import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeptChat({ dept, colors, onClose }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
    loadMessages();

    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [dept.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = () => {
    base44.entities.DeptMessage.filter({ department_id: dept.id }, 'created_date', 100)
      .then(msgs => setMessages(msgs || []));
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);
    const newMsg = {
      department_id: dept.id,
      author_id: user.id,
      author_name: user.full_name,
      author_photo: user.photo_url || '',
      content: text.trim(),
    };
    setMessages(prev => [...prev, { ...newMsg, id: 'tmp-' + Date.now(), created_date: new Date().toISOString() }]);
    setText('');
    await base44.entities.DeptMessage.create(newMsg);
    setSending(false);
    loadMessages();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const deleteMsg = async (msg) => {
    if (msg.author_id !== user?.id) return;
    await base44.entities.DeptMessage.delete(msg.id);
    setMessages(prev => prev.filter(m => m.id !== msg.id));
  };

  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const isFirst = !prev || prev.author_id !== msg.author_id;
    acc.push({ ...msg, isFirst });
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm`}>
        <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
          <MessageCircle className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
          <p className="text-xs text-muted-foreground">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground bg-surface rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm">Aucun message pour l'instant</p>
            <p className="text-xs mt-1 opacity-60">Soyez le premier à écrire !</p>
          </div>
        )}

        {grouped.map((msg) => {
          const isMe = msg.author_id === user?.id;
          const initials = msg.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${msg.isFirst ? 'mt-3' : 'mt-0.5'}`}>
              {/* Avatar (seulement si premier du groupe) */}
              <div className="flex-shrink-0 w-7 mt-auto">
                {!isMe && msg.isFirst && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center">
                    {msg.author_photo ? (
                      <img src={msg.author_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">{initials}</span>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {!isMe && msg.isFirst && (
                  <p className="text-[10px] text-muted-foreground mb-1 ml-1">{msg.author_name}</p>
                )}
                <div className="group relative">
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? `${colors.bg} ${colors.text} rounded-tr-sm border ${colors.border}`
                      : 'bg-card border border-border text-foreground rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground mt-0.5 ${isMe ? 'text-right' : 'text-left'} ml-1`}>
                    {formatTime(msg.created_date)}
                  </p>
                  {isMe && !msg.id?.startsWith('tmp-') && (
                    <button
                      onClick={() => deleteMsg(msg)}
                      className="absolute -top-1 -left-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger transition-all text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/60">
        <form onSubmit={send} className="flex items-end gap-2">
          <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-2.5 focus-within:border-secondary/30 transition-colors">
            <textarea
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
              }}
              placeholder="Écrire un message..."
              className="w-full bg-transparent text-foreground text-sm placeholder-muted-foreground/60 resize-none focus:outline-none leading-relaxed"
              style={{ maxHeight: '100px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all ${
              text.trim() ? `${colors.bg} ${colors.text} hover:brightness-110 border ${colors.border}` : 'bg-surface text-muted-foreground'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}