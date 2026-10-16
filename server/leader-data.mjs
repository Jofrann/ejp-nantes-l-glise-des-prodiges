import { canViewAllEJPData, canViewSensitiveEJPData } from '../src/lib/ejpAccess.js';
// Maintained allowlist. Credentials, settings, sessions, tokens and private personal notes are excluded.
export const BUSINESS_SOURCES={
 Department:'Départements',DepartmentMember:'Appartenances',DepartmentReport:'Rapports départementaux',DeptMessage:'Actualités départementales',User:'Personnes',Event:'Événements',AttendanceResponse:'Présences',SundayAttendanceReport:'Rapports de présence',
 FIJ:'Familles FIJ',FijMember:'Membres FIJ',FijParticipant:'Participants FIJ',FijWeeklyReport:'Rapports FIJ',FijThursdayReport:'Rencontres FIJ',FijAttendanceEntry:'Présences FIJ',FijAlert:'Besoins FIJ',FijDocument:'Documents FIJ',FijCommunication:'Communications FIJ',FijTransfer:'Transferts FIJ',FijOpeningProcess:'Ouvertures FIJ',FijConsecrationRequest:'Demandes FIJ',
 MusicServicePlan:'Plannings Musique',MusicAssignment:'Affectations Musique',MusicRehearsal:'Répétitions',MusicSong:'Répertoire',MusicSetlistItem:'Setlists',MusicAvailability:'Disponibilités Musique',MusicMemberProfile:'Profils Musique',
 SoundServicePlan:'Plannings Sonorisation',SoundAssignment:'Affectations Sonorisation',SoundEquipment:'Matériel Sonorisation',SoundIncident:'Incidents Sonorisation',SoundAvailability:'Disponibilités Sonorisation',SoundChecklistRun:'Checklists Sonorisation',SoundChecklistTemplate:'Modèles de checklists',SoundChecklistItemState:'Vérifications techniques',SoundMemberProfile:'Profils Sonorisation',
 WelcomeServicePlan:'Plannings Accueil',WelcomeAssignment:'Affectations Accueil',WelcomeMemberProfile:'Profils Accueil',ModerationServicePlan:'Plannings Modération',ModerationRunItem:'Conducteurs de programme',ModerationAnnouncement:'Annonces',ModerationMemberProfile:'Profils Modération',
 PrayerSchedule:'Plannings MPI',PrayerAssignment:'Affectations MPI',PrayerAvailability:'Disponibilités MPI',PrayerMemberProfile:'Profils MPI',PrayerTopic:'Sujets MPI',
 CoordinationPlan:'Plannings Coordination',CoordinationFollowUp:'Suivis Coordination',CoordinationAttentionPoint:'Points d’attention',CoordinationMeeting:'Réunions Coordination',CoordinationReport:'Rapports Coordination',CoordinationMemberProfile:'Profils Coordination',
 TrainingProgram:'Formations',TrainingModule:'Modules de formation',TrainingSubmission:'Participations aux formations',ServantJourney:'Parcours et suivi académique',PersonalGoal:'Objectifs et progression',StarResource:'Ressources',PilotageDecision:'Décisions',Post:'Publications',PostComment:'Commentaires',
 LogisticsPlan:'Historique Logistique',LogisticsTask:'Tâches Logistique archivées',LogisticsNeed:'Besoins Logistique archivés',LogisticsEquipment:'Matériel Logistique archivé',LogisticsMemberProfile:'Profils Logistique archivés',
 VisitorContact:'Visiteurs (confidentiel)',PrayerRequest:'Demandes de prière (confidentiel)',PrayerRequestAssignee:'Responsables des demandes de prière',PrayerRequestUpdate:'Suivis de prière (confidentiel)',FijMemberNote:'Suivis FIJ (confidentiel)',AppointmentRequest:'Accompagnements (confidentiel)',FirstVisitIntent:'Intentions de visite (confidentiel)',MembershipApplication:'Demandes d’intégration (confidentiel)',ServantApplication:'Demandes de service (confidentiel)',
};
export const SENSITIVE_SOURCES=new Set(['VisitorContact','PrayerRequest','PrayerRequestAssignee','PrayerRequestUpdate','PrayerTopic','TrainingSubmission','ServantJourney','PersonalGoal','FijMemberNote','AppointmentRequest','FirstVisitIntent','MembershipApplication','ServantApplication']);
const secretKey=key=>/password|secret|token|credential|hash|api.?key|authorization|cookie|ejp_permissions/i.test(key);
export const sanitizeBusinessData=value=>Array.isArray(value) ? value.map(sanitizeBusinessData) : value && typeof value==='object' ? Object.fromEntries(Object.entries(value).filter(([key])=>!secretKey(key)).map(([key,v])=>[key,sanitizeBusinessData(v)])) : value;
export async function readLeaderData(entities,user,body) {
 if(!canViewAllEJPData(user))throw Object.assign(new Error('Habilitation globale nominative requise'),{status:403});
 const catalog=Object.entries(BUSINESS_SOURCES).filter(([name])=>!SENSITIVE_SOURCES.has(name) || canViewSensitiveEJPData(user)).map(([source,label])=>({source,label,sensitive:SENSITIVE_SOURCES.has(source)}));
 if(!body.source)return {sources:catalog,departments:(await entities.Department.list('display_order',100000)).map(d=>({id:d.id,slug:d.slug,name:d.name})),sensitive_access:canViewSensitiveEJPData(user)};
 if(!Object.hasOwn(BUSINESS_SOURCES,body.source))throw Object.assign(new Error('Source métier non consultable'),{status:400});
 if(SENSITIVE_SOURCES.has(body.source) && !canViewSensitiveEJPData(user))throw Object.assign(new Error('Habilitation sensible requise'),{status:403});
 const offset=Math.max(0,Math.floor(Number(body.offset)||0));const limit=25;
 const query={};let scopeNote='';
 if(body.department_id) {
   if(body.source==='Department')query.id=body.department_id;
   else if(body.source==='User')query.id={$in:[...new Set((await entities.DepartmentMember.filter({department_id:body.department_id},null,100000)).map(m=>m.user_id))]};
   else if(/^(Music|Sound|Welcome|Prayer|Moderation|Logistics|Coordination|Department|DeptMessage)/.test(body.source) || body.source==='VisitorContact')query.department_id=body.department_id;
   else scopeNote='Cette rubrique est transversale : le filtre département ne s’applique pas. Utiliser le suivi d’équipe pour les présences attendues.';
 }
 if(body.user_id)query[body.source==='User' ? 'id' : 'user_id']=body.user_id;if(body.id)query.id=body.id;
 const rows=await entities[body.source].filter(query,'-created_date',limit+1,offset);
 const sensitiveRead=SENSITIVE_SOURCES.has(body.source) || (body.source==='User' && canViewSensitiveEJPData(user));
 const records=rows.slice(0,limit).map(row=>body.source==='User' ? Object.fromEntries(['id','full_name','first_name','last_name','internal_identifier','photo_url','account_status',...(canViewSensitiveEJPData(user)?['phone','email','contact_email','bio']:[])].filter(k=>Object.hasOwn(row,k)).map(k=>[k,row[k]])) : sanitizeBusinessData(row));
 // Persist the access before returning any sensitive record. Audit failure blocks delivery.
 await entities.AuditLog.create({action:sensitiveRead?'sensitive_data_read':'global_data_read',performed_by_id:user.id,entity_type:body.source,entity_ids:records.map(r=>r.id),department_id:body.department_id || null,created_date:new Date().toISOString()});
 return {records,next_offset:rows.length>limit ? offset+limit : null,label:BUSINESS_SOURCES[body.source],sensitive:sensitiveRead,scope_note:scopeNote};
}
