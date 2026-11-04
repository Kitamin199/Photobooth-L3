import usePhotobooth from '../hooks/usePhotobooth';
import { LAYOUTS } from '../lib/boothConfig';
import CameraPreview from './booth/CameraPreview';

export default function StudioDemo() {
  const booth = usePhotobooth();
  const live = booth.cameraStatus === 'live';
  return (
    <div role="group" id="demo" className="studio-window" aria-labelledby="demo-title">
      <header className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-xs">
        <b id="demo-title">PHOTOBOOTH / LIVE STUDIO</b><small>SESSION 01</small>
      </header>
      <div className="grid gap-5 p-4 md:grid-cols-[1.7fr_1fr] md:p-6">
        <CameraPreview booth={booth} poster={`${import.meta.env.BASE_URL}images/Photobox1.png`} />
        <div className="flex flex-col items-start justify-center gap-3">
          <p className="eyebrow">Pengaturan sesi</p>
          <h3 className="font-display text-2xl">Pilih gaya strip</h3>
          <fieldset disabled={booth.isCapturing} className="flex flex-wrap gap-2">
            <legend className="sr-only">Layout foto</legend>
            {LAYOUTS.map(layout => (
              <button key={layout.id} type="button" aria-pressed={booth.layoutId === layout.id} onClick={() => booth.setLayoutId(layout.id)} className="chip">{layout.name}</button>
            ))}
          </fieldset>
          <p className="text-sm text-plum">Timer 3 detik untuk setiap pose.</p>
          <button className="action" disabled={!live || booth.isCapturing} onClick={booth.capture}>{booth.isCapturing ? 'Sesi berlangsung…' : 'Ambil foto'}</button>
          {booth.cameraStatus !== 'idle' && <button className="text-sm underline" onClick={booth.stopCamera}>Matikan kamera</button>}
          {booth.error && <p role="alert" className="text-sm text-plum">{booth.error}</p>}
        </div>
      </div>
      {booth.preview && <figure className="flex flex-col items-center gap-4 border-t border-line p-5">
        <img src={booth.preview.src} alt="Hasil sesi foto" className="max-h-80 rounded-lg shadow" />
        <a className="action" href={booth.preview.src} download={booth.preview.filename}>Unduh PNG</a>
      </figure>}
    </div>
  );
}
