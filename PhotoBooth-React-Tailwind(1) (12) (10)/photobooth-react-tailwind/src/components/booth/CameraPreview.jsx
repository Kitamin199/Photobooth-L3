import Icon from '../Icon';

const corners = ['top-5 left-5 border-t-[3px] border-l-[3px]', 'top-5 right-5 border-t-[3px] border-r-[3px]', 'bottom-5 left-5 border-b-[3px] border-l-[3px]', 'bottom-5 right-5 border-b-[3px] border-r-[3px]'];

export default function CameraPreview({ booth, poster }) {
  const connecting = booth.cameraStatus === 'connecting';
  return (
    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-[#d3cecd] shadow-[0_15px_35px_#0000000f] md:aspect-video md:rounded-[32px]" aria-label="Pratinjau kamera">
      <video poster={booth.cameraStatus === "idle" ? poster : undefined} ref={booth.videoRef} autoPlay playsInline muted className="absolute inset-0 size-full object-cover" style={{ filter: booth.filter.css, transform: booth.mirrored ? 'scaleX(-1)' : 'none' }} aria-label="Video kamera" />
      <span role="status" className="absolute top-4 left-4 z-10 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-extrabold tracking-wider text-white md:top-5 md:left-5">
        {booth.cameraStatus === 'live' ? 'LIVE' : connecting ? 'MENGHUBUNGKAN' : 'STANDBY'}
      </span>
      {booth.shot && <span role="status" className="absolute top-4 right-4 z-10 rounded-full bg-pink px-3 py-1.5 text-xs font-extrabold text-white md:top-5 md:right-5">Pose {booth.shot.current} / {booth.shot.total}</span>}
      {corners.map((position) => <span key={position} className={`pointer-events-none absolute z-10 size-[25px] border-white/70 ${position}`} aria-hidden="true" />)}
      {booth.countdown !== null && <div role="timer" aria-live="polite" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center font-display text-[110px] font-bold text-white [text-shadow:0_5px_18px_#fb71a4]">{booth.countdown}</div>}
      <div className={`pointer-events-none absolute inset-0 z-30 bg-white transition-opacity duration-300 ${booth.isFlashing ? 'opacity-100 duration-0' : 'opacity-0'}`} aria-hidden="true" />
      {booth.cameraStatus !== 'live' && (
        <button type="button" onClick={booth.startCamera} disabled={connecting} className="relative z-10 flex items-center gap-2 rounded-full border-[3px] border-white bg-pink px-6 py-4 text-sm font-extrabold text-white shadow-[0_8px_20px_#fb71a466] transition-transform hover:scale-105 disabled:opacity-70 md:px-9 md:py-[18px] md:text-[17px]">
          <Icon name="camera" />{connecting ? 'Meminta izin kamera…' : 'Nyalakan Kamera'}
        </button>
      )}
    </div>
  );
}
