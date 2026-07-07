import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getFijAccessLevel } from '@/lib/permissions';

export function useFijData() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessLevel = getFijAccessLevel(user, fijs);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.list('display_order', 100),
    ]).then(([u, f]) => {
      setUser(u);
      setFijs((f || []).filter(x => x.is_active !== false));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return { user, fijs, loading, accessLevel, reload: load };
}