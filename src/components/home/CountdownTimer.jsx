import React, { useState, useEffect } from 'react';

function getNextServiceDate(serviceTime = '15:00') {
  const [hour, minute] = serviceTime.split(':').map(Number);
  const now = new Date();
  const target = new Date();

  // Trouver le prochain dimanche
  const dayOfWeek = now.getDay(); // 0 = dimanche
  let daysUntilSunday = (7 - dayOfWeek) % 7;

  // Si on est dimanche, vérifier si le culte est déjà passé
  if (dayOfWeek === 0) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = hour * 60 + minute;
    if (nowMinutes >= targetMinutes) {
      // Culte déjà passé aujourd'hui → prochain dimanche dans 7 jours
      daysUntilSunday = 7;
    }
    // Sinon daysUntilSunday reste 0 (c'est aujourd'hui)
  }

  target.setDate(now.getDate() + daysUntilSunday);
  target.setHours(hour, minute, 0, 0);
  return target;
}

export default function CountdownTimer({ serviceTime = '15:00' }) {
  const [timeLeft, setTimeLeft] = useState({ jours: 0, heures: 0, minutes: 0, secondes: 0 });

  useEffect(() => {
    const compute = () => {
      const target = getNextServiceDate(serviceTime);
      const diff = target - new Date();
      if (diff <= 0) {
        // Recompute immédiatement si expiré
        return;
      }
      setTimeLeft({
        jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
        heures: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secondes: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [serviceTime]);

  const units = [
    { label: 'Jours', value: timeLeft.jours },
    { label: 'Heures', value: timeLeft.heures },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.secondes },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center min-w-[2.5rem]">
            <span className="font-bold text-2xl md:text-4xl text-white tabular-nums leading-none">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[9px] text-white/50 uppercase tracking-widest mt-1">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-white/30 text-2xl md:text-3xl mb-4 select-none">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}