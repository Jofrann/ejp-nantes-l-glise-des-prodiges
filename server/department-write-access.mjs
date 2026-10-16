import { activeMembership } from '../src/lib/ejpAccess.js';
import { isAdmin } from '../src/lib/permissions.js';
export async function checkDepartmentWrite(entities,user,entity,method,args) {
 if(isAdmin(user))return;
 if(method==='deleteMany') {
   // Validate the full set before allowing any cascading deletion.
   for(const row of await entities[entity].filter(args[0] || {},null,100000))await checkDepartmentWrite(entities,user,entity,'delete',[row.id]);
   return;
 }
 if(method==='bulkCreate') {for(const row of args[0] || [])await checkDepartmentWrite(entities,user,entity,'create',[row]);return;}
 if(!['create','update','delete'].includes(method))return;
 const old=method==='create' ? null : await entities[entity].get(args[0]);
 const input=method==='create' ? args[0] : method==='update' ? args[1] : {};
 const row={...old,...input};
 let id=old?.department_id || input?.department_id;
 if(!id) {
   const parents={SoundChecklistItemState:['SoundChecklistRun','run_id'],MusicSetlistItem:['MusicServicePlan','service_plan_id'],ModerationRunItem:['ModerationServicePlan','service_plan_id'],PrayerRequestUpdate:['PrayerRequest','request_id'],PrayerRequestAssignee:['PrayerRequest','prayer_request_id']};
   const parent=parents[entity];
   if(parent && row[parent[1]])id=(await entities[parent[0]].get(row[parent[1]])).department_id;
 }
 if(!id || entity==='DepartmentMember')return;
 const department=await entities.Department.get(id);
 const members=await entities.DepartmentMember.filter({user_id:user.id,department_id:id});
 if(department.is_active===false || !members.some(activeMembership))throw Object.assign(new Error('Écriture hors du département autorisé'),{status:403});
}
