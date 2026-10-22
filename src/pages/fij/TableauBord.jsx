import React from "react";
import FijPageShell, { LoadingSpinner } from "@/components/fij/FijPageShell";
import { useFijData } from "@/hooks/useFijData";
import FijVisualDashboard from "@/components/fij/FijVisualDashboard";

export default function TableauBord() {
  const { user, fijs, loading, error, reload, accessLevel } = useFijData();
  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8" role="alert">
        <p>{error}</p>
        <button onClick={reload}>Réessayer</button>
      </div>
    );
  return (
    <FijPageShell
      accessLevel={accessLevel}
      breadcrumbLabel="Coordination FIJ"
      visualDashboard
      requiredRoles={["coordination", "direction"]}
    >
      <FijVisualDashboard user={user} fijs={fijs} coordination />
    </FijPageShell>
  );
}
