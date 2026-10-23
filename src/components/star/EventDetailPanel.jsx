import { useAuth } from "@/lib/AuthContext";
import { isBureauLike, isAdmin } from "@/lib/permissions";
import React, { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  CalendarClock,
  Video,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const ABSENCE_REASONS = [
  { value: "travail", label: "Travail" },
  { value: "etudes", label: "Études" },
  { value: "sante", label: "Santé" },
  { value: "famille", label: "Famille" },
  { value: "deplacement", label: "Déplacement" },
  { value: "service_ailleurs", label: "Service ailleurs" },
  { value: "autre", label: "Autre" },
];

export default function EventDetailPanel({
  event,
  open,
  onClose,
  existingResponse,
  onResponded,
}) {
  const { user } = useAuth();
  const opener = useRef(/** @type {HTMLElement} */ (document.activeElement));
  const [error, setError] = useState("");
  const [status, setStatus] = useState(
    existingResponse?.status || "no_response",
  );
  const [reason, setReason] = useState(existingResponse?.reason_category || "");
  const [lateTime, setLateTime] = useState(
    existingResponse?.estimated_arrival_time || "",
  );
  const [comment, setComment] = useState(existingResponse?.comment || "");
  const [saving, setSaving] = useState(false);
  const [meetUrl, setMeetUrl] = useState(event?.meet_url || null);
  const [generatingMeet, setGeneratingMeet] = useState(false);

  const handleGenerateMeet = async () => {
    if (event?._derived) return;
    setError("");
    setGeneratingMeet(true);
    try {
      const res = await base44.functions.invoke("createMeetLink", {
        event_id: event.id,
        title: event.title,
        event_date: event.event_date,
        event_time: event.event_time,
        end_time: event.end_time,
        description: event.description,
      });
      setMeetUrl(res.data.meet_url);
    } catch (e) {
      setError(e.message || "Action impossible. Réessaie.");
    } finally {
      setGeneratingMeet(false);
    }
  };

  const handleRespond = async (newStatus) => {
    if (event?._derived || event?.presence_mode === "informative") return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        event_id: event.id,
        event_title: event.title,
        event_date: event.event_date,
        status: newStatus,
        reason_category: newStatus === "absent" ? reason : undefined,
        estimated_arrival_time: newStatus === "late" ? lateTime : undefined,
        comment: comment || undefined,
      };
      let result;
      if (existingResponse?.id) {
        result = await base44.entities.AttendanceResponse.update(
          existingResponse.id,
          payload,
        );
      } else {
        result = await base44.entities.AttendanceResponse.create(payload);
      }
      onResponded?.(result);
      onClose();
    } catch (e) {
      setError(e.message || "Action impossible. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  if (!event) return null;
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value && !saving) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/30 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            opener.current?.focus();
          }}
          className="app-event-detail fixed right-0 top-0 bottom-0 z-[90] w-[92vw] max-w-sm bg-white text-slate-800 shadow-2xl p-6 overflow-y-auto outline-none"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="font-semibold">
              Détail du rendez-vous
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-2 text-sm border">
              Fermer
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Horaires, participation et accès en ligne au rendez-vous.
          </Dialog.Description>
          {error && (
            <p role="alert" className="text-sm text-red-700 mb-4">
              {error}
            </p>
          )}
          <div className="mb-5">
            <p className="text-sm font-bold text-foreground leading-tight">
              {event.title}
            </p>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {event.description}
              </p>
            )}
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="w-3.5 h-3.5 text-secondary" />
                <span>
                  {new Date(event.event_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              {event.event_time && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  <span>
                    {event.event_time}
                    {event.end_time ? `–${event.end_time}` : ""}
                  </span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Google Meet */}
          <div className="border-t border-border pt-4 mb-4">
            {meetUrl ? (
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 hover:bg-green-100 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-700">
                    Réunion Google Meet
                  </p>
                  <p className="text-[10px] text-green-600 truncate">
                    {meetUrl}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              </a>
            ) : !event._derived && (isAdmin(user) || isBureauLike(user)) ? (
              <button
                onClick={handleGenerateMeet}
                disabled={generatingMeet}
                className="flex items-center justify-center gap-2 w-full bg-card border border-border rounded-xl py-2.5 text-xs font-semibold text-foreground hover:border-green-400/30 hover:bg-green-50/50 transition-all disabled:opacity-50"
              >
                {generatingMeet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Création du
                    lien…
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5 text-green-600" /> Créer un
                    lien Google Meet
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Le responsable ajoutera ici le lien de visioconference.
              </p>
            )}
          </div>

          {/* Présence */}
          {!event._derived && event.presence_mode !== "informative" && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-heading font-semibold text-foreground mb-3">
                Ma présence
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleRespond("present")}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    status === "present"
                      ? "bg-success/10 border-success/30 text-success"
                      : "bg-card border-border text-muted-foreground hover:border-success/20"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Présent</span>
                </button>
                <button
                  onClick={() => handleRespond("absent")}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    status === "absent"
                      ? "bg-danger/10 border-danger/30 text-danger"
                      : "bg-card border-border text-muted-foreground hover:border-danger/20"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Absent</span>
                </button>
                <button
                  onClick={() => handleRespond("late")}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    status === "late"
                      ? "bg-warning/10 border-warning/30 text-warning"
                      : "bg-card border-border text-muted-foreground hover:border-warning/20"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Retard</span>
                </button>
              </div>

              {(status === "absent" || !status) && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Motif d'absence
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                  >
                    <option value="">Sélectionner...</option>
                    {ABSENCE_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {status === "late" && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Heure d'arrivée estimée
                  </label>
                  <input
                    type="time"
                    value={lateTime}
                    onChange={(e) => setLateTime(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary/40 resize-none"
                />
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
