export function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function cameraErrorMessage(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return 'Izin kamera belum diberikan. Izinkan kamera melalui ikon di samping alamat browser, lalu coba lagi.';
  }
  if (error?.name === 'NotFoundError') return 'Kamera tidak ditemukan. Sambungkan kamera, lalu coba lagi.';
  if (error?.name === 'NotReadableError') return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut, lalu coba lagi.';
  return error?.message || 'Kamera gagal dinyalakan. Periksa perangkat dan izin kamera di browser.';
}

// AbortSignal membatalkan jeda tanpa meninggalkan timer setelah halaman ditutup.
export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Dibatalkan', 'AbortError'));
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Dibatalkan', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export function captureFrame(video, { filter = 'none', mirrored = true } = {}) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    throw new Error('Kamera belum siap. Tunggu gambar kamera muncul, lalu coba lagi.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung pengolahan foto. Coba browser lain.');
  ctx.save();
  ctx.filter = filter;
  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  return canvas;
}
