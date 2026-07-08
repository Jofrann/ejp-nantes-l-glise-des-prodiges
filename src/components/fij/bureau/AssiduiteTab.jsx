import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AssiduiteTab({ fij, members, reports }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reports.length) { setLoading(false); return; }
    const reportIds = reports.map(r => r.id);
    // Load attendance entries for all reports of this FI
    Promise.all(
      reportIds.map(rid => base44.entities.FijAttendanceEntry.filter({ report_id: rid }, '-thursday_date', 500).catch(() => []))
    ).then(results => {
      const all = results.flat();
      setEntries(all);
      setLoading(false);
    });
  }, [reports]);

  if (loading) {
    return <div className="text-center py-8"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>;
  }

  if (!reports.length) {
    return (
      <div className="text-center py-10">
        <BarChart3 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucune donnée d'assiduité</p>
      </div>
    );
  }

  // Per-member attendance stats
  const memberStats = members.map(member => {
    const memberEntries = entries.filter(e => e.member_id === member.id);
    const present = memberEntries.filter(e => e.present).length;
    const absent = memberEntries.filter(e => !e.present).length;
    const late = memberEntries.filter(e => e.late).length;
    const rate = memberEntries.length > 0 ? Math.round((present / memberEntries.length) * 100) : 0;
    return { member, present, absent, late, total: memberEntries.length, rate };
  }).sort((a, b) => b.rate - a.rate);

  // Detect 3 consecutive absences
  const sortedReports = [...reports].sort((a, b) => new Date(a.thursday_date) - new Date(b.thursday_date));
  const membersWith3Absences = members.filter(member => {
    const memberEntries = sortedReports
      .map(r => entries.find(e => e.report_id === r.id && e.member_id === member.id))
      .filter(Boolean);
    let consecutive = 0;
    for (const e of memberEntries) {
      if (!e.present) {
        consecutive++;
        if (consecutive >= 3) return true;
      } else {
        consecutive = 0;
      }
    }
    return false;
  });

  return (
    <div className="space-y-4">
      {/* Alert: 3 consecutive absences */}
      {membersWith3Absences.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-danger mb-1.5">⚠️ Absences consécutives (3+)</p>
          <div className="flex flex-wrap gap-1.5">
            {membersWith3Absences.map(m => (
              <span key={m.id} className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full">{m.full_name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={CheckCircle2} label="Présences" value={entries.filter(e => e.present).length} color="text-success" />
        <StatCard icon={XCircle} label="Absences" value={entries.filter(e => !e.present).length} color="text-danger" />
        <StatCard icon={Clock} label="Retards" value={entries.filter(e => e.late).length} color="text-warning" />
      </div>

      {/* Per-member table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Assiduité par membre</p>
        </div>
        <div className="divide-y divide-border">
          {memberStats.map(({ member, present, absent, late, total, rate }) => (
            <div key={member.id} className="px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
                <p className="text-[10px] text-muted-foreground">{present}P · {absent}A · {late}R / {total}</p>
              </div>
              <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${rate >= 75 ? 'bg-success' : rate >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${rate}%` }} />
              </div>
              <span className="text-sm font-bold text-foreground w-9 text-right">{rate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}