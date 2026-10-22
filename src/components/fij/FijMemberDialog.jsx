import React, { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Phone, Mail, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogTitle as SharedTitle,
  DialogDescription as SharedDescription,
} from "@/components/ui/dialog";
import { Button as SharedButton } from "@/components/ui/button";
import { Textarea as SharedTextarea } from "@/components/ui/textarea";
import { attendanceSummary } from "@/lib/fijAnalytics";
import {
  canReadFijMembers,
  canCreateMemberNote,
  canUpdateFijMember,
  isFijCoordinationRole,
  GROWTH_STATUS_LABELS,
} from "@/lib/fijPermissions";
import "./fijDashboard.css";

// Existing JS shared controls do not declare their forwardRef props yet.
const Button = /** @type {React.ComponentType<any>} */ (SharedButton);
const Textarea = /** @type {React.ComponentType<any>} */ (SharedTextarea);
const DialogTitle = /** @type {React.ComponentType<any>} */ (SharedTitle);
const DialogDescription = /** @type {React.ComponentType<any>} */ (
  SharedDescription
);
const entities = /** @type {Record<string, any>} */ (base44.entities);

export default function FijMemberDialog({
  member,
  fij,
  user,
  onClose,
  onUpdated,
}) {
  const opener = useRef(document.activeElement);
  const [tab, setTab] = useState("profile"),
    [entries, setEntries] = useState([]),
    [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [saving, setSaving] = useState(false),
    [content, setContent] = useState("");
  const [growth, setGrowth] = useState(member?.growth_status || ""),
    [notice, setNotice] = useState("");
  const allowed =
    member && fij && member.fij_id === fij.id && canReadFijMembers(user, fij);
  useEffect(() => {
    let live = true;
    setTab("profile");
    setLoading(true);
    setError(null);
    setNotice("");
    setContent("");
    setGrowth(member?.growth_status || "");
    if (!allowed) {
      setLoading(false);
      return;
    }
    Promise.all([
      entities.FijAttendanceEntry.filter(
        { member_id: member.id, fij_id: fij.id },
        "-thursday_date",
        1000,
      ),
      entities.FijMemberNote.filter(
        { member_id: member.id, fij_id: fij.id },
        "-created_date",
        100,
      ),
    ])
      .then(([e, n]) => {
        if (live) {
          setEntries(e);
          setNotes(n);
        }
      })
      .catch(() => {
        if (live)
          setError(
            "Impossible de charger l’historique. Fermez puis rouvrez la fiche pour réessayer.",
          );
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [member?.id, fij?.id, allowed]);
  if (!member || !allowed) return null;
  const summary = attendanceSummary(entries),
    label = GROWTH_STATUS_LABELS[member.growth_status] || "Non renseigné";
  const base = isFijCoordinationRole(user)
    ? "/app/responsabilites/fij-coordination/registre"
    : "/app/responsabilites/fij-pilote/mes-fij";
  async function addNote(e) {
    e.preventDefault();
    if (!content.trim() || saving) return;
    setSaving(true);
    setError(null);
    setNotice("");
    try {
      const note = await entities.FijMemberNote.create({
        fij_id: fij.id,
        member_id: member.id,
        member_name: member.full_name,
        content: content.trim(),
        note_type: "suivi",
        author_user_id: user.id,
        author_name: user.full_name || user.email,
        visibility: isFijCoordinationRole(user)
          ? "coordination_fij"
          : "pilote_fij",
      });
      setNotes((n) => [note, ...n]);
      setContent("");
      setNotice("Note enregistrée.");
    } catch {
      setError("La note n’a pas été enregistrée. Votre texte est conservé.");
    } finally {
      setSaving(false);
    }
  }
  async function updateGrowth(e) {
    setGrowth(e.target.value);
    setSaving(true);
    setError(null);
    try {
      await entities.FijMember.update(member.id, {
        growth_status: e.target.value,
      });
      onUpdated?.();
      setNotice("Parcours mis à jour.");
    } catch {
      setGrowth(member.growth_status || "");
      setError("Le parcours n’a pas été modifié. Réessayez.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fij-member-overlay" />
        <DialogPrimitive.Content
          className="fij-member-dialog fij-visual"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = opener.current;
            if (target instanceof HTMLElement && target.isConnected)
              target.focus();
          }}
        >
          <DialogPrimitive.Close
            className="fij-dialog-close"
            aria-label="Fermer la fiche membre"
          >
            <X size={20} />
          </DialogPrimitive.Close>
          <div className="fij-member-hero">
            <span className="fij-kicker">
              CONNAÎTRE & ACCOMPAGNER · {fij.name}
            </span>
            <DialogTitle className="fij-member-name">
              {member.full_name}
            </DialogTitle>
            <DialogDescription>
              Le parcours, les présences et les attentions qui comptent.
            </DialogDescription>
            <div className="fij-person-meta">
              <span>
                {member.age ? `${member.age} ans` : "Âge non renseigné"}
              </span>
              <span>{member.city || "Ville non renseignée"}</span>
              <span>{label}</span>
            </div>
          </div>
          <nav className="fij-local-tabs" aria-label="Rubriques du membre">
            {[
              ["profile", "Profil"],
              ["journey", "Évolution & présences"],
              ["care", "Accompagnement"],
            ].map(([key, text]) => (
              <button
                key={key}
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
              >
                {text}
              </button>
            ))}
          </nav>
          {error && (
            <p role="alert" className="fij-error">
              {error}
            </p>
          )}
          <div className="fij-dialog-body">
            {tab === "profile" && (
              <>
                <div className="fij-contact-row">
                  {member.phone && (
                    <a href={`tel:${member.phone}`}>
                      <Phone size={15} />
                      {member.phone}
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`}>
                      <Mail size={15} />
                      {member.email}
                    </a>
                  )}
                </div>
                <dl className="fij-profile-grid">
                  <div>
                    <dt>Dans la FIJ depuis</dt>
                    <dd>
                      {member.entry_date
                        ? new Date(
                            member.entry_date + "T12:00:00",
                          ).toLocaleDateString("fr-FR")
                        : "Non renseigné"}
                    </dd>
                  </div>
                  <div>
                    <dt>Pilote</dt>
                    <dd>{fij.pilot_name || "Non renseigné"}</dd>
                  </div>
                  <div>
                    <dt>Participation enregistrée</dt>
                    <dd>
                      {loading
                        ? "Chargement…"
                        : summary.rate == null
                          ? "Aucune présence renseignée"
                          : `${summary.rate} % · ${summary.present} / ${summary.total} rencontres`}
                    </dd>
                  </div>
                  <div>
                    <dt>Situation</dt>
                    <dd>{member.is_active === false ? "Inactif" : "Actif"}</dd>
                  </div>
                </dl>
                <h3>Repères personnels</h3>
                <p className="fij-subtle">
                  {member.notes ||
                    "Aucune information complémentaire enregistrée."}
                </p>
                <h3>Formation & potentiel</h3>
                <p className="fij-subtle">
                  {member.training_potential || "Non renseigné"}
                </p>
                <Link
                  className="fij-text-link"
                  to={
                    isFijCoordinationRole(user)
                      ? `${base}/${fij.id}`
                      : `${base}/${fij.id}/membres/${member.id}`
                  }
                >
                  Ouvrir l’espace de gestion existant <ArrowUpRight size={15} />
                </Link>
              </>
            )}
            {tab === "journey" && (
              <>
                <div className="fij-section-heading">
                  <div>
                    <h3>Présences enregistrées</h3>
                    <p>Les absences non renseignées ne sont pas comptées.</p>
                  </div>
                  <strong>
                    {loading
                      ? "…"
                      : summary.rate == null
                        ? "—"
                        : `${summary.rate} %`}
                  </strong>
                </div>
                <div className="fij-presence-strip">
                  {summary.rows
                    .slice(0, 16)
                    .reverse()
                    .map((e) => (
                      <div
                        key={e.id}
                        className={e.present ? "present" : "absent"}
                      >
                        <b>{e.present ? (e.late ? "R" : "P") : "A"}</b>
                        <span>
                          {e.thursday_date
                            ?.slice(5)
                            .split("-")
                            .reverse()
                            .join("/")}
                        </span>
                      </div>
                    ))}
                </div>
                <p className="fij-subtle">
                  P : présent · A : absent · R : présent en retard
                </p>
                {!loading && !entries.length && (
                  <p>Aucun historique de présence disponible.</p>
                )}
                <h3>Parcours actuel</h3>
                {canUpdateFijMember(user, fij) ? (
                  <>
                    <label htmlFor="fij-growth" className="fij-subtle">
                      Statut renseigné par le pilote
                    </label>
                    <select
                      id="fij-growth"
                      value={growth}
                      disabled={saving}
                      onChange={updateGrowth}
                    >
                      <option value="" disabled>
                        Non renseigné
                      </option>
                      {Object.entries(GROWTH_STATUS_LABELS).map(([k, v]) => (
                        <option value={k} key={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p>{label}</p>
                )}
                <p className="fij-subtle">
                  Le statut est un repère d’accompagnement. L’historique de ses
                  changements n’est pas encore enregistré.
                </p>
              </>
            )}
            {tab === "care" && (
              <>
                <h3>Prendre soin, dans la durée</h3>
                {canCreateMemberNote(user, fij) && (
                  <form noValidate onSubmit={addNote}>
                    <label htmlFor="fij-care-note">
                      Ajouter une note de suivi
                    </label>
                    <Textarea
                      className="resize-y"
                      id="fij-care-note"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Échange, besoin exprimé, prochaine attention…"
                      required
                      maxLength={5000}
                    />
                    <Button type="submit" disabled={saving || !content.trim()}>
                      {saving ? "Enregistrement…" : "Enregistrer la note"}
                    </Button>
                  </form>
                )}
                <div className="fij-timeline">
                  {loading ? (
                    <p>Chargement du suivi…</p>
                  ) : notes.length ? (
                    notes.map((n) => (
                      <article key={n.id}>
                        <small>
                          {n.created_date
                            ? new Date(n.created_date).toLocaleDateString(
                                "fr-FR",
                              )
                            : "Date non renseignée"}{" "}
                          · {n.author_name || "Pilote"}
                        </small>
                        <p>{n.content}</p>
                      </article>
                    ))
                  ) : (
                    <p className="fij-subtle">Aucun suivi enregistré.</p>
                  )}
                </div>
              </>
            )}
            <p role="status" className="fij-subtle">
              {notice}
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
