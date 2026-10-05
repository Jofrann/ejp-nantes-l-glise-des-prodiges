import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Check, ChevronRight, ChevronLeft, User, Mail, Award, Users, Heart, CheckCircle2, Info } from 'lucide-react';
import { BADGES, DEPT_ROLES, getBadgeLabel, getRoleLabel } from '@/lib/annuaireConstants';

const STEPS = [
  { id: 1, label: 'Identité', icon: User },
  { id: 2, label: 'Compte', icon: Mail },
  { id: 3, label: 'Badges', icon: Award },
  { id: 4, label: 'Services', icon: Users },
  { id: 5, label: 'Responsabilités', icon: Heart },
  { id: 6, label: 'Vérification', icon: CheckCircle2 },
];

export default function CreatePersonWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [fijs, setFijs] = useState([]);
  const [previewIdentifier, setPreviewIdentifier] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [badges, setBadges] = useState([]);
  const [services, setServices] = useState([]); // [{ department_id, role_in_dept }]
  const [fijAssignment, setFijAssignment] = useState(null); // { fij_id, role }

  useEffect(() => {
    base44.entities.Department.filter({ is_active: true }, { sort: 'display_order', limit: 50 }).then(res => {
      const list = (res?.items || res || []).filter(d => d.status === 'active');
      setDepartments(list);
    });
    base44.entities.FIJ.filter({ is_active: true }, { limit: 50 }).then(res => {
      const list = (res?.items || res || []).filter(f => f.status !== 'closed');
      setFijs(list);
    });
  }, []);

  // Generate preview identifier from first/last name
  useEffect(() => {
    if (firstName && lastName) {
      const f = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (f) setPreviewIdentifier(`${f}@prodiges`);
    }
  }, [firstName, lastName]);

  const toggleBadge = (id) => {
    setBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const addService = () => {
    setServices(prev => [...prev, { department_id: '', role_in_dept: 'serviteur' }]);
  };

  const updateService = (idx, field, value) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeService = (idx) => {
    setServices(prev => prev.filter((_, i) => i !== idx));
  };

  const canNext = () => {
    if (step === 1) return firstName.trim() && lastName.trim();
    if (step === 2) return email.trim() && /\S+@\S+\.\S+/.test(email);
    return true;
  };

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Create user + memberships via adminManageUser
      const createRes = await base44.functions.invoke('adminManageUser', {
        action: 'create',
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        badges,
        department_memberships: services.filter(s => s.department_id).map(s => ({
          department_id: s.department_id,
          role_in_dept: s.role_in_dept,
        })),
      });

      const userId = createRes.data?.user_id;
      if (!userId) throw new Error('Création échouée — aucun user_id retourné');

      // 2. Assign FIJ pilot if selected
      if (fijAssignment && fijAssignment.fij_id) {
        await base44.functions.invoke('adminManageUser', {
          action: 'assign_fij_pilot',
          user_id: userId,
          fij_id: fijAssignment.fij_id,
          role: fijAssignment.role,
        });
      }

      onCreated();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erreur lors de la création';
      setError(msg);
      // Go back to step 2 if email-related error
      if (msg.includes('email') || msg.includes('existe')) setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-foreground font-semibold text-sm">Ajouter une personne</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition ${step === s.id ? 'bg-secondary text-primary-foreground' : step > s.id ? 'bg-emerald-100 text-emerald-700' : 'bg-surface text-muted-foreground'}`}>
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`text-[9px] ${step === s.id ? 'text-secondary font-medium' : 'text-muted-foreground/60'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${step > s.id ? 'bg-emerald-300' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>
          )}

          {/* Step 1: Identité */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Identité de la personne</p>
                <p className="text-xs text-muted-foreground">Ces informations apparaîtront dans tout l'espace EJP.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">Prénom *</label>
                  <input
                    className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">Nom *</label>
                  <input
                    className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Téléphone (optionnel)</label>
                <input
                  className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          )}

          {/* Step 2: Compte */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Compte de connexion</p>
                <p className="text-xs text-muted-foreground">Un email d'invitation sera envoyé à cette adresse. La personne choisira son mot de passe.</p>
              </div>

              {/* Identifiant EJP (auto-généré) */}
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3.5">
                <label className="text-xs text-secondary font-medium block mb-1">Identifiant EJP (généré automatiquement)</label>
                <p className="text-sm text-secondary font-mono">{previewIdentifier || '—'}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Cet identifiant est visible dans l'Annuaire. Il n'est pas utilisé pour la connexion.</p>
              </div>

              {/* Email réel de connexion */}
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Adresse email de connexion *</label>
                <input
                  type="email"
                  className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom.nom@gmail.com"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground/70 mt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Cette adresse reçoit l'invitation et sert à la connexion. Elle doit être une vraie boîte email que la personne consulte.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Badges */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Profil de la personne</p>
                <p className="text-xs text-muted-foreground">Sélectionne les badges globaux. Les responsabilités départementales se gèrent dans l'onglet Services.</p>
              </div>
              <div className="space-y-2">
                {BADGES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => toggleBadge(b.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition text-left ${badges.includes(b.id) ? 'bg-secondary/10 border-secondary/30' : 'bg-card border-border hover:border-secondary/20'}`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${badges.includes(b.id) ? 'bg-secondary border-secondary' : 'border-border'}`}>
                      {badges.includes(b.id) && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.label}</p>
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Services */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Services</p>
                <p className="text-xs text-muted-foreground">Dans quel(s) département(s) sert-elle ? Tu peux en ajouter plusieurs.</p>
              </div>
              {services.length === 0 ? (
                <div className="text-center py-6 bg-surface/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">Aucun département sélectionné.</p>
                  <button onClick={addService} className="text-xs text-secondary hover:underline">+ Ajouter un département</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((s, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium">Département {idx + 1}</span>
                        <button onClick={() => removeService(idx)} className="text-muted-foreground hover:text-danger"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="space-y-2">
                        <select
                          value={s.department_id}
                          onChange={e => updateService(idx, 'department_id', e.target.value)}
                          className="w-full bg-white border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary/50"
                        >
                          <option value="">Choisir un département...</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <select
                          value={s.role_in_dept}
                          onChange={e => updateService(idx, 'role_in_dept', e.target.value)}
                          className="w-full bg-white border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary/50"
                        >
                          {DEPT_ROLES.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button onClick={addService} className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary/80 transition">
                    + Ajouter un département
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Responsabilités */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Responsabilités spécialisées</p>
                <p className="text-xs text-muted-foreground">Pilotage FIJ. Tu peux passer cette étape si aucune responsabilité.</p>
              </div>

              {fijs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune FIJ active disponible.</p>
              ) : (
                <div>
                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border bg-card cursor-pointer hover:border-secondary/20">
                    <input
                      type="checkbox"
                      checked={!fijAssignment}
                      onChange={() => setFijAssignment(null)}
                      className="accent-secondary"
                    />
                    <span className="text-sm text-foreground">Aucune responsabilité FIJ</span>
                  </label>

                  <div className="mt-3 space-y-3">
                    <select
                      value={fijAssignment?.fij_id || ''}
                      onChange={e => setFijAssignment(e.target.value ? { fij_id: e.target.value, role: 'pilot' } : null)}
                      className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50"
                    >
                      <option value="">Assigner comme pilote FIJ...</option>
                      {fijs.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    {fijAssignment && (
                      <select
                        value={fijAssignment.role}
                        onChange={e => setFijAssignment({ ...fijAssignment, role: e.target.value })}
                        className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50"
                      >
                        <option value="pilot">Pilote</option>
                        <option value="copilot">Copilote</option>
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Vérification */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Vérification</p>
                <p className="text-xs text-muted-foreground">Vérifie les informations avant de créer le compte.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
                {/* Identité */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Identité</p>
                  <p className="text-sm font-semibold text-foreground">{firstName} {lastName}</p>
                  <p className="text-xs text-secondary font-mono">{previewIdentifier}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                  {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
                </div>

                {/* Badges */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1.5">Badges</p>
                  {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map(b => (
                        <span key={b} className="text-xs px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 font-medium">{getBadgeLabel(b)}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucun badge</p>
                  )}
                </div>

                {/* Services */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1.5">Services</p>
                  {services.filter(s => s.department_id).length > 0 ? (
                    <div className="space-y-1">
                      {services.filter(s => s.department_id).map((s, i) => {
                        const dept = departments.find(d => d.id === s.department_id);
                        return (
                          <p key={i} className="text-xs text-foreground">
                            {dept?.name || '—'} <span className="text-secondary/70">— {getRoleLabel(s.role_in_dept)}</span>
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucun service</p>
                  )}
                </div>

                {/* Responsabilités */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1.5">Responsabilités</p>
                  {fijAssignment ? (
                    <p className="text-xs text-rose-600">Pilote FIJ — {fijs.find(f => f.id === fijAssignment.fij_id)?.name} ({fijAssignment.role === 'pilot' ? 'Pilote' : 'Copilote'})</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucune</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Un email d'invitation sera envoyé à <strong>{email}</strong>. La personne recevra un lien pour choisir son mot de passe et accéder à son espace.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            {step > 1 ? 'Précédent' : 'Annuler'}
          </button>

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
            >
              Continuer
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="flex items-center gap-2 bg-secondary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-secondary/90 transition disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? 'Création...' : 'Créer le compte'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}