import { useLayoutEffect, useRef } from 'react';

export default function PageShutter({ page }) {
  const overlay = useRef(null);
  useLayoutEffect(() => {
    const layer = overlay.current;
    const [top, bottom] = layer.children;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const destination = new URL(page === 'home' ? './booth.html' : './index.html', location.href);
    let closing = false;
    let animations = [];

    function reset() {
      animations.forEach(animation => animation.cancel());
      animations = [];
      closing = false;
      layer.hidden = true;
    }

    function run(opening) {
      layer.hidden = false;
      animations = [top, bottom].map((panel, i) => {
        const outside = 'translateY(' + (i ? '101%' : '-101%') + ')';
        const frames = [ { transform: outside }, { transform: 'translateY(0)' } ];
        return panel.animate(opening ? frames.reverse() : frames, {
          duration: 210, easing: 'cubic-bezier(.45,0,.3,1)', fill: 'both',
        });
      });
      return Promise.all(animations.map(animation => animation.finished));
    }

    function navigate(event) {
      const link = event.target.closest?.('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
          event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href);
      if (url.origin !== destination.origin || url.pathname !== destination.pathname || motion.matches || !top.animate) return;
      event.preventDefault();
      if (closing) return;
      reset();
      closing = true;
      run(false).then(() => location.assign(url.href), () => {});
    }

    const previous = document.referrer && new URL(document.referrer);
    const fromOtherPage = previous && previous.origin === location.origin &&
      (previous.pathname === destination.pathname || (page === 'booth' && previous.pathname === new URL('./', destination).pathname));
    if (fromOtherPage && !motion.matches && top.animate &&
        performance.getEntriesByType('navigation')[0]?.type !== 'reload') {
      run(true).then(reset, () => {});
    }
    document.addEventListener('click', navigate);
    window.addEventListener('pagehide', reset);
    return () => {
      document.removeEventListener('click', navigate);
      window.removeEventListener('pagehide', reset);
      reset();
    };
  }, [page]);
  return <div ref={overlay} hidden aria-hidden="true" className="page-shutter"><i /><i /></div>;
}
