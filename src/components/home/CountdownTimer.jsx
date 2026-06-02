import React, { useState, useEffect } from 'react';

function getNextServiceDate(serviceTime = '15:00') {
  const [hour, minute] = serviceTime.split(':').map(Number);
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = dimanche

  let daysUntilSunday = (7 - dayOfWeek) % 7;

  // Si aujourd'hui est dimanche, vérifier si le culte est passé
  if (dayOfWeek === 0) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = hour * 60 + minute;
    if (nowMinutes >= targetMinutes) daysUntilSunday = 7;
  }

  const target = new Date(now);
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
      if (diff <= 0) return;
      setTimeLeft({
        jours: Math.floor(diff / 86400000),
        heures: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        secondes: Math.floor((diff % 60000) / 1000),
      });
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [serviceTime]);

  const units = [
    { label: 'Jours', value: timeLeft.jours },
    { label: 'Heures', value: timeLeft.heures },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.secondes },
  ];

  return (
    <div className="flex items-end justify-center gap-6 md:gap-10">
      {units.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <span className="font-display text-5xl md:text-7xl text-[#F7F4EF] tabular-nums leading-none font-light">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[9px] text-[#B8B8B8]/40 uppercase tracking-[0.3em] mt-3 font-light">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-[#C8A96A]/30 text-4xl md:text-5xl pb-8 font-light select-none">·</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}