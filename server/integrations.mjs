import Ajv from 'ajv';
import { createHash } from 'node:crypto';
import { db, entities } from './store.mjs';
import { executeEntity } from './access.mjs';
import { isFijCoordination } from '../src/lib/permissions.js';
import { isAdmin, isBureauLike } from '../src/lib/permissions.js';

const fail = (status,message) => { throw Object.assign(new Error(message),{status}); };
const missing = label => fail(503, `${label} n’est pas encore configuré. Contacte l’administration.`);
db.exec('CREATE TABLE IF NOT EXISTS integration_usage(user_id TEXT, kind TEXT, day TEXT, count INTEGER, PRIMARY KEY(user_id,kind,day))');
function quota(user,kind,limit) {
  const day = new Date().toISOString().slice(0,10);
  db.prepare('DELETE FROM integration_usage WHERE day < ?').run(day);
  const used = db.prepare('SELECT count FROM integration_usage WHERE user_id=? AND kind=? AND day=?').get(user.id,kind,day)?.count || 0;
  if (used >= limit) fail(429,'Limite quotidienne atteinte. Réessaie demain.');
  db.prepare('INSERT INTO integration_usage VALUES(?,?,?,1) ON CONFLICT(user_id,kind,day) DO UPDATE SET count=count+1').run(user.id,kind,day);
}

async function provider(url,init,label) {
  let response;
  try { response = await fetch(url,{...init,signal:AbortSignal.timeout(45000)}); }
  catch { fail(504,`${label} ne répond pas. Réessaie plus tard.`); }
  if (!response.ok) {
    // Never send credentials or provider response bodies to browsers/logs.
    fail(response.status === 429 ? 429 : 502,`${label} a refusé la demande (${response.status}). Vérifie la configuration ou réessaie.`);
  }
  try { return await response.json(); } catch { fail(502,`${label} a renvoye une reponse invalide`); }
}

export function integrationStatus() {
  return {
    uploads: { configured:true, maxFileBytes:50*1024*1024 },
    ai: { configured:Boolean(process.env.OPENAI_API_KEY), provider:'OpenAI', model:process.env.OPENAI_MODEL || 'gpt-5-mini' },
    email: { configured:Boolean(process.env.RESEND_API_KEY && process.env.EJP_EMAIL_FROM), provider:'Resend' },
    meet: { configured:Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN), provider:'Google Calendar / Meet' },
    payments: { mode:'payment_links' },
  };
}

export async function invokeAI(input,user) {
  if (!process.env.OPENAI_API_KEY) missing('L’assistant IA');
  if (typeof input.prompt !== 'string' || !input.prompt.trim() || input.prompt.length > 20000) fail(400,'Écris une demande de 20 000 caractères maximum');
  if (input.file_urls?.length) fail(400,'Les pièces jointes ne sont pas prises en charge par cet assistant');
  quota(user,'ai',Number(process.env.EJP_AI_DAILY_LIMIT || 20));
  const schema = input.response_json_schema;
  let validate;
  if (schema) {
    if (JSON.stringify(schema).length > 10000) fail(400,'Schema IA trop volumineux');
    try { validate = new Ajv({strict:false}).compile(schema); } catch { fail(400,'Schema IA invalide'); }
  }
  const payload = {
    model:process.env.OPENAI_MODEL || 'gpt-5-mini', store:false, max_output_tokens:4000,
    instructions:'Réponds en français. Tu es un assistant de préparation et de rédaction pour EJP Nantes. Distingue les faits, les propositions et tes incertitudes. Ne prétends jamais avoir modifié ou enregistré les données de la plateforme.' + (schema ? ` Réponds uniquement avec un objet JSON conforme à ce schéma : ${JSON.stringify(schema)}.` : ''),
    input:input.prompt,
    ...(schema ? { text:{ format:{ type:'json_object' } } } : {}),
    ...(input.add_context_from_internet ? { tools:[{type:'web_search'}] } : {}),
  };
  const result = await provider('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(payload)},'L’assistant IA');
  const text = result.output?.flatMap(item=>item.content || []).filter(item=>item.type==='output_text').map(item=>item.text).join('\n');
  if (!text || result.status !== 'completed') fail(502,'Réponse IA incomplète. Réessaie avec une demande plus courte.');
  if (!schema) return text;
  try { const value = JSON.parse(text); if (!validate(value)) fail(502,'Reponse IA incompatible avec le format demande'); return value; } catch { fail(502,'La réponse IA n’a pas le format demandé. Réessaie.'); }
}

export async function sendEmail(input,user) {
  if (!isAdmin(user) && !isBureauLike(user) && !isFijCoordination(user)) fail(403,'L’envoi de courriels est réservé à l’administration et à la coordination autorisée');
  const to = String(input.to || '').trim();
  if (!/^[^\s@,;\r\n]+@[^\s@,;\r\n]+\.[^\s@,;\r\n]+$/.test(to) || !input.subject || !input.body || /[\r\n]/.test(String(input.subject)) || String(input.subject).length>200 || String(input.body).length>20000) fail(400,'Destinataire, objet et message valides requis');
  if (!isAdmin(user) && !isBureauLike(user)) {
    const fij = await executeEntity({entity:'FIJ',method:'get',args:[input.fij_id],user});
    if (to !== fij.pilot_email && to !== fij.copilot_email) fail(403,'Destinataire hors du périmètre FIJ');
  }
  if (!process.env.RESEND_API_KEY || !process.env.EJP_EMAIL_FROM) missing('L’envoi de courriels');
  quota(user,'email',100);
  const result = await provider('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.EJP_EMAIL_FROM,to:[to],subject:String(input.subject),text:String(input.body)})},'Le service de courriels');
  if (!result.id) fail(502,'Le service de courriels n’a pas confirmé la prise en charge');
  await entities.AuditLog.create({action:'email_accepted',performed_by_id:user.id,entity_type:'Email',entity_id:result.id,details:'Courriel accepté par le fournisseur ; livraison non confirmée'});
  return { success:true, id:result.id, status:'accepted' };
}

export async function createMeet(input,user) {
  if (!isAdmin(user) && !isBureauLike(user)) fail(403,'La création de visioconférences est réservée aux responsables');
  if (!input.event_id) fail(400,'Choisis un événement enregistré');
  const event = await entities.Event.get(input.event_id);
  if (event.meet_url) return {meet_url:event.meet_url,calendar_event_id:event.calendar_event_id};
  if (!integrationStatus().meet.configured) missing('Google Meet');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.event_date || '') || !/^\d{2}:\d{2}$/.test(event.event_time || '')) fail(400,'Date et heure de l’événement requises');
  const start = `${event.event_date}T${event.event_time}:00`;
  const endTime = event.end_time || `${String(Number(event.event_time.slice(0,2))+1).padStart(2,'0')}:${event.event_time.slice(3)}`;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) || endTime <= event.event_time) fail(400,'Renseigne une heure de fin après l’heure de début');
  quota(user,'meet',30);
  const oauth = await provider('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,refresh_token:process.env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'})},'La connexion Google');
  const id = createHash('sha256').update(`ejp-${event.id}`).digest('hex');
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || 'primary');
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
  const headers = {Authorization:`Bearer ${oauth.access_token}`,'Content-Type':'application/json'};
  // Deterministic Calendar event id prevents duplicate events on retries.
  let response;
  try { response = await fetch(`${url}?conferenceDataVersion=1`,{method:'POST',headers,signal:AbortSignal.timeout(30000),body:JSON.stringify({id,summary:event.title,description:event.description || '',start:{dateTime:start,timeZone:'Europe/Paris'},end:{dateTime:`${event.event_date}T${endTime}:00`,timeZone:'Europe/Paris'},conferenceData:{createRequest:{requestId:id,conferenceSolutionKey:{type:'hangoutsMeet'}}}})}); }
  catch { fail(504,'Google Meet ne répond pas. Réessaie.'); }
  const data = response.status === 409 ? await provider(`${url}/${id}`,{headers},'Google Calendar') : response.ok ? await response.json() : fail(502,'Google Calendar a refusé la création de la réunion');
  const meet_url = data.hangoutLink || data.conferenceData?.entryPoints?.find(p=>p.entryPointType==='video')?.uri;
  if (!meet_url) fail(502,'Le lien Meet est en préparation. Réessaie dans un instant.');
  await entities.Event.update(event.id,{meet_url,calendar_event_id:data.id});
  return {meet_url,calendar_event_id:data.id};
}
