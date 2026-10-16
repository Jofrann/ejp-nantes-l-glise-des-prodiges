import React, { useState } from "react";
import { Upload, Images, ExternalLink, ImageOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PUBLIC_IMAGE_SLOTS, resolvePublicImage } from "@/lib/publicMedia";

export default function PublicPhotosEditor({
  config,
  setConfig,
  gallery,
  leaders,
  onOpenGallery,
  onSave,
  saving,
  pending,
  setPending,
  onBusyChange,
}) {
  const [picker, setPicker] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [failed, setFailed] = useState({});
  const change = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }));
    setPending((current) => [...new Set([...current, key])]);
    setFailed((current) => ({ ...current, [key]: false }));
  };
  const upload = async (event, key) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(key);
    onBusyChange(true);
    setError("");
    try {
      const result = await base44.integrations.Core.UploadFile({
        file,
        visibility: "public",
      });
      change(key, result.file_url);
    } catch (err) {
      setError(err.message || "Le fichier n’a pas pu être envoyé. Réessaie.");
    } finally {
      setBusy("");
      onBusyChange(false);
    }
  };
  const publish = async () => {
    if (await onSave()) setPending([]);
  };
  const photos = gallery.filter((item) => item.type === "image");
  return (
    <div className="public-photo-editor">
      <div className="public-edit-intro">
        <div>
          <p className="private-eyebrow">SITE PUBLIC</p>
          <h2>Choisir les photos, à leur place.</h2>
          <p>
            Chaque carte correspond à un emplacement du site. Remplace une
            image, vérifie son aperçu, puis publie tes modifications.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          Voir le site <ExternalLink size={15} />
        </a>
      </div>
      <p className="public-edit-help">
        Les fichiers ajoutés à la galerie apparaissent dans{" "}
        <a href="/#galerie" target="_blank" rel="noreferrer">
          Accueil → Galerie « Une maison vivante »
        </a>
        . Pour les utiliser ailleurs, choisis-les sur une carte ci-dessous.
      </p>
      {error && (
        <p role="alert" className="public-edit-error">
          {error}
        </p>
      )}
      <div className="public-photo-grid">
        {PUBLIC_IMAGE_SLOTS.map((slot) => {
          const src = resolvePublicImage(slot, config, gallery, leaders);
          return (
            <section
              key={slot.key}
              className="public-photo-card"
              aria-label={slot.title}
            >
              <div
                className={`public-photo-preview ${slot.portrait ? "is-portrait" : ""}`}
              >
                {src && !failed[slot.key] ? (
                  <img
                    key={src}
                    src={src}
                    alt={`Aperçu : ${slot.title}`}
                    onError={() =>
                      setFailed((current) => ({ ...current, [slot.key]: true }))
                    }
                  />
                ) : (
                  <div>
                    <ImageOff />
                    <span>
                      {src
                        ? "Image inaccessible : choisis un autre fichier."
                        : "Aucun portrait configuré — monogramme affiché."}
                    </span>
                  </div>
                )}
                <span>
                  {pending.includes(slot.key)
                    ? "À publier"
                    : config[slot.key]
                      ? "Photo choisie"
                      : "Image actuelle par défaut"}
                </span>
              </div>
              <div className="public-photo-copy">
                <h3>{slot.title}</h3>
                <p>{slot.location}</p>
                {slot.key === "hero_image_url" && config.hero_video_url && (
                  <p className="public-edit-help">
                    Une vidéo est active : elle passe devant cette photo. La
                    photo reste sa couverture.
                  </p>
                )}
                <div className="public-photo-actions">
                  <label className="public-edit-button">
                    {busy === slot.key ? (
                      "Envoi…"
                    ) : (
                      <>
                        <Upload size={14} />
                        Remplacer la photo
                      </>
                    )}
                    <input
                      aria-label={`Remplacer : ${slot.title}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={!!busy || saving}
                      onChange={(event) => upload(event, slot.key)}
                    />
                  </label>
                  <button
                    className="public-edit-button is-soft"
                    disabled={!!busy || saving}
                    onClick={() => setPicker(slot)}
                  >
                    <Images size={14} />
                    Depuis la galerie
                  </button>
                </div>
                <details>
                  <summary>
                    Coller un lien ou rétablir l’image par défaut
                  </summary>
                  <label htmlFor={slot.key}>Adresse de l’image</label>
                  <input
                    id={slot.key}
                    type="url"
                    value={config[slot.key] || ""}
                    placeholder="https://…"
                    onChange={(event) => change(slot.key, event.target.value)}
                  />
                  <button
                    className="public-edit-text"
                    onClick={() => change(slot.key, "")}
                  >
                    Rétablir l’image par défaut
                  </button>
                </details>
                <a
                  className="public-edit-text"
                  href={slot.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir cet emplacement sur le site <ExternalLink size={12} />
                </a>
              </div>
            </section>
          );
        })}
      </div>
      <section className="public-photo-video">
        <h3>Vidéo d’accueil</h3>
        <p>
          Quand une vidéo est choisie, elle s’affiche devant la grande image
          d’accueil. Désactive-la pour afficher uniquement la photo.
        </p>
        {config.hero_video_url ? (
          <video
            src={config.hero_video_url}
            controls
            preload="metadata"
            playsInline
          />
        ) : (
          <p className="public-edit-help">
            Aucune vidéo active : la photo d’accueil est affichée.
          </p>
        )}
        <div className="public-photo-actions">
          <label className="public-edit-button">
            <Upload size={14} />
            {busy === "hero_video_url" ? "Envoi…" : "Choisir une vidéo"}
            <input
              type="file"
              aria-label="Remplacer la vidéo d’accueil"
              accept="video/mp4,video/webm,video/quicktime"
              disabled={!!busy || saving}
              onChange={(event) => upload(event, "hero_video_url")}
            />
          </label>
          {config.hero_video_url && (
            <button
              className="public-edit-button is-soft"
              onClick={() => change("hero_video_url", "")}
            >
              Désactiver la vidéo
            </button>
          )}
        </div>
        <details>
          <summary>Utiliser un lien vidéo</summary>
          <label htmlFor="public-video-url">Adresse de la vidéo</label>
          <input
            id="public-video-url"
            value={config.hero_video_url || ""}
            onChange={(event) => change("hero_video_url", event.target.value)}
          />
        </details>
      </section>
      <div className="public-publish-bar">
        <p>
          {pending.length
            ? `${pending.length} emplacement${pending.length > 1 ? "s" : ""} modifié${pending.length > 1 ? "s" : ""} — à publier`
            : "Les aperçus montrent les images actuellement configurées."}
        </p>
        <button
          className="public-edit-button"
          disabled={!!busy || saving}
          onClick={publish}
        >
          {saving ? "Publication…" : "Publier les modifications"}
        </button>
      </div>
      <Dialog
        open={!!picker}
        onOpenChange={(open) => {
          if (!open) setPicker(null);
        }}
      >
        <DialogContent className="public-media-picker">
          <DialogTitle>Choisir une photo pour {picker?.title}</DialogTitle>
          <DialogDescription>
            Ce choix remplace l’image de cet emplacement après publication. Le
            média reste aussi dans la galerie.
          </DialogDescription>
          {photos.length ? (
            <div className="public-picker-grid">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    change(picker.key, photo.file_url);
                    setPicker(null);
                  }}
                >
                  <img
                    src={photo.file_url}
                    alt={photo.alt_text || photo.title || "Photo de galerie"}
                  />
                  <span>
                    {photo.title || "Sans titre"}
                    {photo.is_active === false
                      ? " · masquée dans la galerie"
                      : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="public-edit-help">
              Aucune photo dans la galerie. Ajoute une photo ici avec «
              Remplacer la photo », ou ouvre la galerie.
              <button
                className="public-edit-text"
                onClick={() => {
                  setPicker(null);
                  onOpenGallery();
                }}
              >
                Gérer la galerie
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
