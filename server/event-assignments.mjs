// Read projection over existing sources; never persist a second copy.
export const ASSIGNMENT_SOURCES = [
  { plan: 'MusicServicePlan', assignment: 'MusicAssignment', parent: 'service_plan_id' },
  { plan: 'SoundServicePlan', assignment: 'SoundAssignment', parent: 'service_plan_id' },
  { plan: 'WelcomeServicePlan', assignment: 'WelcomeAssignment', parent: 'service_plan_id' },
  { plan: 'PrayerSchedule', assignment: 'PrayerAssignment', parent: 'schedule_id' },
  { plan: 'ModerationServicePlan' },
];
const time = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '') ? Number(value.slice(0,2))*60+Number(value.slice(3)) : null;
export function interval(row, plan, event) {
  const date = row.date || plan.date || event?.event_date;
  const start = time(row.start_time || plan.call_time || plan.start_time || plan.service_start_time || event?.event_time);
  const end = time(row.end_time || plan.end_time || event?.end_time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || start === null || end === null || start === end) return null;
  const day = Date.parse(date + 'T00:00:00Z');
  return { start: day + start*60000, end: day + (end + (end < start ? 1440 : 0))*60000 };
}
export function assignmentConflicts(rows) {
  const conflicts=[];
  const active=rows.filter(r=>r.user_id && r.interval && !['declined','replaced','cancelled'].includes(r.status));
  for(let i=0;i<active.length;i++) for(let j=i+1;j<active.length;j++) {
    const a=active[i],b=active[j];
    if(a.user_id===b.user_id && a.interval.start<b.interval.end && b.interval.start<a.interval.end)
      conflicts.push({user_id:a.user_id,assignment_ids:[a.id,b.id],department_ids:[a.department_id,b.department_id]});
  }
  return conflicts;
}
export async function projectAssignments(entities, { eventId, departmentId, from, to } = {}) {
  const events=await entities.Event.list(null,100000);
  const eventMap=new Map(events.map(e=>[e.id,e]));
  const departments=await entities.Department.list(null,100000);
  const deptMap=new Map(departments.map(d=>[d.id,d]));
  const rows=[], unlinkedPlans=[];
  const inPeriod=date=>(!from || date>=from) && (!to || date<=to);
  for(const source of ASSIGNMENT_SOURCES) {
    const plans=await entities[source.plan].filter(departmentId ? {department_id:departmentId} : {},null,100000);
    for(const plan of plans) {
      if(deptMap.get(plan.department_id)?.is_active===false || plan.is_active===false || plan.status==='archived')continue;
      if(plan.status==='cancelled' || !inPeriod(plan.date || eventMap.get(plan.event_id)?.event_date || ''))continue;
      if(!plan.event_id || !eventMap.has(plan.event_id)) {unlinkedPlans.push({source:source.plan,id:plan.id,department_id:plan.department_id,title:plan.title,date:plan.date});continue;}
      const event=eventMap.get(plan.event_id);
      if(event.is_active===false || (eventId && event.id!==eventId))continue;
      let assignments;
      if(source.assignment) assignments=await entities[source.assignment].filter({[source.parent]:plan.id},null,100000);
      else assignments=[{id:plan.id+':moderator',user_id:plan.moderator_user_id,full_name:plan.moderator_name,position:'moderateur',status:'assigned'},...(plan.co_moderator_user_id ? [{id:plan.id+':co',user_id:plan.co_moderator_user_id,full_name:plan.co_moderator_name,position:'co_moderateur',status:'assigned'}]:[])];
      if(!assignments.length)assignments=[{id:plan.id+':incomplete',status:'unconfigured',position:'Équipe à renseigner'}];
      for(const assignment of assignments) {
        if(assignment.department_id && assignment.department_id!==plan.department_id)continue;
        rows.push({id:`${source.assignment || source.plan}:${assignment.id}`,source:source.assignment || source.plan,source_id:assignment.id,plan_source:source.plan,plan_id:plan.id,
          event_id:event.id,event_title:event.title,date:plan.date || event.event_date,department_id:plan.department_id,department_name:deptMap.get(plan.department_id)?.name || '',
          user_id:assignment.user_id || null,full_name:assignment.full_name || '',position:assignment.position || assignment.role || 'à préciser',status:assignment.status || 'assigned',
          start_time:assignment.start_time || plan.call_time || plan.start_time || plan.service_start_time || event.event_time || null,
          end_time:assignment.end_time || plan.end_time || event.end_time || null,interval:interval(assignment,plan,event),
          service_status:assignment.service_status || (source.plan==='ModerationServicePlan' ? (assignment.position==='co_moderateur' ? plan.co_moderator_service_status : plan.moderator_service_status) : null) || 'not_recorded'});
      }
    }
  }
  const conflicts=assignmentConflicts(rows);
  return {assignments:rows,conflicts,unlinked_plans:unlinkedPlans,
    missing_times:rows.filter(r=>!r.interval).map(r=>r.id),
    unfilled:rows.filter(r=>r.status!=='unconfigured' && (!r.user_id || r.status==='declined')).length,
    incomplete_plans:rows.filter(r=>r.status==='unconfigured').length,
    pending_confirmations:rows.filter(r=>r.user_id && ['assigned','pending'].includes(r.status)).length};
}
