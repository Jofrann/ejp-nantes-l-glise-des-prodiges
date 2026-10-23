import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { WorkspaceReadState } from "@/components/workspaces/WorkspacePrimitives";
import * as Dialog from "@radix-ui/react-dialog";
import { Input as SharedInput } from "@/components/ui/input";
const Input = /** @type {React.ComponentType<any>} */ (SharedInput);
const today = () =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(
    new Date(),
  );
export default function DepartmentProgramming({ departmentId }) {
  const state = useWorkspaceData("getDepartmentProgramming", departmentId),
    opener = useRef(null);
  const [draft, setDraft] = useState(null),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const begin = (plan) => {
    opener.current = document.activeElement;
    setError("");
    setDraft(
      plan
        ? {
            ...plan,
            assignments: state.data.assignments
              .filter(
                (a) =>
                  a.service_plan_id === plan.id &&
                  !["replaced", "cancelled"].includes(a.status),
              )
              .map((a) => ({ user_id: a.user_id, position: a.position })),
          }
        : {
            request_id: crypto.randomUUID(),
            title: "Prodiges Expérience",
            date: today(),
            start_time: "",
            end_time: "",
            status: "planned",
            assignments: [],
          },
    );
  };
  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await base44.functions.invoke("saveDepartmentProgramming", {
        department_id: departmentId,
        id: draft.id,
        request_id: draft.request_id,
        expected_updated_date: draft.updated_date,
        program: draft,
        assignments: draft.assignments,
      });
      await state.reload();
      setDraft(null);
      setNotice(
        "Programmation enregistrée. Les agendas sont actualisés ; les notifications sont envoyées dans l’application.",
      );
      window.dispatchEvent(new Event("ejp-notifications-updated"));
    } catch (e) {
      setError(
        e.message || "Enregistrement impossible. La saisie est conservée.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (state.loading || state.error)
    return (
      <section className="ws">
        <WorkspaceReadState {...state} />
      </section>
    );
  const d = state.data;
  return (
    <section className="ws">
      <header className="ws-intro">
        <div>
          <h1>Programmer mon équipe</h1>
          <p>
            Préparer les services à l’avance et affecter les serviteurs du
            département.
          </p>
        </div>
        {d.can_manage && (
          <button className="ws-button ws-primary" onClick={() => begin(null)}>
            Préparer une programmation
          </button>
        )}
      </header>
      <p role="status">{notice}</p>
      <div className="ws-work-list">
        {d.plans
          .filter((p) => p.date >= today())
          .map((p) => (
            <article key={p.id}>
              <div>
                <small>
                  {p.date} {p.start_time ? "· " + p.start_time : ""}{" "}
                  {p.status === "cancelled" ? "· Annulée" : ""}
                </small>
                <h2>{p.title}</h2>
                <p>
                  {d.assignments
                    .filter(
                      (a) =>
                        a.service_plan_id === p.id &&
                        !["replaced", "cancelled"].includes(a.status),
                    )
                    .map(
                      (a) =>
                        (d.members.find((m) => m.id === a.user_id)?.full_name ||
                          "Membre") +
                        " · " +
                        a.position,
                    )
                    .join(" / ") || "Aucun serviteur affecté"}
                </p>
              </div>
              {d.can_manage && (
                <button className="ws-button" onClick={() => begin(p)}>
                  Modifier
                </button>
              )}
            </article>
          ))}
      </div>
      {!d.plans.some((p) => p.date >= today()) && (
        <p className="ws-method">
          Aucune programmation à venir. Les plannings spécialisés du département
          restent disponibles dans ses autres outils.
        </p>
      )}
      <Dialog.Root
        open={!!draft}
        onOpenChange={(v) => {
          if (!v && !saving) setDraft(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/30 backdrop-blur-sm" />
          <Dialog.Content
            className="ws ws-edit app-safe-dialog fixed z-[90] bg-white rounded-2xl p-6 shadow-xl"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              opener.current?.focus();
            }}
          >
            <Dialog.Title className="text-lg font-semibold">
              {draft?.id
                ? "Modifier la programmation"
                : "Préparer une programmation"}
            </Dialog.Title>
            <Dialog.Description className="ws-caption">
              Les affectations sont privées et visibles par la coordination
              générale et les leaders. Chaque serviteur retrouve ses services
              dans son agenda.
            </Dialog.Description>
            {draft && (
              <form onSubmit={save} noValidate>
                <label className="ws-field">
                  Titre
                  <Input
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </label>
                <div className="ws-form-grid">
                  {[
                    ["date", "Date du service", "date"],
                    ["start_time", "Début facultatif", "time"],
                    ["end_time", "Fin facultative", "time"],
                  ].map(([key, label, type]) => (
                    <label key={key} className="ws-field">
                      {label}
                      <Input
                        type={type}
                        value={draft[key] || ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            [key]: e.target.value,
                            ...(key === "date" ? { event_id: null } : {}),
                          })
                        }
                      />
                    </label>
                  ))}
                  <label className="ws-field">
                    Statut
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value })
                      }
                    >
                      <option value="planned">Programmée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </label>
                </div>
                <label className="ws-field">
                  Événement (facultatif)
                  <select
                    value={draft.event_id || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, event_id: e.target.value || null })
                    }
                  >
                    <option value="">Programmation indépendante</option>
                    {d.events
                      ?.filter((e) => e.event_date === draft.date)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                          {e.event_time ? " · " + e.event_time : ""}
                        </option>
                      ))}
                  </select>
                </label>
                <fieldset className="space-y-3">
                  <legend className="font-semibold mb-3">
                    Serviteurs à affecter
                  </legend>
                  {d.members.map((m) => {
                    const a = draft.assignments.find((a) => a.user_id === m.id);
                    return (
                      <div key={m.id} className="border-b border-border pb-3">
                        <label className="flex gap-3 items-center text-sm">
                          <input
                            type="checkbox"
                            checked={!!a}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                assignments: e.target.checked
                                  ? [
                                      ...draft.assignments,
                                      { user_id: m.id, position: "" },
                                    ]
                                  : draft.assignments.filter(
                                      (a) => a.user_id !== m.id,
                                    ),
                              })
                            }
                          />
                          {m.full_name}
                        </label>
                        {a && (
                          <label className="ws-field mt-2">
                            Poste de {m.full_name}
                            <Input
                              value={a.position}
                              placeholder="Ex. accueil, régie, coordination…"
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  assignments: draft.assignments.map((x) =>
                                    x.user_id === m.id
                                      ? { ...x, position: e.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                  {!d.members.length && (
                    <p>
                      Aucun serviteur actif dans ce département. Ajoute d’abord
                      les membres de l’équipe.
                    </p>
                  )}
                </fieldset>
                {error && (
                  <p role="alert" className="ws-error">
                    {error}
                  </p>
                )}
                <div className="app-dialog-actions flex flex-wrap gap-3 mt-6">
                  <button
                    disabled={saving}
                    className="ws-button ws-primary"
                    type="submit"
                  >
                    {saving ? "Enregistrement…" : "Enregistrer et notifier"}
                  </button>
                  <Dialog.Close className="ws-button" disabled={saving}>
                    Fermer
                  </Dialog.Close>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
