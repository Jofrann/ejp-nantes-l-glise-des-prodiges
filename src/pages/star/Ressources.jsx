import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Link2, Shirt, Phone, ChevronRight, Star, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SECTIONS = [
  { key: 'liens', label: 'Liens utiles', icon: Link2, desc: 'PCNC, formulaires, chaînes vidéo' },
  { key: 'documents', label: 'Documents', icon: FileText, desc: 'Procédures, fiches, chartes' },
  { key: 'livres', label: 'Livres', icon: BookOpen, desc: 'Recommandations EJP' },
  { key: 'boutique', label: 'Boutique', icon: Shirt, desc: 'T-shirts, sweats, articles' },
  { key: 'contacts', label: 'Contacts', icon: Phone, desc: 'Pôles et responsables' },
];

export default function Ressources() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.FijDocument.filter({ visibility: 'all_fij' }, '-created_date', 20)
      .then(docs => { setDocuments(docs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Ressources</h1>
        <p className="text-sm text-muted-foreground">Tout ce dont tu as besoin pour vivre la vie EJP.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {SECTIONS.map(({ icon: Icon, label, desc, key }, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:shadow-sm hover:border-purple-400/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Documents disponibles */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Documents récents</h2>
      {loading ? (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-border border-t-secondary rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun document pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                {doc.description && <p className="text-xs text-muted-foreground truncate">{doc.description}</p>}
              </div>
              <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}