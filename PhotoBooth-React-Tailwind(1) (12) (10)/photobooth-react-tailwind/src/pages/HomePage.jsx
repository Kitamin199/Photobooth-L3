import AnimatedContent from '../components/AnimatedContent';
import ScrollExpand from '../components/ScrollExpand';
import SmoothScroll from '../components/SmoothScroll';
import { useEffect, useRef } from 'react';
import GridMotion from '../components/GridMotion';
import StudioDemo from '../components/StudioDemo';
import FrameGallery from '../components/FrameGallery';

const heroStrips = [1, 2, 3].map(number => `${import.meta.env.BASE_URL}images/hero/strip-${number}.webp`);

function HeroRibbon({ edge }) {
  return (
    <div className={`hero-ribbon hero-ribbon-${edge}`} aria-hidden="true">
      <GridMotion items={heroStrips} rows={1} aspectRatio={2.7} angle={0} tilt={0}
        direction={edge === 'top' ? 'left' : 'right'} speed={18} gap={28} radius={0}
        dim={0} grayscale={false} parallax={0} spotlight={0} fade={0}
        theme="light" tileColor="transparent" />
    </div>
  );
}

const occasions = [
  ['Acara kampus', 'kampus', 'Dua peserta berpose dalam bingkai Winter Camp 2026', 'Ajak tiap kelompok berpose di sela kegiatan, lalu simpan strip untuk dokumentasi.'],
  ['Konten kreator', 'kreator', 'Studio foto berlatar koran dengan kursi dan lampu', 'Rangkai beberapa ekspresi dalam satu strip untuk dibagikan.'],
  ['Komunitas', 'komunitas', 'Sekelompok peserta berfoto bersama sambil memegang papan tulisan', 'Siapkan satu sudut foto untuk mengabadikan pertemuan anggota.'],
  ['Bareng sahabat', 'sahabat', 'Dua sahabat berpose dalam bingkai kuning COMTALK', 'Pilih frame favorit dan sisakan pose terakhir untuk gaya paling spontan.'],
];

export default function HomePage() {
  const studioRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const studio = studioRef.current;
    const hero = heroRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    function update() {
      frame = 0;
      if (motion.matches) {
        hero.style.removeProperty('--hero-shift');
        hero.style.removeProperty('--hero-blur');
        return;
      }
      const stickyTop = parseFloat(getComputedStyle(hero).top) || 0;
      const distance = Math.max(1, window.innerHeight - stickyTop);
      const progress = Math.min(1, Math.max(0, (window.innerHeight - studio.getBoundingClientRect().top) / distance));
      const eased = progress * progress * (3 - 2 * progress);
      hero.style.setProperty('--hero-shift', `${-Math.min(80, window.innerHeight * 0.1) * eased}px`);
      hero.style.setProperty('--hero-blur', `${8 * eased}px`);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener?.('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener?.('change', schedule);
    };
  }, []);

  return (
    <main id="main-content" className="landing-page">
      <SmoothScroll />
      <div className="hero-stack">
        <section ref={heroRef} id="home" className="hero-intro">
          <HeroRibbon edge="top" />
          <HeroRibbon edge="bottom" />
          <p className="eyebrow">PhotoBooth Studio • Edisi digital</p>
          <h1>Photobooth online,<br /><em>langsung dari kamera.</em></h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-plum">Dua pose atau empat, sendiri atau bareng teman. Pilih frame, hadap kamera, lalu bawa pulang strip fotomu.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><a className="action" href="#demo">Coba kamera</a><a className="action secondary" href="#frames">Jelajahi frame</a></div>
        </section>
        <section ref={studioRef} id="tentang" className="landing-section" aria-labelledby="tentang-title">
          <p className="eyebrow">Tentang studio</p>
          <h2 id="tentang-title" className="section-title">Coba studio PhotoBooth</h2>
          <p className="mt-2 mb-6 text-sm text-plum">Pilih layout dan coba kamera langsung di sini.</p>
          <StudioDemo />
          <AnimatedContent><h3 className="mt-8 font-display text-2xl font-bold">Untuk siapa PhotoBooth?</h3></AnimatedContent>
          <AnimatedContent stagger={0.08} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map(([title, photo, alt, body], i) => <article key={title} className="border-t-2 border-plum/30 pt-4">
              <img src={`${import.meta.env.BASE_URL}images/audience/${photo}.webp`} alt={alt} width="552" height="552" loading="lazy" className="mb-4 aspect-square w-full rounded-xl object-cover" />
              <small className="font-mono text-plum">0{i + 1}</small><h4 className="my-2 font-display text-xl">{title}</h4><p className="text-sm leading-relaxed">{body}</p>
            </article>)}
          </AnimatedContent>
        </section>
      </div>
      <FrameGallery />
      <ScrollExpand title="Studio lengkap" src={`${import.meta.env.BASE_URL}images/studio-lengkap.png`}>
        <p className="eyebrow">Studio lengkap</p><h2 className="section-title">Atur sesi sesuai gayamu.</h2>
        <p className="my-4 max-w-xl">Buka studio untuk mengganti warna frame, mencoba filter Y2K dan mengatur timer 1, 3, atau 5 detik.</p><a className="action" href="./booth.html">Buka studio lengkap</a>
      </ScrollExpand>
      <section id="harga" className="landing-section flex flex-wrap items-center justify-between gap-5 border-y border-line py-8">
        <div><p className="eyebrow">Harga sesi</p><h2 className="section-title">Foto gratis di browser.</h2></div>
        <p className="max-w-sm text-sm leading-relaxed">Pilih layout, ambil foto, dan unduh hasil PNG langsung ke perangkatmu.</p>
      </section>
      <footer className="mx-auto flex w-[92%] max-w-5xl justify-between py-8 text-sm"><b>PhotoBooth Studio</b><a href="#home" className="underline">Kembali ke atas</a></footer>
    </main>
  );
}
