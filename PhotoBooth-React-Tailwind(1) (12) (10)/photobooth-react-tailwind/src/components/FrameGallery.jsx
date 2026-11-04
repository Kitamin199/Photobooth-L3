import AnimatedContent from './AnimatedContent';
import SectionMarquee from './SectionMarquee';
import { useState } from 'react';
import { LAYOUTS, THEMES } from '../lib/boothConfig';
import { frameTemplates } from '../lib/frameTemplates';

const categories = ['Semua', 'Newspaper', 'Modern', 'Cute', 'Vintage'];

function StripPreview({ layout, theme, title }) {
  const columns = layout.id === '4cut' ? 2 : 1;
  const rows = layout.shots / columns;
  const gap = 12;
  const photoWidth = (layout.width - 48 - gap * (columns - 1)) / columns;
  const photoHeight = (layout.height - 100 - gap * (rows - 1)) / rows;

  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true"
      className="pointer-events-none absolute inset-x-[10%] inset-y-[16%] h-[68%] w-[80%] drop-shadow-md">
      <rect width={layout.width} height={layout.height} fill={theme.bg} />
      <text x="50%" y="34" textAnchor="middle" fill={theme.text} fontSize="17" fontFamily="monospace">{title.toUpperCase()}</text>
      {Array.from({ length: layout.shots }, (_, i) => (
        <image key={i} href={`${import.meta.env.BASE_URL}images/Photobox${i + 1}.png`}
          x={24 + (i % columns) * (photoWidth + gap)} y={50 + Math.floor(i / columns) * (photoHeight + gap)}
          width={photoWidth} height={photoHeight} preserveAspectRatio="xMidYMid slice" />
      ))}
    </svg>
  );
}

function FrameCard({ frame, layout }) {
  const theme = THEMES.find(item => item.id === frame.theme);
  return (
    <figure className="flex flex-col rounded-2xl border border-line bg-white p-3 shadow-sm">
      <div className={`relative grid aspect-[3/4] place-items-center rounded-xl ${frame.backdrop}`}>
        <small className="absolute top-3 left-3 rounded-full bg-white/85 px-2 py-1 font-semibold text-plum">{frame.category}</small>
        <StripPreview layout={layout} theme={theme} title={frame.name} />
        <small className="absolute bottom-2 font-mono text-plum">{layout.shots} pose · {layout.name}</small>
      </div>
      <figcaption className="mt-3 grow text-sm font-bold">{frame.name}</figcaption>
      <a href={`./booth.html?frame=${frame.id}&layout=${layout.id}`} aria-label={`Gunakan frame ${frame.name}`} className="mt-3 rounded-xl border border-line py-2 text-center text-xs font-bold hover:bg-pink-soft">Gunakan Frame</a>
    </figure>
  );
}

export default function FrameGallery() {
  const [layout, setLayout] = useState(null);
  const [filter, setFilter] = useState('Semua');
  const visible = frameTemplates.filter(frame => filter === 'Semua' || frame.category === filter);
  return (
    <section id="frames" className="gallery-section">
      <div className="mx-auto w-[92%] max-w-5xl">
      <AnimatedContent>
      <p className="eyebrow">Koleksi / 01–03</p>
      <h2 className="section-title">Galeri frame</h2>
      <p className="mt-2 text-sm text-plum">Pilih layout untuk melihat template yang tersedia.</p>
      </AnimatedContent>
      <div className="my-5 flex flex-wrap gap-2" role="group" aria-label="Pilihan layout">
        <button className="chip" aria-pressed={!layout} onClick={() => setLayout(null)}>Semua</button>
        {LAYOUTS.map(item => <button key={item.id} className="chip" aria-pressed={layout?.id === item.id} onClick={() => setLayout(item)}>{item.name}</button>)}
      </div>
      <AnimatedContent stagger={0.08} className="grid gap-5 sm:grid-cols-3">
        {LAYOUTS.map((item, index) => (
          <button key={item.id} aria-label={`Pilih layout ${item.name}`} aria-pressed={layout?.id === item.id}
            onClick={() => setLayout(item)} className="overflow-hidden rounded-2xl border border-line bg-white text-left aria-pressed:ring-2 aria-pressed:ring-plum">
            <div className={`relative h-56 overflow-hidden [&>svg]:-rotate-3 ${['bg-pink/30', 'bg-yellow/45', 'bg-lavender/35'][index]}`}>
              <StripPreview layout={item} theme={THEMES[0]} title="PhotoBooth Studio" />
            </div>
            <div className="p-4"><b>{item.name}</b><p className="text-sm text-plum">{item.description}</p></div>
          </button>
        ))}
      </AnimatedContent>
      {layout && <section aria-label="Template frame" className="mt-12 md:mt-20">
      <AnimatedContent className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">{layout.name} / 08 template</p><h3 className="section-title">Template frame</h3><p className="mt-2 text-sm text-plum">Pilih template favoritmu untuk memulai sesi foto.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori frame">
          {categories.map(category => <button key={category} className="chip" aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}
        </div>
      </AnimatedContent>
      <AnimatedContent key={layout.id + filter} stagger={0.06} className="mt-8 grid gap-3 min-[400px]:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {visible.map(frame => <FrameCard key={frame.id} frame={frame} layout={layout} />)}
      </AnimatedContent>
      </section>}
      </div>
      <div className="mt-8"><SectionMarquee label="Galeri Frame" /></div>
    </section>
  );
}
