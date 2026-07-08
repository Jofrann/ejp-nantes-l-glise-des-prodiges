import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isFijCoordination } from '@/lib/permissions';
import { isFijCoordinationRole, isFijDirectionRole, isPilotOfFij, getFijAccessLevelV2 } from '@/lib/fijPermissions';

export function useFijData() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);

      const allFijs = await base44.entities.FIJ.list('display_order', 100);

      // Coordination ou direction : toutes les FIJ
      // Pilote : uniquement ses FIJ (pilot, copilot, ou co_pilot_user_ids)
      if (isFijCoordinationRole(u) || isFijDirectionRole(u)) {
        setFijs((allFijs || []).filter(x => x.is_active !== false));
      } else {
        const owned = (allFijs || []).filter(f =>
          f.is_active !== false && isPilotOfFij(u, f)
        );
        setFijs(owned);
      }
    } catch {
      setFijs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accessLevel = getFijAccessLevelV2(user, fijs);
  return { user, fijs, loading, accessLevel, reload: load };
}