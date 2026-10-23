import React from 'react';
import { AssignmentList,ReadState,useEJPRead } from '@/components/departements/DepartmentAnalytics';
export default function MyAssignments({compact=false}){
 const state=useEJPRead('getMyAssignments',{});
 if(compact && !state.loading && !state.error && !state.data?.assignments?.length)return null;
 return <section className="private-assignments bg-card border border-border rounded-xl p-4 my-5"><h2 className="font-semibold mb-3">Mes prochaines affectations</h2><ReadState state={state}><AssignmentList rows={state.data?.assignments || []}/></ReadState></section>;
}
