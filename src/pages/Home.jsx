import React, { useEffect, useState, useRef } from 'react';
import { X, Fingerprint, Brain, Apple, Home, Droplets, Sprout, Sun, ScanLine, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (isLoginOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isLoginOpen]);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen antialiased overflow-x-hidden" style={{ 
      backgroundColor: '#0a1410', 
      color: '#d6d3d1',
      fontFamily: '"Space Mono", monospace',
      cursor: 'none'
    }}>
      <style>{`
        .font-serif { font-family: "Playfair Display", serif; }
        .font-mono { font-family: "Space Mono", monospace; }
        
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes slowPan {
          0% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.1); }
        }
        .animate-pan {
          animation: slowPan 30s infinite alternate ease-in-out;
        }
        
        .hologram-text {
          text-shadow: 0 0 10px rgba(94, 234, 212, 0.5);
        }
        
        .bg-forest-950 { background-color: #0a1410; }
        .bg-forest-900 { background-color: #13241c; }
        .bg-forest-800 { background-color: #1c3329; }
        .text-copper-400 { color: #5eead4; }
        .text-bronze-400 { color: #d4a373; }
        .border-copper-400 { border-color: #5eead4; }
        .border-bronze-400 { border-color: #d4a373; }
        
        .noise-overlay {
          background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
        }
      `}</style>

      {/* Custom Cursor */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full mix-blend-screen transition-all duration-300"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: isHovering ? 400 : 300,
          height: isHovering ? 400 : 300,
          background: isHovering 
            ? 'radial-gradient(circle, rgba(94, 234, 212, 0.25) 0%, rgba(94, 234, 212, 0) 70%)'
            : 'radial-gradient(circle, rgba(94, 234, 212, 0.15) 0%, rgba(94, 234, 212, 0) 70%)',
          transform: 'translate(-50%, -50%)'
        }}
      />
      <div
        className="fixed pointer-events-none z-[10000] rounded-full"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: 6,
          height: 6,
          backgroundColor: '#d4a373',
          boxShadow: '0 0 10px #d4a373',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] noise-overlay mix-blend-overlay" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-6 flex justify-between items-center" style={{ color: '#e7e5e4' }}>
        <div className="font-mono text-xs tracking-widest uppercase mix-blend-difference z-50 relative">
          CBM / Deep Nature
        </div>
        
        <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest uppercase absolute left-1/2 -translate-x-1/2 mix-blend-difference z-50">
          <a href="#" className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>The Protocol</a>
          <a href="#" className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>The Terrain</a>
          <a href="#" className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Locations</a>
        </div>

        <div className="flex items-center gap-6 z-50">
          <button
            onClick={() => setIsLoginOpen(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="group relative flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full border border-white/5 bg-[#0a1410]/40 backdrop-blur-xl transition-all duration-500 hover:border-[#5eead4]/30 hover:bg-[#13241c]/60"
          >
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-stone-400 group-hover:text-copper-400 group-hover:border-[#5eead4]/30 transition-all duration-500">
              <Fingerprint className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400 group-hover:text-stone-200 transition-colors">Member Access</span>
              <span className="w-1 h-1 rounded-full bg-stone-600 group-hover:bg-[#5eead4] group-hover:shadow-[0_0_8px_rgba(94,234,212,0.8)] transition-all duration-500" />
            </div>
          </button>

          <div 
            className="w-8 h-8 flex flex-col justify-center gap-1.5 items-end mix-blend-difference cursor-pointer group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <span className="w-8 h-px bg-current group-hover:w-6 transition-all duration-300" />
            <span className="w-5 h-px bg-current group-hover:w-8 transition-all duration-300" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0a1410]/40 z-10" />
          <img
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
            alt="Glass House in Forest"
            className="w-full h-full object-cover animate-pan opacity-80"
          />
        </div>

        <div ref={addToRefs} className="relative z-20 text-center px-6 reveal active">
          <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 border border-[#5eead4]/30 rounded-full bg-[#0a1410]/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#5eead4] animate-pulse" style={{ boxShadow: '0 0 10px rgba(94,234,212,0.8)' }} />
            <span className="font-mono text-[10px] tracking-widest uppercase text-copper-400 hologram-text">System Status: Biological Terrain Optimized</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-100 tracking-tight leading-none mb-6 drop-shadow-2xl">
            Where Nature <br />
            <span className="italic font-light text-white/90">Meets Intelligence</span>
          </h1>

          <p className="max-w-md mx-auto font-mono text-xs md:text-sm text-stone-300 leading-relaxed tracking-wide mt-8 border-t border-white/20 pt-8">
            BIOLOGICAL MEDICINE REDEFINED. <br />
            CATALOGING THE SILENT RHYTHMS OF BIO-ADVANCEMENT.
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Scroll to Enter</span>
          <div className="h-12 w-px bg-gradient-to-b from-[#5eead4] to-transparent" />
        </div>
      </header>

      <main>
        {/* Digital Terrain Section */}
        <section className="relative py-32 md:py-48 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2664&auto=format&fit=crop"
              className="w-full h-full object-cover opacity-20 saturate-0"
              alt="Forest Floor"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1410] via-[#0a1410]/80 to-[#0a1410]" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full z-10 pointer-events-none opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#5eead4] fill-none" strokeWidth="0.1">
              <path d="M50,10 L50,90 M20,30 Q50,50 80,30 M30,70 Q50,50 70,70" />
              <circle cx="50" cy="20" r="15" />
              <circle cx="50" cy="50" r="2" />
            </svg>
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div ref={addToRefs} className="reveal">
                <h2 className="font-serif text-4xl md:text-5xl text-stone-100 mb-8 leading-tight">
                  True longevity begins <br />
                  <span className="italic text-copper-400">with the Terrain.</span>
                </h2>
                <p className="font-mono text-sm text-stone-400 leading-relaxed mb-12 max-w-md">
                  Two patients can live similarly and age very differently. We decode the environment within to optimize the outcome without.
                </p>

                <div className="grid gap-6">
                  {[
                    { icon: Brain, title: 'Neural Mapping', subtitle: 'Cognitive Resonance', color: 'bronze' },
                    { icon: Apple, title: 'Bio-Nutrition', subtitle: 'Cellular Fueling', color: 'copper', ml: 'md:ml-8' },
                    { icon: Home, title: 'Environmental Base', subtitle: 'Toxic Load Elimination', color: 'stone', ml: 'md:ml-16' }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`glass-panel p-6 rounded-sm flex items-center gap-6 group hover:bg-white/5 transition-colors duration-500 ${item.ml || ''}`}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center border rounded-full ${
                        item.color === 'bronze' ? 'border-[#d4a373]/30 text-[#d4a373] bg-[#b08968]/10' :
                        item.color === 'copper' ? 'border-[#5eead4]/30 text-[#5eead4] bg-[#2dd4bf]/10' :
                        'border-stone-400/30 text-stone-300 bg-stone-500/10'
                      }`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-stone-200">{item.title}</h4>
                        <p className="font-mono text-[10px] text-stone-500 uppercase tracking-wide">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={addToRefs} className="relative h-[600px] hidden lg:block reveal">
                <div className="absolute inset-0 glass-panel rounded-sm overflow-hidden">
                  <div className="absolute top-10 right-10 font-mono text-[9px] text-copper-400 text-right space-y-1 z-20">
                    <p>BIOMETRIC_ID: 994-AZ</p>
                    <p>TERRAIN_SCORE: 98.4%</p>
                    <p>OXIDATION_LEVEL: NOMINAL</p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1527&auto=format&fit=crop"
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay hover:scale-105 transition-transform duration-[2s]"
                    alt="Fungi texture"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blue Zones Data Block */}
        <section ref={addToRefs} className="reveal max-w-7xl mx-auto px-6 mb-32 md:mb-48">
          <div className="grid grid-cols-1 md:grid-cols-2 h-auto md:h-[600px] border border-stone-800">
            <div className="relative h-[400px] md:h-full overflow-hidden group">
              <div className="absolute inset-0 bg-[#0a1410]/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
              <img
                src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2641&auto=format&fit=crop"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                alt="Blue Zone Path"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <span className="font-mono text-[10px] bg-white text-[#0a1410] px-2 py-1 uppercase tracking-widest">Zone 04: Sardinian Highlands</span>
              </div>
            </div>

            <div className="relative bg-[#13241c]/50 backdrop-blur-xl border-l border-stone-800 p-12 flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4">
                <ScanLine className="w-6 h-6 text-copper-400 opacity-50 animate-pulse" />
              </div>

              <div className="space-y-6">
                <span className="font-mono text-xs text-bronze-400 tracking-widest uppercase border-b border-[#d4a373]/20 pb-2 inline-block">Longevity Engineering</span>
                
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-100 leading-none">
                  Engineering Your <br />
                  <span className="italic text-stone-500">Personal Blue Zone.</span>
                </h2>

                <p className="font-mono text-xs md:text-sm text-stone-400 leading-relaxed mt-4 border-l-2 border-[#5eead4]/50 pl-6">
                  Blue Zones are general patterns. Your biology is a specific code. We don't just mimic nature; we decode your unique terrain to replicate Blue Zone longevity within your specific environment.
                </p>

                <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="border border-stone-800 p-4">
                    <span className="block font-serif text-2xl text-stone-200">105+</span>
                    <span className="block font-mono text-[9px] text-stone-500 uppercase mt-1">Projected Healthspan</span>
                  </div>
                  <div className="border border-stone-800 p-4">
                    <span className="block font-serif text-2xl text-stone-200">0.0%</span>
                    <span className="block font-mono text-[9px] text-stone-500 uppercase mt-1">Inflammatory Markers</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100% 40px' }} />
            </div>
          </div>
        </section>

        {/* The Elements Section */}
        <section ref={addToRefs} className="reveal max-w-7xl mx-auto px-6 mb-32 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-6">
            <div>
              <span className="font-mono text-[10px] text-copper-400 tracking-widest uppercase mb-2 block">Offerings</span>
              <h2 className="font-serif text-4xl text-stone-100">The Elements</h2>
            </div>
            <div className="font-mono text-[10px] text-stone-500 uppercase tracking-widest mt-4 md:mt-0">
              Restoring Fundamental Harmony
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {[
              {
                img: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
                icon: Droplets,
                title: 'Fluid Dynamics',
                subtitle: 'IV & Ozone Therapy',
                desc: 'Restoring the internal ocean. Cleansing cellular pathways through hyper-oxygenation.',
                color: '#5eead4'
              },
              {
                img: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
                icon: Sprout,
                title: 'Microbiome Architecture',
                subtitle: 'Gut-Brain Axis',
                desc: 'Rebuilding the foundation. Introducing ancestral strains to modern biology.',
                color: '#d4a373'
              },
              {
                img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1632&auto=format&fit=crop',
                icon: Sun,
                title: 'Mitochondrial Light',
                subtitle: 'Photobiomodulation',
                desc: 'Direct energy transfer. Optimizing ATP production via targeted spectrum exposure.',
                color: 'rgba(234, 179, 8, 0.8)'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative h-[400px] md:h-full w-full overflow-hidden rounded-sm border border-stone-800"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <img
                  src={item.img}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 saturate-50 group-hover:saturate-100"
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1410] via-[#0a1410]/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 p-8 w-full z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <item.icon className="w-6 h-6 mb-4" style={{ color: item.color }} />
                  <h3 className="font-serif text-2xl text-stone-100 mb-2">{item.title}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: item.color }}>{item.subtitle}</p>
                  <p className="font-mono text-xs text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-l border-white/30 pl-3">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#13241c]/30">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h4 className="font-serif text-xl text-stone-200 mb-2">Centre for Biological Medicine</h4>
                <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">Deep Nature Spa & Exclusive Bio-Advancement</p>
              </div>
              
              <div className="flex gap-8 font-mono text-[10px] uppercase tracking-widest text-stone-400">
                <a href="#" className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Manifesto</a>
                <a href="#" className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Apply for Membership</a>
                <a href="#" className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Contact</a>
              </div>
            </div>
            <div className="mt-12 flex justify-between items-end border-t border-white/5 pt-8 font-mono text-[9px] text-stone-600 uppercase">
              <div>© 2024 Biological Medicine</div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                All Systems Operational
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Login Modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 ${
          isLoginOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[#0a1410]/90 backdrop-blur-2xl" onClick={() => setIsLoginOpen(false)} />
        
        <div
          className={`relative z-[110] w-full max-w-5xl glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl transition-transform duration-600 ${
            isLoginOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-5'
          }`}
          style={{ boxShadow: '0 25px 50px -12px rgba(10, 20, 16, 0.5)' }}
        >
          <button
            onClick={() => setIsLoginOpen(false)}
            className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-auto lg:h-[600px]">
            {/* Left: Member Login */}
            <div className="p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-br from-white/5 to-transparent">
              <div>
                <div className="flex items-center gap-3 mb-10 opacity-60">
                  <Fingerprint className="w-5 h-5 text-copper-400" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400">Secure Node Access</span>
                </div>
                
                <h2 className="font-serif text-3xl text-stone-100 mb-2">Member Terminal</h2>
                <p className="font-mono text-xs text-stone-500 mb-12">Enter biometric credentials to access your protocol.</p>
                
                <form className="space-y-8">
                  <div className="group relative">
                    <label className="absolute -top-3 left-0 font-mono text-[9px] text-stone-500 uppercase tracking-widest">Identifier</label>
                    <input
                      type="text"
                      className="block w-full bg-transparent border-b border-white/20 py-3 text-stone-200 focus:outline-none focus:border-[#5eead4] transition-colors font-mono text-sm placeholder-stone-700"
                      placeholder="BIO-ID (e.g. 994-AZ)"
                    />
                  </div>
                  
                  <div className="group relative">
                    <label className="absolute -top-3 left-0 font-mono text-[9px] text-stone-500 uppercase tracking-widest">Genetic Key</label>
                    <input
                      type="password"
                      className="block w-full bg-transparent border-b border-white/20 py-3 text-stone-200 focus:outline-none focus:border-[#5eead4] transition-colors font-mono text-sm placeholder-stone-700"
                      placeholder="••••••••••"
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-8 w-full group flex items-center justify-between bg-stone-100/5 hover:bg-stone-100/10 border border-white/10 rounded-sm px-6 py-4 transition-all duration-300"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <span className="font-mono text-xs text-stone-300 uppercase tracking-widest group-hover:text-copper-400 transition-colors">Authenticate</span>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>

              <div className="mt-12 lg:mt-0 font-mono text-[9px] text-stone-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5eead4] animate-pulse" />
                Secure Connection Established
              </div>
            </div>

            {/* Right: Request Membership */}
            <div className="p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="mb-10 inline-block px-3 py-1 rounded-full border border-[#d4a373]/30 bg-[#b08968]/5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-bronze-400">Waitlist Open</span>
                </div>

                <h2 className="font-serif text-3xl text-stone-100 mb-6">Initiate Protocol</h2>
                <p className="font-mono text-xs leading-relaxed text-stone-400 mb-10 border-l border-white/20 pl-4">
                  Membership is limited by biological capacity. We accept new terrains on a rolling basis following a comprehensive terrain assessment.
                </p>

                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">First Name</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-300 text-xs focus:border-[#d4a373] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">Last Name</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-300 text-xs focus:border-[#d4a373] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">Signal (Email)</label>
                    <input
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-300 text-xs focus:border-[#d4a373] focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full bg-stone-100 text-[#0a1410] font-mono text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors mt-4"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    Request Assessment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}