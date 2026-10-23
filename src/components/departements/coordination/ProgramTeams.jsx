import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Input as SharedInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEJPRead, ReadState, AssignmentList } from "../DepartmentAnalytics";

export function PlanEventLink({ plan, departmentId, onLinked }) {
  const state = useEJPRead("getProgramAssignments", {
    department_id: departmentId,
  });
  const [eventId, setEventId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await base44.functions.invoke("linkDepartmentEvent", {
        department_id: departmentId,
        source: plan.source,
        plan_id: plan.id,
        event_id: eventId,
      });
      onLinked();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="py-3 border-t border-border space-y-2">
      <p className="text-sm">
        {plan.title || "Planning"} · {plan.date || "Date manquante"}
      </p>
      <ReadState state={state}>
        <label className="block text-sm">
          Programme à relier
          <select
            className="block border border-border bg-card rounded-lg p-2 w-full"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">Choisir un programme de la même date</option>
            {state.data?.events
              .filter((e) => e.event_date === plan.date)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} · {e.event_date}
                </option>
              ))}
          </select>
        </label>
        <Button disabled={!eventId || saving} onClick={save}>
          {saving ? "Enregistrement…" : "Relier le planning"}
        </Button>
      </ReadState>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function DepartmentPlanningTools({ departmentId }) {
  const state = useEJPRead("getProgramAssignments", {
    department_id: departmentId,
  });
  return (
    <section className="mt-6 border border-border bg-card rounded-xl p-4">
      <h3 className="font-semibold">Plannings à relier à un programme</h3>
      <ReadState state={state}>
        {state.data?.unlinked_plans.length && state.data?.can_link_plans ? (
          state.data.unlinked_plans.map((plan) => (
            <PlanEventLink
              key={plan.source + plan.id}
              plan={plan}
              departmentId={departmentId}
              onLinked={state.refresh}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            Aucun planning à relier avec tes autorisations actuelles.
          </p>
        )}
      </ReadState>
    </section>
  );
}
const Input = /** @type {React.ComponentType<any>} */ (SharedInput);
const localDay = () =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(
    new Date(),
  );
const rangeEnd = () => {
  const d = new Date(localDay() + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 42);
  return d.toISOString().slice(0, 10);
};
const displayDate = (value) =>
  value
    ? new Date(value + "T12:00:00Z").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date à renseigner";
export default function ProgramTeams() {
  const [from, setFrom] = useState(localDay),
    [to, setTo] = useState(rangeEnd),
    [departmentId, setDepartmentId] = useState(""),
    [eventId, setEventId] = useState("");
  const period = useRef({ from, to });
  const invalidPeriod = Boolean(from && to && from > to);
  if (!invalidPeriod) period.current = { from, to };
  const state = useEJPRead("getProgramAssignments", {
    ...period.current,
    department_id: departmentId || undefined,
  });
  const data = state.data;
  const plans = (data?.plans || []).filter(
    (p) =>
      !eventId ||
      p.event_id === eventId ||
      (!p.event_id &&
        p.date === data.events.find((e) => e.id === eventId)?.event_date),
  );
  const rows = (data?.assignments || []).filter((a) =>
    plans.some((p) => p.plan_id === a.plan_id && p.source === a.plan_source),
  );
  const dates = [...new Set(plans.map((p) => p.date))].sort();
  return (
    <section
      className="ws"
      aria-label="Programmations de tous les départements"
    >
      <header className="ws-intro">
        <div>
          <span className="ws-eyebrow">COORDINATION & LEADERS</span>
          <h1>Les programmations</h1>
          <p>Qui est prévu au service, quand et dans quelle équipe.</p>
        </div>
        <button className="ws-button" onClick={state.refresh}>
          Actualiser
        </button>
      </header>
      <div className="ws-form-grid">
        <label className="ws-field">
          Du
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setEventId("");
            }}
          />
        </label>
        <label className="ws-field">
          Au
          <Input
            type="date"
            min={from || undefined}
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setEventId("");
            }}
          />
        </label>
        <label className="ws-field">
          Département
          <select
            aria-label="Département"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setEventId("");
            }}
          >
            <option value="">Tous les départements</option>
            {data?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ws-field">
          Événement
          <select
            aria-label="Événement"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">Tous les événements et plannings à relier</option>
            {data?.events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.event_date} · {e.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {invalidPeriod ? (
        <p role="alert" className="ws-error">
          La fin de période doit suivre le début.
        </p>
      ) : (
        <ReadState state={state}>
          {data && (
            <>
              <p className="ws-caption">
                {plans.length} programmation(s) ·{" "}
                {
                  rows.filter(
                    (a) =>
                      a.user_id &&
                      !["declined", "replaced", "cancelled"].includes(a.status),
                  ).length
                }{" "}
                affectation(s) prévues ·{" "}
                {
                  rows.filter(
                    (a) =>
                      a.user_id && ["assigned", "pending"].includes(a.status),
                  ).length
                }{" "}
                confirmation(s) attendue(s).
              </p>
              {!plans.length && (
                <div className="ws-method">
                  <h2>Aucune programmation dans cette période</h2>
                  <p>
                    Les responsables renseignent leurs plannings dans leur
                    département. Ils apparaîtront ici, même avant leur
                    rattachement à un événement.
                  </p>
                </div>
              )}
              {dates.map((date) => {
                const dayPlans = plans.filter((p) => p.date === date);
                const ids = [...new Set(dayPlans.map((p) => p.department_id))];
                return (
                  <details
                    key={date}
                    className="ws-method"
                    open={dates.length === 1 ? true : undefined}
                  >
                    <summary>
                      {displayDate(date)} · {ids.length} département(s)
                      programmé(s)
                    </summary>
                    {ids.map((id) => (
                      <section
                        key={id}
                        className="border-t border-border mt-4 pt-4"
                      >
                        <h2 className="font-semibold">
                          {
                            dayPlans.find((p) => p.department_id === id)
                              ?.department_name
                          }
                        </h2>
                        {dayPlans
                          .filter((p) => p.department_id === id)
                          .map((plan) => (
                            <div key={plan.id} className="mt-4">
                              <h3 className="text-sm font-medium">
                                {plan.title}
                              </h3>
                              <p className="ws-caption">
                                {plan.event_id
                                  ? plan.event_title
                                  : "Événement à relier"}{" "}
                                ·{" "}
                                {plan.status === "draft"
                                  ? "Brouillon"
                                  : plan.status === "completed"
                                    ? "Terminé"
                                    : "Programmation enregistrée"}
                                {plan.start_time
                                  ? ` · ${plan.start_time}`
                                  : " · Horaire à renseigner"}
                                {plan.end_time ? `–${plan.end_time}` : ""}
                              </p>
                              <AssignmentList
                                planningOnly
                                rows={rows.filter(
                                  (a) =>
                                    a.plan_id === plan.plan_id &&
                                    a.plan_source === plan.source,
                                )}
                              />
                            </div>
                          ))}
                      </section>
                    ))}
                  </details>
                );
              })}
              {!!data.conflicts.length && (
                <details className="ws-method">
                  <summary>
                    {data.conflicts.length} chevauchement(s) horaire(s) à
                    examiner
                  </summary>
                  {data.conflicts.map((c, i) => (
                    <p key={i}>
                      {data.assignments.find((a) => a.user_id === c.user_id)
                        ?.full_name || "Membre"}{" "}
                      :{" "}
                      {c.assignment_ids
                        .map((id) => {
                          const a = data.assignments.find((a) => a.id === id);
                          return `${a?.department_name} · ${a?.date} · ${a?.start_time}–${a?.end_time}`;
                        })
                        .join(" / ")}
                    </p>
                  ))}
                </details>
              )}
              <p className="ws-caption">
                Lecture des plannings préparés par les départements. Une
                affectation prévue ne signifie pas que le service a été réalisé.
                Les modifications restent dans les espaces des responsables.
              </p>
            </>
          )}
        </ReadState>
      )}
    </section>
  );
}
