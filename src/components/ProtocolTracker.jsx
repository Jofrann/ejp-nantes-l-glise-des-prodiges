import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Calendar, MessageSquare, Sparkles, Check, Flame, Award } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';

export default function ProtocolTracker({ protocol }) {
  const [logs, setLogs] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ date: '', feeling: 5, notes: '' });
  const [motivation, setMotivation] = useState(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);

  useEffect(() => {
    // Simulate existing logs
    const mockLogs = [
      { date: '2025-01-10', feeling: 6, notes: 'Feeling more energetic' },
      { date: '2025-01-13', feeling: 7, notes: 'Sleep improving' },
      { date: '2025-01-16', feeling: 8, notes: 'Significant improvement in focus' }
    ];
    setLogs(mockLogs);
    calculateStreak(mockLogs);
  }, [protocol]);

  const calculateStreak = (logsList) => {
    if (logsList.length === 0) {
      setStreak(0);
      return;
    }

    const sortedLogs = [...logsList].sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 1;
    
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = new Date(sortedLogs[i].date);
      const next = new Date(sortedLogs[i + 1].date);
      const daysDiff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 3) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5eead4', '#d4a373', '#fbbf24']
    });
  };

  const addLog = () => {
    if (!newLog.date) return;
    const updatedLogs = [...logs, newLog].sort((a, b) => new Date(a.date) - new Date(b.date));
    setLogs(updatedLogs);
    calculateStreak(updatedLogs);
    
    // Check for milestones
    if (updatedLogs.length === 7 || updatedLogs.length === 14 || updatedLogs.length === 30) {
      triggerConfetti();
      setShowStreakCelebration(true);
      setTimeout(() => setShowStreakCelebration(false), 3000);
    }
    
    setNewLog({ date: '', feeling: 5, notes: '' });
    setShowLogForm(false);
  };

  const generateMotivation = async () => {
    setLoadingMotivation(true);
    try {
      const trend = logs.length > 1 ? (logs[logs.length - 1].feeling - logs[0].feeling) : 0;
      const context = `Protocol: ${protocol.name}
Recent logs: ${logs.slice(-3).map(l => `${l.date}: feeling ${l.feeling}/10`).join(', ')}
Trend: ${trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a motivational message and suggestion for a member tracking their protocol.

${context}

Generate:
1. message: Encouraging message (40-50 words, personalized to their progress)
2. suggestion: One specific actionable suggestion to optimize results (30-40 words)
3. milestone: Next milestone to celebrate (e.g., "Week 4: Energy levels normalized")

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            suggestion: { type: "string" },
            milestone: { type: "string" }
          }
        }
      });

      setMotivation(result);
    } catch (error) {
      console.error('Error generating motivation:', error);
    } finally {
      setLoadingMotivation(false);
    }
  };

  const chartData = logs.map((log, i) => ({
    day: `Day ${i + 1}`,
    feeling: log.feeling
  }));

  const avgFeeling = logs.length ? (logs.reduce((sum, l) => sum + l.feeling, 0) / logs.length).toFixed(1) : 0;
  const trend = logs.length > 1 ? logs[logs.length - 1].feeling - logs[0].feeling : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-2xl text-stone-100">{protocol.name}</h3>
          <p className="font-mono text-xs text-stone-500 mt-1">{logs.length} entries logged</p>
        </div>
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="px-4 py-2 bg-copper-400/20 border border-copper-400/30 rounded-sm hover:bg-copper-400/30 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-copper-400" />
          <span className="font-mono text-xs text-copper-400 uppercase tracking-widest">Log Progress</span>
        </button>
      </div>

      {showLogForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-panel p-4 rounded-sm"
        >
          <div className="space-y-3">
            <div>
              <label className="font-mono text-xs text-stone-400 block mb-1">Date</label>
              <input
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-200 text-xs focus:border-copper-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-stone-400 block mb-1">How are you feeling? (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newLog.feeling}
                onChange={(e) => setNewLog({ ...newLog, feeling: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between font-mono text-xs text-stone-500 mt-1">
                <span>1</span>
                <span className="text-copper-400 text-lg">{newLog.feeling}</span>
                <span>10</span>
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-stone-400 block mb-1">Notes</label>
              <textarea
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                placeholder="How do you feel? Any changes?"
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-200 text-xs focus:border-copper-400 focus:outline-none h-20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogForm(false)}
                className="flex-1 py-2 border border-white/10 rounded-sm font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={addLog}
                className="flex-1 bg-copper-400/20 border border-copper-400/30 rounded-sm py-2 font-mono text-xs uppercase tracking-widest text-copper-400 hover:bg-copper-400/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Entry
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showStreakCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="glass-panel p-4 rounded-sm border-2 border-copper-400 bg-copper-400/10 text-center"
        >
          <Award className="w-12 h-12 text-copper-400 mx-auto mb-2 animate-pulse" />
          <div className="font-serif text-2xl text-copper-400">Milestone Reached!</div>
          <div className="font-mono text-xs text-stone-300 mt-1">
            {logs.length} days logged • Keep going!
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <motion.div 
          className="glass-panel p-4 rounded-sm relative overflow-hidden group hover:scale-105 transition-transform"
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-2 right-2">
            <Flame className={`w-5 h-5 ${streak > 3 ? 'text-orange-500 animate-pulse' : 'text-stone-600'}`} />
          </div>
          <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-2">Streak</div>
          <div className="font-serif text-3xl text-copper-400">{streak}</div>
        </motion.div>
        
        <motion.div 
          className="glass-panel p-4 rounded-sm hover:scale-105 transition-transform"
          whileHover={{ y: -5 }}
        >
          <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-2">Avg Feeling</div>
          <div className="font-serif text-3xl text-stone-100">{avgFeeling}/10</div>
        </motion.div>
        
        <motion.div 
          className="glass-panel p-4 rounded-sm hover:scale-105 transition-transform"
          whileHover={{ y: -5 }}
        >
          <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-2">Trend</div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-stone-500'}`} />
            <span className="font-serif text-3xl text-stone-100">{trend > 0 ? '+' : ''}{trend}</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-panel p-4 rounded-sm hover:scale-105 transition-transform"
          whileHover={{ y: -5 }}
        >
          <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-2">Duration</div>
          <div className="font-serif text-3xl text-stone-100">{logs.length} days</div>
        </motion.div>
      </div>

      {logs.length > 0 && (
        <div className="glass-panel p-4 rounded-sm">
          <h4 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4">Progress Chart</h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: '#a8a29e', fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#a8a29e', fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="feeling" stroke="#5eead4" strokeWidth={2} dot={{ fill: '#5eead4' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button
        onClick={generateMotivation}
        disabled={loadingMotivation}
        className="w-full glass-panel p-4 rounded-sm border border-white/10 hover:border-copper-400/30 transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className={`w-4 h-4 text-copper-400 ${loadingMotivation ? 'animate-pulse' : ''}`} />
        <span className="font-mono text-xs text-copper-400 uppercase tracking-widest">
          {loadingMotivation ? 'Analyzing...' : 'Get AI Insights & Motivation'}
        </span>
      </button>

      {motivation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-sm border-l-2 border-copper-400"
        >
          <div className="flex items-start gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-copper-400 flex-shrink-0 mt-1" />
            <div>
              <div className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-2">AI Coach Message</div>
              <p className="font-mono text-sm text-stone-200 leading-relaxed">{motivation.message}</p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div>
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Suggestion</div>
              <p className="font-mono text-xs text-stone-300">{motivation.suggestion}</p>
            </div>
            <div>
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Next Milestone</div>
              <p className="font-mono text-xs text-copper-400">{motivation.milestone}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        <h4 className="font-mono text-xs text-bronze-400 uppercase tracking-widest">Recent Entries</h4>
        {logs.slice(-3).reverse().map((log, i) => (
          <div key={i} className="glass-panel p-3 rounded-sm flex items-start gap-3">
            <Calendar className="w-4 h-4 text-copper-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-stone-300">{log.date}</span>
                <span className="font-mono text-sm text-copper-400">{log.feeling}/10</span>
              </div>
              {log.notes && (
                <p className="font-mono text-[10px] text-stone-500">{log.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}