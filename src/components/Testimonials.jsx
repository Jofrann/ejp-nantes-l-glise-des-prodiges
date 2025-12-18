import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Quote, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials({ approach = 'clinical', protocol = null }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    generateTestimonials();
  }, [approach, protocol]);

  const generateTestimonials = async () => {
    setLoading(true);
    try {
      const protocolContext = protocol ? `for the ${protocol} protocol` : 'for various protocols';
      const perspectiveMap = {
        clinical: 'clinical and evidence-based, focusing on measurable outcomes',
        holistic: 'holistic and transformative, emphasizing overall wellness',
        futuristic: 'innovative and cutting-edge, highlighting advanced technology'
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 realistic, anonymized testimonials for a high-end biological medicine spa ${protocolContext}. 
Use a ${perspectiveMap[approach]} tone.

For each testimonial include:
- name: First name and last initial (e.g., "Sarah M.")
- age: Age range (e.g., "42")
- tier: Membership tier (Explorer, Sustainer, or Pioneer)
- protocol: Protocol they used (if not specified, choose from: IV Therapy, Neural Mapping, Microbiome Architecture, or Blue Zone Engineering)
- quote: Their testimonial (60-80 words, authentic and specific about results)
- outcome: Key measurable outcome (e.g., "Energy +40%", "Inflammation -65%")
- timeframe: How long to see results (e.g., "4 weeks")

Make them diverse in age, gender-neutral names, and specific about biological improvements.

Return as JSON with array called 'testimonials'.`,
        response_json_schema: {
          type: "object",
          properties: {
            testimonials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "string" },
                  tier: { type: "string" },
                  protocol: { type: "string" },
                  quote: { type: "string" },
                  outcome: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            }
          }
        }
      });

      setTestimonials(result.testimonials);
    } catch (error) {
      console.error('Error generating testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-sm flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-copper-400 animate-pulse mr-3" />
        <span className="font-mono text-xs text-stone-400">Generating testimonials...</span>
      </div>
    );
  }

  if (!testimonials.length) return null;

  const current = testimonials[currentIndex];

  return (
    <div className="glass-panel p-8 rounded-sm relative overflow-hidden">
      <Quote className="absolute top-4 right-4 w-12 h-12 text-copper-400/20" />
      
      <div className="flex items-center gap-2 mb-6">
        <span className="font-mono text-[9px] text-copper-400 uppercase tracking-widest">Member Testimonials</span>
        <span className="text-stone-600">•</span>
        <span className="font-mono text-[9px] text-stone-500">{currentIndex + 1} of {testimonials.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-mono text-sm text-stone-200 leading-relaxed mb-6 italic">
            "{current.quote}"
          </p>

          <div className="flex items-start justify-between">
            <div>
              <div className="font-serif text-lg text-stone-100">{current.name}</div>
              <div className="font-mono text-xs text-stone-500 mt-1">
                Age {current.age} • {current.tier} Tier • {current.protocol}
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-xl text-copper-400">{current.outcome}</div>
              <div className="font-mono text-[9px] text-stone-500 mt-1">in {current.timeframe}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prevTestimonial}
          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-copper-400 hover:bg-copper-400/10 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-stone-400" />
        </button>
        
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-copper-400 w-8' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextTestimonial}
          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-copper-400 hover:bg-copper-400/10 transition-all"
        >
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>
    </div>
  );
}