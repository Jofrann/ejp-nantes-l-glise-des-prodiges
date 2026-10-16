import React from 'react';
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,Legend} from 'recharts';
export default function AttendanceTrend({data}) {
 return <div className="h-64 min-w-0" role="img" aria-label="Évolution des présences, absences et données manquantes"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><XAxis dataKey="date"/><YAxis allowDecimals={false}/><Tooltip/><Legend/><Bar isAnimationActive={false} dataKey="present" name="Présents" fill="hsl(var(--success))"/><Bar isAnimationActive={false} dataKey="absent" name="Absents" fill="hsl(var(--danger))"/><Bar isAnimationActive={false} dataKey="missing" name="Non renseignés" fill="hsl(var(--muted-foreground))"/></BarChart></ResponsiveContainer></div>;
}
