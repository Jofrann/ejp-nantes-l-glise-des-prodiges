import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useFijDashboard(fijs, enabled) {
  const key = fijs
    .map((f) => f.id)
    .sort()
    .join("|");
  const [data, setData] = useState({
    members: [],
    thursday: [],
    weekly: [],
    entries: [],
  });
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    let live = true;
    if (!enabled) {
      setLoading(false);
      return () => {
        live = false;
      };
    }
    if (!key) {
      setLoading(false);
      return () => {
        live = false;
      };
    }
    setLoading(true);
    setError(null);
    const ids = key.split("|");
    // Query by FIJ so a pilot never requests another pilot's member details.
    const scoped = async (name, field = "fij_id") =>
      (
        await Promise.all(
          ids.map((id) =>
            base44.entities[name].filter(
              { [field]: id },
              "-created_date",
              1000,
            ),
          ),
        )
      ).flat();
    Promise.all([
      scoped("FijMember"),
      scoped("FijThursdayReport"),
      scoped("FijWeeklyReport", "fij_house_id"),
      scoped("FijAttendanceEntry"),
    ])
      .then(([members, thursday, weekly, entries]) => {
        if (live) setData({ members, thursday, weekly, entries });
      })
      .catch(() => {
        if (live)
          setError(
            "Les données FIJ n’ont pas pu être chargées. Réessayez pour retrouver les indicateurs.",
          );
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [key, enabled, revision]);
  return { ...data, loading, error, reload };
}
