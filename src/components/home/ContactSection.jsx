import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactSection({ config }) {
  const [form, setForm] = useState({ prenom: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('Message depuis le site EJP Nantes');
    const body = encodeURIComponent(`Prénom : ${form.prenom}\nEmail : ${form.email}\n\n${form.message}`);
    const mail = config?.contact_email || 'contact@ejpnantes.fr';
    window.open(`mailto:${mail}?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  const socials = [
    { label: 'Instagram', href: config?.instagram_url },
    { label: 'TikTok', href: config?.tiktok_url },
    { label: 'YouTube', href: config?.youtube_url },
    { label: 'WhatsApp', href: config?.whatsapp_url },
  ].filter(s => s.href);

  return (
    <section id="contact" className="py-36 px-6 bg-zinc-950/70 backdrop-blur-md border-y border-white/5">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-6">On vous attend</span>
            <h2 className="font-display text-4xl md:text-5xl text-[#F7F4EF] font-light mb-6 leading-tight">
              Une question ?<br />Écrivez-nous.
            </h2>
            <p className="text-[#B8B8B8]/60 text-sm font-light leading-relaxed mb-10">
              Nous sommes disponibles pour répondre à toutes vos questions. N'hésitez pas à nous écrire.
            </p>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-[0.3em] text-[#B8B8B8]/50 hover:text-[#C8A96A] transition-colors duration-200 border-b border-transparent hover:border-[#C8A96A]/50 pb-0.5">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="space-y-5"
          >
            <input
              type="text"
              placeholder="Prénom"
              value={form.prenom}
              onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
              className="w-full bg-transparent border-b border-white/10 text-[#F7F4EF] placeholder-[#B8B8B8]/30 py-3 text-sm font-light focus:outline-none focus:border-[#C8A96A]/60 transition-colors duration-200"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-transparent border-b border-white/10 text-[#F7F4EF] placeholder-[#B8B8B8]/30 py-3 text-sm font-light focus:outline-none focus:border-[#C8A96A]/60 transition-colors duration-200"
            />
            <textarea
              placeholder="Votre message"
              rows={4}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-transparent border-b border-white/10 text-[#F7F4EF] placeholder-[#B8B8B8]/30 py-3 text-sm font-light focus:outline-none focus:border-[#C8A96A]/60 transition-colors duration-200 resize-none"
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#C8A96A] text-[#0B0B0C] text-xs tracking-[0.3em] uppercase font-medium hover:bg-[#D4B87A] transition-colors duration-300 mt-4"
            >
              {sent ? 'Merci — Nous vous répondrons.' : 'Envoyer'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}