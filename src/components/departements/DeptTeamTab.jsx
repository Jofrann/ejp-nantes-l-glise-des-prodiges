import React from 'react';
import { Users } from 'lucide-react';
import DeptRoleBadge from './DeptRoleBadge';
import { POSITION_LABELS as MUSIC_POSITION_LABELS } from '@/lib/musicConstants';
import { POSITION_SHORT as SOUND_POSITION_SHORT } from '@/lib/soundConstants';
import { PROFILE_FUNCTION_SHORT as PRAYER_FUNCTION_SHORT } from '@/lib/prayerConstants';
import { PROFILE_FUNCTION_SHORT as WELCOME_FUNCTION_SHORT } from '@/lib/welcomeConstants';
import { PROFILE_FUNCTION_SHORT as MODERATION_FUNCTION_SHORT } from '@/lib/moderationConstants';
import { PROFILE_FUNCTION_SHORT as LOGISTICS_FUNCTION_SHORT } from '@/lib/logisticsConstants';

/**
 * DeptTeamTab — Onglet Équipe du moteur départemental.
 *
 * Affiche TOUS les membres actifs du département (référents + serviteurs),
 * avec leur rôle et internal_identifier.
 *
 * IMPORTANT : N'affiche JAMAIS le vrai email technique.
 * Un simple serviteur voit les mêmes informations qu'un responsable
 * (les capacités de gestion sont limitées à l'admin via Annuaire).
 */
export default function DeptTeamTab({ members, colors, musicProfiles = null, soundProfiles = null, prayerProfiles = null, welcomeProfiles = null, moderationProfiles = null, logisticsProfiles = null, departmentType = null }) {
  // CLOISONNEMENT : ne construire que la map correspondant au département courant.
  // Les profils spécialisés des autres départements ne sont pas chargés ni affichés.
  const musicProfileMap = {};
  if (musicProfiles && departmentType === 'music') {
    musicProfiles.forEach(p => { if (p.user_id) musicProfileMap[p.user_id] = p; });
  }
  const soundProfileMap = {};
  if (soundProfiles && departmentType === 'sound') {
    soundProfiles.forEach(p => { if (p.user_id) soundProfileMap[p.user_id] = p; });
  }
  const prayerProfileMap = {};
  if (prayerProfiles && departmentType === 'prayer') {
    prayerProfiles.forEach(p => { if (p.user_id) prayerProfileMap[p.user_id] = p; });
  }
  const welcomeProfileMap = {};
  if (welcomeProfiles && departmentType === 'welcome') {
    welcomeProfiles.forEach(p => { if (p.user_id) welcomeProfileMap[p.user_id] = p; });
  }
  const moderationProfileMap = {};
  if (moderationProfiles && departmentType === 'moderation') {
    moderationProfiles.forEach(p => { if (p.user_id) moderationProfileMap[p.user_id] = p; });
  }
  const logisticsProfileMap = {};
  if (logisticsProfiles && departmentType === 'logistics') {
    logisticsProfiles.forEach(p => { if (p.user_id) logisticsProfileMap[p.user_id] = p; });
  }
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun membre actif pour le moment.</p>
      </div>
    );
  }

  // Trier : responsables d'abord, puis par nom
  const sorted = [...members].sort((a, b) => {
    const roleOrder = { responsable: 0, coordinateur: 1, referent: 2, adjoint: 3, pilote: 4, serviteur: 5, membre: 6 };
    const ra = roleOrder[a.role_in_dept] ?? 99;
    const rb = roleOrder[b.role_in_dept] ?? 99;
    if (ra !== rb) return ra - rb;
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  return (
    <div className="space-y-2.5">
      {sorted.map(m => {
        const initials = m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
        return (
          <div
            key={m.id}
            className="flex items-center gap-3 bg-card border border-border hover:border-secondary/30 rounded-xl p-3 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border ${colors.border}`}>
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${colors.text}`}>{initials}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{m.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {m.internal_identifier && (
                  <span className="text-[11px] text-muted-foreground font-mono truncate">{m.internal_identifier}</span>
                )}
                {m.note && <span className="text-xs text-muted-foreground truncate">· {m.note}</span>}
              </div>
              {departmentType === 'music' && musicProfileMap[m.user_id]?.positions?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {musicProfileMap[m.user_id].positions.map(pos => (
                    <span key={pos} className="text-[10px] px-1.5 py-0.5 rounded border bg-surface text-muted-foreground">
                      {MUSIC_POSITION_LABELS[pos] || pos}
                    </span>
                  ))}
                </div>
              )}
              {departmentType === 'sound' && soundProfileMap[m.user_id]?.positions?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {soundProfileMap[m.user_id].positions.map(pos => (
                    <span key={pos} className="text-[10px] px-1.5 py-0.5 rounded border bg-blue-500/5 text-blue-600 border-blue-400/20">
                      {SOUND_POSITION_SHORT[pos] || pos}
                    </span>
                  ))}
                </div>
              )}
              {departmentType === 'prayer' && prayerProfileMap[m.user_id]?.functions?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {prayerProfileMap[m.user_id].functions.map(fn => (
                    <span key={fn} className="text-[10px] px-1.5 py-0.5 rounded border bg-purple-500/5 text-purple-600 border-purple-400/20">
                      {PRAYER_FUNCTION_SHORT[fn] || fn}
                    </span>
                  ))}
                </div>
              )}
              {departmentType === 'welcome' && welcomeProfileMap[m.user_id]?.functions?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {welcomeProfileMap[m.user_id].functions.map(fn => (
                    <span key={fn} className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-500/5 text-amber-600 border-amber-400/20">
                      {WELCOME_FUNCTION_SHORT[fn] || fn}
                    </span>
                  ))}
                </div>
              )}
              {departmentType === 'moderation' && moderationProfileMap[m.user_id]?.functions?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {moderationProfileMap[m.user_id].functions.map(fn => (
                    <span key={fn} className="text-[10px] px-1.5 py-0.5 rounded border bg-blue-500/5 text-blue-600 border-blue-400/20">
                      {MODERATION_FUNCTION_SHORT[fn] || fn}
                    </span>
                  ))}
                </div>
              )}
              {departmentType === 'logistics' && logisticsProfileMap[m.user_id]?.functions?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {logisticsProfileMap[m.user_id].functions.map(fn => (
                    <span key={fn} className="text-[10px] px-1.5 py-0.5 rounded border bg-green-500/5 text-green-600 border-green-400/20">
                      {LOGISTICS_FUNCTION_SHORT[fn] || fn}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <DeptRoleBadge role={m.role_in_dept} />
          </div>
        );
      })}
    </div>
  );
}