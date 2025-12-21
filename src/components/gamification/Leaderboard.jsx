import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Medal, Award } from 'lucide-react';

export default function Leaderboard({ currentUserRank = 47 }) {
  const [timeframe, setTimeframe] = useState('week');
  const [category, setCategory] = useState('streak');

  // Simulated leaderboard data
  const leaderboardData = {
    streak: [
      { rank: 1, name: 'BIO-A82', value: 156, badge: 'crown' },
      { rank: 2, name: 'BIO-C44', value: 142, badge: 'gold' },
      { rank: 3, name: 'BIO-F91', value: 128, badge: 'silver' },
      { rank: 4, name: 'BIO-K23', value: 115, badge: null },
      { rank: 5, name: 'BIO-D67', value: 108, badge: null },
      { rank: 6, name: 'BIO-M89', value: 98, badge: null },
      { rank: 7, name: 'BIO-P12', value: 94, badge: null },
      { rank: 8, name: 'BIO-R56', value: 87, badge: null },
      { rank: 9, name: 'BIO-T34', value: 82, badge: null },
      { rank: 10, name: 'BIO-W78', value: 79, badge: null }
    ],
    score: [
      { rank: 1, name: 'BIO-F91', value: 98, badge: 'crown' },
      { rank: 2, name: 'BIO-A82', value: 96, badge: 'gold' },
      { rank: 3, name: 'BIO-M89', value: 95, badge: 'silver' },
      { rank: 4, name: 'BIO-C44', value: 94, badge: null },
      { rank: 5, name: 'BIO-K23', value: 93, badge: null },
      { rank: 6, name: 'BIO-D67', value: 92, badge: null },
      { rank: 7, name: 'BIO-P12', value: 91, badge: null },
      { rank: 8, name: 'BIO-R56', value: 90, badge: null },
      { rank: 9, name: 'BIO-T34', value: 89, badge: null },
      { rank: 10, name: 'BIO-W78', value: 88, badge: null }
    ]
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'crown': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'gold': return <Medal className="w-4 h-4 text-yellow-500" />;
      case 'silver': return <Award className="w-4 h-4 text-stone-400" />;
      default: return null;
    }
  };

  const data = leaderboardData[category];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4">
          Community Leaderboard
        </h3>
        <p className="font-mono text-[10px] text-stone-500 mb-4">
          Anonymous rankings • Updated weekly • Opt-in only
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCategory('streak')}
            className={`px-3 py-2 rounded-sm font-mono text-xs transition-all ${
              category === 'streak'
                ? 'bg-copper-400/20 text-copper-400 border border-copper-400/30'
                : 'bg-white/5 text-stone-500 border border-white/10 hover:border-white/20'
            }`}
          >
            Adherence Streak
          </button>
          <button
            onClick={() => setCategory('score')}
            className={`px-3 py-2 rounded-sm font-mono text-xs transition-all ${
              category === 'score'
                ? 'bg-copper-400/20 text-copper-400 border border-copper-400/30'
                : 'bg-white/5 text-stone-500 border border-white/10 hover:border-white/20'
            }`}
          >
            Terrain Score
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-panel p-4 rounded-sm flex items-center justify-between ${
              entry.rank <= 3 ? 'border border-copper-400/30' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                entry.rank === 2 ? 'bg-yellow-600/20 text-yellow-500' :
                entry.rank === 3 ? 'bg-stone-400/20 text-stone-400' :
                'bg-white/5 text-stone-500'
              }`}>
                {entry.rank}
              </div>
              
              <div>
                <div className="font-mono text-sm text-stone-200 flex items-center gap-2">
                  {entry.name}
                  {entry.badge && getBadgeIcon(entry.badge)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif text-xl text-copper-400">
                {entry.value}{category === 'streak' ? 'd' : '%'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-4 rounded-sm border-2 border-copper-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-copper-400/20 flex items-center justify-center">
              <span className="font-mono text-sm text-copper-400">{currentUserRank}</span>
            </div>
            <div>
              <div className="font-mono text-sm text-stone-200">Your Rank</div>
              <div className="font-mono text-[9px] text-stone-500">BIO-994</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-mono text-xs">+12 this week</span>
          </div>
        </div>
      </div>
    </div>
  );
}