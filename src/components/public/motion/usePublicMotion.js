import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// One owner for public motion; media queries revert every tween and listener.
export default function usePublicMotion(revision) {
  const root = useRef(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element);
      const lines = select('.ejp-title-line > span');
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (lines.length) entrance.from(lines, { yPercent: 115, rotation: 3, duration: 1.25, stagger: .16 }, .12);
      entrance.from(select('.ejp-hero .ejp-eyebrow'), { opacity: 0, y: 20, duration: .8 }, 0)
        .from(select('.ejp-hero-bottom > *'), { opacity: 0, y: 35, duration: 1, stagger: .16 }, .7)
        .from(select('.ejp-hero-caption'), { opacity: 0, duration: 1 }, 1.15);
      const hero = select('.ejp-hero')[0];
      if (hero) {
        gsap.fromTo(select('.ejp-hero-visual'), { scale: 1.12 }, { scale: 1, duration: 3.5, ease: 'power2.out' });
        gsap.to(select('.ejp-hero-visual'), { yPercent: 20, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.to(select('.ejp-hero-content'), { y: -80, opacity: .25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
      }
      select('.ejp-photo-frame').forEach(frame => {
        const image = frame.querySelector('.ejp-photo-depth');
        if (image) gsap.fromTo(image, { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.05, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.fromTo(frame, { clipPath: 'inset(9% 5% 9% 5% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: frame, start: 'top 90%', end: 'top 25%', scrub: .8 } });
      });
      select('[data-motion-reveal]').forEach(node => gsap.from(node, { opacity: 0, y: 45, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: node, start: 'top 90%', toggleActions: 'play none none none' } }));
      const ribbon = select('.ejp-scroll-ribbon-track');
      if (ribbon.length) gsap.fromTo(ribbon, { xPercent: -12 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: ribbon[0].parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      const progress = select('.ejp-scroll-progress');
      if (progress.length) gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: element, start: 'top top', end: 'bottom bottom', scrub: true } });
      const refresh = () => ScrollTrigger.refresh();
      element.querySelectorAll('img').forEach(image => image.addEventListener('load', refresh));
      document.fonts?.ready.then(() => { if (element.isConnected) refresh(); });
      refresh();
      return () => element.querySelectorAll('img').forEach(image => image.removeEventListener('load', refresh));
    }, element);
    mm.add('(min-width: 901px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
      const cleanups = [];
      element.querySelectorAll('[data-tilt]').forEach(card => {
        const x = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3.out' });
        const y = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3.out' });
        const move = event => {
          const rect = card.getBoundingClientRect();
          x(-(event.clientY - rect.top - rect.height / 2) / rect.height * 7);
          y((event.clientX - rect.left - rect.width / 2) / rect.width * 7);
        };
        const leave = () => { x(0); y(0); };
        gsap.set(card, { transformPerspective: 1000 });
        card.addEventListener('pointermove', move); card.addEventListener('pointerleave', leave);
        cleanups.push(() => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); });
      });
      return () => cleanups.forEach(cleanup => cleanup());
    }, element);
    return () => mm.revert();
  }, [revision]);
  return root;
}
