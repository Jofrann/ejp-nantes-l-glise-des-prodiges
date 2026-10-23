import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { WorkspaceReadState } from "@/components/workspaces/WorkspacePrimitives";
import {
  Dialog,
  DialogContent as SharedContent,
  DialogHeader,
  DialogTitle as SharedTitle,
  DialogDescription as SharedDescription,
} from "@/components/ui/dialog";
import { Input as SharedInput } from "@/components/ui/input";
const DialogContent = /** @type {React.ComponentType<any>} */ (SharedContent),
  DialogTitle = /** @type {React.ComponentType<any>} */ (SharedTitle),
  DialogDescription = /** @type {React.ComponentType<any>} */ (
    SharedDescription
  ),
  Input = /** @type {React.ComponentType<any>} */ (SharedInput);
const today = () =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(
    new Date(),
  );
export default function CalendarManagement() {
  const opener = useRef(null);
  const state = useWorkspaceData("getCalendarManagement"),
    [draft, setDraft] = useState(null),
    [id, setId] = useState(null),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [settings, setSettings] = useState(null),
    [meetDate, setMeetDate] = useState(""),
    [meetUrl, setMeetUrl] = useState(""),
    [month, setMonth] = useState(today().slice(0, 7));
  const begin = (e) => {
    opener.current = document.activeElement;
    setId(e?.id || null);
    setDraft(
      e
        ? {
            ...e,
            is_public: e.is_public !== false,
            publication_status: e.publication_status || "published",
          }
        : {
            request_id: crypto.randomUUID(),
            title: "",
            description: "",
            event_type: "special",
            event_date: today(),
            event_time: "",
            end_time: "",
            location: "",
            is_public: true,
            publication_status: "draft",
            is_active: true,
          },
    );
    setError("");
  };
  async function save(name, body) {
    if (saving) return false;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await base44.functions.invoke(name, body);
      setNotice("Enregistré. Les agendas utilisent la même source.");
      await state.reload();
      return true;
    } catch (e) {
      setError(e.message || "Enregistrement impossible, saisie conservée.");
      return false;
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
  const schedule = settings || state.data.settings;
  return (
    <section className="ws">
      <header className="ws-intro">
        <div>
          <h1>Événements & agendas</h1>
          <p>
            Publier une fois. Retrouver le rendez-vous sur le site et dans les
            agendas internes.
          </p>
        </div>
        <button className="ws-button ws-primary" onClick={() => begin(null)}>
          Créer un événement
        </button>
      </header>
      <p role="status">{notice}</p>
      {error && (
        <p role="alert" className="ws-error">
          {error}
        </p>
      )}
      <label className="ws-field">
        Mois affiché
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </label>
      <div className="ws-work-list">
        {state.data.events
          .filter((e) => e.event_date?.startsWith(month))
          .sort((a, b) => a.event_date.localeCompare(b.event_date))
          .map((e) => (
            <article key={e.id}>
              <div>
                <small>
                  {e.publication_status === "draft"
                    ? "Brouillon"
                    : e.is_public === false
                      ? "Interne"
                      : "Site public & agendas"}
                  {e.is_active === false ? " · Annulé" : ""}
                  {e.recurrence_key ? " · Récurrent" : ""}
                </small>
                <h2>{e.title}</h2>
                <p>
                  {e.event_date} · {e.event_time || "Horaire à confirmer"}
                  {e.end_time ? "–" + e.end_time : ""}
                </p>
              </div>
              <button
                className="ws-button"
                onClick={() => begin(e)}
                aria-label={"Modifier " + e.title + " du " + e.event_date}
              >
                Modifier
              </button>
            </article>
          ))}
      </div>
      <details className="ws-method">
        <summary>Horaires récurrents</summary>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save("saveCalendarSchedule", { settings: schedule });
          }}
        >
          <p>
            Prodiges Expérience chaque dimanche. FIJ chaque mardi. Prière des
            stars réservée aux personnes affectées au service du dimanche.
          </p>
          <div className="ws-form-grid">
            {[
              ["service_time", "Prodiges Expérience · début"],
              ["service_end", "Prodiges Expérience · fin facultative"],
              ["fij_time", "FIJ · début facultatif"],
              ["fij_end", "FIJ · fin facultative"],
              ["stars_time", "Prière des stars · début"],
              ["stars_end", "Prière des stars · fin"],
            ].map(([key, label]) => (
              <label className="ws-field" key={key}>
                {label}
                <Input
                  type="time"
                  value={schedule[key] || ""}
                  onChange={(e) =>
                    setSettings({ ...schedule, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <button disabled={saving} className="ws-button" type="submit">
            Enregistrer les horaires
          </button>
        </form>
      </details>
      <details className="ws-method">
        <summary>Lien Meet privé de la prière des stars</summary>
        <p>
          Ajoutez le lien du dimanche concerné. Les serviteurs programmés
          reçoivent une notification dans l’application ; le lien est accessible
          dans leur agenda privé. Les nouvelles affectations sont prises en
          compte automatiquement.
        </p>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save("shareStarsMeeting", {
              event_date: meetDate,
              meet_url: meetUrl,
            });
          }}
        >
          <div className="ws-form-grid">
            <label className="ws-field">
              Dimanche concerné
              <Input
                type="date"
                value={meetDate}
                onChange={(e) => setMeetDate(e.target.value)}
              />
            </label>
            <label className="ws-field">
              Lien Google Meet
              <Input
                type="url"
                value={meetUrl}
                placeholder="https://meet.google.com/abc-defg-hij"
                onChange={(e) => setMeetUrl(e.target.value)}
              />
            </label>
          </div>
          <button className="ws-button" type="submit" disabled={saving}>
            Partager dans les agendas privés
          </button>
        </form>
        <div className="ws-caption">
          {state.data.meetings.map((m) => (
            <p key={m.id}>{m.event_date} · lien enregistré</p>
          ))}
        </div>
      </details>
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open && !saving) setDraft(null);
        }}
      >
        <DialogContent
          className="ws ws-edit"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            opener.current?.focus();
          }}
        >
          <DialogHeader className="">
            <DialogTitle>
              {id ? "Modifier le rendez-vous" : "Nouvel événement"}
            </DialogTitle>
            <DialogDescription>
              Public : site et tous les agendas. Interne : agendas des
              serviteurs uniquement. Un brouillon n’est pas diffusé.
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <form
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await save("saveCalendarEvent", {
                    id,
                    event: draft,
                    request_id: draft.request_id,
                  })
                )
                  setDraft(null);
              }}
            >
              <label className="ws-field">
                Titre
                <Input
                  required
                  maxLength={180}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </label>
              <div className="ws-form-grid">
                {[
                  ["event_date", "Date", "date"],
                  ["event_time", "Début (facultatif)", "time"],
                  ["end_time", "Fin (facultative)", "time"],
                  ["location", "Lieu", "text"],
                ].map(([key, label, type]) => (
                  <label className="ws-field" key={key}>
                    {label}
                    <Input
                      type={type}
                      value={draft[key] || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="ws-field">
                  Type
                  <select
                    aria-label="Type d’événement"
                    value={draft.event_type}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        event_type: e.target.value,
                        title:
                          e.target.value === "culte"
                            ? "Prodiges Expérience"
                            : draft.title,
                      })
                    }
                  >
                    {[
                      ["culte", "Prodiges Expérience"],
                      ["fij", "FIJ"],
                      ["special", "Événement spécial"],
                      ["formation", "Formation"],
                      ["reunion", "Réunion"],
                      ["service", "Service"],
                      ["ejp", "Programme EJP"],
                      ["autre", "Autre"],
                    ].map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ws-field">
                  Diffusion
                  <select
                    aria-label="Diffusion"
                    value={draft.is_public ? "public" : "internal"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        is_public: e.target.value === "public",
                      })
                    }
                  >
                    <option value="public">
                      Site public & tous les agendas
                    </option>
                    <option value="internal">
                      Agendas internes uniquement
                    </option>
                  </select>
                </label>
                <label className="ws-field">
                  Publication
                  <select
                    aria-label="Publication"
                    value={draft.publication_status}
                    onChange={(e) =>
                      setDraft({ ...draft, publication_status: e.target.value })
                    }
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </label>
                <label className="ws-field">
                  Disponibilité
                  <select
                    aria-label="Disponibilité du rendez-vous"
                    value={draft.is_active === false ? "cancelled" : "active"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        is_active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Actif</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </label>
              </div>
              <label className="ws-field">
                Description
                <Input
                  value={draft.description || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </label>
              {error && (
                <p role="alert" className="ws-error">
                  {error}
                </p>
              )}
              <button
                className="ws-button ws-primary"
                disabled={saving}
                type="submit"
              >
                {saving ? "Enregistrement…" : "Enregistrer l’événement"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
export function DepartmentCalendar({ departmentId }) {
  const state = useWorkspaceData("getAgendaData", departmentId);
  if (state.loading || state.error)
    return (
      <div className="ws">
        <WorkspaceReadState {...state} />
      </div>
    );
  return (
    <section className="ws">
      <header className="ws-intro">
        <div>
          <h1>Agenda du département</h1>
          <p>
            Les rendez-vous communs de l’église et vos services personnels à
            venir.
          </p>
        </div>
        <Link to="/app/agenda" className="ws-button">
          Ouvrir mon agenda complet
        </Link>
      </header>
      <div className="ws-work-list">
        {state.data.events.map((e) => (
          <article key={e.id}>
            <div>
              <small>
                {e._scope === "prayer"
                  ? "Prière privée"
                  : e._scope === "service"
                    ? "Votre service"
                    : e.is_public === false
                      ? "Interne"
                      : "Rendez-vous commun"}
              </small>
              <h2>{e.title}</h2>
              <p>
                {e.event_date} · {e.event_time || "Horaire à confirmer"}
                {e.end_time ? "–" + e.end_time : ""}
              </p>
            </div>
            {e.meet_url && (
              <a
                className="ws-button"
                href={e.meet_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rejoindre sur Meet
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
