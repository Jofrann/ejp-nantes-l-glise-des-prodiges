import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isAdminUser } from '../../shared/identityUtils.ts';

/**
 * annuaireSearch — Fonction backend de lecture pour l'Annuaire EJP.
 *
 * Actions :
 * - search : liste les personnes avec leurs appartenances + assignments FIJ + filtres
 * - getPerson : fiche complète d'une personne (memberships, FIJ, audit logs)
 * - stats : compteurs légers pour l'Annuaire
 *
 * Toutes les actions nécessitent un compte admin.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(admin)) return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'search':
        return await handleSearch(base44, body);
      case 'getPerson':
        return await handleGetPerson(base44, body);
      case 'stats':
        return await handleStats(base44);
      default:
        return Response.json({ error: 'Action non supportée' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function handleSearch(base44: any, body: any): Promise<Response> {
  const { search, filter_status, filter_badge, filter_department, filter_role } = body;

  // 1. Liste tous les utilisateurs (limite 200)
  const users = await base44.asServiceRole.entities.User.list('-created_date', 200);

  // 2. Toutes les appartenances actives
  const allMembershipsRaw = await base44.asServiceRole.entities.DepartmentMember.filter({}, { limit: 500 });
  const allMemberships = allMembershipsRaw?.items || allMembershipsRaw || [];
  const activeMemberships = allMemberships.filter(m => m.status === 'active' || m.is_active !== false);

  // 3. Tous les départements
  const allDepts = await base44.asServiceRole.entities.Department.filter({}, { limit: 50 });
  const deptMap = {};
  (allDepts.items || allDepts || []).forEach(d => { deptMap[d.id] = d; });

  // 4. Toutes les FIJ (pour pilot assignments)
  const allFijs = await base44.asServiceRole.entities.FIJ.filter({}, { limit: 50 });
  const fijList = allFijs.items || allFijs || [];

  // 5. Construire les personnes
  let persons = (users || []).map(u => {
    const memberships = activeMemberships.filter(m => m.user_id === u.id);
    const departments = memberships.map(m => ({
      membership_id: m.id,
      department_id: m.department_id,
      department_name: deptMap[m.department_id]?.name || '—',
      department_slug: deptMap[m.department_id]?.slug || '',
      role_in_dept: m.role_in_dept,
      joined_at: m.joined_at,
    }));

    const fijAssignments = [];
    for (const f of fijList) {
      if (f.pilot_user_id === u.id) fijAssignments.push({ fij_id: f.id, fij_name: f.name, role: 'pilote' });
      if (f.copilot_user_id === u.id) fijAssignments.push({ fij_id: f.id, fij_name: f.name, role: 'copilote' });
    }

    return {
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      full_name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      internal_identifier: u.internal_identifier,
      phone: u.phone,
      photo_url: u.photo_url,
      account_status: u.account_status || 'pending',
      first_login: u.first_login,
      badges: Array.isArray(u.badges) ? u.badges : [],
      roles: Array.isArray(u.roles) ? u.roles : [],
      role: u.role,
      created_date: u.created_date,
      departments,
      fij_assignments: fijAssignments,
    };
  });

  // 6. Appliquer les filtres
  if (search) {
    const s = search.toLowerCase();
    persons = persons.filter(p =>
      (p.first_name || '').toLowerCase().includes(s) ||
      (p.last_name || '').toLowerCase().includes(s) ||
      (p.full_name || '').toLowerCase().includes(s) ||
      (p.internal_identifier || '').toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s)
    );
  }

  if (filter_status && filter_status !== 'all') {
    persons = persons.filter(p => (p.account_status) === filter_status);
  }

  if (filter_badge && filter_badge !== 'all') {
    persons = persons.filter(p => p.badges.includes(filter_badge));
  }

  if (filter_department && filter_department !== 'all') {
    persons = persons.filter(p => p.departments.some(d => d.department_id === filter_department));
  }

  if (filter_role && filter_role !== 'all') {
    persons = persons.filter(p => p.departments.some(d => d.role_in_dept === filter_role));
  }

  return Response.json({ persons, total: persons.length });
}

async function handleGetPerson(base44: any, body: any): Promise<Response> {
  const { user_id } = body;
  if (!user_id) return Response.json({ error: 'user_id requis' }, { status: 400 });

  const user = await base44.asServiceRole.entities.User.get(user_id);
  if (!user) return Response.json({ error: 'Personne introuvable' }, { status: 404 });

  // Toutes les appartenances (actives + archivées)
  const allMembershipsRaw = await base44.asServiceRole.entities.DepartmentMember.filter({ user_id }, { limit: 100, sort: '-created_date' });
  const allMemberships = allMembershipsRaw?.items || allMembershipsRaw || [];

  // Tous les départements
  const allDepts = await base44.asServiceRole.entities.Department.filter({}, { limit: 50 });
  const deptMap = {};
  (allDepts.items || allDepts || []).forEach(d => { deptMap[d.id] = d; });

  const memberships = (allMemberships || []).map(m => ({
    membership_id: m.id,
    department_id: m.department_id,
    department_name: deptMap[m.department_id]?.name || '—',
    department_slug: deptMap[m.department_id]?.slug || '',
    department_icon: deptMap[m.department_id]?.icon,
    department_color: deptMap[m.department_id]?.color,
    role_in_dept: m.role_in_dept,
    status: m.status,
    is_active: m.is_active,
    joined_at: m.joined_at,
    ended_at: m.ended_at,
    created_date: m.created_date,
  }));

  // Assignments FIJ
  const allFijs = await base44.asServiceRole.entities.FIJ.filter({}, { limit: 50 });
  const fijList = allFijs.items || allFijs || [];
  const fijAssignments = [];
  for (const f of fijList) {
    if (f.pilot_user_id === user.id) fijAssignments.push({ fij_id: f.id, fij_name: f.name, fij_slug: f.slug, role: 'pilote', status: f.status });
    if (f.copilot_user_id === user.id) fijAssignments.push({ fij_id: f.id, fij_name: f.name, fij_slug: f.slug, role: 'copilote', status: f.status });
  }

  // Audit logs pour cette personne
  const auditLogsRaw = await base44.asServiceRole.entities.AuditLog.filter({ entity_type: 'User', entity_id: user_id }, { limit: 50, sort: '-created_date' });
  const auditLogs = auditLogsRaw?.items || auditLogsRaw || [];

  // Logs de membership (entity_type = DepartmentMember) — récupérer via les membership IDs
  const membershipIds = (allMemberships || []).map(m => m.id);
  let membershipLogs: any[] = [];
  if (membershipIds.length > 0) {
    for (const mId of membershipIds.slice(0, 20)) {
      try {
        const mLogsRaw = await base44.asServiceRole.entities.AuditLog.filter({ entity_type: 'DepartmentMember', entity_id: mId }, { limit: 5, sort: '-created_date' });
        const mLogs = mLogsRaw?.items || mLogsRaw || [];
        membershipLogs = membershipLogs.concat(mLogs);
      } catch {}
    }
  }

  // Logs FIJ (entity_type = FIJ) — récupérer via les fij IDs
  const fijIds = fijAssignments.map(f => f.fij_id);
  let fijLogs: any[] = [];
  for (const fId of fijIds) {
    try {
      const fLogsRaw = await base44.asServiceRole.entities.AuditLog.filter({ entity_type: 'FIJ', entity_id: fId }, { limit: 5, sort: '-created_date' });
      const fLogs = fLogsRaw?.items || fLogsRaw || [];
      fijLogs = fijLogs.concat(fLogs);
    } catch {}
  }

  // Combiner et dédupliquer
  const allLogs = [...(auditLogs || []), ...membershipLogs, ...fijLogs];
  const seenIds = new Set();
  const uniqueLogs = allLogs.filter(l => {
    if (seenIds.has(l.id)) return false;
    seenIds.add(l.id);
    return true;
  }).sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()).slice(0, 30);

  // Tous les départements actifs (pour l'ajout)
  const activeDepts = (allDepts.items || allDepts || [])
    .filter(d => d.is_active !== false && d.status === 'active')
    .map(d => ({ id: d.id, name: d.name, slug: d.slug, icon: d.icon, color: d.color }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Toutes les FIJ actives (pour l'assignation)
  const activeFijs = fijList
    .filter(f => f.is_active !== false && f.status !== 'closed')
    .map(f => ({ id: f.id, name: f.name, slug: f.slug, pilot_user_id: f.pilot_user_id, copilot_user_id: f.copilot_user_id }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return Response.json({
    person: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      internal_identifier: user.internal_identifier,
      phone: user.phone,
      photo_url: user.photo_url,
      bio: user.bio,
      account_status: user.account_status || 'pending',
      first_login: user.first_login,
      badges: Array.isArray(user.badges) ? user.badges : [],
      roles: Array.isArray(user.roles) ? user.roles : [],
      role: user.role,
      created_date: user.created_date,
    },
    memberships,
    fij_assignments: fijAssignments,
    audit_logs: uniqueLogs,
    active_departments: activeDepts,
    active_fijs: activeFijs,
  });
}

async function handleStats(base44: any): Promise<Response> {
  const users = await base44.asServiceRole.entities.User.list('-created_date', 200);

  const total = (users || []).length;
  const active = (users || []).filter(u => (u.account_status || 'pending') === 'active').length;
  const pending = (users || []).filter(u => u.account_status === 'pending').length;
  const suspended = (users || []).filter(u => u.account_status === 'suspended').length;
  const archived = (users || []).filter(u => u.account_status === 'archived').length;

  const starCount = (users || []).filter(u => (u.badges || []).includes('STAR')).length;
  const etudiantCount = (users || []).filter(u => (u.badges || []).includes('ETUDIANT')).length;
  const leaderCount = (users || []).filter(u => (u.badges || []).includes('LEADER')).length;
  const bergereCount = (users || []).filter(u => (u.badges || []).includes('BERGERE')).length;
  const adminCount = (users || []).filter(u => (u.badges || []).includes('ADMIN')).length;

  // Responsables = au moins une membership avec role responsable/coordinateur/referent
  const allMembershipsRaw = await base44.asServiceRole.entities.DepartmentMember.filter({}, { limit: 500 });
  const allMemberships = allMembershipsRaw?.items || allMembershipsRaw || [];
  const responsableUserIds = new Set();
  allMemberships.forEach(m => {
    if (['responsable', 'coordinateur', 'referent'].includes(m.role_in_dept) && (m.status === 'active' || m.is_active !== false)) {
      if (m.user_id) responsableUserIds.add(m.user_id);
    }
  });

  return Response.json({
    total,
    active,
    pending,
    suspended,
    archived,
    star: starCount,
    etudiant: etudiantCount,
    leader: leaderCount,
    bergere: bergereCount,
    admin: adminCount,
    responsables: responsableUserIds.size,
  });
}