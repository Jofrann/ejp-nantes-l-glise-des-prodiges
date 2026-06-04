import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Pin, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOJIS = ['❤️', '🔥', '🙏', '👏', '😭'];

export default function PostCard({ post, currentUser, onReactionUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [userReactions, setUserReactions] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});

  const firstName = post.author_name?.split(' ')[0] || '?';
  const initial = firstName[0]?.toUpperCase();

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  };

  const handleReaction = async (emoji) => {
    const key = emoji;
    const alreadyReacted = userReactions[key];

    if (alreadyReacted) {
      await base44.entities.PostReaction.delete(alreadyReacted);
      setUserReactions(r => { const n = { ...r }; delete n[key]; return n; });
      setReactions(r => ({ ...r, [emoji]: Math.max(0, (r[emoji] || 1) - 1) }));
    } else {
      const rec = await base44.entities.PostReaction.create({ post_id: post.id, user_id: currentUser.id, emoji });
      setUserReactions(r => ({ ...r, [key]: rec.id }));
      setReactions(r => ({ ...r, [emoji]: (r[emoji] || 0) + 1 }));
    }
    onReactionUpdate?.();
  };

  const loadComments = async () => {
    if (comments !== null) { setShowComments(v => !v); return; }
    setLoadingComments(true);
    const data = await base44.entities.PostComment.filter({ post_id: post.id }, 'created_date', 50);
    setComments(data || []);
    setLoadingComments(false);
    setShowComments(true);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const c = await base44.entities.PostComment.create({
      post_id: post.id,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_photo: currentUser.photo_url || '',
      content: newComment.trim(),
    });
    setComments(prev => [...(prev || []), c]);
    setNewComment('');
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden"
    >
      {/* Header auteur */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-amber-400/15 border border-amber-400/20 flex items-center justify-center">
          {post.author_photo ? (
            <img src={post.author_photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-amber-400">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-none">{post.author_name}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{timeAgo(post.created_date)}</p>
        </div>
        {post.is_pinned && (
          <div className="flex items-center gap-1 text-amber-400/60 text-[10px] uppercase tracking-wider">
            <Pin className="w-3 h-3" /> Épinglé
          </div>
        )}
        {post.type === 'announcement' && (
          <span className="text-[9px] uppercase tracking-[0.2em] bg-amber-400/15 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
            Officiel
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Média */}
      {post.media_url && (
        <div className="px-4 pb-3">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls className="w-full rounded-xl max-h-72 object-cover" />
          ) : (
            <img src={post.media_url} alt="" className="w-full rounded-xl max-h-72 object-cover" />
          )}
        </div>
      )}

      {/* Réactions */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        {EMOJIS.map(emoji => {
          const count = reactions[emoji] || 0;
          const active = !!userReactions[emoji];
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                active
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {emoji} {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
        {totalReactions > 0 && (
          <span className="text-xs text-gray-600 ml-1">{totalReactions} réaction{totalReactions > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Footer commentaires */}
      <div className="px-4 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {loadingComments ? 'Chargement…' : `${post.comment_count || 0} commentaire${(post.comment_count || 0) > 1 ? 's' : ''}`}
        </button>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {(comments || []).map(c => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {c.author_photo ? (
                        <img src={c.author_photo} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400">{c.author_name?.[0]}</span>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2 flex-1">
                      <p className="text-[11px] font-semibold text-white/80">{c.author_name}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input commentaire */}
              <div className="flex gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-amber-400/15 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[9px] font-bold text-amber-400">
                    {currentUser?.full_name?.[0] || '?'}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
                    placeholder="Écrire un commentaire…"
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                  <button onClick={submitComment} className="text-amber-400/60 hover:text-amber-400 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}