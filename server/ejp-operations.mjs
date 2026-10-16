import { entities, db } from './store.mjs';
import { projectAssignments } from './event-assignments.mjs';
import { activeMembership, canViewAllEJPData, departmentManager } from '../src/lib/ejpAccess.js';
import { isAdmin } from '../src/lib/permissions.js';
import { departmentAnalytics } from './department-analytics.mjs';
import { readLeaderData } from './leader-data.mjs';
import { filterSensitiveRead } from './sensitive-access.mjs';
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export const operationNames=new Set(['getProgramAssignments','getMyAssignments','linkDepartmentEvent','recordDepartmentService','getDepartmentAnalytics','getManagedDepartments','getLeaderData','setEJPPermissions','getEJPPermissionCandidates','getReferentTeamData','getAcademicEligibility']);
export async function executeEJPOperation(name,body,user) {
  if(user?.account_status!=='active' || user.first_login)fail(403,'Compte actif requis');
  for(const key of ['from','to'])if(body[key] && !/^\d{4}-\d{2}-\d{2}$/.test(body[key]))fail(400,'Période invalide');
  if(body.from && body.to && body.from>body.to)fail(400,'La fin de période précède le début');
  if(name==='getAcademicEligibility') {
    const journeys=await entities.ServantJourney.filter({user_id:user.id},'-updated_date',1);
    const legacy=journeys[0] || (await entities.ServantJourney.filter({created_by_id:user.id},'-updated_date',1))[0];
    return {is_student:user.badges?.includes('ETUDIANT') || ['etudiant','alternant'].includes(legacy?.current_status) || user.roles?.includes('etudiant') || false};
  }
  if(name==='getLeaderData')return readLeaderData(entities,user,body);
  if(name==='getEJPPermissionCandidates') {
    if(!isAdmin(user))fail(403,'Administration requise');
    return {users:(await entities.User.filter({account_status:'active'},'full_name',100000)).map(u=>({id:u.id,full_name:u.full_name,identifier:u.internal_identifier,permissions:u.ejp_permissions || {}}))};
  }
  if(name==='setEJPPermissions') {
    if(!isAdmin(user))fail(403,'Administration requise pour habiliter une personne');
    const person=await entities.User.get(body.user_id);
    if(person.account_status!=='active')fail(400,'Compte actif requis');
    const keys=['canViewAllEJPData','canViewSensitiveEJPData','canManagePilotageDecisions'];
    if(!body.permissions || Object.keys(body.permissions).some(k=>!keys.includes(k)) || Object.values(body.permissions).some(v=>typeof v!=='boolean'))fail(400,'Habilitations invalides');
    const permissions={...Object.fromEntries(keys.map(k=>[k,false])),...body.permissions};
    if(permissions.canViewSensitiveEJPData && !permissions.canViewAllEJPData)fail(400,'La lecture sensible nécessite l’habilitation globale');
    db.exec('BEGIN IMMEDIATE');try {
      await entities.User.update(person.id,{ejp_permissions:permissions});
      await entities.AuditLog.create({action:'ejp_permissions_change',performed_by_id:user.id,entity_type:'User',entity_id:person.id,before:person.ejp_permissions || {},after:permissions});
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    return {success:true};
  }
  const memberships=(await entities.DepartmentMember.filter({user_id:user.id},null,100000)).filter(activeMembership);
  const departments=await entities.Department.filter({is_active:true},null,100000);
  const department=departments.find(d=>d.id===body.department_id || d.slug===body.department_slug);
  const global=canViewAllEJPData(user);
  const coord=departments.find(d=>d.slug==='coordination');
  const coordinates=coord && memberships.some(m=>m.department_id===coord.id);
  if(name==='getMyAssignments') {
    if(body.user_id && body.user_id!==user.id)fail(403,'Les affectations personnelles ne concernent que ton compte');
    const ids=[...new Set(memberships.filter(m=>departments.some(d=>d.id===m.department_id)).map(m=>m.department_id))];
    const from=body.from || new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris'}).format(new Date());
    const projections=await Promise.all(ids.map(departmentId=>projectAssignments(entities,{departmentId,from,to:body.to})));
    return {assignments:projections.flatMap(p=>p.assignments).filter(a=>a.user_id===user.id && !['replaced','cancelled'].includes(a.status)).sort((a,b)=>a.date.localeCompare(b.date))};
  }
  if(name==='getReferentTeamData') {
    const managed=departments.filter(d=>global || departmentManager(user,d.id,memberships));
    if(!managed.length)fail(403,'Aucun département sous ta responsabilité');
    const members=(await entities.DepartmentMember.filter({department_id:{$in:managed.map(d=>d.id)}},null,100000)).filter(activeMembership);
    const ids=[...new Set(members.map(m=>m.user_id))];
    if(body.user_id && !ids.includes(body.user_id))fail(403,'Personne hors de ton périmètre');
    const target=body.user_id ? [body.user_id] : ids;
    const users=target.length ? await entities.User.filter({id:{$in:target}},null,100000) : [];
    const analyses=await Promise.all(managed.map(d=>departmentAnalytics(entities,d.id)));
    const attendance=[...new Map(analyses.flatMap(a=>a.attendance).filter(a=>target.includes(a.user_id)).map(a=>[`${a.event_id}:${a.user_id}`,{...a,created_by_id:a.user_id}])).values()];
    const appointments=await filterSensitiveRead(entities,user,'AppointmentRequest',(await entities.AppointmentRequest.list(null,100000)).filter(a=>target.includes(a.user_id || a.created_by_id)));
    const goals=await filterSensitiveRead(entities,user,'PersonalGoal',(await entities.PersonalGoal.list(null,100000)).filter(a=>target.includes(a.user_id || a.created_by_id)));
    return {users:users.map(p=>({id:p.id,full_name:p.full_name,first_name:p.first_name,last_name:p.last_name,photo_url:p.photo_url})),memberships:members.filter(m=>target.includes(m.user_id)),departments:managed,attendances:attendance,appointments,goals};
  }
  if(name==='getManagedDepartments')return {departments:departments.filter(d=>global || departmentManager(user,d.id,memberships)).map(d=>({id:d.id,slug:d.slug,name:d.name}))};
  if(name==='getDepartmentAnalytics') {
    if(!department || (!global && !departmentManager(user,department.id,memberships)))fail(403,'Analyse réservée au Référent du département');
    return {...await departmentAnalytics(entities,department.id,{from:body.from,to:body.to,userId:body.user_id}),can_record_service:departmentManager(user,department.id,memberships)};
  }
  if(name==='recordDepartmentService') {
    if(!department || !departmentManager(user,department.id,memberships))fail(403,'Validation réservée au Référent de ce département');
    if(!['not_recorded','completed','not_completed'].includes(body.status))fail(400,'Statut de service invalide');
    const parents={MusicAssignment:['MusicServicePlan','service_plan_id'],SoundAssignment:['SoundServicePlan','service_plan_id'],WelcomeAssignment:['WelcomeServicePlan','service_plan_id'],PrayerAssignment:['PrayerSchedule','schedule_id']};
    const mapping=parents[body.source];
    if(!mapping && body.source!=='ModerationServicePlan')fail(400,'Source d’affectation invalide');
    const old=await entities[body.source].get(body.assignment_id);
    if(old.department_id!==department.id)fail(403,'Affectation hors département');
    const plan=mapping ? await entities[mapping[0]].get(old[mapping[1]]) : old;
    const today=new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris'}).format(new Date());
    if(!plan.date || plan.date>today)fail(400,'Un service futur ne peut pas être validé');
    const field=mapping ? 'service_status' : body.position==='co_moderateur' ? 'co_moderator_service_status' : 'moderator_service_status';
    db.exec('BEGIN IMMEDIATE');try {
      await entities[body.source].update(old.id,{[field]:body.status});
      await entities.AuditLog.create({action:'department_service_recorded',entity_type:body.source,entity_id:old.id,performed_by_id:user.id,before:old[field] || 'not_recorded',after:body.status});
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    return {success:true};
  }
  if(name==='getProgramAssignments') {
    if(!global && !coordinates && !(department && departmentManager(user,department.id,memberships)))fail(403,'Lecture réservée au Référent de ce département ou à la Coordination');
    // Coordination receives only the whitelisted operational projection, no confidential sources.
    const data=await projectAssignments(entities,{eventId:body.event_id,departmentId:department?.id,from:body.from,to:body.to});
    return {...data,can_link_plans:Boolean(department && departmentManager(user,department.id,memberships)),events:(await entities.Event.filter({is_active:true},'event_date',100000)).filter(e=>(!body.event_id || e.id===body.event_id) && (!body.from || e.event_date>=body.from) && (!body.to || e.event_date<=body.to)).map(e=>({id:e.id,title:e.title,event_date:e.event_date,event_time:e.event_time,end_time:e.end_time}))};
  }
  if(name==='linkDepartmentEvent') {
    if(!department || !(departmentManager(user,department.id,memberships) || isAdmin(user)))fail(403,'Seul le responsable de ce département peut relier son planning');
    const sources=['MusicServicePlan','SoundServicePlan','WelcomeServicePlan','ModerationServicePlan','PrayerSchedule','CoordinationPlan'];
    if(!sources.includes(body.source))fail(400,'Source de planning invalide');
    const old=await entities[body.source].get(body.plan_id);
    if(old.department_id!==department.id)fail(403,'Planning hors département');
    const event=await entities.Event.get(body.event_id);
    if(event.is_active===false)fail(400,'Événement inactif');
    if(old.date && event.event_date!==old.date)fail(400,'Le planning et le programme doivent avoir la même date');
    db.exec('BEGIN IMMEDIATE');try {
      await entities[body.source].update(old.id,{event_id:event.id});
      await entities.AuditLog.create({action:'plan_event_link',entity_type:body.source,entity_id:old.id,performed_by_id:user.id,before_event_id:old.event_id || null,event_id:event.id});
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    return {success:true};
  }
  fail(404,'Opération inconnue');
}
