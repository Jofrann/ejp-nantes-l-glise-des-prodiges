import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getFijAccessLevel, isFijCoordination } from '@/lib/permissions';

export function useFijData() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);

      // Si coordination/direction : charger toutes les FIJ
      // Si pilote : charger uniquement ses FIJ
      if (isFijCoordination(u)) {
        const all = await base44.entities.FIJ.list('display_order', 100);
        setFijs((all || []).filter(x => x.is_active !== false));
      } else {
        // Pilote : filtrer côté requête par pilot_user_id
        const owned = await base44.entities.FIJ.filter({ pilot_user_id: u.id }, 'display_order', 100).catch(() => []);
        setFijs((owned || []).filter(x => x.is_active !== false));
      }
    } catch {
      setFijs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accessLevel = getFijAccessLevel(user, fijs);
  return { user, fijs, loading, accessLevel, reload: load };
}