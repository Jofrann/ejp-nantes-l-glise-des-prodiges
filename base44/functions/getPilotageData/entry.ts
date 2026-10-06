import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { canAccessPilotage } from '../../shared/pilotagePermissions.ts';

/**
 * getPilotageData — Backend d'agrégation pour l'espace Pilotage global.
 *
 * Principe : Pilotage est une COUCHE DE LECTURE au-dessus des systèmes existants.
 * Il agrège des synthèses, indicateurs, alertes et tendances.
 * Il ne recopie PAS les données dans de nouvelles entités.
 * Il ne crée PAS un système parallèle.
 *
 * Confidentialité :
 * - MPI : seuls des comptes sont renvoyés (jamais le contenu des demandes).
 * - Accueil : seuls des comptes de visiteurs (jamais téléphone/notes/coords).
 * - Étudiant : seuls des comptes de formations (jamais notes/difficultés).
 * - Pastoral : seuls des comptes de RDV (jamais le contenu).
 *
 * Accès : canAccessPilotage(user) — Bergère, Bureau, Admin, ou badge PILOTAGE.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // === 0. Vérification d'accès Pilotage ===
    if (!canAccessPilotage(user)) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'Pilotage',
        details: "Tentative d'accès Pilotage refusée",
        performed_by_id: user.id,
        performed_by_name: user.full_name || user.email,
        performed_by_role: user.role || (user.roles || []).join(','),
      });
      return Response.json({ access_denied: true, message: 'Accès Pilotage non autorisé.' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    const in14Days = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    // === 1. Chargement parallèle des données de base ===
    const [
      departments, allMembers, upcomingEvents, fijs, decisions, dismissals, totalUsers
    ] = await Promise.all([
      base44.asServiceRole.entities.Department.filter({ is_active: true }, 'display_order', 100),
      base44.asServiceRole.entities.DepartmentMember.filter({ status: 'active' }, '-created_date', 500),
      base44.asServiceRole.entities.Event.filter({ is_active: true, event_date: { $gte: today } }, 'event_date', 30),
      base44.asServiceRole.entities.FIJ.filter({ is_active: true }, 'display_order', 100),
      base44.asServiceRole.entities.PilotageDecision.filter({}, '-created_date', 100),
      base44.asServiceRole.entities.PilotageAlertDismissal.filter({}, '-created_date', 200),
      base44.asServiceRole.entities.User.filter({}, '-created_date', 500),
    ]);

    const depts = (departments || []).filter((d: any) => d.status !== 'inactive' && d.status !== 'archived');
    const members = (allMembers || []).filter((m: any) => m.status === 'active' || (!m.status && m.is_active === true));
    const events = upcomingEvents || [];
    const fijList = fijs || [];
    const decisionList = decisions || [];
    const dismissalList = dismissals || [];
    const users = totalUsers || [];

    // === 2. Map des membres par département ===
    const membersByDept: Record<string, any[]> = {};
    (members || []).forEach((m: any) => {
      if (!membersByDept[m.department_id]) membersByDept[m.department_id] = [];
      membersByDept[m.department_id].push(m);
    });

    // === 3. Chargement parallèle des alertes (compteurs et items) ===
    const [
      openIncidents, blockedTasks, overdueFollowups, urgentAttentionPoints,
      newVisitors, activeFijAlerts, pendingPrayerRequests,
      logisticsNeedsUnfulfilled, upcomingCoordMeetings, upcomingCoordPlans,
      upcomingMusicPlans, upcomingSoundPlans, upcomingWelcomePlans,
      upcomingModerationPlans, upcomingLogisticsPlans, upcomingPrayerSchedules,
      activeFormations, activeObjectives
    ] = await Promise.all([
      base44.asServiceRole.entities.SoundIncident.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.LogisticsTask.filter({ status: 'blocked' }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.CoordinationFollowUp.filter({ due_date: { $lt: today }, status: { $nin: ['done', 'cancelled'] } }, '-due_date', 50).catch(() => []),
      base44.asServiceRole.entities.CoordinationAttentionPoint.filter({ status: 'open', severity: { $in: ['action', 'urgent'] } }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.VisitorContact.filter({ status: 'new' }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.FijAlert.filter({ status: 'active' }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.PrayerRequest.filter({ status: { $in: ['submitted', 'assigned', 'in_progress'] } }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.LogisticsNeed.filter({ status: { $in: ['requested', 'approved', 'in_progress'] } }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.CoordinationMeeting.filter({ date: { $gte: today }, status: 'planned' }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.CoordinationPlan.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.MusicServicePlan.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.SoundServicePlan.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.WelcomeServicePlan.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.ModerationServicePlan.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.LogisticsPlan.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.PrayerSchedule.filter({ date: { $gte: today }, status: { $nin: ['completed', 'cancelled'] } }, 'date', 20).catch(() => []),
      base44.asServiceRole.entities.TrainingProgram.filter({ status: 'active' }, '-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.PersonalGoal.filter({ status: 'active' }, '-created_date', 200).catch(() => []),
    ]);

    // === 4. Construction des alertes ===
    const alerts: any[] = [];
    const dismissedKeys = new Set((dismissalList || []).map((d: any) => d.alert_key));

    // 4a. Départements sans responsable
    (depts || []).forEach((dept: any) => {
      const deptMembers = membersByDept[dept.id] || [];
      const hasResponsable = deptMembers.some((m: any) =>
        ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept)
      );
      if (!hasResponsable && deptMembers.length > 0) {
        alerts.push({
          key: `dept_no_responsible:${dept.id}`,
          level: 'IMPORTANT',
          title: `${dept.name} : aucun responsable désigné`,
          description: `${deptMembers.length} membre(s) actif(s) mais aucun responsable, référent ou coordinateur.`,
          action_label: 'Voir le département',
          action_url: `/app/pilotage/departements/${dept.slug}`,
          source_type: 'department',
          source_id: dept.id,
          department_slug: dept.slug,
        });
      }
    });

    // 4b. Incidents sono ouverts
    (openIncidents || []).forEach((inc: any) => {
      alerts.push({
        key: `sound_incident:${inc.id}`,
        level: inc.severity === 'critical' ? 'CRITIQUE' : 'ATTENTION',
        title: `Incident sono : ${inc.title || 'non titré'}`,
        description: inc.description || 'Incident technique ouvert.',
        action_label: 'Voir les incidents',
        action_url: `/app/departements/sono`,
        source_type: 'sound_incident',
        source_id: inc.id,
        department_slug: 'sono',
      });
    });

    // 4c. Tâches logistiques bloquées
    (blockedTasks || []).forEach((task: any) => {
      alerts.push({
        key: `logistics_task_blocked:${task.id}`,
        level: 'ATTENTION',
        title: `Tâche logistique bloquée : ${task.title || 'non titrée'}`,
        description: task.description || 'Tâche en statut bloqué.',
        action_label: 'Voir les tâches',
        action_url: `/app/departements/intendance`,
        source_type: 'logistics_task',
        source_id: task.id,
        department_slug: 'intendance',
      });
    });

    // 4d. Suivis Coordination en retard
    (overdueFollowups || []).forEach((fu: any) => {
      alerts.push({
        key: `coord_followup_overdue:${fu.id}`,
        level: 'IMPORTANT',
        title: `Suivi en retard : ${fu.title || 'non titré'}`,
        description: `Échéance dépassée (${fu.due_date}).`,
        action_label: 'Voir les suivis',
        action_url: `/app/departements/coordination`,
        source_type: 'coordination_followup',
        source_id: fu.id,
        department_slug: 'coordination',
      });
    });

    // 4e. Points d'attention Coordination
    (urgentAttentionPoints || []).forEach((ap: any) => {
      alerts.push({
        key: `coord_attention:${ap.id}`,
        level: ap.severity === 'urgent' ? 'IMPORTANT' : 'ATTENTION',
        title: `Point d'attention : ${ap.title || 'non titré'}`,
        description: ap.description || "Point d'attention ouvert.",
        action_label: "Voir les points d'attention",
        action_url: `/app/departements/coordination`,
        source_type: 'coordination_attention',
        source_id: ap.id,
        department_slug: 'coordination',
      });
    });

    // 4f. Visiteurs non contactés (compte anonymisé)
    if ((newVisitors || []).length > 0) {
      alerts.push({
        key: `welcome_visitors_uncontacted`,
        level: 'INFO',
        title: `${(newVisitors || []).length} visiteur(s) non encore contacté(s)`,
        description: "Des visiteurs ont rempli une fiche mais n'ont pas été contactés.",
        action_label: 'Voir les visiteurs',
        action_url: `/app/departements/accueil`,
        source_type: 'welcome_visitor',
        source_id: null,
        department_slug: 'accueil',
      });
    }

    // 4g. Alertes FIJ actives
    (activeFijAlerts || []).forEach((al: any) => {
      alerts.push({
        key: `fij_alert:${al.id}`,
        level: 'ATTENTION',
        title: `FIJ : ${al.title || 'alerte active'}`,
        description: al.description || al.message || 'Alerte FIJ active.',
        action_label: 'Voir les alertes FIJ',
        action_url: `/app/responsabilites/fij-coordination/alertes`,
        source_type: 'fij_alert',
        source_id: al.id,
        department_slug: 'coordination-fij',
      });
    });

    // 4h. Demandes de prière en attente (compte anonymisé — jamais le contenu)
    const pendingPrayerCount = (pendingPrayerRequests || []).length;
    if (pendingPrayerCount > 0) {
      alerts.push({
        key: `prayer_requests_pending`,
        level: 'ATTENTION',
        title: `${pendingPrayerCount} demande(s) de prière en attente de suivi`,
        description: 'Des demandes nécessitent une qualification ou un suivi.',
        action_label: 'Voir les demandes',
        action_url: `/app/departements/mpi`,
        source_type: 'prayer_request',
        source_id: null,
        department_slug: 'mpi',
      });
    }

    // 4i. Besoins logistiques non satisfaits
    if ((logisticsNeedsUnfulfilled || []).length > 0) {
      alerts.push({
        key: `logistics_needs_unfulfilled`,
        level: 'ATTENTION',
        title: `${(logisticsNeedsUnfulfilled || []).length} besoin(s) logistique(s) non satisfait(s)`,
        description: 'Des besoins sont en attente de traitement.',
        action_label: 'Voir les besoins',
        action_url: `/app/departements/intendance`,
        source_type: 'logistics_task',
        source_id: null,
        department_slug: 'intendance',
      });
    }

    // Filtrer les alertes masquées
    const visibleAlerts = alerts.filter((a: any) => !dismissedKeys.has(a.key));

    // === 5. Santé des départements ===
    const deptHealthMap: Record<string, any> = {};
    (depts || []).forEach((dept: any) => {
      const deptMembers = membersByDept[dept.id] || [];
      const deptAlerts = visibleAlerts.filter((a: any) => a.department_slug === dept.slug);
      const criticalAlerts = deptAlerts.filter((a: any) => a.level === 'CRITIQUE' || a.level === 'IMPORTANT');

      let healthStatus = 'stable';
      let healthLabel = 'Stable';
      if (criticalAlerts.length > 0) {
        healthStatus = 'attention';
        healthLabel = 'Attention requise';
      } else if (deptAlerts.length > 0) {
        healthStatus = 'watch';
        healthLabel = 'Suivi nécessaire';
      }

      const responsible = deptMembers.find((m: any) =>
        ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept)
      );

      deptHealthMap[dept.id] = {
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        short_name: dept.short_name,
        color: dept.color,
        icon: dept.icon,
        description: dept.description,
        member_count: deptMembers.length,
        responsible_name: responsible?.full_name || null,
        health_status: healthStatus,
        health_label: healthLabel,
        alert_count: deptAlerts.length,
        issues: deptAlerts.map((a: any) => ({ title: a.title, level: a.level })),
      };
    });

    // === 6. Échéances importantes ===
    const upcomingDeadlines: any[] = [];

    (events || []).forEach((ev: any) => {
      if (ev.event_date <= in14Days) {
        upcomingDeadlines.push({
          title: ev.title,
          date: ev.event_date,
          time: ev.event_time,
          type: 'event',
          location: ev.location,
        });
      }
    });

    (upcomingCoordMeetings || []).forEach((m: any) => {
      upcomingDeadlines.push({
        title: m.title,
        date: m.date,
        time: m.start_time,
        type: 'meeting',
        department_slug: 'coordination',
      });
    });

    (overdueFollowups || []).forEach((fu: any) => {
      upcomingDeadlines.push({
        title: fu.title,
        date: fu.due_date,
        type: 'overdue_followup',
        department_slug: 'coordination',
      });
    });

    (blockedTasks || []).forEach((task: any) => {
      if (task.due_at) {
        upcomingDeadlines.push({
          title: task.title,
          date: task.due_at,
          type: 'blocked_task',
          department_slug: 'intendance',
        });
      }
    });

    upcomingDeadlines.sort((a: any, b: any) => (a.date || '').localeCompare(b.date || ''));

    // === 7. Activité récente (synthèse métier, pas AuditLog brut) ===
    const recentActivity: any[] = [];

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const newMembers = (members || []).filter((m: any) =>
      m.created_date && new Date(m.created_date) > new Date(sevenDaysAgo)
    );
    if (newMembers.length > 0) {
      const deptNames = new Set(newMembers.map((m: any) => {
        const d = depts.find((dd: any) => dd.id === m.department_id);
        return d?.name || '';
      }).filter(Boolean));
      recentActivity.push({
        title: `${newMembers.length} nouveau(x) membre(s)`,
        description: `Rejoigné(s) : ${[...deptNames].join(', ')}`,
        type: 'new_members',
      });
    }

    const recentDecisions = (decisionList || []).filter((d: any) =>
      d.created_date && new Date(d.created_date) > new Date(sevenDaysAgo)
    );
    if (recentDecisions.length > 0) {
      recentActivity.push({
        title: `${recentDecisions.length} décision(s) de pilotage`,
        description: 'Nouvelles décisions ou suivis créés.',
        type: 'new_decisions',
      });
    }

    // === 8. Statistiques personnes ===
    const userDeptCount: Record<string, Set<string>> = {};
    (members || []).forEach((m: any) => {
      if (!m.user_id) return;
      if (!userDeptCount[m.user_id]) userDeptCount[m.user_id] = new Set();
      userDeptCount[m.user_id].add(m.department_id);
    });
    const multiDeptMembers = Object.entries(userDeptCount)
      .filter(([, deptsSet]) => deptsSet.size > 1)
      .map(([userId, deptsSet]) => {
        const u = users.find((uu: any) => uu.id === userId);
        return {
          user_id: userId,
          full_name: u?.full_name || u?.internal_identifier || '—',
          dept_count: deptsSet.size,
        };
      })
      .sort((a: any, b: any) => b.dept_count - a.dept_count)
      .slice(0, 20);

    const responsables = (members || []).filter((m: any) =>
      ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept)
    ).map((m: any) => {
      const d = depts.find((dd: any) => dd.id === m.department_id);
      return {
        full_name: m.full_name,
        department_name: d?.name || '',
        department_slug: d?.slug || '',
        role_in_dept: m.role_in_dept,
      };
    });

    const deptWithoutResponsible = (depts || []).filter((d: any) => {
      const dm = membersByDept[d.id] || [];
      return dm.length > 0 && !dm.some((m: any) => ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept));
    }).map((d: any) => ({ department_name: d.name, slug: d.slug, member_count: (membersByDept[d.id] || []).length }));

    const deptNeedingReinforcement = (depts || []).filter((d: any) => {
      const dm = membersByDept[d.id] || [];
      return dm.length > 0 && dm.length < 3;
    }).map((d: any) => ({ department_name: d.name, slug: d.slug, member_count: (membersByDept[d.id] || []).length }));

    // === 9. Synthèse FIJ ===
    const fijSummary = {
      total: (fijList || []).length,
      active: (fijList || []).filter((f: any) => f.status === 'active').length,
      paused: (fijList || []).filter((f: any) => f.status === 'paused').length,
      opening: (fijList || []).filter((f: any) => f.status === 'opening').length,
      total_members: (fijList || []).reduce((sum: number, f: any) => sum + (f.member_count || 0), 0),
      fijs: (fijList || []).slice(0, 12).map((f: any) => ({
        id: f.id,
        name: f.name,
        city: f.city,
        status: f.status,
        member_count: f.member_count || 0,
        pilot_name: f.pilot_name || null,
        meeting_day: f.meeting_day || null,
        meeting_time: f.meeting_time || null,
      })),
    };

    // === 10. Synthèse croissance (non sensible) ===
    const growth = {
      active_formations: (activeFormations || []).length,
      active_objectives: (activeObjectives || []).length,
    };

    // === 11. Vie du ministère ===
    const ministryLife = {
      upcoming_events: (events || []).slice(0, 15).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        date: ev.event_date,
        time: ev.event_time,
        location: ev.location,
        event_type: ev.event_type,
        is_featured: ev.is_featured,
      })),
      fij_summary: fijSummary,
      department_activities: (depts || []).map((d: any) => {
        const plans: any[] = [];
        const slug = d.slug;
        if (slug === 'prodiges-musique' && upcomingMusicPlans?.length) plans.push(...upcomingMusicPlans);
        if (slug === 'sono' && upcomingSoundPlans?.length) plans.push(...upcomingSoundPlans);
        if (slug === 'accueil' && upcomingWelcomePlans?.length) plans.push(...upcomingWelcomePlans);
        if (slug === 'moderation' && upcomingModerationPlans?.length) plans.push(...upcomingModerationPlans);
        if (slug === 'intendance' && upcomingLogisticsPlans?.length) plans.push(...upcomingLogisticsPlans);
        if (slug === 'coordination' && upcomingCoordPlans?.length) plans.push(...upcomingCoordPlans);
        if (slug === 'mpi' && upcomingPrayerSchedules?.length) plans.push(...upcomingPrayerSchedules);
        const next = plans
          .filter((p: any) => p.date >= today)
          .sort((a: any, b: any) => (a.date || '').localeCompare(b.date || ''))[0];
        return {
          department_name: d.name,
          slug: d.slug,
          next_activity_title: next?.title || null,
          next_activity_date: next?.date || null,
        };
      }),
    };

    // === 11b. Départements accessibles par l'utilisateur courant ===
    // Un utilisateur Pilotage voit la synthèse de TOUS les départements,
    // mais ne peut ouvrir l'espace opérationnel que s'il en est membre (ou admin/bergere).
    const userRoles = Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles
      : user.role ? [user.role] : [];
    const userBadges = Array.isArray(user.badges) ? user.badges : [];
    const myMemberDeptIds = new Set(
      (members || []).filter((m: any) => m.user_id === user.id).map((m: any) => m.department_id)
    );
    const isBureauOrAdmin =
      userRoles.includes('admin') || userRoles.includes('bergere') || userRoles.includes('bureau') ||
      userBadges.includes('ADMIN') || userBadges.includes('BERGERE') || userBadges.includes('BUREAU');
    const accessibleDepartmentSlugs = isBureauOrAdmin
      ? (depts || []).map((d: any) => d.slug)
      : (depts || []).filter((d: any) => myMemberDeptIds.has(d.id)).map((d: any) => d.slug);

    // === 12. Réponse finale ===
    return Response.json({
      access_granted: true,
      user: {
        id: user.id,
        full_name: user.full_name || user.email,
        roles: user.roles || (user.role ? [user.role] : []),
        badges: user.badges || [],
      },
      accessible_department_slugs: accessibleDepartmentSlugs,
      overview: {
        department_health: Object.values(deptHealthMap),
        upcoming_deadlines: upcomingDeadlines.slice(0, 20),
        attention_points: visibleAlerts.filter((a: any) => a.level === 'IMPORTANT' || a.level === 'CRITIQUE').slice(0, 10),
        recent_activity: recentActivity,
      },
      departments: Object.values(deptHealthMap),
      people: {
        total_active: users.length,
        multi_dept_members: multiDeptMembers,
        responsables: responsables.slice(0, 30),
        departments_without_responsible: deptWithoutResponsible,
        departments_needing_reinforcement: deptNeedingReinforcement,
      },
      growth,
      ministry_life: ministryLife,
      alerts: visibleAlerts,
      dismissed_alert_keys: [...dismissedKeys],
      decisions: (decisionList || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        source_type: d.source_type,
        source_id: d.source_id,
        source_department_slug: d.source_department_slug,
        priority: d.priority,
        status: d.status,
        assigned_to_name: d.assigned_to_name,
        due_date: d.due_date,
        created_by_name: d.created_by_name,
        created_date: d.created_date,
        resolved_at: d.resolved_at,
        resolution_notes: d.resolution_notes,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}