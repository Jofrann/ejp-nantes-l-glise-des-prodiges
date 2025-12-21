import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Moon, Apple, Dumbbell, Brain, Sun, Droplets } from 'lucide-react';

export default function DigitalTerrainSimulator({ onBiometricsUpdate }) {
  const [params, setParams] = useState({
    sleep: 7,
    nutrition: 70,
    exercise: 50,
    stress: 30,
    hydration: 80,
    sunlight: 60
  });

  const [biometrics, setBiometrics] = useState({
    mitochondrial: 75,
    oxidative: 20,
    inflammation: 15,
    cognition: 80,
    energy: 70,
    recovery: 75
  });

  const [timeSeriesData, setTimeSeriesData] = useState([]);

  useEffect(() => {
    // Calculate biometric impacts based on parameters
    const calculateBiometrics = () => {
      const mitochondrial = Math.min(100, 
        (params.sleep / 8 * 30) + 
        (params.nutrition / 100 * 25) + 
        (params.exercise / 100 * 20) + 
        ((100 - params.stress) / 100 * 15) + 
        (params.hydration / 100 * 10)
      );

      const oxidative = Math.max(0, 
        40 - (params.nutrition / 100 * 15) - 
        (params.sleep / 8 * 10) - 
        ((100 - params.stress) / 100 * 10) - 
        (params.exercise / 100 * 5)
      );

      const inflammation = Math.max(0,
        35 - (params.nutrition / 100 * 12) - 
        (params.exercise / 100 * 8) - 
        ((100 - params.stress) / 100 * 10) - 
        (params.sleep / 8 * 5)
      );

      const cognition = Math.min(100,
        (params.sleep / 8 * 25) + 
        (params.nutrition / 100 * 20) + 
        ((100 - params.stress) / 100 * 25) + 
        (params.exercise / 100 * 15) + 
        (params.hydration / 100 * 10) + 
        (params.sunlight / 100 * 5)
      );

      const energy = Math.min(100,
        (params.sleep / 8 * 30) + 
        (params.nutrition / 100 * 25) + 
        (params.hydration / 100 * 15) + 
        (params.exercise / 100 * 15) + 
        ((100 - params.stress) / 100 * 10) + 
        (params.sunlight / 100 * 5)
      );

      const recovery = Math.min(100,
        (params.sleep / 8 * 35) + 
        (params.nutrition / 100 * 20) + 
        ((100 - params.stress) / 100 * 20) + 
        (params.hydration / 100 * 15) + 
        (params.exercise / 100 * 10)
      );

      const newBiometrics = {
        mitochondrial: Math.round(mitochondrial),
        oxidative: Math.round(oxidative),
        inflammation: Math.round(inflammation),
        cognition: Math.round(cognition),
        energy: Math.round(energy),
        recovery: Math.round(recovery)
      };

      setBiometrics(newBiometrics);
      
      // Update time series
      setTimeSeriesData(prev => {
        const newData = [...prev, {
          time: prev.length,
          mitochondrial: newBiometrics.mitochondrial,
          energy: newBiometrics.energy,
          cognition: newBiometrics.cognition
        }];
        return newData.slice(-20);
      });

      if (onBiometricsUpdate) {
        onBiometricsUpdate(newBiometrics);
      }
    };

    calculateBiometrics();
  }, [params, onBiometricsUpdate]);

  const parameterControls = [
    { key: 'sleep', label: 'Sleep', icon: Moon, unit: 'hrs', max: 12, color: '#818cf8' },
    { key: 'nutrition', label: 'Nutrition', icon: Apple, unit: '%', max: 100, color: '#22c55e' },
    { key: 'exercise', label: 'Exercise', icon: Dumbbell, unit: '%', max: 100, color: '#f97316' },
    { key: 'stress', label: 'Stress', icon: Brain, unit: '%', max: 100, color: '#ef4444' },
    { key: 'hydration', label: 'Hydration', icon: Droplets, unit: '%', max: 100, color: '#06b6d4' },
    { key: 'sunlight', label: 'Sunlight', icon: Sun, unit: '%', max: 100, color: '#eab308' }
  ];

  const radarData = [
    { metric: 'Mitochondrial', value: biometrics.mitochondrial, fullMark: 100 },
    { metric: 'Energy', value: biometrics.energy, fullMark: 100 },
    { metric: 'Cognition', value: biometrics.cognition, fullMark: 100 },
    { metric: 'Recovery', value: biometrics.recovery, fullMark: 100 },
    { metric: 'Anti-Inflam', value: 100 - biometrics.inflammation, fullMark: 100 },
    { metric: 'Anti-Oxidative', value: 100 - biometrics.oxidative, fullMark: 100 }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-serif text-3xl text-stone-100 mb-2">Digital Terrain Simulator</h3>
        <p className="font-mono text-xs text-stone-400">
          Adjust lifestyle parameters to see real-time impact on your biological terrain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Parameter Controls */}
        <div className="space-y-6">
          <h4 className="font-mono text-xs text-bronze-400 uppercase tracking-widest">Lifestyle Inputs</h4>
          {parameterControls.map(param => (
            <motion.div
              key={param.key}
              className="glass-panel p-4 rounded-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <param.icon className="w-4 h-4" style={{ color: param.color }} />
                  <span className="font-mono text-sm text-stone-200">{param.label}</span>
                </div>
                <span className="font-mono text-lg text-copper-400">
                  {params[param.key]}{param.unit}
                </span>
              </div>
              <Slider
                value={[params[param.key]]}
                onValueChange={(value) => setParams({ ...params, [param.key]: value[0] })}
                max={param.max}
                step={1}
                className="cursor-pointer"
              />
            </motion.div>
          ))}
        </div>

        {/* Biometric Outputs */}
        <div className="space-y-6">
          <h4 className="font-mono text-xs text-bronze-400 uppercase tracking-widest">Biometric Outputs</h4>
          
          <div className="glass-panel p-6 rounded-sm">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar dataKey="value" stroke="#5eead4" fill="#5eead4" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-3 rounded-sm">
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Mitochondrial</div>
              <div className="font-serif text-2xl text-stone-100">{biometrics.mitochondrial}%</div>
            </div>
            <div className="glass-panel p-3 rounded-sm">
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Energy</div>
              <div className="font-serif text-2xl text-stone-100">{biometrics.energy}%</div>
            </div>
            <div className="glass-panel p-3 rounded-sm">
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Cognition</div>
              <div className="font-serif text-2xl text-stone-100">{biometrics.cognition}%</div>
            </div>
            <div className="glass-panel p-3 rounded-sm">
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Recovery</div>
              <div className="font-serif text-2xl text-stone-100">{biometrics.recovery}%</div>
            </div>
          </div>

          {timeSeriesData.length > 5 && (
            <div className="glass-panel p-4 rounded-sm">
              <h5 className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-3">Trend Analysis</h5>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={timeSeriesData}>
                  <Line type="monotone" dataKey="mitochondrial" stroke="#5eead4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cognition" stroke="#818cf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}