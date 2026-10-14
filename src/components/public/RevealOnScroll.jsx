import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export default function RevealOnScroll({ children, delay = 0, y = 40, className = '' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(ref.current, { opacity: 0, y, duration: 1, delay: delay / 1000, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 92%', toggleActions: 'play none none none' } });
    });
    return () => mm.revert();
  }, [delay, y]);
  return <div ref={ref} className={className}>{children}</div>;
}
