import React from 'react';
import { getInitials, BADGE_LABELS, STATUS_LABELS, formatDate, getBadgeLabel, getRoleLabel } from '@/lib/annuaireConstants';

export default function FicheApercu({ person, memberships, fijAssignments }) {
  const statusInfo = STATUS_LABELS[person.account_status] || STATUS_LABELS.pending;
  const activeMemberships = memberships.filter(m => m.status === 'active' || m.is_active !== false);

  return (
    <div className="space-y-6">
      {/* Identité */}
      <Section title="Identité">
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoRow label="Prénom" value={person.first_name || '—'} />
          <InfoRow label="Nom" value={person.last_name || '—'} />
          <InfoRow label="Identifiant EJP" value={person.internal_identifier || '—'} mono accent />
          <InfoRow label="Statut" value={statusInfo.label} />
          <InfoRow label="Compte créé le" value={formatDate(person.created_date)} />
          <InfoRow label="Téléphone" value={person.phone || '—'} />
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        {person.badges?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {person.badges.map(b => (
              <span key={b} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                {getBadgeLabel(b)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun badge.</p>
        )}
      </Section>

      {/* Services */}
      <Section title="Services">
        {activeMemberships.length > 0 ? (
          <div className="space-y-2">
            {activeMemberships.map(m => (
              <div key={m.membership_id} className="flex items-center justify-between bg-surface/50 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.department_name}</p>
                  <p className="text-xs text-muted-foreground">Depuis le {formatDate(m.joined_at)}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                  {getRoleLabel(m.role_in_dept)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun service actif.</p>
        )}
      </Section>

      {/* Responsabilités spécialisées */}
      <Section title="Responsabilités spécialisées">
        {fijAssignments.length > 0 ? (
          <div className="space-y-2">
            {fijAssignments.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-rose-50/50 border border-rose-100 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Pilote FIJ</p>
                  <p className="text-xs text-muted-foreground">{f.fij_name}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 font-medium">
                  {f.role === 'pilote' ? 'Pilote' : 'Copilote'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune responsabilité spécialisée.</p>
        )}
      </Section>

      {/* Accès */}
      <Section title="Accès">
        <div className="flex flex-wrap gap-2">
          {activeMemberships.map(m => (
            <span key={m.membership_id} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              {m.department_name}
            </span>
          ))}
          {fijAssignments.map((f, i) => (
            <span key={`f${i}`} className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              {f.fij_name}
            </span>
          ))}
          {activeMemberships.length === 0 && fijAssignments.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun accès actif.</p>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono, accent }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm ${mono ? 'font-mono' : 'font-medium'} ${accent ? 'text-secondary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}