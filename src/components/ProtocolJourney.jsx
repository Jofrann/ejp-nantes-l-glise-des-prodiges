import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Clock, FileText, Sparkles } from 'lucide-react';

export default function ProtocolJourney({ protocol, onClose }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(0);

  useEffect(() => {
    generateJourney();
  }, [protocol]);

  const generateJourney = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed Protocol Journey for: ${protocol.name || protocol}

Generate a step-by-step guide with:
1. overview: Brief protocol overview (40-50 words)
2. duration: Total duration (e.g., "8 weeks")
3. steps: Array of 5-7 protocol steps, each with:
   - title: Step name (e.g., "Initial Assessment")
   - day: When this happens (e.g., "Day 1", "Week 2")
   - description: What happens (50-60 words)
   - deliverable: What the member receives/experiences
   - icon: Choose from: "assessment", "treatment", "monitoring", "optimization", "review"

Make it practical, detailed, and progressive.

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            duration: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  day: { type: "string" },
                  description: { type: "string" },
                  deliverable: { type: "string" },
                  icon: { type: "string" }
                }
              }
            }
          }
        }
      });

      setJourney(result);
    } catch (error) {
      console.error('Error generating journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconMap = {
    assessment: '📋',
    treatment: '💉',
    monitoring: '📊',
    optimization: '⚡',
    review: '✅'
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Sparkles className="w-12 h-12 text-copper-400 animate-pulse mb-4" />
        <p className="font-mono text-sm text-stone-400 uppercase tracking-widest">Mapping Protocol Journey...</p>
      </div>
    );
  }

  if (!journey) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 mb-4">Protocol Journey</h2>
        <p className="font-mono text-sm text-stone-400 leading-relaxed mb-2">{journey.overview}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-copper-400/30 bg-copper-400/10">
          <Clock className="w-3 h-3 text-copper-400" />
          <span className="font-mono text-xs text-copper-400">{journey.duration}</span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-copper-400 via-copper-400/50 to-transparent" />

        <div className="space-y-6">
          {journey.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <button
                onClick={() => setSelectedStep(index)}
                className={`w-full text-left glass-panel p-6 rounded-sm border transition-all duration-300 ${
                  selectedStep === index
                    ? 'border-copper-400 bg-copper-400/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Timeline Icon */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    selectedStep === index
                      ? 'bg-copper-400/20 border-2 border-copper-400'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    {iconMap[step.icon] || '📍'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-xl text-stone-100">{step.title}</h3>
                      <span className="font-mono text-xs text-bronze-400 uppercase tracking-widest">
                        {step.day}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedStep === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 mt-4"
                        >
                          <p className="font-mono text-xs text-stone-300 leading-relaxed">
                            {step.description}
                          </p>
                          
                          <div className="flex items-start gap-2 border-l-2 border-copper-400 pl-3">
                            <FileText className="w-4 h-4 text-copper-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-mono text-[9px] text-bronze-400 uppercase tracking-widest">
                                Deliverable
                              </div>
                              <div className="font-mono text-xs text-stone-300 mt-1">
                                {step.deliverable}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4 rounded-sm border border-copper-400/30 bg-copper-400/5">
        <p className="font-mono text-xs text-stone-300 leading-relaxed">
          <span className="text-copper-400 font-semibold">Note:</span> This journey is personalized based on your assessment. 
          Timeline may be adjusted based on your biological response and progress.
        </p>
      </div>
    </div>
  );
}