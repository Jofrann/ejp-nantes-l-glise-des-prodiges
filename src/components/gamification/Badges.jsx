import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Zap, Target, Heart, Flame, Crown } from 'lucide-react';

export default function Badges({ earnedBadges = [], allBadges }) {
  const badges = allBadges || [
    { id: 'first_log', name: 'First Step', icon: Star, description: 'Logged your first protocol', color: '#fbbf24', earned: true },
    { id: 'week_streak', name: 'Week Warrior', icon: Flame, description: '7-day logging streak', color: '#f97316', earned: true },
    { id: 'month_streak', name: 'Monthly Master', icon: Crown, description: '30-day logging streak', color: '#d4a373', earned: false },
    { id: 'protocol_complete', name: 'Protocol Pioneer', icon: Target, description: 'Completed a full protocol', color: '#5eead4', earned: true },
    { id: 'score_90', name: 'Elite Terrain', icon: Trophy, description: 'Achieved 90+ terrain score', color: '#22c55e', earned: false },
    { id: 'perfect_week', name: 'Perfect Week', icon: Award, description: 'All protocols on time for a week', color: '#818cf8', earned: true },
    { id: 'early_riser', name: 'Dawn Optimizer', icon: Zap, description: 'Completed morning protocols 5 days straight', color: '#eab308', earned: false },
    { id: 'community', name: 'Community Champion', icon: Heart, description: 'Top 10% in adherence', color: '#ec4899', earned: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4">Achievement Gallery</h3>
        <p className="font-mono text-[10px] text-stone-500">
          {badges.filter(b => b.earned).length} of {badges.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: badge.earned ? 1.05 : 1 }}
            className={`glass-panel p-4 rounded-sm text-center relative overflow-hidden ${
              badge.earned ? 'border-copper-400/30' : 'opacity-40'
            }`}
          >
            {badge.earned && (
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: badge.color }}
              />
            )}
            
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              badge.earned ? 'bg-white/10' : 'bg-white/5'
            }`}>
              <badge.icon 
                className="w-8 h-8" 
                style={{ color: badge.earned ? badge.color : '#57534e' }}
              />
            </div>
            
            <div className="font-mono text-xs text-stone-200 mb-1">{badge.name}</div>
            <div className="font-mono text-[9px] text-stone-500">{badge.description}</div>

            {badge.earned && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-copper-400 animate-pulse" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}