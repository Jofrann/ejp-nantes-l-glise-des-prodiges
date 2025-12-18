import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, Users, Heart, Zap } from 'lucide-react';

function AnimatedCounter({ value, duration = 2 }) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function GlobalImpactCounter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('impact-counter');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const metrics = [
    { icon: Users, label: 'Active Members', value: 2847, suffix: '', color: '#5eead4' },
    { icon: Heart, label: 'Healthspan Added', value: 15234, suffix: ' Years', color: '#d4a373' },
    { icon: Zap, label: 'Protocols Completed', value: 8965, suffix: '', color: '#fbbf24' },
    { icon: TrendingUp, label: 'Avg. Terrain Score', value: 94, suffix: '%', color: '#22c55e' }
  ];

  return (
    <div id="impact-counter" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#13241c]/50 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-[10px] text-copper-400 tracking-widest uppercase mb-4 block">
              Global Impact
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-100 mb-4">
              Optimizing Biology <br />
              <span className="italic text-stone-500">One Terrain at a Time</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel p-6 rounded-sm text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ backgroundColor: metric.color }}
              />
              
              <metric.icon
                className="w-8 h-8 mx-auto mb-4 opacity-60"
                style={{ color: metric.color }}
              />
              
              <div className="font-serif text-4xl text-stone-100 mb-2">
                {isVisible ? (
                  <>
                    <AnimatedCounter value={metric.value} />
                    <span className="text-xl">{metric.suffix}</span>
                  </>
                ) : (
                  <span>0{metric.suffix}</span>
                )}
              </div>
              
              <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">
                {metric.label}
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ backgroundColor: metric.color }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="font-mono text-xs text-stone-400 leading-relaxed max-w-2xl mx-auto">
            Real-time aggregated data from our global community of members committed to biological optimization.
            Every protocol completed brings us closer to understanding human longevity.
          </p>
        </motion.div>
      </div>
    </div>
  );
}