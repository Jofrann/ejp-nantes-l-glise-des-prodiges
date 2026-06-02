import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeptChat({ dept, colors, onClose }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
    loadMessages();

    // Polling toutes les 5s pour simuler le temps réel
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
    // Optimistic update
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

  // Grouper par auteur consécutif
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
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-zinc-900/80 backdrop-blur-sm`}>
        <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-base`}>💬</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{dept.name}</p>
          <p className="text-xs text-gray-500">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <p className="text-2xl mb-2">💬</p>
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
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    {msg.author_photo ? (
                      <img src={msg.author_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">{initials}</span>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {!isMe && msg.isFirst && (
                  <p className="text-[10px] text-gray-500 mb-1 ml-1">{msg.author_name}</p>
                )}
                <div className="group relative">
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? `${colors.bg} ${colors.text} rounded-tr-sm`
                      : 'bg-white/8 text-white rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-gray-600 mt-0.5 ${isMe ? 'text-right' : 'text-left'} ml-1`}>
                    {formatTime(msg.created_date)}
                  </p>
                  {isMe && !msg.id?.startsWith('tmp-') && (
                    <button
                      onClick={() => deleteMsg(msg)}
                      className="absolute -top-1 -left-6 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all text-xs"
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
      <div className="px-4 py-3 border-t border-white/10 bg-zinc-900/60">
        <form onSubmit={send} className="flex items-end gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-white/20 transition-colors">
            <textarea
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
              }}
              placeholder="Écrire un message..."
              className="w-full bg-transparent text-white text-sm placeholder-gray-600 resize-none focus:outline-none leading-relaxed"
              style={{ maxHeight: '100px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all ${
              text.trim() ? `${colors.bg} ${colors.text} hover:brightness-125` : 'bg-white/5 text-gray-600'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}