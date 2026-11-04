import { useEffect, useRef } from 'react';
import CameraPreview from '../components/booth/CameraPreview';
import BoothControls from '../components/booth/BoothControls';
import FrameSelector from '../components/booth/FrameSelector';
import ResultPreview from '../components/booth/ResultPreview';
import usePhotobooth from '../hooks/usePhotobooth';

import { LAYOUTS } from '../lib/boothConfig';
import { frameTemplates } from '../lib/frameTemplates';

function scrollTo(element) {
  element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

export default function BoothPage() {
  const params = new URLSearchParams(window.location.search);
  const frameId = params.get('frame');
  const template = frameTemplates.find(frame => frame.id === frameId);
  const booth = usePhotobooth(template, LAYOUTS.find(item => item.id === params.get('layout'))?.id);
  const cameraRef = useRef(null);
  const resultRef = useRef(null);
  const lastScrolledCapture = useRef(null);

  useEffect(() => {
    if (booth.preview && booth.preview.capturedAt !== lastScrolledCapture.current) {
      lastScrolledCapture.current = booth.preview.capturedAt;
      scrollTo(resultRef.current);
    }
  }, [booth.preview]);

  function retake() {
    scrollTo(cameraRef.current);
    booth.capture();
  }

  return (
    <main id="main-content">
      <section className="relative isolate flex min-h-[calc(100vh-88px)] flex-col items-center overflow-x-clip px-4 pt-6 pb-10 md:px-10" aria-label="Studio photobooth">
        <div aria-hidden="true" className="pointer-events-none absolute top-[100px] bottom-[80px] left-0 -z-10 hidden w-[55px] rounded-r-[40px] bg-linear-to-b from-yellow via-pink to-lavender opacity-85 lg:block" />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 -z-10 hidden h-[140px] w-40 rounded-tl-[90px] bg-yellow/65 lg:block" />
        <h1 className="mb-6 rounded-full border-2 border-[#fce4ec] bg-white px-4 py-2 text-center text-[10px] font-extrabold tracking-[1.5px] text-pink md:px-6 md:text-xs md:tracking-[2px]">{template?.name || 'NO. 1 VIRTUAL PHOTOBOOTH STUDIO'}</h1>
        <div className="grid w-full max-w-[1280px] items-start gap-[25px] lg:grid-cols-[minmax(0,1fr)_290px] wide:grid-cols-[minmax(0,1fr)_330px]">
          <div ref={cameraRef} className="flex min-w-0 flex-col gap-5">
            <CameraPreview booth={booth} />
            <BoothControls booth={booth} onShowResult={() => scrollTo(resultRef.current)} />
            {booth.error && <p role="alert" className="rounded-2xl border border-pink/40 bg-pink-soft px-4 py-3 text-center text-sm leading-relaxed text-plum">{booth.error}</p>}
            {booth.cameraStatus !== 'idle' && (
              <div className="mt-1 text-center">
                <button type="button" onClick={booth.stopCamera} className="rounded-full bg-ink px-[22px] py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-plum">
                  {booth.isCapturing ? 'Batalkan & Matikan Kamera' : booth.cameraStatus === 'connecting' ? 'Batalkan' : 'Matikan Kamera'}
                </button>
              </div>
            )}
          </div>
          <FrameSelector layoutId={booth.layoutId} themeId={booth.themeId} onLayoutChange={booth.setLayoutId} onThemeChange={booth.setThemeId} disabled={booth.isCapturing} />
        </div>
      </section>
      <ResultPreview preview={booth.preview} resultRef={resultRef} onRetake={retake} busy={booth.isCapturing} />
    </main>
  );
}
