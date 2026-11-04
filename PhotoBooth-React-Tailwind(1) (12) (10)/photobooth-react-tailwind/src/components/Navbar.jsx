import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon';

export default function Navbar({ page }) {
  const isBooth = page === 'booth';
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = event => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const escape = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [menuOpen]);
  useLayoutEffect(() => {
    const header = headerRef.current;
    const root = document.documentElement.style;
    const measure = () => root.setProperty('--home-navbar-height', header.offsetHeight + 'px');
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(header);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      root.removeProperty('--home-navbar-height');
    };
  }, [isBooth]);
  const links = [
    { href: isBooth ? './index.html#home' : '#home', label: 'Beranda', active: !isBooth },
    { href: './booth.html', label: 'Studio Booth', active: isBooth },
    ...(!isBooth ? [
      { href: '#tentang', label: 'Tentang' },
      { href: '#frames', label: 'Galeri Frame' },
      { href: '#harga', label: 'Harga' },
    ] : []),
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b-2 border-[#f0ead6] bg-cream/95 py-4 backdrop-blur-sm">
      <nav aria-label="Navigasi utama" className="mx-auto flex w-[92%] max-w-[1300px] flex-wrap items-center justify-between gap-2 md:flex-nowrap wide:gap-5">
        <a href="./index.html" className="flex items-center gap-2 font-display text-[23px] font-bold text-pink md:text-[26px]" aria-label="PhotoBooth, ke beranda">
          <Icon name="camera" className="size-7" />
          PhotoBooth.
        </a>
        <button type="button" ref={toggle} aria-expanded={menuOpen} aria-controls="nav-links"
          onClick={() => setMenuOpen(!menuOpen)} className="ml-auto min-h-11 rounded-full border border-line bg-white px-3 text-sm font-bold md:hidden">Menu</button>
        <ul id="nav-links" data-open={menuOpen} onClick={() => setMenuOpen(false)} className="site-links order-3 flex w-full items-center justify-start gap-1.5 overflow-x-auto rounded-full border-2 border-[#f3efe0] bg-white px-3 py-2.5 shadow-[0_4px_15px_#00000008] md:justify-center md:order-none md:w-auto">
          {links.map((link) => (
            <li key={link.label} className="shrink-0">
              <a href={link.href} aria-current={link.active ? 'page' : undefined} className={`block rounded-full px-3.5 py-2 text-[12px] font-extrabold transition-colors md:px-[18px] md:text-[13px] ${link.active ? 'bg-pink text-white shadow-[0_3px_8px_#fb71a44d]' : 'text-[#666] hover:bg-pink-soft hover:text-pink'}`}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {isBooth ? <span className="hidden wide:block wide:w-24" aria-hidden="true" /> : (
          <a href="./booth.html" className="rounded-full border-2 border-ink bg-yellow px-3 py-2.5 text-xs sm:px-5 sm:text-[13px] font-extrabold shadow-[3px_3px_0_#222] transition-transform hover:-translate-y-0.5">
            Mulai Foto
          </a>
        )}
      </nav>
    </header>
  );
}
