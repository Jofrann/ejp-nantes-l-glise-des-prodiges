import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutGrid, Users, ChevronRight, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getDepartmentRoute } from '@/lib/departmentRouting';

export default function Organisation() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.DepartmentMember.filter({ is_active: true }, null, 200),
      base44.entities.Department.list('display_order', 50),
    ]).then(([u, mems, depts]) => {
      setUser(u);
      setMemberships((mems || []).filter(m => m.user_id === u?.id));
      setDepartments(depts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mon organisation</h1>
        <p className="text-sm text-muted-foreground">Tes rattachements, équipes et référents.</p>
      </motion.div>

      {/* Mes rattachements */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mes rattachements</h2>
      {memberships.length === 0 ? (
        <div className="text-center py-8 mb-6">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Tu n'es rattaché à aucun département.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {memberships.map((m, i) => {
            const dept = departments.find(d => d.id === m.department_id);
            if (!dept) return null;
            const isReferent = m.role_in_dept === 'referent';
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={getDepartmentRoute(dept)}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
                    <span className={`text-[10px] ${isReferent ? 'text-secondary' : 'text-muted-foreground'}`}>
                      {isReferent ? 'Référent' : 'Membre'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tous les départements */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Tous les départements</h2>
      <div className="space-y-2">
        {departments.filter(d => d.is_active).map(dept => (
          <Link key={dept.id} to={getDepartmentRoute(dept)}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
              {dept.description && <p className="text-xs text-muted-foreground truncate">{dept.description}</p>}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}