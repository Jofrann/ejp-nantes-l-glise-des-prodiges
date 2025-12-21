import React, { useEffect, useState, useRef } from 'react';
import { X, Fingerprint, Brain, Apple, Home, Droplets, Sprout, Sun, ScanLine, ArrowRight, Sparkles, ChevronRight, Users, Map, Microscope, BarChart3, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, useScroll, useTransform } from 'framer-motion';
import BiometricDashboard from '../components/BiometricDashboard';
import ThreeDHero from '../components/ThreeDHero';
import ThemeSwitcher from '../components/ThemeSwitcher';
import TerrainAssessment from '../components/TerrainAssessment';
import MemberDashboard from '../components/MemberDashboard';
import BlueZoneMap from '../components/BlueZoneMap';
import LabAssistant from '../components/LabAssistant';
import ScanEffect from '../components/ScanEffect';
import Testimonials from '../components/Testimonials';
import ProtocolJourney from '../components/ProtocolJourney';
import GlobalImpactCounter from '../components/GlobalImpactCounter';
import ScrollProgress from '../components/ScrollProgress';
import MicroInteraction from '../components/MicroInteraction';
import DigitalTerrainSimulator from '../components/DigitalTerrainSimulator';

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const revealRefs = useRef([]);
  
  // Elements content variations
  const [elementsApproach, setElementsApproach] = useState('clinical');
  const [elementsContent, setElementsContent] = useState(null);
  const [loadingElements, setLoadingElements] = useState(false);
  
  // Protocol/Terrain modal
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [conceptDetails, setConceptDetails] = useState(null);
  const [loadingConcept, setLoadingConcept] = useState(false);
  
  // Membership tiers
  const [showMembershipTiers, setShowMembershipTiers] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [membershipTiers, setMembershipTiers] = useState(null);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    interests: []
  });

  // New feature states
  const [theme, setTheme] = useState('elemental');
  const [showAssessment, setShowAssessment] = useState(false);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [showTerrainSimulator, setShowTerrainSimulator] = useState(false);
  const [simulatorBiometrics, setSimulatorBiometrics] = useState(null);
  const [currentSection, setCurrentSection] = useState('hero');
  const [selectedProtocolJourney, setSelectedProtocolJourney] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState(null);

  const { scrollY } = useScroll();

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

  // Load default elements content on mount
  useEffect(() => {
    generateElementsContent('clinical');
  }, []);

  // Track current section for Lab Assistant
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'terrain', 'elements', 'bluezone'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = {
      clinical: { bg: '#f8fafc', text: '#1e293b', primary: '#0ea5e9' },
      elemental: { bg: '#0a1410', text: '#d6d3d1', primary: '#5eead4' },
      futuristic: { bg: '#000000', text: '#ffffff', primary: '#00ffff' }
    };

    const colors = themeColors[theme];
    root.style.setProperty('--theme-bg', colors.bg);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-primary', colors.primary);
  }, [theme]);

  // Generate Elements content variations
  const generateElementsContent = async (approach) => {
    if (elementsContent && elementsContent[approach]) {
      setElementsApproach(approach);
      return;
    }
    
    setLoadingElements(true);
    try {
      const approachDescriptions = {
        clinical: 'clinical and scientific, using medical terminology and evidence-based language',
        holistic: 'wellness-focused and holistic, emphasizing natural healing and mind-body connection',
        futuristic: 'futuristic and innovative, highlighting cutting-edge technology and bio-advancement'
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate three descriptive texts for a high-end biological medicine spa's services. Use a ${approachDescriptions[approach]} tone. Each description should be 15-20 words and capture the essence of the treatment.

Services:
1. Fluid Dynamics (IV & Ozone Therapy) - intravenous treatments and oxygenation therapy
2. Microbiome Architecture (Gut-Brain Axis) - microbiome restoration and gut health optimization
3. Mitochondrial Light (Photobiomodulation) - light therapy for cellular energy optimization

Return as JSON with keys: fluidDynamics, microbiomeArchitecture, mitochondrialLight`,
        response_json_schema: {
          type: "object",
          properties: {
            fluidDynamics: { type: "string" },
            microbiomeArchitecture: { type: "string" },
            mitochondrialLight: { type: "string" }
          }
        }
      });

      setElementsContent(prev => ({
        ...prev,
        [approach]: result
      }));
      setElementsApproach(approach);
    } catch (error) {
      console.error('Error generating elements content:', error);
    } finally {
      setLoadingElements(false);
    }
  };

  // Generate concept details with case study
  const generateConceptDetails = async (concept) => {
    setSelectedConcept(concept);
    setLoadingConcept(true);
    
    try {
      const conceptPrompts = {
        neural: 'Neural Mapping - cognitive function assessment and brain optimization through advanced neurological protocols',
        nutrition: 'Bio-Nutrition - personalized nutritional therapy based on individual cellular and metabolic needs',
        environmental: 'Environmental Base - toxic load assessment and environmental detoxification strategies',
        bluezone: 'Blue Zone Engineering - replicating longevity patterns from Blue Zones in individual biological terrain'
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate detailed information for a biological medicine concept: ${conceptPrompts[concept]}

Include:
1. overview: 2-3 sentence overview of the protocol (60-80 words)
2. methodology: 3-4 bullet points explaining the process
3. caseStudy: A realistic case study with patient profile (anonymized), initial condition, protocol applied, and outcome (100-120 words)
4. expectedOutcomes: 3-4 measurable outcomes

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            methodology: { type: "array", items: { type: "string" } },
            caseStudy: { type: "string" },
            expectedOutcomes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setConceptDetails(result);
    } catch (error) {
      console.error('Error generating concept details:', error);
    } finally {
      setLoadingConcept(false);
    }
  };

  // Generate membership tiers based on user input
  const generateMembershipTiers = async () => {
    setLoadingTiers(true);
    
    try {
      const interestsText = formData.interests.length > 0 
        ? `User is interested in: ${formData.interests.join(', ')}`
        : 'General wellness and longevity';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate three membership tiers for a high-end biological medicine spa. ${interestsText}

Create tiers: Explorer (entry-level), Sustainer (mid-level), Pioneer (premium).

For each tier include:
- name, tagline (5-7 words), monthlyPrice (number), annualPrice (number)
- benefits: array of 4-5 specific benefits
- idealFor: short description of who this tier suits (20-30 words)
- accessLevel: brief description of access privileges (15-20 words)

Ensure benefits are progressively more comprehensive. Price ranges: Explorer $300-500/mo, Sustainer $800-1200/mo, Pioneer $2000-3500/mo.

Return as JSON with array called 'tiers'.`,
        response_json_schema: {
          type: "object",
          properties: {
            tiers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  tagline: { type: "string" },
                  monthlyPrice: { type: "number" },
                  annualPrice: { type: "number" },
                  benefits: { type: "array", items: { type: "string" } },
                  idealFor: { type: "string" },
                  accessLevel: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMembershipTiers(result.tiers);
      setShowMembershipTiers(true);
    } catch (error) {
      console.error('Error generating membership tiers:', error);
      alert('Unable to generate tiers. Please try again.');
    } finally {
      setLoadingTiers(false);
    }
  };

  // Handle membership application submission
  const submitMembershipApplication = async () => {
    if (!selectedTier) {
      alert('Please select a membership tier');
      return;
    }

    setLoadingTiers(true);
    try {
      const tierData = membershipTiers.find(t => t.name === selectedTier);
      
      // Save to database
      await base44.entities.MembershipApplication.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        interests: formData.interests,
        selectedTier: selectedTier,
        tierDetails: tierData,
        status: 'pending'
      });

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: 'Membership Application Received - Centre for Biological Medicine',
        body: `Dear ${formData.firstName} ${formData.lastName},

Thank you for your interest in our ${selectedTier} membership tier.

Selected Tier: ${selectedTier}
${tierData.tagline}
Monthly Investment: $${tierData.monthlyPrice}

Your interests: ${formData.interests.join(', ') || 'General wellness'}

We will review your application and contact you within 48 hours to schedule your comprehensive terrain assessment.

Best regards,
Centre for Biological Medicine Team`
      });

      // Close modal and show success
      setIsLoginOpen(false);
      alert(`✓ Application Received!\n\nThank you for applying to the ${selectedTier} tier. Check your email (${formData.email}) for confirmation.`);
      
      // Reset form
      setFormData({ firstName: '', lastName: '', email: '', interests: [] });
      setShowMembershipTiers(false);
      setSelectedTier(null);
      setMembershipTiers(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Unable to submit application. Please try again.');
    } finally {
      setLoadingTiers(false);
    }
  };

  // Mock member login
  const handleMemberLogin = () => {
    setIsMemberLoggedIn(true);
    setIsLoginOpen(false);
  };

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

      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-6 flex justify-between items-center" style={{ color: '#e7e5e4' }}>
        <div className="font-mono text-xs tracking-widest uppercase mix-blend-difference z-50 relative">
          CBM / Deep Nature
        </div>
        
        <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest uppercase absolute left-1/2 -translate-x-1/2 mix-blend-difference z-50">
          <button onClick={() => window.scrollTo({ top: document.querySelector('main').offsetTop, behavior: 'smooth' })} className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>The Protocol</button>
          <button onClick={() => window.scrollTo({ top: document.querySelector('main').offsetTop, behavior: 'smooth' })} className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>The Terrain</button>
          <button onClick={() => setIsLoginOpen(true)} className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Membership</button>
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

      {/* Theme Switcher */}
      <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} isHovering={isHovering} setIsHovering={setIsHovering} />

      {/* Lab Assistant */}
      <LabAssistant currentSection={currentSection} setIsHovering={setIsHovering} />

      {/* Hero Section */}
      <header id="hero" className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0a1410]/40 z-10" />
          <img
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
            alt="Glass House in Forest"
            className="w-full h-full object-cover animate-pan opacity-80"
          />
          <ThreeDHero />
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
        {/* Biometric Dashboard Overlay */}
        {showBiometrics && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-8 top-32 z-40 w-[450px]"
          >
            <BiometricDashboard approach={elementsApproach} />
          </motion.div>
        )}

        {/* Blue Zone Map Overlay */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[600px]"
          >
            <BlueZoneMap />
          </motion.div>
        )}

        {/* Digital Terrain Section */}
        <section id="terrain" className="relative py-32 md:py-48 overflow-hidden">
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
                    { icon: Brain, title: 'Neural Mapping', subtitle: 'Cognitive Resonance', color: 'bronze', concept: 'neural' },
                    { icon: Apple, title: 'Bio-Nutrition', subtitle: 'Cellular Fueling', color: 'copper', ml: 'md:ml-8', concept: 'nutrition' },
                    { icon: Home, title: 'Environmental Base', subtitle: 'Toxic Load Elimination', color: 'stone', ml: 'md:ml-16', concept: 'environmental' }
                  ].map((item, i) => (
                    <ScanEffect key={i}>
                      <motion.button
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        onClick={() => {
                          generateConceptDetails(item.concept);
                          setSelectedProtocolJourney({ name: item.title, concept: item.concept });
                        }}
                        className={`glass-panel p-6 rounded-sm flex items-center gap-6 group hover:bg-white/5 transition-colors duration-500 ${item.ml || ''} cursor-none text-left w-full`}
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
                        <div className="flex-1">
                          <h4 className="font-serif text-lg text-stone-200">{item.title}</h4>
                          <p className="font-mono text-[10px] text-stone-500 uppercase tracking-wide">{item.subtitle}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-copper-400 transition-colors" />
                      </motion.button>
                    </ScanEffect>
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
        <section id="bluezone" ref={addToRefs} className="reveal max-w-7xl mx-auto px-6 mb-32 md:mb-48">
          <div className="grid grid-cols-1 md:grid-cols-2 h-auto md:h-[600px] border border-stone-800">
            <button
              onClick={() => generateConceptDetails('bluezone')}
              className="relative h-[400px] md:h-full overflow-hidden group cursor-none w-full"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="absolute inset-0 bg-[#0a1410]/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
              <img
                src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2641&auto=format&fit=crop"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                alt="Blue Zone Path"
              />
              <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3">
                <span className="font-mono text-[10px] bg-white text-[#0a1410] px-2 py-1 uppercase tracking-widest">Zone 04: Sardinian Highlands</span>
                <ChevronRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

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

        {/* Digital Terrain Simulator Section */}
        <section id="terrain" className="max-w-7xl mx-auto px-6 mb-32">
          <DigitalTerrainSimulator 
            onBiometricsUpdate={(biometrics) => {
              setSimulatorBiometrics(biometrics);
              setShowBiometrics(true);
            }}
          />
        </section>

        {/* Global Impact Counter */}
        <GlobalImpactCounter />

        {/* Testimonials Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="mb-8">
            <span className="font-mono text-[10px] text-copper-400 tracking-widest uppercase mb-2 block">Member Experiences</span>
            <h2 className="font-serif text-4xl text-stone-100">Transformation Stories</h2>
          </div>
          <Testimonials approach={elementsApproach} />
        </section>

        {/* The Elements Section */}
        <section id="elements" ref={addToRefs} className="reveal max-w-7xl mx-auto px-6 mb-32 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-6">
            <div>
              <span className="font-mono text-[10px] text-copper-400 tracking-widest uppercase mb-2 block">Offerings</span>
              <h2 className="font-serif text-4xl text-stone-100">The Elements</h2>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest hidden lg:block">
                Perspective:
              </span>
              <div className="flex gap-2">
                {[
                  { key: 'clinical', label: 'Clinical', icon: '⚕️' },
                  { key: 'holistic', label: 'Holistic', icon: '🌿' },
                  { key: 'futuristic', label: 'Futuristic', icon: '🔬' }
                ].map(approach => (
                  <button
                    key={approach.key}
                    onClick={() => generateElementsContent(approach.key)}
                    disabled={loadingElements}
                    className={`px-3 py-1.5 rounded-sm border transition-all duration-300 font-mono text-[9px] uppercase tracking-widest flex items-center gap-2 ${
                      elementsApproach === approach.key
                        ? 'border-copper-400 bg-[#5eead4]/10 text-copper-400'
                        : 'border-white/10 bg-white/5 text-stone-400 hover:border-white/20'
                    }`}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <span>{approach.icon}</span>
                    <span>{approach.label}</span>
                  </button>
                ))}
              </div>
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
                color: '#5eead4',
                contentKey: 'fluidDynamics'
              },
              {
                img: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
                icon: Sprout,
                title: 'Microbiome Architecture',
                subtitle: 'Gut-Brain Axis',
                desc: 'Rebuilding the foundation. Introducing ancestral strains to modern biology.',
                color: '#d4a373',
                contentKey: 'microbiomeArchitecture'
              },
              {
                img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1632&auto=format&fit=crop',
                icon: Sun,
                title: 'Mitochondrial Light',
                subtitle: 'Photobiomodulation',
                desc: 'Direct energy transfer. Optimizing ATP production via targeted spectrum exposure.',
                color: 'rgba(234, 179, 8, 0.8)',
                contentKey: 'mitochondrialLight'
              }
            ].map((item, i) => {
              const displayDesc = elementsContent?.[elementsApproach]?.[item.contentKey] || item.desc;
              return (
                <MicroInteraction key={i} type="lift">
                  <div
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
                      {loadingElements ? 'Generating perspective...' : displayDesc}
                    </p>
                    </div>
                    </div>
                    </MicroInteraction>
                    );
                    })}
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
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Manifesto</button>
                <button onClick={() => setIsLoginOpen(true)} className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Apply for Membership</button>
                <button onClick={() => alert('Contact us at: contact@biologicalmedicine.com')} className="hover:text-copper-400 transition-colors" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Contact</button>
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
                
                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleMemberLogin(); }}>
                  <div className="group relative">
                    <label className="absolute -top-3 left-0 font-mono text-[9px] text-stone-500 uppercase tracking-widest">Identifier</label>
                    <input
                      type="text"
                      className="block w-full bg-transparent border-b border-white/20 py-3 text-stone-200 focus:outline-none focus:border-[#5eead4] transition-colors font-mono text-sm placeholder-stone-700"
                      placeholder="BIO-ID (e.g. 994-AZ)"
                      required
                    />
                  </div>
                  
                  <div className="group relative">
                    <label className="absolute -top-3 left-0 font-mono text-[9px] text-stone-500 uppercase tracking-widest">Genetic Key</label>
                    <input
                      type="password"
                      className="block w-full bg-transparent border-b border-white/20 py-3 text-stone-200 focus:outline-none focus:border-[#5eead4] transition-colors font-mono text-sm placeholder-stone-700"
                      placeholder="••••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
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

            {/* Right: Request Membership or Member Dashboard */}
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
                {isMemberLoggedIn ? (
                  <MemberDashboard 
                    memberData={{ bioId: '994-AZ' }} 
                    recommendedProtocols={assessmentResults?.recommendedProtocols || []}
                  />
                ) : (
                  <>
                    <div className="mb-10 inline-block px-3 py-1 rounded-full border border-[#d4a373]/30 bg-[#b08968]/5">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-bronze-400">Waitlist Open</span>
                    </div>

                    <h2 className="font-serif text-3xl text-stone-100 mb-6">Initiate Protocol</h2>
                <p className="font-mono text-xs leading-relaxed text-stone-400 mb-10 border-l border-white/20 pl-4">
                  Membership is limited by biological capacity. We accept new terrains on a rolling basis following a comprehensive terrain assessment.
                </p>

                {!showMembershipTiers ? (
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); generateMembershipTiers(); }}>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-300 text-xs focus:border-[#d4a373] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-300 text-xs focus:border-[#d4a373] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">Signal (Email)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-stone-300 text-xs focus:border-[#d4a373] focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">Areas of Interest</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Longevity', 'Performance', 'Recovery', 'Prevention', 'Optimization', 'Detox'].map(interest => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                interests: prev.interests.includes(interest)
                                  ? prev.interests.filter(i => i !== interest)
                                  : [...prev.interests, interest]
                              }));
                            }}
                            className={`px-3 py-2 rounded-sm border text-[10px] font-mono uppercase tracking-widest transition-all ${
                              formData.interests.includes(interest)
                                ? 'border-[#d4a373] bg-[#d4a373]/10 text-[#d4a373]'
                                : 'border-white/10 bg-white/5 text-stone-500 hover:border-white/20'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingTiers}
                      className="w-full bg-stone-100 text-[#0a1410] font-mono text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      {loadingTiers ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          Analyzing Terrain...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Personalized Tiers
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                      {membershipTiers?.map((tier, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTier(selectedTier === tier.name ? null : tier.name)}
                          className={`w-full text-left glass-panel p-4 rounded-sm border transition-all duration-300 ${
                            selectedTier === tier.name
                              ? 'border-[#d4a373] bg-[#d4a373]/5'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-serif text-lg text-stone-100">{tier.name}</h3>
                              <p className="font-mono text-[9px] text-[#d4a373] uppercase tracking-widest">{tier.tagline}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-serif text-xl text-stone-200">${tier.monthlyPrice}</p>
                              <p className="font-mono text-[8px] text-stone-500">per month</p>
                            </div>
                          </div>
                          <p className="font-mono text-[10px] text-stone-400 mb-3 pb-3 border-b border-white/5">{tier.idealFor}</p>
                          <div className="space-y-1.5">
                            {tier.benefits.slice(0, selectedTier === tier.name ? tier.benefits.length : 3).map((benefit, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-[#5eead4] text-xs mt-0.5">→</span>
                                <p className="font-mono text-[9px] text-stone-300 leading-relaxed">{benefit}</p>
                              </div>
                            ))}
                          </div>
                          {selectedTier === tier.name && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="font-mono text-[9px] text-stone-400 leading-relaxed">{tier.accessLevel}</p>
                              <p className="font-mono text-[10px] text-stone-500 mt-2">Annual: ${tier.annualPrice} (save ${(tier.monthlyPrice * 12 - tier.annualPrice).toFixed(0)})</p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          setShowMembershipTiers(false);
                          setSelectedTier(null);
                        }}
                        className="flex-1 py-2 text-center font-mono text-[9px] text-stone-500 uppercase tracking-widest hover:text-stone-300 transition-colors border border-white/10 rounded-sm"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={submitMembershipApplication}
                        disabled={!selectedTier || loadingTiers}
                        className="flex-1 bg-stone-100 text-[#0a1410] font-mono text-xs uppercase tracking-widest py-2 hover:bg-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                      >
                        {loadingTiers ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Details Modal */}
      {selectedConcept && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(10, 20, 16, 0.95)' }}
        >
          <div className="absolute inset-0 backdrop-blur-2xl" onClick={() => setSelectedConcept(null)} />
          
          <div className="relative z-[110] w-full max-w-4xl glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedConcept(null)}
              className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-50"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-12">
              {loadingConcept ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="w-12 h-12 text-copper-400 animate-pulse mb-4" />
                  <p className="font-mono text-sm text-stone-400 uppercase tracking-widest">Analyzing Protocol...</p>
                </div>
              ) : conceptDetails ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-copper-400 animate-pulse" />
                    <span className="font-mono text-[10px] text-copper-400 uppercase tracking-widest">Protocol Analysis</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-3xl text-stone-100 mb-4">Protocol Overview</h2>
                    <p className="font-mono text-sm text-stone-300 leading-relaxed">{conceptDetails.overview}</p>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Methodology</h3>
                    <div className="space-y-3">
                      {conceptDetails.methodology.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 glass-panel p-4 rounded-sm">
                          <span className="font-mono text-copper-400 text-sm">{String(i + 1).padStart(2, '0')}</span>
                          <p className="font-mono text-xs text-stone-300 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-sm border-l-2 border-copper-400">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-copper-400" />
                      <h3 className="font-mono text-xs text-copper-400 uppercase tracking-widest">Case Study</h3>
                    </div>
                    <p className="font-mono text-xs text-stone-300 leading-relaxed whitespace-pre-line">{conceptDetails.caseStudy}</p>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs text-bronze-400 uppercase tracking-widest mb-4">Expected Outcomes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {conceptDetails.expectedOutcomes.map((outcome, i) => (
                        <div key={i} className="flex items-start gap-2 border border-white/5 p-3 rounded-sm">
                          <span className="text-copper-400 text-sm">✓</span>
                          <p className="font-mono text-[10px] text-stone-300">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        const protocolName = selectedConcept === 'neural' ? 'Neural Mapping' :
                                            selectedConcept === 'nutrition' ? 'Bio-Nutrition' :
                                            selectedConcept === 'environmental' ? 'Environmental Base' :
                                            'Blue Zone Engineering';
                        setSelectedProtocolJourney({ name: protocolName, concept: selectedConcept });
                      }}
                      className="bg-white/5 border border-white/10 text-stone-300 font-mono text-xs uppercase tracking-widest py-3 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      View Journey
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConcept(null);
                        setIsLoginOpen(true);
                      }}
                      className="bg-stone-100 text-[#0a1410] font-mono text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors flex items-center justify-center gap-2"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Begin Protocol
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Terrain Assessment Modal */}
      {showAssessment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(10, 20, 16, 0.95)' }}>
          <div className="absolute inset-0 backdrop-blur-2xl" onClick={() => setShowAssessment(false)} />
          
          <div className="relative z-[110] w-full max-w-3xl glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAssessment(false)}
              className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-50"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-12">
              <div className="flex items-center gap-3 mb-8">
                <Microscope className="w-8 h-8 text-copper-400" />
                <div>
                  <h2 className="font-serif text-3xl text-stone-100">Terrain Assessment</h2>
                  <p className="font-mono text-xs text-stone-500 mt-1">AI-Powered Biological Analysis</p>
                </div>
              </div>
              
              <TerrainAssessment
                onComplete={(results) => {
                  setAssessmentResults(results);
                  setShowAssessment(false);
                  setTimeout(() => {
                    alert('✓ Assessment Complete! View your recommended protocols in the Member Dashboard.');
                  }, 500);
                }}
                setIsHovering={setIsHovering}
              />
            </div>
          </div>
        </div>
      )}

      {/* Protocol Journey Modal */}
      {selectedProtocolJourney && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(10, 20, 16, 0.95)' }}>
          <div className="absolute inset-0 backdrop-blur-2xl" onClick={() => setSelectedProtocolJourney(null)} />
          
          <div className="relative z-[110] w-full max-w-4xl glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProtocolJourney(null)}
              className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-50"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-12">
              <ProtocolJourney 
                protocol={selectedProtocolJourney}
                onClose={() => setSelectedProtocolJourney(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}