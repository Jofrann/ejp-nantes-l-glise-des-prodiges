import { entities } from './store.mjs';
import { isAdmin, isBureauLike, getRoles, canManageDepartment } from '../src/lib/permissions.js';
import { canReadFijV2, canReadFijMembers, canReadMemberNotes, isPilotOfFij } from '../src/lib/fijPermissions.js';
import { filterSensitiveRead } from './sensitive-access.mjs';
import { departmentManager,canViewAllEJPData } from '../src/lib/ejpAccess.js';

export const personalEntities = new Set(['AttendanceResponse','AppointmentRequest','BookLog','DataRequest','PersonalGoal','PersonalNote','PersonalTimeBlock','PrivacyConsent','ScriptureReadingLog','ServantJourney','StarNotification','TrainingSubmission','UserWorkspacePreference']);
const catalog = new Set(['TrainingProgram','TrainingModule','StarResource','StarProduct']);
const fijChildren = new Set(['FijAlert','FijAttendanceEntry','FijCommunication','FijConsecrationRequest','FijDocument','FijMember','FijMemberNote','FijOpeningProcess','FijParticipant','FijThursdayReport','FijTransfer','FijWeeklyReport']);
export const activeMembership = row => row.status ? row.status === 'active' : row.is_active !== false;
export const owns = (user, row) => row.created_by_id === user.id || row.user_id === user.id || row.created_by === user.email;
const reject = (message = 'Accès non autorisé', status = 403) => { throw Object.assign(new Error(message), { status }); };
const select = (row, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(row,key)).map(key => [key,row[key]]));

export async function executeEntity({ entity, method, args, user, scope }) {
  const administrator = isAdmin(user);
  const self = scope === 'self' && personalEntities.has(entity);
  const departments = await entities.Department.list();
  const activeDepartmentIds = new Set(departments.filter(d => d.is_active !== false).map(d => d.id));
  const allMemberships = (await entities.DepartmentMember.list()).filter(m => activeMembership(m) && activeDepartmentIds.has(m.department_id));
  const myMemberships = allMemberships.filter(m => m.user_id === user.id);
  const managedIds = myMemberships.filter(m => ['referent','responsable','coordinateur'].includes(m.role_in_dept)).map(m => m.department_id);
  const teamUserIds = new Set(allMemberships.filter(m => managedIds.includes(m.department_id)).map(m => m.user_id));
  const coord = departments.find(row => row.slug === 'coordination-fij');
  const coordination = administrator || getRoles(user).some(role => ['coordination_fij','referent_fij'].includes(role)) || myMemberships.some(row => row.department_id === coord?.id);
  const fijUser = coordination ? {...user,roles:[...getRoles(user),'coordination_fij']} : user;
  const fijs = await entities.FIJ.list();
  const accessibleFij = id => fijs.find(row => row.id === id);
  const managed = id => departmentManager(user,id,myMemberships);
  const programVisible = program => program && program.status === 'published' && (program.is_public || !program.assigned_roles?.length || program.assigned_roles.includes('all') || program.assigned_roles.some(role => getRoles(user).includes(role) || getRoles(user).some(ownRole => role === `star_${ownRole}`)));
  const programs = await entities.TrainingProgram.list();
  const canRead = row => {
    if (self) return owns(user,row);
    if (administrator) return true;
    if (personalEntities.has(entity)) {
      if (owns(user,row)) return true;
      if (entity === 'PersonalGoal') return row.visibility !== 'private' && teamUserIds.has(row.created_by_id || row.user_id);
      if (entity === 'AttendanceResponse') return false; // Referent history uses the event-scoped analytical endpoint.
      return false;
    }
    if (entity === 'Post' || entity === 'PostComment') return true;
    if (entity === 'PostReaction') return row.user_id === user.id;
    if (entity === 'Department') return true;
    if (entity === 'DepartmentMember') return row.user_id === user.id || managed(row.department_id) || canViewAllEJPData(user);
    if (entity === 'DeptMessage' || entity === 'DepartmentReport') return canViewAllEJPData(user) || myMemberships.some(m => m.department_id === row.department_id);
    if (entity === 'User') return row.id === user.id || teamUserIds.has(row.id);
    if (entity === 'TrainingProgram') return programVisible(row);
    if (entity === 'TrainingModule') return programVisible(programs.find(p => p.id === row.program_id));
    if (entity === 'StarResource' || entity === 'StarProduct') return row.is_active !== false;
    if (entity === 'FIJ') return canReadFijV2(fijUser,row);
    if (fijChildren.has(entity)) {
      const fij = accessibleFij(row.fij_id || row.source_fij_id || row.fij_source_id || row.fij_house_id);
      const pilot = fijs.some(f => isPilotOfFij(user,f));
      if (entity === 'FijDocument') return coordination || (pilot && ['all_fij','pilots'].includes(row.visibility)) || (isBureauLike(user) && row.visibility === 'direction');
      if (entity === 'FijCommunication') return coordination || (pilot && row.status === 'sent' && (row.target_scope === 'all_pilots' || (row.target_scope === 'specific_fij' && fijs.some(f => isPilotOfFij(user,f) && row.target_fij_ids?.includes(f.id)))));
      if (entity === 'FijMemberNote') return canReadMemberNotes(fijUser,fij,row);
      if (entity === 'FijMember' || entity === 'FijParticipant') return canReadFijMembers(fijUser,fij);
      if (!fij) return coordination;
      return canReadFijV2(fijUser,fij);
    }
    return false;
  };
  const permittedEntity = personalEntities.has(entity) || catalog.has(entity) || fijChildren.has(entity) || ['User','Department','DepartmentMember','DeptMessage','DepartmentReport','FIJ','Post','PostComment','PostReaction'].includes(entity);
  if (!administrator && !permittedEntity) reject();
  const project = row => entity === 'User' && !administrator && row.id !== user.id ? select(row,['id','first_name','last_name','full_name','photo_url','role','roles','badges','account_status']) : row;
  if (['list','filter'].includes(method)) {
    const [query, sort, limit, skip] = method === 'filter' ? args : [{}, ...args];
    const options = sort && typeof sort === 'object' ? sort : {};
    const take = Math.min(10000,Math.max(0,Number(options.limit ?? limit ?? 1000)));
    const offset = Math.max(0,Number(options.skip ?? skip ?? 0));
    const rows = await entities[entity].filter(query || {}, options.sort ?? sort,100000);
    return filterSensitiveRead(entities,user,entity,rows.filter(canRead).slice(offset,offset+take).map(project));
  }
  if (method === 'get') { const row=await entities[entity].get(args[0]); if(!canRead(row))reject(); return filterSensitiveRead(entities,user,entity,project(row)); }
  if (['bulkCreate','deleteMany'].includes(method)) { if(!administrator)reject(); return entities[entity][method](...args); }
  const old = method === 'create' ? null : await entities[entity].get(args[0]);
  const input = {...(method === 'create' ? args[0] : args[1])};
  const target = {...old,...input};
  if(entity==='User' && Object.hasOwn(input,'ejp_permissions'))reject('Utiliser la gestion nominative des habilitations');
  if (!administrator || self) {
    if (personalEntities.has(entity)) {
      if (old && !owns(user,old)) reject();
      if (entity === 'StarNotification' && (method !== 'update' || Object.keys(input).some(key => key !== 'is_read'))) reject();
      if (entity === 'AppointmentRequest' && input.status && !['pending','cancelled'].includes(input.status)) reject('Le statut est réservé au responsable du rendez-vous');
      if (entity === 'DataRequest' && input.status && !['pending','requested'].includes(input.status)) reject();
      if (entity === 'TrainingSubmission') {
        if (!programVisible(programs.find(p => p.id === target.program_id))) reject();
        if (input.status && !['in_progress','submitted'].includes(input.status)) reject('La validation est réservée au formateur');
        if (old?.status === 'validated') reject('Cette formation est déjà validée');
        const module = await entities.TrainingModule.get(target.module_id);
        if (module.program_id !== target.program_id) reject('Module incohérent',400);
      }
    } else if (['Post','PostComment','PostReaction'].includes(entity)) {
      if (old && !owns(user,old) && !isBureauLike(user)) reject();
      if (old && input.post_id && input.post_id !== old.post_id) reject();
      if (entity === 'Post' && (target.type === 'announcement' || input.is_pinned !== undefined) && !isBureauLike(user)) reject();
      if (['PostComment','PostReaction'].includes(entity)) await entities.Post.get(target.post_id);
      if (entity === 'PostReaction' && (method === 'update' || typeof target.emoji !== 'string' || target.emoji.length > 8)) reject('Reaction invalide',400);
    } else if (entity === 'Department') { if(!isBureauLike(user) && (method==='create' || !managed(old.id)))reject(); }
    else if (entity === 'DepartmentMember') { if(!isBureauLike(user))reject(); }
    else if (entity === 'DeptMessage') {
      if(!isBureauLike(user) && !myMemberships.some(m=>m.department_id===target.department_id))reject();
      if(old && !owns(user,old) && !managed(old.department_id))reject();
    } else if (entity === 'DepartmentReport') { if(!managed(target.department_id))reject(); }
    else if (entity === 'FIJ') { if(!coordination || (method==='delete' && !getRoles(user).includes('bergere')))reject(); }
    else if (fijChildren.has(entity)) {
      const fij=accessibleFij(target.fij_id || target.source_fij_id || target.fij_source_id || target.fij_house_id);
      if(!coordination && (!isPilotOfFij(user,fij) || (old && !canRead(old))))reject();
      if(!coordination && (method==='delete' || ['validated','approved','rejected'].includes(input.status) || input.validated_by || input.validated_by_id))reject();
    } else reject();
    for(const key of ['id','created_by','created_by_id','created_date','roles','role','badges','author_id','author_name','author_photo','author_role'])delete input[key];
    if(method==='create' && personalEntities.has(entity))input.user_id=user.id;
    if(old && personalEntities.has(entity) && input.event_id && input.event_id!==old.event_id)reject('Référence non modifiable',400);
    if(old && fijChildren.has(entity) && input.fij_id && input.fij_id!==old.fij_id)reject('FIJ non modifiable',400);
  }
  if (method === 'delete') return entities[entity].delete(old.id);
  if (entity === 'Department') {
    if(!String(target.name || '').trim())reject('Nom du département requis',400);
    if(method==='create')input.slug=String(input.slug || input.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    if(input.slug && departments.some(d=>d.slug===input.slug && d.id!==old?.id))reject('Un département utilise déjà ce nom ou cet identifiant',409);
  }
  if (entity === 'StarProduct' && target.stripe_checkout_url) {
    let url; try { url = new URL(target.stripe_checkout_url); } catch { reject('Lien Stripe invalide',400); }
    if (url.protocol !== 'https:' || !['buy.stripe.com','checkout.stripe.com'].includes(url.hostname) || url.username || url.password) reject('Utilise un lien de paiement Stripe HTTPS',400);
  }
  if (entity === 'DepartmentMember') {
    const department=await entities.Department.get(target.department_id);
    const person=await entities.User.get(target.user_id);
    if(department.is_active===false || person.account_status!=='active')reject('Département ou compte inactif',400);
    if(!['serviteur','membre','referent','responsable','coordinateur','adjoint','pilote'].includes(target.role_in_dept || 'serviteur'))reject('Rôle départemental invalide',400);
    if(method==='create' && (await entities.DepartmentMember.filter({user_id:person.id,department_id:department.id})).some(activeMembership))reject('Cette affectation existe déjà',409);
    input.full_name=person.full_name; if(method==='create'){input.status='active';input.is_active=true;}
  }
  if(method==='create') {
    if (['Post','PostComment'].includes(entity)) { input.author_id=user.id;input.author_name=user.full_name;input.author_photo=user.photo_url || '';input.author_role=user.role;if(!String(input.content || '').trim())reject('Message requis',400); }
    if (entity === 'PostReaction') { input.user_id=user.id; const existing=(await entities.PostReaction.filter({post_id:input.post_id,user_id:user.id,emoji:input.emoji}))[0]; if(existing)return existing; }
    input.created_by_id=user.id; input.created_by=user.email; input.created_by_name=user.full_name;
    if(personalEntities.has(entity))input.user_id=user.id;
    if(entity==='AttendanceResponse') {const event=await entities.Event.get(input.event_id);if(event.is_active===false)reject('Événement inactif',400);input.event_title=event.title;input.event_date=event.event_date;const duplicate=(await entities.AttendanceResponse.filter({event_id:input.event_id})).find(row=>owns(user,row));if(duplicate)return entities.AttendanceResponse.update(duplicate.id,input);}
    return entities[entity].create(input);
  }
  delete input.created_by_id;delete input.created_by;delete input.created_by_name;delete input.user_id;delete input.created_date;
  return entities[entity].update(old.id,input);
}
