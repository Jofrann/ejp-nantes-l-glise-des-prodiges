import { canViewSensitiveEJPData,activeMembership,departmentManager } from '../src/lib/ejpAccess.js';
import { isPilotOfFij } from '../src/lib/fijPermissions.js';
import { SENSITIVE_SOURCES } from './leader-data.mjs';
const owner=(user,row)=>Boolean((row.user_id && row.user_id===user.id) || (row.created_by_id && row.created_by_id===user.id) || (row.requester_user_id && row.requester_user_id===user.id) || (user.email && row.created_by===user.email));
export async function canReadSensitiveRow(entities,user,entity,row) {
 if(!SENSITIVE_SOURCES.has(entity))return true;
 if(!user || user.account_status!=='active')return false;
 if(canViewSensitiveEJPData(user) || owner(user,row))return true;
 const memberships=(await entities.DepartmentMember.filter({user_id:user.id},null,100000)).filter(activeMembership);
 const departments=await entities.Department.filter({is_active:true},null,100000);
 const active=memberships.filter(m=>departments.some(d=>d.id===m.department_id));
 const manages=departmentManager(user,row.department_id,active);
 if(entity==='VisitorContact')return manages;
 if(entity==='PrayerTopic')return row.visibility==='mpi' ? active.some(m=>m.department_id===row.department_id) : row.visibility==='restricted' && manages;
 if(entity==='PrayerRequest') {
   if(row.confidentiality==='GENERAL_MPI')return active.some(m=>m.department_id===row.department_id);
   if(row.confidentiality==='RESTRICTED_MPI')return manages;
   if(row.confidentiality==='PRIVATE_ASSIGNEES')return (await entities.PrayerRequestAssignee.filter({prayer_request_id:row.id})).some(a=>a.user_id===user.id);
   return false;
 }
 if(entity==='PrayerRequestAssignee' || entity==='PrayerRequestUpdate') {
   const requestId=row.prayer_request_id || row.request_id;
   if(!requestId)return false;
   return canReadSensitiveRow(entities,user,'PrayerRequest',await entities.PrayerRequest.get(requestId));
 }
 if(entity==='AppointmentRequest')return row.reviewed_by===user.id || row.assigned_to===user.id;
 if(entity==='PersonalGoal' && row.visibility && row.visibility!=='private' && !['academique','professionnel'].includes(row.category)) {
   const managedIds=active.filter(m=>departmentManager(user,m.department_id,active)).map(m=>m.department_id);
   const memberships=await entities.DepartmentMember.filter({user_id:row.user_id || row.created_by_id},null,100000);
   return memberships.some(m=>activeMembership(m) && managedIds.includes(m.department_id));
 }
 if(entity==='FijMemberNote') {
   const fij=await entities.FIJ.get(row.fij_id).catch(()=>null);
   const coord=departments.find(d=>d.slug==='coordination-fij');
   const coordinates=coord && active.some(m=>m.department_id===coord.id);
   if(coordinates || user.roles?.some(r=>['coordination_fij','referent_fij'].includes(r)))return true;
   return Boolean(fij && row.visibility!=='coordination_fij' && isPilotOfFij(user,fij));
 }
 if(entity==='FirstVisitIntent' || entity==='MembershipApplication' || entity==='ServantApplication') {
   const accueil=departments.find(d=>d.slug==='accueil');return Boolean(accueil && departmentManager(user,accueil.id,active));
 }
 return false;
}
export async function filterSensitiveRead(entities,user,entity,value) {
 if(!SENSITIVE_SOURCES.has(entity))return value;
 const input=Array.isArray(value)?value:[value];const result=[];
 for(const row of input)if(await canReadSensitiveRow(entities,user,entity,row))result.push(row);
 if(result.length)await entities.AuditLog.create({action:'sensitive_data_read',entity_type:entity,entity_ids:result.map(r=>r.id),performed_by_id:user.id});
 if(!Array.isArray(value) && !result.length)throw Object.assign(new Error('Dossier confidentiel non autorisé'),{status:403});
 return Array.isArray(value)?result:result[0];
}
