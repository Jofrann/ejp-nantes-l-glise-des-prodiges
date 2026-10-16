const plans=new Set(['MusicServicePlan','SoundServicePlan','WelcomeServicePlan','ModerationServicePlan','PrayerSchedule','CoordinationPlan']);
const parents={MusicAssignment:['MusicServicePlan','service_plan_id'],SoundAssignment:['SoundServicePlan','service_plan_id'],WelcomeAssignment:['WelcomeServicePlan','service_plan_id'],PrayerAssignment:['PrayerSchedule','schedule_id']};
const reject=message=>{throw Object.assign(new Error(message),{status:400});};
export async function validateEventWrite(entities,entity,old,input) {
  // Legacy forms omit event selection and send null: retain an established link.
  if(plans.has(entity) && old?.event_id && Object.hasOwn(input,'event_id') && !input.event_id)input.event_id=old.event_id;
  const row={...old,...input};
  if(old?.department_id && input.department_id && old.department_id!==input.department_id)reject('Le département d’une donnée historique ne peut pas être modifié');
  if(plans.has(entity) && row.event_id) {
    const event=await entities.Event.get(row.event_id);
    if(event.is_active===false)reject('Événement inactif');
    if(row.date && event.event_date!==row.date)reject('La date du planning doit correspondre au programme');
  }
  if(parents[entity]) {
    const [parent,key]=parents[entity];
    const plan=await entities[parent].get(row[key]);
    if(plan.department_id!==row.department_id)reject('Affectation et planning de départements différents');
    if(!old || Object.hasOwn(input,'user_id') || Object.hasOwn(input,key)) {
      const person=await entities.User.get(row.user_id);
      const department=await entities.Department.get(row.department_id);
      const members=await entities.DepartmentMember.filter({user_id:row.user_id,department_id:row.department_id});
      if(person.account_status!=='active' || department.is_active===false || !members.some(m=>m.status ? m.status==='active' : m.is_active!==false))reject('La personne doit être membre actif du département');
    }
  }
}
