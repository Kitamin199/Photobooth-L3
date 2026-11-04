import Icon from '../Icon';

function MenuButton({ icon, label, active = false, ...props }) {
  return (
    <button type="button" className={`flex min-h-[65px] min-w-[72px] flex-col items-center justify-center gap-1 rounded-[20px] border-2 border-pink px-2 py-2 text-plum shadow-[0_4px_0_#fb71a4] transition-transform hover:-translate-y-0.5 disabled:opacity-40 ${active ? 'bg-pink-soft' : 'bg-white'}`} {...props}>
      <Icon name={icon} /><span className="whitespace-nowrap text-[11px] font-bold">{label}</span>
    </button>
  );
}

function OptionButton({ active = false, children, ...props }) {
  return <button type="button" className={`flex size-[50px] items-center justify-center rounded-full border-2 text-[15px] font-extrabold transition-colors disabled:opacity-40 ${active ? 'border-pink bg-pink-soft text-pink' : 'border-line bg-white text-plum hover:border-pink'}`} {...props}>{children}</button>;
}

export default function BoothControls({ booth, onShowResult }) {
  const busy = booth.isCapturing;
  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)] md:gap-3 lg:grid-cols-2 wide:grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)]">
      <div className="flex flex-wrap justify-center gap-2 md:justify-start lg:justify-center wide:justify-start">
        <MenuButton icon="filter" label={booth.filter.name} title="Ganti filter kamera" onClick={booth.cycleFilter} disabled={busy} />
        <MenuButton icon="sticker" label={`Sticker: ${booth.stickers ? 'ON' : 'OFF'}`} active={booth.stickers} aria-pressed={booth.stickers} title="Tampilkan stiker pada frame" onClick={booth.toggleStickers} disabled={busy} />
        <MenuButton icon="image" label="Hasil" title={booth.preview ? 'Lihat hasil photostrip' : 'Ambil foto dahulu untuk melihat hasil'} onClick={onShowResult} disabled={busy || !booth.preview} />
      </div>
      <div className="order-first flex justify-center md:order-none lg:order-first lg:col-span-2 wide:order-none wide:col-span-1">
        <button type="button" onClick={booth.capture} disabled={busy || booth.cameraStatus !== 'live'} aria-label={busy ? 'Sedang mengambil foto' : 'Ambil foto photostrip'} title="Ambil Foto Photostrip" className="flex size-[82px] items-center justify-center rounded-full border-[6px] border-white bg-pink motion-safe:animate-shutter transition-transform enabled:hover:scale-105 disabled:animate-none disabled:opacity-45">
          <span className="size-[60px] rounded-full border-2 border-dashed border-white/80" />
        </button>
      </div>
      <div className="flex justify-center gap-2 md:justify-end lg:justify-center wide:justify-end">
        <OptionButton active={booth.flash} aria-pressed={booth.flash} aria-label="Efek flash layar" title="Efek flash layar" onClick={booth.toggleFlash} disabled={busy}><Icon name="flash" /></OptionButton>
        <OptionButton aria-label={`Timer ${booth.timer} detik, klik untuk mengganti`} title="Ganti timer: 3, 5, atau 1 detik" onClick={booth.cycleTimer} disabled={busy}>{booth.timer}s</OptionButton>
        <OptionButton active={booth.mirrored} aria-pressed={booth.mirrored} aria-label="Mirror kamera" title="Mirror kamera" onClick={booth.toggleMirror} disabled={busy}><Icon name="mirror" /></OptionButton>
      </div>
    </div>
  );
}
