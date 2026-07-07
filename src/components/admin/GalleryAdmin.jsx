import React, { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Trash2, Film } from 'lucide-react';

export default function GalleryAdmin({ gallery, setGallery }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const uploadFiles = useCallback(async (files) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const m = await base44.entities.GalleryMedia.create({
        file_url,
        type,
        title: file.name.replace(/\.[^.]+$/, ''),
        is_active: true,
        display_order: gallery.length,
      });
      setGallery(prev => [m, ...prev]);
    }
    setUploading(false);
  }, [gallery.length, setGallery]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const remove = async (id) => {
    await base44.entities.GalleryMedia.delete(id);
    setGallery(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-foreground font-semibold">Galerie ({gallery.length})</h2>
        <label className={`flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Upload en cours...' : 'Choisir des fichiers'}
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => uploadFiles(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {/* Zone drag & drop */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/40 bg-surface/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload className={`w-7 h-7 mx-auto mb-3 ${dragOver ? 'text-secondary' : 'text-muted-foreground'}`} />
        <p className="text-sm text-muted-foreground">
          {uploading ? 'Upload en cours...' : 'Glissez des photos/vidéos ici, ou cliquez pour parcourir'}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, MP4, MOV…</p>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-3 gap-3">
        {gallery.map(m => (
          <div key={m.id} className="relative group rounded-xl overflow-hidden aspect-square bg-surface border border-border">
            {m.type === 'video' ? (
              <>
                <video
                  src={m.file_url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                  playsInline
                />
                <div className="absolute top-2 left-2">
                  <Film className="w-4 h-4 text-white/60" />
                </div>
              </>
            ) : (
              <img
                src={m.file_url}
                alt={m.title || ''}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => remove(m.id)} className="bg-danger/80 text-white p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}