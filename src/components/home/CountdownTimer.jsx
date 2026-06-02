import React, { useState, useEffect } from 'react';

function getNextServiceDate(hour = 15, minute = 0) {
  const now = new Date();
  const target = new Date();
  // Trouver le prochain dimanche
  const day = now.getDay(); // 0 = dimanche
  const daysUntilSunday = day === 0 ? (now.getHours() * 60 + now.getMinutes() < hour * 60 + minute ? 0 : 7) : 7 - day;
  target.setDate(now.getDate() + daysUntilSunday);
  target.setHours(hour, minute, 0, 0);
  return target;
}

export default function CountdownTimer({ serviceTime = '15:00' }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [targetDate, setTargetDate] = useState(null);

  useEffect(() => {
    const [hour, minute] = serviceTime.split(':').map(Number);
    setTargetDate(getNextServiceDate(hour, minute));
  }, [serviceTime]);

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTargetDate(getNextServiceDate(...serviceTime.split(':').map(Number)));
        return;
      }
      setTimeLeft({
        jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
        heures: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secondes: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, serviceTime]);

  const units = [
    { label: 'Jours', value: timeLeft.jours ?? 0 },
    { label: 'Heures', value: timeLeft.heures ?? 0 },
    { label: 'Min', value: timeLeft.minutes ?? 0 },
    { label: 'Sec', value: timeLeft.secondes ?? 0 },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl md:text-4xl text-white tabular-nums leading-none">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[9px] text-white/50 uppercase tracking-widest mt-1">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-white/30 text-2xl md:text-3xl mb-3">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}