import { useEffect, useRef } from 'react';

// Pause decorative CSS loops outside the viewport and in background tabs.
export default function useVisibleMotion({ pauseOnScroll = false } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let visible = true;
    let scrolling = false;
    let timer;
    const update = () => node.style.setProperty('--loop-state', visible && !scrolling && !document.hidden ? 'running' : 'paused');
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); })
      : null;
    const onScroll = () => {
      if (!visible) return;
      if (!scrolling) { scrolling = true; update(); }
      clearTimeout(timer);
      timer = setTimeout(() => { scrolling = false; update(); }, 180);
    };
    if (pauseOnScroll) window.addEventListener('scroll', onScroll, { passive: true });
    observer?.observe(node);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [pauseOnScroll]);
  return ref;
}
