import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Upload, Loader2, ShoppingBag, FileText, ExternalLink, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const iCls = "w-full bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50";

const CATEGORIES = [
  { value: 'document', label: 'Document' },
  { value: 'lien', label: 'Lien utile' },
  { value: 'video', label: 'Vidéo' },
  { value: 'formulaire', label: 'Formulaire' },
  { value: 'livre', label: 'Livre' },
  { value: 'autre', label: 'Autre' },
];

function ResourceCard({ resource, onUpdate, onRemove }) {
  const [form, setForm] = useState({ ...resource });
  const [uploading, setUploading] = useState(false);
  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(resource.id, patch);
  }, [resource.id, onUpdate]);

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    save({ file_url });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <input className={iCls + ' flex-1 mr-2'} placeholder="Titre" value={form.title || ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} onBlur={e => save({ title: e.target.value })} />
        <button onClick={() => onRemove(resource.id)} className="text-danger/60 hover:text-danger">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <textarea className={iCls + ' mb-2'} rows={2} placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} onBlur={e => save({ description: e.target.value })} />
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select className={iCls} value={form.category || 'document'} onChange={e => save({ category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input className={iCls} placeholder="Lien externe (URL)" value={form.external_url || ''} onChange={e => setForm(f => ({...f, external_url: e.target.value}))} onBlur={e => save({ external_url: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer hover:text-secondary/80">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Upload...' : 'Fichier (PDF, etc.)'}
          <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
        </label>
        {form.file_url && <span className="text-[10px] text-green-600">✓ Fichier uploadé</span>}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer ml-auto">
          <input type="checkbox" checked={form.is_featured || false} onChange={e => save({ is_featured: e.target.checked })} className="accent-secondary" />
          Nouveauté
        </label>
      </div>
    </div>
  );
}

function ProductCard({ product, onUpdate, onRemove }) {
  const [form, setForm] = useState({ ...product });
  const [uploading, setUploading] = useState(false);
  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(product.id, patch);
  }, [product.id, onUpdate]);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    save({ image_url: file_url });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <input className={iCls + ' flex-1 mr-2'} placeholder="Nom du produit" value={form.title || ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} onBlur={e => save({ title: e.target.value })} />
        <button onClick={() => onRemove(product.id)} className="text-danger/60 hover:text-danger">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <textarea className={iCls + ' mb-2'} rows={2} placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} onBlur={e => save({ description: e.target.value })} />
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="relative">
          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="number" step="0.01" className={iCls + ' pl-7'} placeholder="Prix (€)" value={form.price ?? ''} onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value) || 0}))} onBlur={e => save({ price: parseFloat(e.target.value) || 0 })} />
        </div>
        <select className={iCls} value={form.stock_status || 'available'} onChange={e => save({ stock_status: e.target.value })}>
          <option value="available">En stock</option>
          <option value="limited">Stock limité</option>
          <option value="out_of_stock">Rupture</option>
        </select>
      </div>
      <input className={iCls + ' mb-2'} placeholder="Lien Stripe Checkout (URL)" value={form.stripe_checkout_url || ''} onChange={e => setForm(f => ({...f, stripe_checkout_url: e.target.value}))} onBlur={e => save({ stripe_checkout_url: e.target.value })} />
      <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer hover:text-secondary/80">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? 'Upload...' : 'Image produit'}
        <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
      </label>
    </div>
  );
}

export default function AdminRessourcesTab() {
  const [resources, setResources] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('resources');

  useEffect(() => {
    Promise.all([
      base44.entities.StarResource.list('display_order', 100),
      base44.entities.StarProduct.list('display_order', 100),
    ]).then(([r, p]) => {
      setResources(r || []);
      setProducts(p || []);
      setLoading(false);
    });
  }, []);

  const addResource = async () => {
    const r = await base44.entities.StarResource.create({ title: 'Nouvelle ressource', category: 'document', is_active: true, display_order: resources.length });
    setResources(prev => [...prev, r]);
  };
  const updateResource = async (id, data) => {
    await base44.entities.StarResource.update(id, data);
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };
  const removeResource = async (id) => {
    await base44.entities.StarResource.delete(id);
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const addProduct = async () => {
    const p = await base44.entities.StarProduct.create({ title: 'Nouveau produit', price: 0, is_active: true, display_order: products.length });
    setProducts(prev => [...prev, p]);
  };
  const updateProduct = async (id, data) => {
    await base44.entities.StarProduct.update(id, data);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const removeProduct = async (id) => {
    await base44.entities.StarProduct.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <Loader2 className="w-5 h-5 text-secondary animate-spin" />;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('resources')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${view === 'resources' ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FileText className="w-3.5 h-3.5" /> Ressources ({resources.length})
        </button>
        <button
          onClick={() => setView('products')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${view === 'products' ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Boutique ({products.length})
        </button>
      </div>

      {view === 'resources' && (
        <>
          <button onClick={addResource} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90 mb-4">
            <Plus className="w-3.5 h-3.5" /> Ajouter une ressource
          </button>
          {resources.map(r => <ResourceCard key={r.id} resource={r} onUpdate={updateResource} onRemove={removeResource} />)}
        </>
      )}

      {view === 'products' && (
        <>
          <button onClick={addProduct} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90 mb-4">
            <Plus className="w-3.5 h-3.5" /> Ajouter un produit
          </button>
          {products.map(p => <ProductCard key={p.id} product={p} onUpdate={updateProduct} onRemove={removeProduct} />)}
        </>
      )}
    </div>
  );
}