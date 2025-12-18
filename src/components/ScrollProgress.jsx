import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const sectionElements = [
      { id: 'hero', label: 'Hero' },
      { id: 'terrain', label: 'Terrain' },
      { id: 'bluezone', label: 'Blue Zones' },
      { id: 'elements', label: 'Elements' }
    ];
    setSections(sectionElements);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sectionElements.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-copper-400 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Section Indicators */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => {
              const element = document.getElementById(section.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group relative"
          >
            <motion.div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSection === index
                  ? 'bg-copper-400 w-8'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              whileHover={{ scale: 1.2 }}
            />
            
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div className="glass-panel px-3 py-1 rounded-sm">
                <span className="font-mono text-[9px] text-copper-400 uppercase tracking-widest">
                  {section.label}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}