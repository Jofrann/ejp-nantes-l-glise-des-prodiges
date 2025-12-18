import React, { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Target, Activity, ChevronRight } from 'lucide-react';
import ProtocolTracker from './ProtocolTracker';

export default function MemberDashboard({ memberData, recommendedProtocols = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeProtocol, setActiveProtocol] = useState(null);

  const protocols = [
    { name: 'IV Therapy', time: '09:00', status: 'completed', date: '2025-01-15' },
    { name: 'Neural Mapping', time: '14:00', status: 'upcoming', date: '2025-01-18' },
    { name: 'Microbiome Test', time: '11:00', status: 'scheduled', date: '2025-01-20' }
  ];

  const progress = {
    mitochondrial: 85,
    oxidative: 12,
    hydration: 92,
    overall: 89
  };

  // Default protocols if none provided
  const protocolsToTrack = recommendedProtocols.length > 0 ? recommendedProtocols : [
    { name: 'Neural Mapping', status: 'active' },
    { name: 'IV Therapy', status: 'scheduled' },
    { name: 'Microbiome Optimization', status: 'recommended' }
  ];

  if (activeProtocol) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveProtocol(null)}
          className="font-mono text-xs text-stone-400 hover:text-copper-400 transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <ProtocolTracker protocol={activeProtocol} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-stone-100">Welcome back, Member</h2>
          <p className="font-mono text-xs text-stone-500 mt-1">BIO-ID: {memberData?.bioId || '994-AZ'}</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-full">
          <span className="font-mono text-xs text-copper-400 uppercase tracking-widest">
            Explorer Tier
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-copper-400" />
            <span className="font-mono text-[9px] text-stone-500 uppercase">Overall Score</span>
          </div>
          <div className="font-serif text-3xl text-stone-100">{progress.overall}%</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="font-mono text-[9px] text-green-500">+5% this week</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-[9px] text-stone-500 uppercase">Mitochondrial</span>
          </div>
          <div className="font-serif text-3xl text-stone-100">{progress.mitochondrial}%</div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2">
            <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${progress.mitochondrial}%` }} />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="font-mono text-[9px] text-stone-500 uppercase">Oxidative</span>
          </div>
          <div className="font-serif text-3xl text-stone-100">{progress.oxidative}%</div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2">
            <div className="bg-red-500 h-1 rounded-full" style={{ width: `${progress.oxidative}%` }} />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="font-mono text-[9px] text-stone-500 uppercase">Hydration</span>
          </div>
          <div className="font-serif text-3xl text-stone-100">{progress.hydration}%</div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${progress.hydration}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-sm">
          <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Upcoming Protocols
          </h3>
          <div className="space-y-3">
            {protocols.map((protocol, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-white/10 rounded-sm">
                <div>
                  <div className="font-mono text-sm text-stone-200">{protocol.name}</div>
                  <div className="font-mono text-[10px] text-stone-500 mt-1">{protocol.date} at {protocol.time}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[9px] font-mono uppercase ${
                  protocol.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  protocol.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {protocol.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-sm">
          <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-copper-400 mt-2" />
              <div>
                <div className="font-mono text-xs text-stone-200">Biometric scan completed</div>
                <div className="font-mono text-[10px] text-stone-500 mt-1">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-copper-400 mt-2" />
              <div>
                <div className="font-mono text-xs text-stone-200">IV Therapy session logged</div>
                <div className="font-mono text-[10px] text-stone-500 mt-1">Yesterday</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-copper-400 mt-2" />
              <div>
                <div className="font-mono text-xs text-stone-200">New protocol recommendation</div>
                <div className="font-mono text-[10px] text-stone-500 mt-1">3 days ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-sm">
          <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4">Protocol Tracking</h3>
          <div className="space-y-3">
            {protocolsToTrack.map((protocol, i) => (
              <button
                key={i}
                onClick={() => setActiveProtocol(protocol)}
                className="w-full flex items-center justify-between p-3 border border-white/10 rounded-sm hover:border-copper-400/30 hover:bg-white/5 transition-all text-left"
              >
                <div>
                  <div className="font-mono text-sm text-stone-200">{protocol.name}</div>
                  <div className="font-mono text-[10px] text-stone-500 mt-1 capitalize">{protocol.status}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}