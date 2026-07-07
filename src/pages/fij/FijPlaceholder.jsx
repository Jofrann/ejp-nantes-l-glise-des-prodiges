import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Construction } from 'lucide-react';

const PAGE_TITLES = {
  'tableau-de-bord': 'Tableau de bord FIJ',
  'mes-fij': 'Mes FIJ',
  'registre': 'Registre des FIJ',
  'cr-hebdomadaires': 'CR hebdomadaires',
  'ouvertures': 'Ouvertures de FIJ',
  'consecrations': 'Consécrations',
  'pause': 'FIJ en pause',
  'pilotes': 'Pilotes',
  'communications': 'Communications',
  'reporting': 'Reporting',
  'documents': 'Documents',
  'alertes': 'Alertes',
  'transferts': 'Transferts',
};

export default function FijPlaceholder() {
  const { subpage } = useParams();
  const title = PAGE_TITLES[subpage] || 'Page FIJ';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-5">
          <Construction className="w-6 h-6 text-amber-400/70" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Cette page est en cours de construction. Elle sera disponible prochainement.
        </p>
        <Link
          to="/app/departements/fij"
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Retour à l'accueil FIJ
        </Link>
      </motion.div>
    </div>
  );
}