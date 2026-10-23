import React, { useEffect, useState, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  addMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
const day = (d) => format(d, "yyyy-MM-dd");
const labels = {
  present: "Présent",
  absent: "Absent",
  late: "Retard",
  no_response: "À renseigner",
};
export default function Presences() {
  const [view, setView] = useState("month"),
    [date, setDate] = useState(new Date()),
    [data, setData] = useState(null),
    [drafts, setDrafts] = useState({}),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [notice, setNotice] = useState(""),
    [editing, setEditing] = useState(null),
    [revision, setRevision] = useState(0);
  const serial = useRef(0),
    opener = useRef(null);
  const from = day(
      view === "month"
        ? startOfMonth(date)
        : view === "week"
          ? startOfWeek(date, { weekStartsOn: 1 })
          : date,
    ),
    to = day(
      view === "month"
        ? endOfMonth(date)
        : view === "week"
          ? endOfWeek(date, { weekStartsOn: 1 })
          : date,
    );
  useEffect(() => {
    const run = ++serial.current;
    setLoading(true);
    setError("");
    base44.functions
      .invoke("getAttendancePeriod", { from, to })
      .then((r) => {
        if (run === serial.current) setData(r.data);
      })
      .catch((e) => {
        if (run === serial.current) setError(e.message);
      })
      .finally(() => {
        if (run === serial.current) setLoading(false);
      });
    return () => {
      serial.current++;
    };
  }, [from, to, revision]);
  const previous = {};
  for (const r of [...(data?.responses || [])].sort((a, b) =>
    a.updated_date.localeCompare(b.updated_date),
  ))
    previous[r.event_id] = r;
  const value = (e) => drafts[e.id] || previous[e.id] || { status: "" };
  const setValue = (event, patch) =>
    setDrafts((d) => ({
      ...d,
      [event.id]: { ...value(event), event_id: event.id, ...patch },
    }));
  const navigate = (delta) => {
    setDate(
      view === "month"
        ? addMonths(date, delta)
        : view === "week"
          ? addWeeks(date, delta)
          : addDays(date, delta),
    );
  };
  async function save() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const rows = Object.values(drafts).filter((r) => r.status);
      const batch = {};
      for (const r of rows) {
        const e = data?.events.find((e) => e.id === r.event_id);
        const month = (e?.event_date || r.event_date || from).slice(0, 7);
        (batch[month] ||= []).push(r);
      }
      for (const [month, responses] of Object.entries(batch)) {
        const d = new Date(month + "-01T12:00:00");
        await base44.functions.invoke("saveAttendancePeriod", {
          from: day(startOfMonth(d)),
          to: day(endOfMonth(d)),
          responses,
        });
      }
      setDrafts({});
      setRevision((n) => n + 1);
      setNotice("Tes présences sont enregistrées.");
    } catch (e) {
      setError(
        e.message || "Enregistrement impossible. Tes choix sont conservés.",
      );
    } finally {
      setSaving(false);
    }
  }
  const events = data?.events || [],
    groups = [...new Set(events.map((e) => e.event_date))];
  return (
    <main className="ws attendance-page max-w-5xl mx-auto p-4 sm:p-8">
      <header className="ws-intro">
        <div>
          <h1>Mes présences</h1>
          <p>
            Une période à la fois. Renseigne tes présences, puis enregistre tes
            choix.
          </p>
        </div>
        <Link className="ws-button" to="/app/agenda">
          Mon agenda
        </Link>
      </header>
      <nav className="ws-tabs" aria-label="Période de présence">
        {[
          ["day", "Jour"],
          ["week", "Semaine"],
          ["month", "Mois"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="attendance-period">
        <button
          className="ws-button"
          aria-label="Période précédente"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <label className="ws-field">
          Date de référence
          <input
            className="ws-button"
            type="date"
            value={day(date)}
            onChange={(e) => {
              if (e.target.value)
                setDate(new Date(e.target.value + "T12:00:00"));
            }}
          />
        </label>
        <button
          className="ws-button"
          aria-label="Période suivante"
          onClick={() => navigate(1)}
        >
          →
        </button>
        <button className="ws-button" onClick={() => setDate(new Date())}>
          Aujourd’hui
        </button>
      </div>
      <h2 className="text-lg font-semibold my-5">
        {view === "day"
          ? format(date, "EEEE d MMMM yyyy", { locale: fr })
          : view === "month"
            ? format(date, "MMMM yyyy", { locale: fr })
            : `Du ${format(new Date(from + "T12:00:00"), "d MMM", { locale: fr })} au ${format(new Date(to + "T12:00:00"), "d MMM yyyy", { locale: fr })}`}
      </h2>
      {notice && <p role="status">{notice}</p>}
      {error && (
        <div role="alert" className="ws-error">
          {error}
          <button
            className="ws-button ml-3"
            onClick={() => setRevision((n) => n + 1)}
          >
            Réessayer
          </button>
        </div>
      )}
      {loading ? (
        <p role="status">Chargement des événements…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 items-center mb-5">
            <p className="ws-caption">
              {events.length} rendez-vous ·{" "}
              {
                events.filter((e) =>
                  ["present", "absent", "late"].includes(value(e).status),
                ).length
              }{" "}
              renseignés
            </p>
            {events.length > 0 && (
              <button
                className="ws-button"
                onClick={() =>
                  setDrafts((d) => ({
                    ...d,
                    ...Object.fromEntries(
                      events.map((e) => [
                        e.id,
                        {
                          ...value(e),
                          event_id: e.id,
                          event_date: e.event_date,
                          status: "present",
                          reason_category: null,
                          estimated_arrival_time: null,
                        },
                      ]),
                    ),
                  }))
                }
              >
                Marquer la période « Présent »
              </button>
            )}
          </div>
          {!events.length && (
            <p className="ws-method">
              Aucun événement à renseigner dans cette période.
            </p>
          )}
          {groups.map((date) => (
            <section key={date} className="attendance-day">
              <h3>
                {format(new Date(date + "T12:00:00"), "EEEE d MMMM", {
                  locale: fr,
                })}
              </h3>
              {events
                .filter((e) => e.event_date === date)
                .map((e) => (
                  <article key={e.id} className="attendance-row">
                    <div>
                      <h4>{e.title}</h4>
                      <p>{e.event_time || "Horaire à confirmer"}</p>
                    </div>
                    <label className="ws-field">
                      Ma présence à {e.title}
                      <select
                        aria-label={"Ma présence à " + e.title + " du " + date}
                        value={value(e).status}
                        onChange={(v) =>
                          setValue(e, {
                            status: v.target.value,
                            event_date: e.event_date,
                          })
                        }
                      >
                        <option value="" disabled>
                          Choisir…
                        </option>
                        {Object.entries(labels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {["absent", "late"].includes(value(e).status) && (
                      <button
                        className="ws-button"
                        onClick={() => {
                          opener.current = document.activeElement;
                          setEditing(e);
                        }}
                      >
                        Préciser
                      </button>
                    )}
                  </article>
                ))}
            </section>
          ))}
        </>
      )}
      {Object.keys(drafts).length > 0 && (
        <div className="attendance-save">
          <span>
            {Object.values(drafts).filter((r) => r.status).length} choix à
            enregistrer
          </span>
          <button
            className="ws-button ws-primary"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Enregistrement…" : "Enregistrer mes présences"}
          </button>
        </div>
      )}
      <Dialog.Root
        open={!!editing}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" />
          <Dialog.Content
            className="ws app-safe-dialog fixed z-[90] bg-white rounded-2xl p-6 shadow-xl"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              opener.current?.focus();
            }}
          >
            <Dialog.Title className="text-lg font-semibold">
              Préciser ma présence
            </Dialog.Title>
            <Dialog.Description>{editing?.title}</Dialog.Description>
            {editing && (
              <>
                <label className="ws-field">
                  {value(editing).status === "late"
                    ? "Arrivée prévue"
                    : "Motif facultatif"}
                  {value(editing).status === "late" ? (
                    <input
                      type="time"
                      value={value(editing).estimated_arrival_time || ""}
                      onChange={(e) =>
                        setValue(editing, {
                          estimated_arrival_time: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <select
                      value={value(editing).reason_category || ""}
                      onChange={(e) =>
                        setValue(editing, { reason_category: e.target.value })
                      }
                    >
                      <option value="">Non précisé</option>
                      {[
                        ["travail", "Travail"],
                        ["etudes", "Études"],
                        ["sante", "Santé"],
                        ["famille", "Famille"],
                        ["deplacement", "Déplacement"],
                        ["service_ailleurs", "Service ailleurs"],
                        ["autre", "Autre"],
                      ].map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                <label className="ws-field">
                  Commentaire facultatif
                  <textarea
                    maxLength={1000}
                    value={value(editing).comment || ""}
                    onChange={(e) =>
                      setValue(editing, { comment: e.target.value })
                    }
                  />
                </label>
              </>
            )}
            <Dialog.Close className="ws-button ws-primary">
              Garder ces précisions
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
