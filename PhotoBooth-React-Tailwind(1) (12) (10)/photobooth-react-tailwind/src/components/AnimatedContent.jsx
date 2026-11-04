import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function AnimatedContent({ children, className, stagger = 0 }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const targets = stagger ? Array.from(root.current.children) : root.current;
      gsap.fromTo(targets, { y: 22, opacity: 0.15 }, {
        y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger,
        scrollTrigger: {
          trigger: root.current, start: 'top 94%', end: 'bottom top',
          toggleActions: 'play reset play reset',
        },
      });
    });
    return () => media.revert();
  }, [stagger]);

  return <div ref={root} className={className}>{children}</div>;
}
