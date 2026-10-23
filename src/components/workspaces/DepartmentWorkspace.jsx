import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { profileFor, WORK_STATUSES, WORK_KINDS } from "@/lib/workspaceProfiles";
import { MODULE_META } from "@/lib/departmentModules";
import { base44 } from "@/api/base44Client";
import { Input as SharedInput } from "@/components/ui/input";
import { Button as SharedButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent as SharedDialogContent,
  DialogHeader,
  DialogTitle as SharedDialogTitle,
  DialogDescription as SharedDialogDescription,
} from "@/components/ui/dialog";
import {
  WorkspaceChart,
  WorkspaceMetrics,
  WorkspaceReadState,
} from "./WorkspacePrimitives";
const Input = /** @type {React.ComponentType<any>} */ (SharedInput);
const Button = /** @type {React.ComponentType<any>} */ (SharedButton);
const DialogContent = /** @type {React.ComponentType<any>} */ (
  SharedDialogContent
);
const DialogTitle = /** @type {React.ComponentType<any>} */ (SharedDialogTitle);
const DialogDescription = /** @type {React.ComponentType<any>} */ (
  SharedDialogDescription
);
export default function DepartmentWorkspace({
  department,
  onNavigateTab,
  view = "summary",
}) {
  const opener = useRef(null);
  const state = useWorkspaceData("getDepartmentWorkspace", department.id);
  const [editing, setEditing] = useState(null),
    [draft, setDraft] = useState(null),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [filter, setFilter] = useState("open"),
    [calendar, setCalendar] = useState(false);
  const d = state.data,
    profile = profileFor(d?.canonical || department.slug);
  const begin = (item) => {
    opener.current = document.activeElement;
    setEditing(item || { request_id: crypto.randomUUID() });
    setDraft(
      item
        ? { ...item }
        : {
            title: "",
            kind:
              department.slug === "communication"
                ? "request"
                : department.slug === "vie-academique"
                  ? "appointment"
                  : "task",
            status: "todo",
            due_date: "",
            assigned_to: "",
          },
    );
    setError("");
    setNotice("");
  };
  async function save(e) {
    e.preventDefault();
    if (saving) return;
    if (!draft.title.trim()) {
      setError("Indiquez le titre de l’action.");
      document.getElementById("ws-title")?.focus();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await base44.functions.invoke("saveDepartmentWorkItem", {
        department_id: department.id,
        request_id: editing.request_id,
        id: editing.id,
        expected_updated_date: editing.updated_date,
        item: draft,
      });
      setEditing(null);
      setDraft(null);
      setNotice("Action enregistrée.");
      await state.reload();
    } catch (e) {
      setError(
        e.message || "Enregistrement impossible. Votre saisie est conservée.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (state.loading || state.error)
    return (
      <div className="ws">
        <WorkspaceReadState {...state} />
      </div>
    );
  const primary = profile.tools[0],
    items = d.items.filter(
      (r) =>
        filter === "all" ||
        (filter === "done"
          ? r.status === "done"
          : !["done", "cancelled"].includes(r.status)),
    );
  return (
    <section className="ws" aria-label={`Espace de travail ${department.name}`}>
      {view === "summary" ? (
        <>
          <header className="ws-intro">
            <div>
              <span className="ws-eyebrow">VOTRE ESPACE DE TRAVAIL</span>
              <h1>{department.name}</h1>
              <p>{profile.subtitle}</p>
            </div>
            <button
              className="ws-button"
              onClick={() => onNavigateTab("workboard")}
            >
              Voir le travail <ArrowUpRight size={15} />
            </button>
          </header>
          <WorkspaceMetrics
            items={[
              [
                "Dans l’équipe",
                d.summary.active_members,
                "Personnes actives distinctes",
              ],
              [
                "Actions en cours",
                d.summary.open,
                "Suivi interne du département",
              ],
              ["À reprendre", d.summary.overdue, "Échéances dépassées"],
              [
                department.slug === "communication"
                  ? department.slug === "communication"
                    ? "Publications terminées"
                    : "Actions terminées"
                  : profile.source
                    ? "Services à venir"
                    : "Actions terminées",
                department.slug === "communication"
                  ? d.items.filter(
                      (i) => i.kind === "publication" && i.status === "done",
                    ).length
                  : profile.source
                    ? d.summary.planned
                    : d.summary.completed,
                department.slug === "communication"
                  ? "Enregistrées par votre équipe"
                  : profile.source
                    ? "Dans les plannings existants"
                    : "Dans le suivi de l’équipe",
              ],
            ]}
          />
          <div className="ws-grid">
            <article className="ws-panel">
              <div className="ws-heading">
                <h2>
                  {profile.source
                    ? "Les services au fil des mois"
                    : department.slug === "communication"
                      ? "Les publications réalisées"
                      : "Les actions réalisées"}
                </h2>
                <span>6 mois</span>
              </div>
              <WorkspaceChart
                data={d.trend}
                label={
                  profile.source
                    ? "Services planifiés"
                    : department.slug === "communication"
                      ? "Publications terminées"
                      : "Actions terminées"
                }
              />
              <p className="ws-caption">
                {profile.source
                  ? "Plannings enregistrés, hors annulations. Ce graphique ne mesure pas la présence."
                  : "Actions marquées terminées, classées par échéance ou date de mise à jour."}
              </p>
            </article>
            <article className="ws-panel ws-soft">
              <h2>La prochaine étape</h2>
              {d.next.length ? (
                d.next.map((p) => (
                  <div className="ws-next" key={p.id}>
                    <strong>{p.title}</strong>
                    <span>
                      {new Date(p.date + "T12:00:00Z").toLocaleDateString(
                        "fr-FR",
                      )}
                    </span>
                    {(primary || d.next_kind === "action") && (
                      <button
                        onClick={() => onNavigateTab(primary || "workboard")}
                      >
                        {primary ? "Ouvrir le planning →" : "Ouvrir le suivi →"}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="ws-caption">
                  {profile.source
                    ? "Aucun service à venir enregistré."
                    : "Aucune action à venir avec une échéance."}
                </p>
              )}
              {department.slug === "accueil" && (
                <p className="ws-caption">
                  {d.summary.visitors_to_contact} visiteurs en cours de suivi.
                  Les contacts restent dans l’outil Visiteurs.
                </p>
              )}
              {department.slug === "sono" && (
                <p className="ws-caption">
                  {d.summary.incidents} incidents non résolus.
                </p>
              )}
              <button
                className="ws-link"
                onClick={() => onNavigateTab("workboard")}
              >
                {d.summary.overdue
                  ? "Revoir les échéances"
                  : "Organiser les prochaines actions"}{" "}
                →
              </button>
            </article>
          </div>
          <div className="ws-heading">
            <h2>Les outils de votre équipe</h2>
            <span>Parcours proposés · à adapter avec votre responsable</span>
          </div>
          <div className="ws-process">
            {profile.steps.map((step, i) => (
              <span key={step}>
                <small>{i + 1}</small>
                {step}
              </span>
            ))}
          </div>
          <div className="ws-tool-list">
            {profile.tools.map((id) => (
              <button key={id} onClick={() => onNavigateTab(id)}>
                {MODULE_META[id]?.label || id}
                <ArrowUpRight size={15} />
              </button>
            ))}
            <button onClick={() => onNavigateTab("team")}>
              Équipe <ArrowUpRight size={15} />
            </button>
            <button onClick={() => onNavigateTab("messages")}>
              Actualités <ArrowUpRight size={15} />
            </button>
            {department.slug === "vie-academique" && (
              <Link to="/app/etudiant">
                Mon espace étudiant <ArrowUpRight size={15} />
              </Link>
            )}
            {department.slug === "leaders" && (
              <Link to="/app/pilotage">
                Pilotage de l’église <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
          <details className="ws-method">
            <summary>Mission et informations du département</summary>
            <p>
              {department.description ||
                "La mission de ce département reste à préciser avec son responsable dans les paramètres existants."}
            </p>
            <p>
              Ces étapes organisent le travail ; elles ne remplacent pas la
              mission officielle de l’équipe.
            </p>
          </details>
        </>
      ) : (
        <>
          <header className="ws-intro">
            <div>
              <h1>
                {department.slug === "communication"
                  ? "Demandes & publications"
                  : department.slug === "vie-academique"
                    ? "Accompagnements & rendez-vous"
                    : "Le travail de l’équipe"}
              </h1>
              <p>Une action, une personne responsable, une prochaine étape.</p>
            </div>
            {d.can_manage && (
              <button
                className="ws-button ws-primary"
                onClick={() => begin(null)}
              >
                Ajouter une action
              </button>
            )}
          </header>
          <div className="ws-heading">
            <label className="ws-field">
              Afficher
              <select
                aria-label="Filtrer les actions"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="open">En cours</option>
                <option value="done">Terminées</option>
                <option value="all">Toutes les actions</option>
              </select>
            </label>
            <p role="status">{notice}</p>
          </div>
          {!d.can_manage && (
            <p className="ws-caption">
              Consultation de l’équipe. Le responsable organise et met à jour
              les actions.
            </p>
          )}
          {department.slug === "communication" && (
            <nav className="ws-tabs" aria-label="Vues des publications">
              <button
                aria-pressed={!calendar}
                onClick={() => setCalendar(false)}
              >
                Liste
              </button>
              <button aria-pressed={calendar} onClick={() => setCalendar(true)}>
                Calendrier éditorial
              </button>
            </nav>
          )}
          {department.slug === "communication" && calendar ? (
            <EditorialCalendar
              items={items}
              onEdit={begin}
              canManage={d.can_manage}
            />
          ) : (
            <div className="ws-work-list">
              {items.length ? (
                items.map((item) => (
                  <article key={item.id}>
                    <div>
                      <small>
                        {WORK_KINDS[item.kind]} · {WORK_STATUSES[item.status]}
                      </small>
                      <h2>{item.title}</h2>
                      <p>
                        {d.team.find((u) => u.id === item.assigned_to)?.name ||
                          "Responsable à attribuer"}
                        {item.due_date &&
                          ` · ${new Date(item.due_date + "T12:00:00Z").toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                    {d.can_manage && (
                      <button
                        className="ws-button"
                        onClick={() => begin(item)}
                        aria-label={`Modifier ${item.title}`}
                      >
                        Modifier
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <div className="ws-empty">Aucune action dans cette vue.</div>
              )}
            </div>
          )}
        </>
      )}
      <p className="ws-caption ws-updated">
        Données enregistrées · actualisées à{" "}
        {new Date(d.generated_at).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !saving) setEditing(null);
        }}
      >
        <DialogContent
          className="ws ws-edit"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (
              opener.current instanceof HTMLElement &&
              opener.current.isConnected
            )
              opener.current.focus();
          }}
        >
          <DialogHeader className="">
            <DialogTitle>
              {editing?.id ? "Modifier l’action" : "Nouvelle action"}
            </DialogTitle>
            <DialogDescription>
              Suivi opérationnel partagé avec le département. Ne saisissez pas
              de notes confidentielles ici.
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <form noValidate onSubmit={save}>
              <label className="ws-field" htmlFor="ws-title">
                Titre
                <Input
                  id="ws-title"
                  maxLength={180}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  aria-invalid={!!error}
                  aria-describedby={error ? "ws-form-error" : undefined}
                />
              </label>
              <div className="ws-form-grid">
                <label className="ws-field">
                  Type
                  <select
                    aria-label="Type"
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft({ ...draft, kind: e.target.value })
                    }
                  >
                    {Object.entries(WORK_KINDS).map(([id, label]) => (
                      <option value={id} key={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ws-field">
                  Étape
                  <select
                    aria-label="Étape"
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({ ...draft, status: e.target.value })
                    }
                  >
                    {Object.entries(WORK_STATUSES).map(([id, label]) => (
                      <option value={id} key={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ws-field">
                  Échéance
                  <Input
                    type="date"
                    value={draft.due_date}
                    onChange={(e) =>
                      setDraft({ ...draft, due_date: e.target.value })
                    }
                  />
                </label>
                <label className="ws-field">
                  Responsable
                  <select
                    aria-label="Responsable"
                    value={draft.assigned_to}
                    onChange={(e) =>
                      setDraft({ ...draft, assigned_to: e.target.value })
                    }
                  >
                    <option value="">À attribuer</option>
                    {d.team.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {error && (
                <p id="ws-form-error" role="alert" className="ws-error">
                  {error}
                </p>
              )}
              <Button disabled={saving} type="submit">
                {saving ? "Enregistrement…" : "Enregistrer l’action"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function EditorialCalendar({ items, onEdit, canManage }) {
  const [month, setMonth] = useState(
    new Intl.DateTimeFormat("fr-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
    })
      .format(new Date())
      .slice(0, 7),
  );
  const date = new Date(month + "-01T12:00:00Z"),
    days = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate(),
    start = (date.getUTCDay() + 6) % 7;
  return (
    <>
      <label className="ws-field">
        Mois
        <Input
          type="month"
          value={month}
          onChange={(e) => {
            if (e.target.value) setMonth(e.target.value);
          }}
        />
      </label>
      <div
        className="ws-calendar"
        aria-label="Calendrier des échéances de publication"
      >
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div className="ws-calendar-dayname" key={day}>
            {day}
          </div>
        ))}
        {Array.from({ length: start }, (_, i) => (
          <div aria-hidden="true" key={"empty" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const key = month + "-" + String(i + 1).padStart(2, "0");
          return (
            <div className="ws-calendar-day" key={key}>
              <strong>{i + 1}</strong>
              {items
                .filter((item) => item.due_date === key)
                .map((item) =>
                  canManage ? (
                    <button key={item.id} onClick={() => onEdit(item)}>
                      {item.title}
                      <small>{WORK_STATUSES[item.status]}</small>
                    </button>
                  ) : (
                    <p key={item.id}>{item.title}</p>
                  ),
                )}
            </div>
          );
        })}
      </div>
      <p className="ws-caption">
        Échéances de vos demandes et publications.{" "}
        {items.filter((i) => !i.due_date).length} actions sans date restent
        disponibles dans la liste. La validation ne déclenche pas de publication
        sur un service externe.
      </p>
    </>
  );
}
