import React from 'react';
import { Palette } from 'lucide-react';

const themes = {
  clinical: {
    name: 'Clinical',
    primary: '#ffffff',
    secondary: '#5eead4',
    background: '#f8fafc',
    text: '#1e293b',
    accent: '#0ea5e9'
  },
  elemental: {
    name: 'Elemental',
    primary: '#0a1410',
    secondary: '#5eead4',
    background: '#0a1410',
    text: '#d6d3d1',
    accent: '#d4a373'
  },
  futuristic: {
    name: 'Futuristic',
    primary: '#000000',
    secondary: '#00ffff',
    background: '#000000',
    text: '#ffffff',
    accent: '#ff00ff'
  }
};

export default function ThemeSwitcher({ currentTheme, onThemeChange, isHovering, setIsHovering }) {
  return (
    <div className="fixed top-24 right-8 z-50">
      <div className="glass-panel rounded-full p-2">
        <button
          onClick={() => {
            const themeKeys = Object.keys(themes);
            const currentIndex = themeKeys.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themeKeys.length;
            onThemeChange(themeKeys[nextIndex]);
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 group"
          title={`Theme: ${themes[currentTheme].name}`}
        >
          <Palette className="w-5 h-5 text-copper-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
        <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="glass-panel px-3 py-2 rounded-sm whitespace-nowrap">
            <span className="font-mono text-[9px] text-copper-400 uppercase tracking-widest">
              {themes[currentTheme].name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}