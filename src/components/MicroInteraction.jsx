import React from 'react';
import { motion } from 'framer-motion';

export default function MicroInteraction({ 
  children, 
  type = 'scale', // scale, lift, glow, ripple
  className = '' 
}) {
  const variants = {
    scale: {
      rest: { scale: 1 },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 }
    },
    lift: {
      rest: { y: 0 },
      hover: { y: -8 },
      tap: { y: -4 }
    },
    glow: {
      rest: { boxShadow: '0 0 0 rgba(94, 234, 212, 0)' },
      hover: { boxShadow: '0 0 20px rgba(94, 234, 212, 0.5)' },
      tap: { boxShadow: '0 0 30px rgba(94, 234, 212, 0.7)' }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants[type]}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}