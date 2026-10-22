import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import FijPageShell, { LoadingSpinner } from "@/components/fij/FijPageShell";
import FijVisualDashboard from "@/components/fij/FijVisualDashboard";
import { useFijData } from "@/hooks/useFijData";
import { isPilotOfFij } from "@/lib/fijPermissions";
const entities = /** @type {Record<string, any>} */ (base44.entities);

export default function PiloteHome() {
  const { user, fijs, loading, error, reload, accessLevel } = useFijData();
  const [comms, setComms] = useState([]);
  const myFijs = fijs.filter((f) => isPilotOfFij(user, f));
  const ids = myFijs.map((f) => f.id);
  useEffect(() => {
    let live = true;
    if (user)
      entities.FijCommunication.filter({}, "-created_date", 20)
        .then((rows) => {
          if (live) setComms(rows);
        })
        .catch(() => {});
    return () => {
      live = false;
    };
  }, [user]);
  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8" role="alert">
        <p>{error}</p>
        <button onClick={reload}>Réessayer</button>
      </div>
    );
  const communications = comms.filter(
    (c) =>
      c.status === "sent" &&
      (c.target_scope === "all_pilots" ||
        c.target_fij_ids?.some((id) => ids.includes(id))),
  );
  return (
    <FijPageShell
      accessLevel={accessLevel}
      visualDashboard
      breadcrumbLabel="Pilote FIJ"
    >
      <FijVisualDashboard user={user} fijs={myFijs} />
      <div className="fij-visual fij-visual-extra">
        <div className="fij-section-heading">
          <h2>Informations & ressources</h2>
          <Link
            className="fij-text-link"
            to="/app/responsabilites/fij-pilote/communications"
          >
            Toutes les communications →
          </Link>
        </div>
        {communications.slice(0, 3).map((c) => (
          <p key={c.id} className="mb-3 text-sm">
            <Link to="/app/responsabilites/fij-pilote/communications">
              {c.title} →
            </Link>
          </p>
        ))}
        <div className="flex flex-wrap gap-5 text-sm">
          <Link to="/app/responsabilites/fij-pilote/cr">Comptes rendus →</Link>
          <Link to="/app/responsabilites/fij-pilote/documents">
            Documents & thèmes →
          </Link>
          <Link to="/app/responsabilites/fij-pilote/alertes">
            Signaler un besoin →
          </Link>
        </div>
      </div>
    </FijPageShell>
  );
}
