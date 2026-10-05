import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getRedirectForSlug } from '@/lib/departmentModules';
import PageDepartement from '@/pages/departements/PageDepartement';

/**
 * DepartmentEntry — Protection routeur.
 * Charge le département par slug, puis :
 *  - si le département a une redirection configurée (pilote-fij, coordination-fij) → redirige
 *  - sinon → affiche la page département standard (moteur commun)
 *
 * FIJ (slug: fij) affiche sa page générique avec un lien vers l'espace spécialisé.
 */
export default function DepartmentEntry() {
  const { slug } = useParams();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let found = false;
    base44.entities.Department.filter({ slug }).then((results) => {
      if (results?.[0]) { setDept(results[0]); found = true; }
      if (!found) return base44.entities.Department.filter({ id: slug });
      return null;
    }).then((results) => {
      if (!found && results?.[0]) setDept(results[0]);
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

  // Redirection vers espace spécialisé (pilote-fij, coordination-fij)
  if (dept && getRedirectForSlug(dept.slug)) {
    return <Navigate to={getRedirectForSlug(dept.slug)} replace />;
  }

  return <PageDepartement />;
}