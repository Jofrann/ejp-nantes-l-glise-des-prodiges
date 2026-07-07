import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { UserCheck, Mail, AlertTriangle } from 'lucide-react';

export default function Pilotes() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    base44.entities.FijWeeklyReport.filter({}, '-created_date', 500).then(r => {
      setReports(r || []);
      setDataLoading(false);
    });
  }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  // Build pilot list from FIJ records
  const pilotMap = new Map();
  fijs.forEach(fij => {
    if (fij.pilot_name) {
      const key = fij.pilot_user_id || fij.pilot_name;
      if (!pilotMap.has(key)) {
        pilotMap.set(key, { name: fij.pilot_name, email: fij.pilot_email, fijs: [], reportCount: 0 });
      }
      pilotMap.get(key).fijs.push(fij);
    }
  });

  // Count reports per pilot
  reports.forEach(r => {
    pilotMap.forEach((p) => {
      if (p.fijs.some(f => f.id === r.fij_house_id)) {
        p.reportCount++;
      }
    });
  });

  const pilots = Array.from(pilotMap.values());

  const sendMessage = async (pilot) => {
    const msg = prompt(`Message à ${pilot.name} :`);
    if (!msg) return;
    await base44.entities.FijCommunication.create({
      type: 'announcement',
      title: `Message à ${pilot.name}`,
      content: msg,
      target_scope: 'specific_fij',
      target_fij_ids: pilot.fijs.map(f => f.id),
      sent_by_name: user?.full_name,
      status: 'sent',
    });
    alert('Message envoyé');
  };

  const signalRenfort = async (pilot) => {
    await base44.entities.FijAlert.create({
      fij_house_id: pilot.fijs[0]?.id,
      fij_name: pilot.fijs[0]?.name,
      type: 'pastoral_attention',
      severity: 'warning',
      title: `Besoin de renfort - ${pilot.name}`,
      description: `${pilot.name} a potentiellement besoin de renfort sur ${pilot.fijs.map(f => f.name).join(', ')}.`,
      status: 'open',
    });
    alert('Signalement créé');
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Pilotes"
      subtitle="Suivi des pilotes et copilotes FIJ"
      requiredRoles={['coordination', 'direction']}
    >
      {pilots.length === 0 ? (
        <EmptyState icon={UserCheck} title="Aucun pilote enregistré" sub="Les pilotes apparaissent quand ils sont assignés à une FIJ dans le registre." />
      ) : (
        <div className="space-y-2">
          {pilots.map((pilot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/3 border border-white/8 rounded-xl p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-400">{pilot.name?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{pilot.name}</p>
                  {pilot.email && <p className="text-xs text-gray-500 truncate">{pilot.email}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{pilot.fijs.length} FIJ</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500">{pilot.reportCount} CR remis</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {pilot.fijs.map(f => (
                      <span key={f.id} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/8">{f.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => sendMessage(pilot)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded-lg px-2.5 py-1.5 transition-colors">
                  <Mail className="w-3 h-3" /> Message
                </button>
                <button onClick={() => signalRenfort(pilot)} className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/20 rounded-lg px-2.5 py-1.5 transition-colors">
                  <AlertTriangle className="w-3 h-3" /> Renfort
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </FijPageShell>
  );
}