import { useCallback, useEffect, useRef, useState } from 'react';
import { FILTERS, getLayout, TIMER_OPTIONS } from '../lib/boothConfig';
import { cameraErrorMessage, captureFrame, stopStream, wait } from '../lib/camera';
import { renderPhotostrip } from '../lib/renderPhotostrip';

export default function usePhotobooth(template, initialLayout) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRequestRef = useRef(0);
  const startingRef = useRef(false);
  const removeTrackListenersRef = useRef(null);
  const captureControllerRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState('idle');
  const [error, setError] = useState('');
  const [layoutId, setLayoutId] = useState(initialLayout ?? template?.layout ?? '4cut');
  const [themeId, setThemeId] = useState(template?.theme ?? 'white');
  const [filterIndex, setFilterIndex] = useState(0);
  const [stickers, setStickers] = useState(true);
  const [flash, setFlash] = useState(true);
  const [mirrored, setMirrored] = useState(true);
  const [timer, setTimer] = useState(3);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [shot, setShot] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [captureSet, setCaptureSet] = useState(null);
  const [preview, setPreview] = useState(null);

  const resetCaptureState = useCallback(() => {
    setIsCapturing(false);
    setCountdown(null);
    setShot(null);
    setIsFlashing(false);
  }, []);

  // Invalidasi permintaan tertunda: izin kamera yang terlambat disetujui
  // tidak boleh menyalakan kamera lagi setelah Stop / pindah halaman.
  const releaseCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    startingRef.current = false;
    captureControllerRef.current?.abort();
    captureControllerRef.current = null;
    removeTrackListenersRef.current?.();
    removeTrackListenersRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stopCamera = useCallback(() => {
    releaseCamera();
    setCameraStatus('idle');
    resetCaptureState();
  }, [releaseCamera, resetCaptureState]);

  useEffect(() => {
    window.addEventListener('pagehide', stopCamera);
    return () => {
      window.removeEventListener('pagehide', stopCamera);
      releaseCamera();
    };
  }, [releaseCamera, stopCamera]);

  const startCamera = useCallback(async () => {
    if (startingRef.current || streamRef.current) return;
    startingRef.current = true;
    const request = ++cameraRequestRef.current;
    setCameraStatus('connecting');
    setError('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Kamera memerlukan HTTPS atau localhost. Jalankan melalui npm run dev dan buka alamat localhost yang muncul.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      if (request !== cameraRequestRef.current) {
        stopStream(stream);
        return;
      }
      const video = videoRef.current;
      if (!video) {
        stopStream(stream);
        throw new Error('Pratinjau kamera belum siap. Silakan coba lagi.');
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      if (request !== cameraRequestRef.current) {
        stopStream(stream);
        return;
      }
      const tracks = stream.getVideoTracks();
      if (!tracks.length || tracks.some((track) => track.readyState === 'ended')) {
        throw new Error('Sambungan kamera terputus. Nyalakan kembali kamera.');
      }
      const onEnded = () => {
        stopCamera();
        setError('Sambungan kamera terputus. Nyalakan kembali kamera.');
      };
      tracks.forEach((track) => track.addEventListener('ended', onEnded));
      removeTrackListenersRef.current = () => tracks.forEach((track) => track.removeEventListener('ended', onEnded));
      setCameraStatus('live');
    } catch (cause) {
      if (request !== cameraRequestRef.current) return;
      releaseCamera();
      setCameraStatus('idle');
      setError(cameraErrorMessage(cause));
    } finally {
      if (request === cameraRequestRef.current) startingRef.current = false;
    }
  }, [releaseCamera, stopCamera]);

  const capture = useCallback(async () => {
    if (captureControllerRef.current) return;
    if (!streamRef.current || cameraStatus !== 'live') {
      setError('Nyalakan kamera terlebih dahulu untuk mengambil foto.');
      return;
    }
    const controller = new AbortController();
    captureControllerRef.current = controller;
    const { signal } = controller;
    const layout = getLayout(layoutId);
    const frames = [];
    setError('');
    setIsCapturing(true);

    try {
      for (let index = 0; index < layout.shots; index += 1) {
        setShot({ current: index + 1, total: layout.shots });
        for (let seconds = timer; seconds > 0; seconds -= 1) {
          setCountdown(seconds);
          await wait(1000, signal);
        }
        setCountdown(null);
        if (flash) setIsFlashing(true);
        frames.push(captureFrame(videoRef.current, { filter: FILTERS[filterIndex].css, mirrored }));
        await wait(80, signal);
        setIsFlashing(false);
        if (index < layout.shots - 1) await wait(700, signal);
      }
      setCaptureSet({ frames, capturedAt: new Date() });
    } catch (cause) {
      if (!signal.aborted) setError(cause.message || 'Pengambilan foto gagal. Silakan coba lagi.');
    } finally {
      if (captureControllerRef.current === controller) {
        captureControllerRef.current = null;
        resetCaptureState();
      }
    }
  }, [cameraStatus, layoutId, timer, flash, filterIndex, mirrored, resetCaptureState]);

  useEffect(() => {
    if (!captureSet) return;
    try {
      setPreview(renderPhotostrip({ ...captureSet, title: template?.name, layoutId, themeId, stickers }));
    } catch (cause) {
      setPreview(null);
      setError(cause.message || 'Hasil foto gagal diproses. Silakan foto ulang.');
    }
  }, [captureSet, template, layoutId, themeId, stickers]);

  return {
    videoRef, cameraStatus, error, layoutId, themeId, stickers, flash, mirrored,
    timer, isCapturing, countdown, shot, isFlashing, preview,
    filter: FILTERS[filterIndex],
    startCamera, stopCamera, capture, setLayoutId, setThemeId,
    cycleFilter: () => setFilterIndex((index) => (index + 1) % FILTERS.length),
    cycleTimer: () => setTimer((value) => TIMER_OPTIONS[(TIMER_OPTIONS.indexOf(value) + 1) % TIMER_OPTIONS.length]),
    toggleStickers: () => setStickers((value) => !value),
    toggleFlash: () => setFlash((value) => !value),
    toggleMirror: () => setMirrored((value) => !value),
  };
}
