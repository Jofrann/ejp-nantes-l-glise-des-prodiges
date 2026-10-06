import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield, Loader2, Lock, ArrowLeft, AlertCircle,
  Users, AlertTriangle, Calendar, ExternalLink, ChevronRight
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { HEALTH_META, ALERT_LEVEL_META } from '@/lib/pilotageConstants';

export default function PilotageDeptDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = (await base44.functions.invoke('getPilotageData', {})).data;
        if (res.access_denied) {
          setAccessDenied(true);
        } else if (res.error) {
          setError(res.error);
        } else {
          setData(res);
        }
      } catch (e) {
        setError('Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <Lock className="w-10 h-10 text-danger/60 mb-4" />
        <p className="text-sm font-semibold text-foreground mb-1">Accès Pilotage restreint</p>
        <Link to="/app" className="text-secondary text-sm">← Retour à l'accueil</Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">{error || 'Erreur'}</p>
        <Link to="/app/pilotage" className="text-secondary text-sm mt-4">← Retour au Pilotage</Link>
      </div>
    );
  }

  const dept = (data.departments || []).find((d) => d.slug === slug);
  if (!dept) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="text-sm font-semibold text-foreground mb-1">Département introuvable</p>
        <Link to="/app/pilotage" className="text-secondary text-sm mt-4">← Retour au Pilotage</Link>
      </div>
    );
  }

  const meta = HEALTH_META[dept.health_status] || HEALTH_META.stable;
  const deptAlerts = (data.alerts || []).filter((a) => a.department_slug === slug);
  const deptActivity = (data.ministry_life?.department_activities || []).find((d) => d.slug === slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-secondary/5 blur-[140px] opacity-50" />
      </div>

      <div className="sticky top-14 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/app/pilotage" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Pilotage
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground truncate">{dept.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-heading font-bold text-foreground">{dept.name}</p>
              <p className="text-xs text-muted-foreground">Synthèse directionnelle</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${meta.bg} ${meta.color} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {dept.health_label}
            </span>
          </div>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6 space-y-6">
          {/* Description */}
          {dept.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{dept.description}</p>
          )}

          {/* Indicateurs clés */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card border border-border rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{dept.member_count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Membre{dept.member_count > 1 ? 's' : ''} actif{dept.member_count > 1 ? 's' : ''}</p>
            </div>
            <div className="glass-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center mb-3`}>
                <AlertTriangle className={`w-5 h-5 ${meta.color}`} />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{dept.alert_count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Alerte{dept.alert_count > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Responsable */}
          <div className="glass-card border border-border rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Responsable</p>
            {dept.responsible_name ? (
              <p className="text-sm font-semibold text-foreground">{dept.responsible_name}</p>
            ) : (
              <p className="text-sm text-warning">Aucun responsable désigné</p>
            )}
          </div>

          {/* Prochaine activité */}
          {deptActivity?.next_activity_title && (
            <div className="glass-card border border-border rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Prochaine activité</p>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{deptActivity.next_activity_title}</p>
                  <p className="text-xs text-muted-foreground">{deptActivity.next_activity_date}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alertes du département */}
          {deptAlerts.length > 0 && (
            <div>
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Points d'attention</h2>
              <div className="space-y-2.5">
                {deptAlerts.map((alert, i) => {
                  const alertMeta = ALERT_LEVEL_META[alert.level] || ALERT_LEVEL_META.ATTENTION;
                  return (
                    <div key={i} className={`glass-card border ${alertMeta.border} rounded-xl p-3.5`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${alertMeta.bg} flex items-center justify-center flex-shrink-0`}>
                          <AlertTriangle className={`w-4 h-4 ${alertMeta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                          <Link to={alert.action_url} className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                            {alert.action_label} <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bouton ouvrir l'espace départemental */}
          <div className="pt-4 border-t border-border">
            <Link
              to={`/app/departements/${slug}`}
              className="w-full glass-card border border-secondary/20 rounded-2xl p-4 flex items-center justify-between hover:bg-secondary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Ouvrir l'espace du département</p>
                  <p className="text-xs text-muted-foreground">Accès à l'espace métier complet (si autorisé)</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}