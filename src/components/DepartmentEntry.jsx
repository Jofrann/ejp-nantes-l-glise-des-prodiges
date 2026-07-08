import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isFijDepartment } from '@/lib/departmentRouting';
import PageDepartement from '@/pages/departements/PageDepartement';

/**
 * DepartmentEntry — protection routeur.
 * Charge le département par slug, puis :
 *  - si FIJ → redirige vers /app/departements/fij
 *  - sinon → affiche la page département standard
 *
 * Ainsi, même si un lien ancien subsiste, FIJ ne tombera plus dans la mauvaise page.
 */
export default function DepartmentEntry() {
  const { slug } = useParams();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    base44.entities.Department.filter({ slug }).then((results) => {
      setDept(results?.[0] || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  if (dept && isFijDepartment(dept)) {
    return <Navigate to="/app/departements/fij" replace />;
  }

  return <PageDepartement />;
}