import SectionMarquee from './SectionMarquee';
import { useEffect, useRef } from 'react';

function smoothstep(start, end, value) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export default function ScrollExpand({ children, title, src }) {
  const track = useRef(null);
  const stage = useRef(null);
  const overlay = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 450px)');
    let raf = 0;
    let current = 0;
    let target = 0;
    let previous = 0;

    function paint() {
      const eased = smoothstep(0, 1, current);
      const reveal = smoothstep(0.68, 1, current);
      const style = stage.current.style;
      style.setProperty('--inset-x', `${29 * (1 - eased)}%`);
      style.setProperty('--inset-y', `${21 * (1 - eased)}%`);
      style.setProperty('--radius', `${24 * (1 - eased)}px`);
      style.setProperty('--zoom', 1.04 + 0.31 * (1 - eased));
      style.setProperty('--title-fade', smoothstep(0.4, 0.88, current));
      style.setProperty('--reveal', reveal);
      overlay.current.inert = reveal < 0.05;
    }

    function tick(now) {
      const elapsed = Math.min(64, now - previous);
      previous = now;
      current += (target - current) * (1 - Math.exp(-elapsed / 100));
      if (Math.abs(target - current) < 0.0004) current = target;
      paint();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    }

    function measure(immediate) {
      const height = stage.current.offsetHeight || 1;
      const top = parseFloat(getComputedStyle(stage.current).top) || 0;
      target = motion.matches ? 1 : Math.max(0, Math.min(1, (top - track.current.getBoundingClientRect().top) / (1.2 * height)));
      if (immediate || motion.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
        current = target;
        paint();
      } else if (!raf && current !== target) {
        previous = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    const resize = () => measure(true);
    const scroll = () => measure(false);
    resize();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    motion.addEventListener?.('change', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      motion.removeEventListener?.('change', resize);
    };
  }, []);

  return (
    <section id="studio" className="studio-expand" aria-label={title}>
      <SectionMarquee label="Studio Lengkap" reverse />
      <div ref={track} className="expand-track">
      <div ref={stage} className="expand-stage">
        <div className="expand-frame">
          <img src={src} alt="" loading="lazy" className="expand-photo" />
          <div className="expand-content" ref={overlay}>{children}</div>
        </div>
        <p className="expand-title" aria-hidden="true">{title}</p>
      </div>
      </div>
    </section>
  );
}
