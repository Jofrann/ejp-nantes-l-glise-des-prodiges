import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export default function LabAssistant({ currentSection, setIsHovering }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getContextualGreeting(currentSection);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, currentSection]);

  const getContextualGreeting = (section) => {
    const greetings = {
      hero: "Welcome to the Centre for Biological Medicine. I'm here to guide you through our protocols. What would you like to know?",
      terrain: "I see you're exploring terrain optimization. This is the foundation of longevity. Ask me about any specific protocol.",
      elements: "The Elements section showcases our core therapies. Would you like to understand how they work synergistically?",
      bluezone: "Blue Zones reveal nature's longevity secrets. I can explain how we apply these principles to your unique biology."
    };
    return greetings[section] || "Hello! I'm your Lab AI assistant. How can I help you understand biological medicine today?";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const context = `You are a Lab AI assistant for a high-end biological medicine spa. 
Current section: ${currentSection}
User is viewing information about longevity, protocols, and biological terrain optimization.
Respond in a knowledgeable, clinical yet accessible tone. Keep responses to 2-3 sentences.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\nUser: ${userMessage}\n\nRespond helpfully and concisely.`
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      console.error('Lab AI error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again or contact our team.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full glass-panel flex items-center justify-center group hover:scale-110 transition-transform duration-300"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-copper-400" />
        ) : (
          <Bot className="w-6 h-6 text-copper-400 group-hover:animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-96 h-[500px] glass-panel rounded-lg overflow-hidden border border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-copper-400/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-copper-400" />
              </div>
              <div>
                <div className="font-mono text-sm text-stone-100">Lab AI Assistant</div>
                <div className="font-mono text-[9px] text-stone-500">Context-Aware Guidance</div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-copper-400/20 border border-copper-400/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <p className="font-mono text-xs text-stone-200 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                  <Sparkles className="w-4 h-4 text-copper-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about protocols..."
                className="flex-1 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-200 text-xs focus:border-copper-400 focus:outline-none transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-copper-400/20 border border-copper-400/30 rounded-sm hover:bg-copper-400/30 transition-colors disabled:opacity-50"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Send className="w-4 h-4 text-copper-400" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}