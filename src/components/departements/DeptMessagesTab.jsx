import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

/**
 * DeptMessagesTab — Onglet Actualités du moteur départemental.
 *
 * Affiche les messages DeptMessage scopés au département.
 * Les responsables et admin peuvent poster des messages.
 *
 * Source : DeptMessage (entity fonctionnelle, 0 messages actuellement).
 * Un message est limité à son département — pas de fuite inter-départements.
 */
export default function DeptMessagesTab({ dept, messages, canPost, onRefresh }) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await base44.entities.DeptMessage.create({
        department_id: dept.id,
        content: content.trim(),
      });
      setContent('');
      onRefresh?.();
    } catch (e) {
      // L'erreur remonte — pas de try/catch sauf pour le state du formulaire
    } finally {
      setPosting(false);
    }
  };

  if (messages.length === 0 && !canPost) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulaire de publication (responsables + admin) */}
      {canPost && (
        <div className="bg-card border border-border rounded-2xl p-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partager une information avec le département..."
            rows={2}
            className="w-full text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50 text-foreground"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors"
            >
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Publier
            </button>
          </div>
        </div>
      )}

      {/* Liste des messages */}
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun message pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => {
            const initials = m.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
            const date = new Date(m.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            return (
              <div key={m.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {m.author_photo ? (
                      <img src={m.author_photo} alt={m.author_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">{initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{m.author_name || 'Membre'}</p>
                      <span className="text-[10px] text-muted-foreground">{date}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}