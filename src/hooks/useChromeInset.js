import { useLayoutEffect } from 'react';

// Fixed navigation must reserve its actual rendered size, including safe areas.
export default function useChromeInset(ref, property) {
  useLayoutEffect(() => {
    const element = ref.current;
    const root = element?.closest('.serviteur-app, .ejp-public');
    if (!element || !root) return;
    const measure = () => root.style.setProperty(property, `${Math.ceil(element.getBoundingClientRect().height)}px`);
    const viewport = () => root.style.setProperty('--app-viewport-height', `${window.visualViewport?.height || window.innerHeight}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure(); viewport();
    window.visualViewport?.addEventListener('resize', viewport);
    window.addEventListener('resize', viewport);
    return () => {
      observer.disconnect(); root.style.removeProperty(property);
      window.visualViewport?.removeEventListener('resize', viewport);
      window.removeEventListener('resize', viewport);
    };
  }, [ref, property]);
}
