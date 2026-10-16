import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Upload,
  Pencil,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function GalleryAdmin({ gallery, setGallery }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [edit, setEdit] = useState(null),
    [removing, setRemoving] = useState(null);
  const input = useRef(null);
  const sorted = [...gallery].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0),
  );
  const update = async (id, data) => {
    const saved = await base44.entities.GalleryMedia.update(id, data);
    setGallery((rows) => rows.map((row) => (row.id === id ? saved : row)));
    return saved;
  };
  const run = async (operation) => {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (err) {
      setError(
        err.message || "La modification n’a pas été enregistrée. Réessaie.",
      );
    } finally {
      setBusy(false);
    }
  };
  const upload = (files) => {
    if (!files?.length) return;
    run(async () => {
      let order =
        Math.max(-1, ...gallery.map((row) => Number(row.display_order) || 0)) +
        1;
      for (const file of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({
          file,
          visibility: "public",
        });
        const media = await base44.entities.GalleryMedia.create({
          file_url,
          type: file.type.startsWith("video") ? "video" : "image",
          title: file.name.replace(/\.[^.]+$/, ""),
          is_active: true,
          display_order: order++,
        });
        setGallery((rows) => [...rows, media]);
      }
    });
  };
  const move = (index, step) =>
    run(async () => {
      const reordered = [...sorted];
      [reordered[index], reordered[index + step]] = [
        reordered[index + step],
        reordered[index],
      ];
      try {
        for (let i = 0; i < reordered.length; i++)
          if (reordered[i].display_order !== i)
            await base44.entities.GalleryMedia.update(reordered[i].id, {
              display_order: i,
            });
        setGallery(reordered.map((row, i) => ({ ...row, display_order: i })));
      } catch (err) {
        setGallery(
          await base44.entities.GalleryMedia.list("display_order", 1000),
        );
        throw err;
      }
    });
  return (
    <div className="public-gallery-admin">
      <div className="public-edit-intro">
        <div>
          <p className="private-eyebrow">GALERIE PUBLIQUE</p>
          <h2>Une maison vivante</h2>
          <p>
            Ces médias apparaissent sur l’accueil, dans la section Galerie. Les
            nouveaux ajouts sont placés à la fin ; le visiteur peut afficher la
            suite. Les modifications de cette liste sont enregistrées
            immédiatement.
          </p>
        </div>
        <a href="/#galerie" target="_blank" rel="noreferrer">
          Voir la galerie <ExternalLink size={15} />
        </a>
      </div>
      <p className="public-edit-help">
        Pour remplacer une grande photo du site ou un portrait, utilise l’onglet
        « Photos du site ». Ajouter ici ne remplace pas automatiquement ces
        emplacements déjà configurés.
      </p>
      {error && (
        <p role="alert" className="public-edit-error">
          {error}
        </p>
      )}
      <div
        className="public-gallery-upload"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!busy) upload(event.dataTransfer.files);
        }}
      >
        <button
          className="public-edit-button"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload size={16} />
          {busy ? "Enregistrement…" : "Ajouter des photos ou vidéos"}
        </button>
        <input
          ref={input}
          className="sr-only"
          tabIndex={-1}
          aria-label="Fichiers de la galerie"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          disabled={busy}
          onChange={(event) => {
            upload(event.target.files);
            event.target.value = "";
          }}
        />
        <p>
          Ou dépose tes fichiers ici · Images et vidéos · 50 Mo maximum par
          fichier.
        </p>
      </div>
      <div className="public-gallery-grid">
        {sorted.map((media, i) => (
          <article key={media.id} className="public-gallery-card">
            <div className="public-gallery-preview">
              {media.type === "video" ? (
                <video
                  src={media.file_url}
                  poster={media.thumbnail_url || undefined}
                  preload="metadata"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={media.file_url}
                  alt={media.alt_text || media.title || ""}
                  loading="lazy"
                />
              )}
              <span>
                {media.is_active === false ? "Masqué" : "Visible sur le site"} ·
                Position {i + 1}
              </span>
            </div>
            <div className="public-gallery-copy">
              <h3>{media.title || "Sans titre"}</h3>
              <p>
                {media.type === "video" ? "Vidéo" : "Photo"} · Accueil → Galerie
              </p>
              <div className="public-gallery-actions">
                <button disabled={busy} onClick={() => setEdit({ ...media })}>
                  <Pencil size={14} />
                  Modifier
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() =>
                      update(media.id, {
                        is_active: media.is_active === false,
                      }),
                    )
                  }
                >
                  {media.is_active === false ? (
                    <Eye size={14} />
                  ) : (
                    <EyeOff size={14} />
                  )}
                  {media.is_active === false ? "Afficher" : "Masquer"}
                </button>
                <button
                  disabled={busy || i === 0}
                  onClick={() => move(i, -1)}
                  aria-label={`Monter ${media.title || "le média"}`}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  disabled={busy || i === sorted.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`Descendre ${media.title || "le média"}`}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  disabled={busy}
                  className="public-gallery-remove"
                  onClick={() => setRemoving(media)}
                  aria-label={`Retirer ${media.title || "le média"} de la galerie`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!sorted.length && (
        <p className="public-edit-help">
          La galerie est vide. Ajoute tes premières photos pour faire apparaître
          cette section sur l’accueil.
        </p>
      )}
      <Dialog
        open={!!edit}
        onOpenChange={(open) => {
          if (!open && !busy) setEdit(null);
        }}
      >
        <DialogContent className="public-media-edit">
          <DialogTitle>Modifier le média</DialogTitle>
          <DialogDescription>
            Titre, description et fichier affichés dans la galerie publique.
          </DialogDescription>
          {edit && (
            <>
              <label htmlFor="gallery-title">Titre</label>
              <input
                id="gallery-title"
                value={edit.title || ""}
                onChange={(event) =>
                  setEdit({ ...edit, title: event.target.value })
                }
              />
              <label htmlFor="gallery-alt">
                Description de l’image (accessibilité)
              </label>
              <textarea
                id="gallery-alt"
                rows={3}
                value={edit.alt_text || ""}
                onChange={(event) =>
                  setEdit({ ...edit, alt_text: event.target.value })
                }
              />
              <label className="public-edit-button">
                <Upload size={14} />
                Remplacer le fichier
                <input
                  type="file"
                  aria-label="Remplacer le fichier de la galerie"
                  accept="image/*,video/*"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file)
                      run(async () => {
                        const result =
                          await base44.integrations.Core.UploadFile({
                            file,
                            visibility: "public",
                          });
                        setEdit((current) => ({
                          ...current,
                          file_url: result.file_url,
                          type: file.type.startsWith("video")
                            ? "video"
                            : "image",
                          thumbnail_url: "",
                        }));
                      });
                  }}
                />
              </label>
              {error && (
                <p role="alert" className="public-edit-error">
                  {error}
                </p>
              )}
              <button
                className="public-edit-button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await update(edit.id, {
                      title: edit.title,
                      alt_text: edit.alt_text,
                      file_url: edit.file_url,
                      type: edit.type,
                      thumbnail_url: edit.thumbnail_url || "",
                    });
                    setEdit(null);
                  })
                }
              >
                {busy ? "Enregistrement…" : "Enregistrer le média"}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open && !busy) setRemoving(null);
        }}
      >
        <DialogContent className="public-media-edit">
          <DialogTitle>
            Retirer « {removing?.title || "ce média"} » de la galerie ?
          </DialogTitle>
          <DialogDescription>
            Le média disparaîtra de cette galerie. Les photos déjà choisies pour
            d’autres emplacements du site ne changent pas. Pour le conserver
            dans la liste sans l’afficher, utilise plutôt « Masquer ».
          </DialogDescription>
          <button
            className="public-edit-button is-soft"
            autoFocus
            onClick={() => setRemoving(null)}
          >
            Annuler
          </button>
          <button
            className="public-edit-button is-danger"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await base44.entities.GalleryMedia.delete(removing.id);
                setGallery((rows) =>
                  rows.filter((row) => row.id !== removing.id),
                );
                setRemoving(null);
              })
            }
          >
            Retirer de la galerie
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
