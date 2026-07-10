import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Bell, ArrowLeft, Loader2, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

export default function Boutique() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifySent, setNotifySent] = useState(false);

  useEffect(() => {
    base44.entities.StarProduct.filter({ is_active: true }, 'display_order', 50)
      .then(p => { setProducts(p || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleNotify = () => {
    setNotifySent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  const hasProducts = products.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Boutique EJP"
        intention="T-shirts, ressources et produits officiels."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Ressources', to: '/app/ressources' }, { label: 'Boutique' }]}
      />

      {hasProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {p.image_url ? (
                <div className="w-full h-32 bg-surface overflow-hidden">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 bg-surface flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
                {p.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>}
                <p className="text-sm font-bold text-secondary mt-1.5">{p.price?.toFixed(2)} €</p>
                {p.stock_status === 'out_of_stock' && (
                  <span className="text-[10px] text-danger mt-1 inline-block">Rupture de stock</span>
                )}
                {p.stock_status === 'limited' && (
                  <span className="text-[10px] text-warning mt-1 inline-block">Stock limité</span>
                )}
                {p.stripe_checkout_url && p.stock_status !== 'out_of_stock' ? (
                  <a
                    href={p.stripe_checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 mt-2 w-full bg-secondary text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Commander
                  </a>
                ) : p.stock_status !== 'out_of_stock' && (
                  <span className="flex items-center justify-center mt-2 w-full bg-surface border border-border text-muted-foreground text-[10px] font-medium py-1.5 rounded-lg">
                    Bientôt disponible
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-heading font-bold text-foreground">Boutique EJP bientôt disponible</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            Tu retrouveras ici les t-shirts, ressources et produits officiels de l'EJP Nantes.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            {notifySent ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
                <Bell className="w-3.5 h-3.5" /> Tu seras informé !
              </span>
            ) : (
              <button
                onClick={handleNotify}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-secondary rounded-lg px-4 py-2 hover:bg-secondary/90 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" /> Être informé
              </button>
            )}
            <Link
              to="/app/ressources"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-lg px-4 py-2 hover:border-secondary/30 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour aux ressources
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}