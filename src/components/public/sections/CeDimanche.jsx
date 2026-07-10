import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Navigation, Clock } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

function getNextSunday() {
  const now = new Date();
  const sunday = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  sunday.setDate(now.getDate() + diff);
  sunday.setHours(15, 0, 0, 0);
  if (sunday <= now) sunday.setDate(sunday.getDate() + 7);
  return sunday;
}

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);
  return timeLeft;
}

export default function CeDimanche({ config }) {
  const [nextSunday] = useState(getNextSunday);
  const { days, hours, minutes, seconds } = useCountdown(nextSunday);
  const address = config?.address_label || 'Nantes, France';
  const mapsUrl = config?.maps_link || 'https://maps.google.com/?q=Nantes';
  const serviceTime = config?.service_time || '15:00';

  const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(
    `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${window.location.href}\nDTSTART:${nextSunday.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${new Date(nextSunday.getTime() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:Culte EJP Nantes\nLOCATION:${address}\nEND:VEVENT\nEND:VCALENDAR`
  )}`;

  return (
    <section id="ce-dimanche" className="py-20 md:py-28 px-5 md:px-8 bg-[#FBFAF7]">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <div className="bg-white rounded-[28px] border border-[#E8E2D5] shadow-[0_24px_70px_rgba(16,24,39,0.08)] overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left: info */}
              <div className="p-8 md:p-10">
                <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Ce dimanche</span>
                <h2 className="font-display text-3xl md:text-4xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
                  Culte à {serviceTime.replace(':', 'h')}
                </h2>
                <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
                  Un temps pour chercher Dieu, être édifié, et marcher avec une jeunesse qui désire porter du fruit.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                    <MapPin className="w-4 h-4 text-[#D8B76A] flex-shrink-0" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                    <Clock className="w-4 h-4 text-[#D8B76A] flex-shrink-0" />
                    <span>Tous les dimanches à {serviceTime.replace(':', 'h')}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/venir" className="flex items-center gap-1.5 bg-[#101827] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#1a2740] transition-colors">
                    Préparer ma venue
                  </Link>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#F5F0E8] text-[#101827] text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#EDE6D8] transition-colors">
                    <Navigation className="w-3.5 h-3.5" /> Google Maps
                  </a>
                  <a href={icsUrl} download="culte-ejp-nantes.ics" className="flex items-center gap-1.5 bg-[#F5F0E8] text-[#101827] text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#EDE6D8] transition-colors">
                    <Calendar className="w-3.5 h-3.5" /> Calendrier
                  </a>
                </div>
              </div>

              {/* Right: countdown */}
              <div className="bg-gradient-to-br from-[#101827] to-[#1a2740] p-8 md:p-10 flex flex-col items-center justify-center text-white">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] mb-6 font-semibold">Compte à rebours</p>
                <div className="grid grid-cols-4 gap-3 md:gap-4 w-full max-w-xs">
                  {[
                    { label: 'Jours', value: days },
                    { label: 'Heures', value: hours },
                    { label: 'Min', value: minutes },
                    { label: 'Sec', value: seconds },
                  ].map((unit) => (
                    <div key={unit.label} className="text-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl py-3 px-1 border border-white/10">
                        <span className="font-display text-2xl md:text-3xl font-medium tabular-nums">
                          {String(unit.value).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-1.5 uppercase tracking-wider">{unit.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/40 mt-6 text-center">Prochain culte : {nextSunday.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}