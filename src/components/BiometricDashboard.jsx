import React, { useState, useEffect } from 'react';
import { LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Droplet } from 'lucide-react';

export default function BiometricDashboard({ approach = 'clinical' }) {
  const [data, setData] = useState([]);
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    // Simulate real-time biometric data based on approach
    const generateData = () => {
      const baseValues = {
        clinical: { mitochondrial: 85, oxidative: 12, hydration: 92 },
        holistic: { mitochondrial: 78, oxidative: 18, hydration: 88 },
        futuristic: { mitochondrial: 95, oxidative: 5, hydration: 98 }
      };

      const base = baseValues[approach] || baseValues.clinical;
      
      const newData = Array.from({ length: 10 }, (_, i) => ({
        time: i,
        mitochondrial: base.mitochondrial + Math.random() * 10 - 5,
        oxidative: base.oxidative + Math.random() * 5 - 2.5,
        hydration: base.hydration + Math.random() * 6 - 3
      }));

      const newRadarData = [
        { metric: 'Energy', value: base.mitochondrial, fullMark: 100 },
        { metric: 'Clarity', value: base.mitochondrial - 5, fullMark: 100 },
        { metric: 'Recovery', value: 100 - base.oxidative * 5, fullMark: 100 },
        { metric: 'Hydration', value: base.hydration, fullMark: 100 },
        { metric: 'Immunity', value: base.mitochondrial - 10, fullMark: 100 },
        { metric: 'Longevity', value: (base.mitochondrial + base.hydration) / 2, fullMark: 100 }
      ];

      setData(newData);
      setRadarData(newRadarData);
    };

    generateData();
    const interval = setInterval(generateData, 3000);
    return () => clearInterval(interval);
  }, [approach]);

  return (
    <div className="glass-panel rounded-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs text-copper-400 uppercase tracking-widest">Live Biometric Feed</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[9px] text-stone-500">STREAMING</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-white/10 rounded-sm p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-[9px] text-stone-400 uppercase">Mitochondrial</span>
          </div>
          <div className="font-serif text-2xl text-stone-100">{data[data.length - 1]?.mitochondrial.toFixed(1)}%</div>
        </div>

        <div className="border border-white/10 rounded-sm p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="font-mono text-[9px] text-stone-400 uppercase">Oxidative</span>
          </div>
          <div className="font-serif text-2xl text-stone-100">{data[data.length - 1]?.oxidative.toFixed(1)}%</div>
        </div>

        <div className="border border-white/10 rounded-sm p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-blue-500" />
            <span className="font-mono text-[9px] text-stone-400 uppercase">Hydration</span>
          </div>
          <div className="font-serif text-2xl text-stone-100">{data[data.length - 1]?.hydration.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="mitochondrial" stroke="#5eead4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#a8a29e', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar dataKey="value" stroke="#5eead4" fill="#5eead4" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}