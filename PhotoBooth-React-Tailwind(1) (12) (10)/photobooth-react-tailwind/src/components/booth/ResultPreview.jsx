import Icon from '../Icon';

export default function ResultPreview({ preview, resultRef, onRetake, busy }) {
  if (!preview) return null;
  return (
    <section ref={resultRef} id="hasil" aria-labelledby="result-title" className="mx-auto mt-5 mb-[60px] w-fit max-w-[92%] rounded-[30px] border-[3px] border-[#fce4ec] bg-white px-5 py-[30px] text-center shadow-[0_15px_40px_#0000000d] md:px-10">
      <h2 id="result-title" className="mb-2 font-display text-2xl font-bold text-pink">Hasil Photostrip Kamu</h2>
      <p className="mb-5 text-[13px] leading-relaxed text-[#777]">Tips: Kamu masih bisa mengganti <b>Warna Frame</b>, <b>Layout</b>, atau <b>Sticker</b> di atas.</p>
      <img src={preview.src} width={preview.width} height={preview.height} alt="Hasil photostrip kamu" className="mx-auto mb-6 h-auto w-full max-w-[360px] rounded-[20px] border-4 border-cream shadow-[0_8px_20px_#0000001a]" />
      <div className="flex flex-col justify-center gap-3.5 sm:flex-row sm:flex-wrap">
        <a href={preview.src} download={preview.filename} className="inline-flex items-center justify-center gap-2 rounded-full bg-pink px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_6px_15px_#fb71a44d] transition-transform hover:-translate-y-0.5"><Icon name="download" className="size-5" />Simpan Ke Galeri</a>
        <button type="button" onClick={onRetake} disabled={busy} className="rounded-full border-2 border-line bg-white px-[26px] py-3.5 text-sm font-extrabold transition-colors hover:border-pink hover:bg-pink-soft disabled:opacity-40">Foto Ulang</button>
      </div>
    </section>
  );
}
