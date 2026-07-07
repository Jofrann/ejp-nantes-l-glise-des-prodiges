import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Users, FileText, AlertTriangle, MapPin, Clock, ArrowRight, Plus } from 'lucide-react';

export default function MesFij() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    base44.entities.FijWeeklyReport.filter({}, '-created_date', 200).then(r => {
      setReports(r || []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const myFijs = fijs.filter(f =>
    f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id)
  );

  const weekStart = getMonday(new Date());

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Mes FIJ"
      subtitle="Les familles dont tu es pilote ou copilote"
    >
      {myFijs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tu n'es pilote d'aucune FIJ"
          sub="Si tu penses qu'il s'agit d'une erreur, contacte la coordination FIJ."
        />
      ) : (
        <div className="space-y-4">
          {myFijs.map((fij, i) => {
            const fijReports = reports.filter(r => r.fij_house_id === fij.id);
            const thisWeekReport = fijReports.find(r => r.week_start === weekStart);
            const lastReport = fijReports[0];
            return (
              <motion.div
                key={fij.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden"
              >
                {/* En-tête FIJ */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{fij.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          fij.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : fij.status === 'opening' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : fij.status === 'paused' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {fij.status === 'active' ? 'Active' : fij.status === 'opening' ? 'En ouverture' : fij.status === 'paused' ? 'En pause' : 'Fermée'}
                        </span>
                        {fij.city && <span className="text-xs text-gray-500 flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {fij.city}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-amber-400">{fij.member_count || 0}</p>
                      <p className="text-[10px] text-gray-500 uppercase">membres</p>
                    </div>
                  </div>
                  {(fij.meeting_day || fij.meeting_time) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {fij.meeting_day || '—'}{fij.meeting_time ? ` à ${fij.meeting_time}` : ''}
                    </div>
                  )}
                </div>

                {/* Statut CR */}
                <div className="px-4 py-3 bg-white/2 border-b border-white/5">
                  {thisWeekReport ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${thisWeekReport.status === 'submitted' ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <span className="text-gray-400">
                        CR de cette semaine : {thisWeekReport.status === 'submitted' ? 'Soumis' : thisWeekReport.status === 'validated' ? 'Validé' : 'Brouillon'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-gray-400">CR de cette semaine non rempli</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3 flex gap-2">
                  <Link
                    to={`/app/departements/fij/fij/${fij.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" /> Ouvrir
                  </Link>
                  <Link
                    to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-xl py-2.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> {thisWeekReport ? 'Éditer CR' : 'Remplir CR'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </FijPageShell>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}