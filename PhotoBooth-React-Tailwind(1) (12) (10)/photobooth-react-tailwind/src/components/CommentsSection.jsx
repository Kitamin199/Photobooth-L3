import useVisibleMotion from '../hooks/useVisibleMotion';
import { useEffect, useState } from 'react';
import AnimatedContent from './AnimatedContent';

// Placeholder copy for the layout; replace with real reviews before publication.
const comments = [
  { name: 'Naya', role: 'Acara kampus', initials: 'NA', text: 'Satu frame, banyak cerita. Foto bareng teman jadi kenangan kecil yang bisa dibawa pulang.', tone: 'pink' },
  { name: 'Dimas', role: 'Konten kreator', initials: 'DI', text: 'Suka konsep strip fotonya. Bisa coba beberapa ekspresi dan pilih warna frame sesuai suasana.', tone: 'yellow' },
  { name: 'Alya', role: 'Bareng sahabat', initials: 'AL', text: 'Pose terakhir selalu paling spontan. Seru bikin satu strip bareng sahabat setelah seharian jalan.', tone: 'lavender' },
  { name: 'Raka', role: 'Komunitas', initials: 'RA', text: 'Sudut foto sederhana bisa jadi tempat paling ramai saat kumpul. Semua punya gaya masing-masing.', tone: 'lavender' },
  { name: 'Salsa', role: 'Foto santai', initials: 'SA', text: 'Frame pastel dan foto hitam putih ternyata cocok banget. Hasilnya ingin langsung disimpan.', tone: 'pink' },
  { name: 'Bima', role: 'Acara bersama', initials: 'BI', text: 'Pilih layout, atur timer, lalu siap berpose. Cara sederhana untuk mengabadikan momen bersama.', tone: 'yellow' },
];

function CommentCard({ item }) {
  return (
    <article className={`comment-card comment-card-${item.tone}`}>
      <div className="flex items-center justify-between">
        <div className="comment-rating" aria-label="Contoh rating 5 dari 5">
          <span aria-hidden="true">★★★★★</span><span className="ml-2 text-xs font-bold">5.0</span>
        </div>
        <span className="comment-quote" aria-hidden="true">“</span>
      </div>
      <blockquote className="my-5 flex-1 text-base font-medium italic leading-relaxed">“{item.text}”</blockquote>
      <div className="flex items-center gap-3">
        <span className="comment-avatar" aria-hidden="true">{item.initials}</span>
        <div><p className="font-bold">{item.name}</p><p className="mt-0.5 text-xs text-plum">{item.role}</p></div>
      </div>
    </article>
  );
}

export default function CommentsSection() {
  const motionRef = useVisibleMotion({ pauseOnScroll: true });
  const [paused, setPaused] = useState(false);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)');
    const update = () => setAnimated(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return (
    <section id="komentar" className="comments-section" aria-labelledby="comments-title">
      <AnimatedContent className="mx-auto mb-10 w-[92%] max-w-3xl text-center">
        <p className="eyebrow">Cerita di balik setiap pose</p>
        <h2 id="comments-title" className="mt-3 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-tight">
          Apa kata mereka<br />tentang CekRek!?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-plum">Dari acara kampus sampai kumpul bareng sahabat, setiap strip menyimpan cerita.</p>
        <p className="mt-3 text-xs text-plum">Contoh komentar untuk pratinjau tampilan, bukan ulasan pengguna asli.</p>
        {animated && <button type="button" className="chip mt-5" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          {paused ? 'Lanjutkan animasi' : 'Jeda animasi'}
        </button>}
      </AnimatedContent>
      <div ref={motionRef} className="comment-rows" data-static={!animated} data-paused={paused}>
        {[comments].map((row, rowIndex) => (
          <div className="comment-lane" key={rowIndex}>
            <div className={`comment-track ${rowIndex ? 'comment-track-reverse' : ''}`}>
              {(animated ? [0, 1] : [0]).map(copy => (
                <div className="comment-group" key={copy} aria-hidden={copy > 0 ? true : undefined}>
                  {row.map(item => <CommentCard key={item.name} item={item} />)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
