import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, ExternalLink, Video, BookOpen, Loader2, Download,
  Sparkles, ChevronRight, ShoppingBag, Package
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

const CATEGORY_CONFIG = {
  document: { label: 'Document', icon: FileText, color: 'blue' },
  lien: { label: 'Lien utile', icon: ExternalLink, color: 'cyan' },
  video: { label: 'Vidéo', icon: Video, color: 'purple' },
  formulaire: { label: 'Formulaire', icon: FileText, color: 'amber' },
  livre: { label: 'Livre', icon: BookOpen, color: 'emerald' },
  autre: { label: 'Autre', icon: Sparkles, color: 'slate' },
};

export default function Ressources() {
  const [resources, setResources] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.StarResource.filter({ is_active: true }, 'display_order', 50),
      base44.entities.StarProduct.filter({ is_active: true }, 'display_order', 50),
    ]).then(([r, p]) => {
      setResources(r || []);
      setProducts(p || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  const featured = resources.filter(r => r.is_featured);
  const regular = resources.filter(r => !r.is_featured);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Ressources"
        intention="Documents, liens, vidéos, livres et boutique."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Ressources' }]}
      />

      {/* Nouveautés */}
      {featured.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Nouveautés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featured.map((r, i) => {
              const cat = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.autre;
              const Icon = cat.icon;
              const href = r.file_url || r.external_url;
              const hasUrl = !!href;
              const Wrapper = hasUrl ? motion.a : motion.div;
              const wrapperProps = hasUrl
                ? { href, target: '_blank', rel: 'noopener noreferrer' }
                : {};
              return (
                <Wrapper
                  key={r.id}
                  {...wrapperProps}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-3 bg-gradient-to-br from-${cat.color}-500/10 to-${cat.color}-500/5 border border-${cat.color}-400/20 rounded-2xl p-4 ${hasUrl ? 'hover:shadow-md cursor-pointer' : ''} transition-all`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${cat.color}-500/10 border border-${cat.color}-400/20 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${cat.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{r.title}</p>
                    {r.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.description}</p>}
                    {hasUrl ? (
                      <span className={`text-[10px] text-${cat.color}-600 mt-1 inline-block`}>{cat.label}</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 mt-1 inline-block">Ressource en préparation</span>
                    )}
                  </div>
                  {hasUrl ? <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <Package className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />}
                </Wrapper>
              );
            })}
          </div>
        </div>
      )}

      {/* Boutique */}
      {products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Boutique
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {p.image_url && (
                  <div className="w-full h-24 bg-surface overflow-hidden">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-sm font-bold text-secondary mt-1">{p.price?.toFixed(2)} €</p>
                  {p.stock_status === 'out_of_stock' ? (
                    <span className="text-[10px] text-danger mt-1 inline-block">Rupture de stock</span>
                  ) : p.stock_status === 'limited' ? (
                    <span className="text-[10px] text-warning mt-1 inline-block">Stock limité</span>
                  ) : null}
                  {p.stripe_checkout_url && p.stock_status !== 'out_of_stock' && (
                    <a
                      href={p.stripe_checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 mt-2 w-full bg-secondary text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      Commander
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Toutes les ressources */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Toutes les ressources</h2>
      {regular.length === 0 && featured.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune ressource disponible.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {regular.map((r, i) => {
            const cat = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.autre;
            const Icon = cat.icon;
            const href = r.file_url || r.external_url;
            const hasUrl = !!href;
            const Wrapper = hasUrl ? motion.a : motion.div;
            const wrapperProps = hasUrl
              ? { href, target: '_blank', rel: 'noopener noreferrer' }
              : {};
            return (
              <Wrapper
                key={r.id}
                {...wrapperProps}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 ${hasUrl ? 'hover:shadow-sm cursor-pointer' : ''} transition-all`}
              >
                <div className={`w-9 h-9 rounded-xl bg-${cat.color}-500/10 border border-${cat.color}-400/20 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 text-${cat.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                  {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                  {!hasUrl && <span className="text-[10px] text-muted-foreground/60">Ressource en préparation</span>}
                </div>
                {hasUrl && r.category === 'document' && <Download className="w-3.5 h-3.5 text-muted-foreground" />}
                {hasUrl ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <Package className="w-4 h-4 text-muted-foreground/40" />}
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}