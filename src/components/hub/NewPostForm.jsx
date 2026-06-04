import React, { useState, useRef } from 'react';
import { Image, Video, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewPostForm({ currentUser, type = 'parvis', onPost, canPostAnnouncement = false }) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();

  const isAdmin = canPostAnnouncement && ['admin', 'bureau'].includes(currentUser?.role);
  const [postType, setPostType] = useState(type);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setMediaUrl(file_url);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setUploading(false);
  };

  const submit = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    const post = await base44.entities.Post.create({
      content: content.trim(),
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_photo: currentUser.photo_url || '',
      author_role: currentUser.role,
      type: postType,
      media_url: mediaUrl || undefined,
      media_type: mediaType || undefined,
      comment_count: 0,
      reactions: {},
    });
    setContent('');
    setMediaUrl('');
    setMediaType('');
    setPosting(false);
    onPost?.(post);
  };

  return (
    <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-4">
      {isAdmin && (
        <div className="flex gap-2 mb-3">
          {['parvis', 'announcement'].map(t => (
            <button
              key={t}
              onClick={() => setPostType(t)}
              className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                postType === t
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              {t === 'parvis' ? '🏠 Le Parvis' : '📢 Officiel'}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-1">
          {currentUser?.photo_url ? (
            <img src={currentUser.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-amber-400">{currentUser?.full_name?.[0] || '?'}</span>
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={postType === 'announcement' ? "Publier une annonce officielle…" : "Partage quelque chose avec la communauté…"}
            rows={3}
            className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
          />

          {mediaUrl && (
            <div className="relative mt-2 inline-block">
              {mediaType === 'video' ? (
                <video src={mediaUrl} className="h-28 rounded-xl object-cover" />
              ) : (
                <img src={mediaUrl} alt="" className="h-28 rounded-xl object-cover" />
              )}
              <button
                onClick={() => { setMediaUrl(''); setMediaType(''); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-800 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-3">
            <div className="flex gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors"
                disabled={uploading}
              >
                <Image className="w-4 h-4" />
                {uploading ? 'Upload…' : 'Photo'}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors"
                disabled={uploading}
              >
                <Video className="w-4 h-4" />
                Vidéo
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
            </div>

            <button
              onClick={submit}
              disabled={!content.trim() || posting}
              className="flex items-center gap-2 bg-amber-400 text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-amber-300 transition-all disabled:opacity-30"
            >
              <Send className="w-3.5 h-3.5" />
              {posting ? 'Envoi…' : 'Publier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}