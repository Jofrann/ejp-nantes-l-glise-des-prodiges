import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, FileText, AlertTriangle, TrendingUp, Heart,
  CheckCircle, ArrowRight, Clock, XCircle
} from 'lucide-react';
import { getCurrentThursday, getPreviousThursday } from '@/lib/fijDateUtils';

/**
 * FijDirectionSummary V2 — Synthèse FIJ basée sur FijThursdayReport + FijAttendanceEntry.
 * Affiche les indicateurs clés du réseau FIJ en lecture seule pour /app/direction.
 */
export default function FijDirectionSummary() {
  const [fijs, setFijs] = useState([]);
  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [prevReports, setPrevReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const thisThursday = getCurrentThursday();
  const lastThursday = getPreviousThursday();

  useEffect(() => {
    Promise.all([
      base44.entities.FIJ.list('display_order', 100),
      base44.entities.FijThursdayReport.filter({ thursday_date: thisThursday }, '-created_date', 200).catch(() => []),
      base44.entities.FijThursdayReport.filter({ thursday_date: lastThursday }, '-created_date', 200).catch(() => []),
      base44.entities.FijMember.filter({ is_active: true }, 'full_name', 500).catch(() => []),
    ]).then(([f, r, pr, m]) => {
      setFijs((f || []).filter(x => x.is_active !== false));
      setReports(r || []);
      setPrevReports(pr || []);
      setMembers(m || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const pausedFijs = fijs.filter(f => f.status === 'paused');
  const pilots = new Set(activeFijs.map(f => f.pilot_user_id).filter(Boolean));
  const copilots = new Set(activeFijs.map(f => f.copilot_user_id).filter(Boolean));

  // This week's CR stats
  const crReceived = reports.length;
  const crMissing = activeFijs.filter(f => !reports.some(r => r.fij_id === f.id));
  const crRate = activeFijs.length > 0 ? Math.round((crReceived / activeFijs.length) * 100) : 0;

  // Attendance rate this Thursday
  const totalPresent = reports.reduce((s, r) => s + (r.present_count || 0), 0);
  const totalMembers = reports.reduce((s, r) => s + (r.total_members || 0), 0);
  const attendanceRate = totalMembers > 0 ? Math.round((totalPresent / totalMembers) * 100) : 0;

  // Previous week comparison
  const prevPresent = prevReports.reduce((s, r) => s + (r.present_count || 0), 0);
  const prevMembers = prevReports.reduce((s, r) => s + (r.total_members || 0), 0);
  const prevAttendanceRate = prevMembers > 0 ? Math.round((prevPresent / prevMembers) * 100) : 0;
  const evolution = attendanceRate - prevAttendanceRate;

  const stats = [
    { label: 'FI actives', value: activeFijs.length, icon: Users, color: 'text-secondary' },
    { label: 'En pause', value: pausedFijs.length, icon: Clock, color: 'text-warning' },
    { label: 'Membres', value: members.length, icon: Heart, color: 'text-rose-600' },
    { label: 'Pilotes', value: pilots.size, icon: Users, color: 'text-primary' },
    { label: 'CR reçus', value: crReceived, icon: FileText, color: 'text-secondary' },
    { label: 'CR manquants', value: crMissing.length, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Présence', value: attendanceRate + '%', icon: TrendingUp, color: 'text-success' },
    { label: 'Évolution S-1', value: (evolution >= 0 ? '+' : '') + evolution + '%', icon: evolution >= 0 ? TrendingUp : AlertTriangle, color: evolution >= 0 ? 'text-success' : 'text-danger' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-400/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <h2 className="text-foreground font-semibold text-sm">Synthèse FIJ</h2>
        </div>
        <Link to="/app/departements/fij" className="text-xs text-secondary flex items-center gap-1 hover:text-secondary/80">
          Détails <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-3">
            <s.icon className={`w-3.5 h-3.5 ${s.color} mb-1.5`} />
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CR manquants */}
      {crMissing.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <p className="text-xs font-semibold text-foreground">FIJ sans CR cette semaine ({crMissing.length})</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {crMissing.slice(0, 6).map(f => (
              <span key={f.id} className="text-[10px] bg-warning/10 border border-warning/20 text-warning px-2 py-0.5 rounded-full">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FIJ sans pilote */}
      {activeFijs.filter(f => !f.pilot_user_id).length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-warning" />
            <p className="text-xs font-semibold text-foreground">FIJ sans pilote ({activeFijs.filter(f => !f.pilot_user_id).length})</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeFijs.filter(f => !f.pilot_user_id).slice(0, 5).map(f => (
              <span key={f.id} className="text-[10px] bg-warning/10 border border-warning/20 text-warning px-2 py-0.5 rounded-full">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pas de CR cette semaine */}
      {crReceived === 0 && (
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-2.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Aucun CR reçu pour ce jeudi.</p>
        </div>
      )}

      {/* Tout est OK */}
      {crReceived > 0 && crMissing.length === 0 && (
        <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-lg p-2.5">
          <CheckCircle className="w-3.5 h-3.5 text-success" />
          <p className="text-xs text-success">Tous les CR de cette semaine ont été reçus.</p>
        </div>
      )}
    </motion.div>
  );
}