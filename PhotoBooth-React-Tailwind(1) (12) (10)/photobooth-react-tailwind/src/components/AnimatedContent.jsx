import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let refreshFrame = 0;
function scheduleRefresh() {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh();
  });
}

export default function AnimatedContent({ children, className, stagger = 0 }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const targets = stagger ? Array.from(element.children) : [element];
      const animations = targets.map((target, index) => {
        // Each card has its own visibility range, including stacked mobile grids.
        // Reversing the same timeline preserves progress during rapid direction changes.
        const animation = gsap.fromTo(target, { y: 24, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.inOut',
          paused: true,
        });
        const trigger = ScrollTrigger.create({
          trigger: target,
          start: 'top 94%',
          end: 'bottom 6%',
          animation,
          toggleActions: 'play reverse play reverse',
          invalidateOnRefresh: true,
          onEnter: () => animation.timeScale(1).delay(Math.min(index * stagger, 0.24)),
          onEnterBack: () => animation.timeScale(1).delay(0),
          onLeave: () => animation.delay(0).timeScale(1.25),
          onLeaveBack: () => animation.delay(0).timeScale(1.25),
        });

        // Keyboard focus must remain visible even near the viewport boundaries.
        const onFocus = () => animation.delay(0).progress(1).pause();
        target.addEventListener('focusin', onFocus);
        return { target, animation, trigger, onFocus };
      });

      // Gallery filters can change the height of content below this component.
      scheduleRefresh();
      return () => {
        animations.forEach(({ target, animation, trigger, onFocus }) => {
          target.removeEventListener('focusin', onFocus);
          trigger.kill();
          animation.revert();
        });
      };
    });
    return () => media.revert();
  }, [stagger]);

  return <div ref={root} className={className}>{children}</div>;
}
