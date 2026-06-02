import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, MessageCircle, Youtube } from 'lucide-react';

export default function ContactSection({ config }) {
  const [form, setForm] = useState({ prenom: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ouvre le client mail avec pré-remplissage
    const subject = encodeURIComponent('Message depuis ejpnantes.fr');
    const body = encodeURIComponent(`Prénom : ${form.prenom}\nEmail : ${form.email}\n\nMessage :\n${form.message}`);
    const mail = config?.contact_email || 'contact@ejpnantes.fr';
    window.open(`mailto:${mail}?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <section id="contact" className="py-28 px-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-8 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 100%, #7c3aed, transparent 60%)' }} />

      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">On vous attend</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-3">Une question ?<br />Viens nous parler.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Réseaux */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <p className="text-gray-500 text-sm mb-6">Retrouvez-nous sur les réseaux ou écrivez-nous directement.</p>
            {[
              { icon: Instagram, label: 'Instagram', href: config?.instagram_url || '#', color: 'hover:border-pink-400/50 hover:text-pink-400' },
              { icon: Youtube, label: 'YouTube', href: config?.youtube_url || '#', color: 'hover:border-red-400/50 hover:text-red-400' },
              { icon: MessageCircle, label: 'WhatsApp', href: config?.whatsapp_url || '#', color: 'hover:border-green-400/50 hover:text-green-400' },
              { icon: Mail, label: config?.contact_email || 'contact@ejpnantes.fr', href: `mailto:${config?.contact_email || 'contact@ejpnantes.fr'}`, color: 'hover:border-amber-400/50 hover:text-amber-400' },
            ].map(({ icon: Icon, label, href, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-4 border border-white/10 text-white/70 px-5 py-3.5 rounded-xl text-sm transition-all duration-200 ${color}`}>
                <Icon className="w-5 h-5" />
                {label}
              </a>
            ))}
          </motion.div>

          {/* Formulaire */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Votre prénom"
              value={form.prenom}
              onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50"
            />
            <input
              type="email"
              placeholder="Votre email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50"
            />
            <textarea
              placeholder="Votre message"
              rows={4}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 resize-none"
            />
            <button
              type="submit"
              className="w-full bg-amber-400 text-black font-semibold py-3 rounded-xl text-sm hover:bg-amber-300 transition-all"
            >
              {sent ? 'Merci ! Nous vous répondrons bientôt.' : 'Envoyer le message'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}