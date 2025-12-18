import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronRight, CheckCircle } from 'lucide-react';

export default function TerrainAssessment({ onComplete, setIsHovering }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState({
    symptoms: [],
    lifestyle: {},
    goals: []
  });
  const [results, setResults] = useState(null);

  const symptoms = [
    'Fatigue', 'Brain Fog', 'Digestive Issues', 'Sleep Problems',
    'Inflammation', 'Mood Swings', 'Low Energy', 'Stress'
  ];

  const lifestyleQuestions = [
    { key: 'exercise', label: 'Exercise Frequency', options: ['Never', '1-2x/week', '3-4x/week', 'Daily'] },
    { key: 'sleep', label: 'Sleep Quality', options: ['Poor', 'Fair', 'Good', 'Excellent'] },
    { key: 'diet', label: 'Diet Type', options: ['Standard', 'Vegetarian', 'Paleo', 'Mediterranean'] }
  ];

  const goals = [
    'Increase Energy', 'Improve Sleep', 'Reduce Inflammation',
    'Enhance Cognition', 'Longevity', 'Athletic Performance'
  ];

  const generateAssessment = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biological medicine expert. Based on this patient assessment, generate a personalized biological blueprint.

Symptoms: ${assessment.symptoms.join(', ')}
Lifestyle: ${JSON.stringify(assessment.lifestyle)}
Goals: ${assessment.goals.join(', ')}

Generate a comprehensive assessment with:
1. biologicalScore: Overall terrain score (0-100)
2. primaryConcerns: Array of 2-3 main issues detected
3. recommendedProtocols: Array of 3-4 specific protocol recommendations with brief explanations
4. biomarkers: Array of 3-4 key biomarkers to monitor
5. timelineEstimate: Expected time to see improvements (in weeks)

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            biologicalScore: { type: "number" },
            primaryConcerns: { type: "array", items: { type: "string" } },
            recommendedProtocols: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            biomarkers: { type: "array", items: { type: "string" } },
            timelineEstimate: { type: "number" }
          }
        }
      });

      setResults(result);
      if (onComplete) onComplete(result);
    } catch (error) {
      console.error('Assessment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-copper-400 mb-4">
            <span className="font-serif text-3xl text-copper-400">{results.biologicalScore}</span>
          </div>
          <h3 className="font-serif text-2xl text-stone-100 mb-2">Your Biological Terrain Score</h3>
          <p className="font-mono text-xs text-stone-400">Assessment Complete</p>
        </div>

        <div className="glass-panel p-4 rounded-sm">
          <h4 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-3">Primary Concerns</h4>
          <div className="space-y-2">
            {results.primaryConcerns.map((concern, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="font-mono text-xs text-stone-300">{concern}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-sm">
          <h4 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-3">Recommended Protocols</h4>
          <div className="space-y-3">
            {results.recommendedProtocols.map((protocol, i) => (
              <div key={i} className="border-l-2 border-copper-400 pl-3">
                <div className="font-mono text-sm text-stone-200">{protocol.name}</div>
                <div className="font-mono text-[10px] text-stone-400 mt-1">{protocol.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-sm">
            <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-2">Timeline</div>
            <div className="font-serif text-2xl text-stone-100">{results.timelineEstimate} weeks</div>
          </div>
          <div className="glass-panel p-4 rounded-sm">
            <div className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-2">Biomarkers</div>
            <div className="font-mono text-xs text-stone-300">{results.biomarkers.length} to track</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-8 h-1 rounded-full transition-all ${
                s <= step ? 'bg-copper-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-stone-400">Step {step}/3</span>
      </div>

      {step === 1 && (
        <div>
          <h3 className="font-serif text-xl text-stone-100 mb-4">Current Symptoms</h3>
          <div className="grid grid-cols-2 gap-2">
            {symptoms.map(symptom => (
              <button
                key={symptom}
                onClick={() => {
                  setAssessment(prev => ({
                    ...prev,
                    symptoms: prev.symptoms.includes(symptom)
                      ? prev.symptoms.filter(s => s !== symptom)
                      : [...prev.symptoms, symptom]
                  }));
                }}
                className={`px-3 py-2 rounded-sm border text-xs font-mono transition-all ${
                  assessment.symptoms.includes(symptom)
                    ? 'border-copper-400 bg-copper-400/10 text-copper-400'
                    : 'border-white/10 bg-white/5 text-stone-400 hover:border-white/20'
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl text-stone-100 mb-4">Lifestyle Factors</h3>
          {lifestyleQuestions.map(q => (
            <div key={q.key}>
              <label className="font-mono text-xs text-stone-400 mb-2 block">{q.label}</label>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setAssessment(prev => ({
                        ...prev,
                        lifestyle: { ...prev.lifestyle, [q.key]: option }
                      }));
                    }}
                    className={`px-3 py-2 rounded-sm border text-xs font-mono transition-all ${
                      assessment.lifestyle[q.key] === option
                        ? 'border-copper-400 bg-copper-400/10 text-copper-400'
                        : 'border-white/10 bg-white/5 text-stone-400 hover:border-white/20'
                    }`}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="font-serif text-xl text-stone-100 mb-4">Primary Goals</h3>
          <div className="grid grid-cols-2 gap-2">
            {goals.map(goal => (
              <button
                key={goal}
                onClick={() => {
                  setAssessment(prev => ({
                    ...prev,
                    goals: prev.goals.includes(goal)
                      ? prev.goals.filter(g => g !== goal)
                      : [...prev.goals, goal]
                  }));
                }}
                className={`px-3 py-2 rounded-sm border text-xs font-mono transition-all ${
                  assessment.goals.includes(goal)
                    ? 'border-copper-400 bg-copper-400/10 text-copper-400'
                    : 'border-white/10 bg-white/5 text-stone-400 hover:border-white/20'
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-2 border border-white/10 rounded-sm font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-stone-200 transition-colors"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              generateAssessment();
            }
          }}
          disabled={loading}
          className="flex-1 bg-stone-100 text-[#0a1410] font-mono text-xs uppercase tracking-widest py-2 hover:bg-white transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-pulse" />
              Analyzing...
            </>
          ) : step < 3 ? (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Generate Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );
}