import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

export default function Challenges({ userProgress }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    // Initialize with some default challenges
    const defaultChallenges = [
      {
        id: 'hydration_week',
        name: 'Hydration Hero',
        description: 'Maintain optimal hydration levels (>90%) for 7 consecutive days',
        progress: 4,
        target: 7,
        reward: 'Hydration Master Badge',
        difficulty: 'medium',
        active: true
      },
      {
        id: 'early_protocols',
        name: 'Morning Momentum',
        description: 'Complete morning protocols before 9 AM for 5 days',
        progress: 2,
        target: 5,
        reward: 'Dawn Optimizer Badge',
        difficulty: 'easy',
        active: true
      },
      {
        id: 'terrain_90',
        name: 'Elite Terrain',
        description: 'Achieve and maintain a terrain score of 90+ for 3 consecutive days',
        progress: 0,
        target: 3,
        reward: 'Elite Terrain Badge + 500 XP',
        difficulty: 'hard',
        active: true
      }
    ];
    setChallenges(defaultChallenges);
  }, [userProgress]);

  const generatePersonalizedChallenges = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a health optimization expert. Based on this user's progress data, generate 3 personalized health challenges.
        
User Progress: ${JSON.stringify(userProgress || { avgTerrainScore: 85, streakDays: 4, completedProtocols: 8 })}

Generate challenges that are:
1. Specific and measurable
2. Appropriately challenging but achievable
3. Focused on areas that need improvement
4. Motivating with clear rewards

Return as JSON array with: name, description, target (number), reward, difficulty (easy/medium/hard)`,
        response_json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  target: { type: "number" },
                  reward: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });

      const newChallenges = result.challenges.map((c, i) => ({
        id: `ai_${Date.now()}_${i}`,
        ...c,
        progress: 0,
        active: true
      }));

      setChallenges([...challenges, ...newChallenges]);
    } catch (error) {
      console.error('Error generating challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    easy: '#22c55e',
    medium: '#f97316',
    hard: '#ef4444'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-2">Active Challenges</h3>
          <p className="font-mono text-[10px] text-stone-500">
            Complete challenges to earn badges and XP
          </p>
        </div>
        <button
          onClick={generatePersonalizedChallenges}
          disabled={loading}
          className="glass-panel px-4 py-2 rounded-sm hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <Sparkles className={`w-4 h-4 text-copper-400 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-mono text-xs text-stone-200">Generate AI Challenges</span>
        </button>
      </div>

      <div className="space-y-4">
        {challenges.filter(c => c.active).map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 rounded-sm hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setSelectedChallenge(challenge.id === selectedChallenge ? null : challenge.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-copper-400" />
                </div>
                <div>
                  <div className="font-mono text-sm text-stone-200 mb-1">{challenge.name}</div>
                  <div className="font-mono text-[10px] text-stone-500 leading-relaxed">
                    {challenge.description}
                  </div>
                </div>
              </div>
              <span
                className="px-2 py-1 rounded-full text-[8px] font-mono uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${difficultyColors[challenge.difficulty]}20`,
                  color: difficultyColors[challenge.difficulty]
                }}
              >
                {challenge.difficulty}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-stone-500">Progress</span>
                <span className="text-copper-400">{challenge.progress}/{challenge.target}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-copper-400 to-bronze-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
            </div>

            {selectedChallenge === challenge.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-2 text-copper-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-mono text-xs">Reward: {challenge.reward}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}