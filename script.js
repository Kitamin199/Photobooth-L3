
let currentLayout = '4cut'; // '4cut', '2cut', '4strip'
let currentTheme = 'white'; // 'white', 'pink', 'purple'
let stickersEnabled = true;
let flashEnabled = true;
let isMirrored = true;
let timerSeconds = 3;
let isCapturing = false;
let mediaStream = null;
let capturedFrames = []; // Menyimpan hasil jepretan dalam bentuk Canvas agar bisa di-render ulang kapan saja

// Daftar Filter Kamera
const cameraFilters = [
    { name: 'Normal', css: 'none' },
    { name: 'Y2K Pink', css: 'contrast(1.08) brightness(1.06) saturate(1.35) hue-rotate(-8deg)' },
    { name: 'Soft Glow', css: 'brightness(1.12) contrast(0.95) saturate(1.1)' },
    { name: 'Vintage', css: 'sepia(0.45) contrast(1.05) brightness(0.98)' },
    { name: 'B&W Mono', css: 'grayscale(1) contrast(1.15)' }
];
let currentFilterIndex = 0;

// Elemen DOM
const videoElement = document.getElementById('webcam');
const startButton = document.getElementById('btn-start-camera');
const stopButton = document.getElementById('btn-stop-camera');
const captureButton = document.getElementById('btn-capture');
const countdownOverlay = document.getElementById('countdown-overlay');
const flashOverlay = document.getElementById('flash-overlay');
const statusBadge = document.getElementById('camera-status-badge');
const shotCounterBadge = document.getElementById('shot-counter');

const filterBtn = document.getElementById('btn-filter');
const filterLabel = document.getElementById('filter-label');
const stickerBtn = document.getElementById('btn-sticker');
const scrollResultBtn = document.getElementById('btn-scroll-result');

const flashBtn = document.getElementById('btn-flash');
const timerBtn = document.getElementById('btn-timer');
const mirrorBtn = document.getElementById('btn-mirror');

const resultContainer = document.getElementById('result-container');
const photoPreview = document.getElementById('photo-preview');
const downloadButton = document.getElementById('btn-download');
const retakeButton = document.getElementById('btn-retake');

// ==========================================
// 1. FUNGSI KAMERA (START & STOP)
// ==========================================
async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false
        });
        videoElement.srcObject = mediaStream;
        await videoElement.play();

        startButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
        statusBadge.textContent = 'LIVE';
    } catch (error) {
        console.error("Gagal mengakses kamera:", error);
        alert("Mohon berikan izin akses kamera pada browser Anda.");
    }
}

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
        mediaStream = null;
    }
    stopButton.style.display = 'none';
    startButton.style.display = 'flex';
    statusBadge.textContent = 'STANDBY';
}

// ==========================================
// 2. PROSES MULTI-SHOT & HITUNG MUNDUR
// ==========================================
async function handleShutterClick() {
    if (!mediaStream) {
        alert("Nyalakan kamera terlebih dahulu ya!");
        return;
    }
    if (isCapturing) return;

    isCapturing = true;
    captureButton.disabled = true;

    const shotsNeeded = currentLayout === '2cut' ? 2 : 4;
    capturedFrames = [];
    shotCounterBadge.style.display = 'block';

    for (let i = 1; i <= shotsNeeded; i++) {
        shotCounterBadge.textContent = `Pose ${i} / ${shotsNeeded}`;
        await runCountdown(timerSeconds);
        triggerFlashEffect();
        capturedFrames.push(captureSingleFrameCanvas());
        
        // Jeda singkat antar pose
        if (i < shotsNeeded) {
            await new Promise(r => setTimeout(r, 700));
        }
    }

    shotCounterBadge.style.display = 'none';
    isCapturing = false;
    captureButton.disabled = false;

    // Render Photostrip & Scroll ke hasil
    generatePhotostripResult();
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function runCountdown(seconds) {
    return new Promise((resolve) => {
        let count = seconds;
        countdownOverlay.textContent = count;
        countdownOverlay.classList.add('active');

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                countdownOverlay.textContent = count;
            } else {
                clearInterval(timer);
                countdownOverlay.textContent = '';
                setTimeout(() => {
                    countdownOverlay.classList.remove('active');
                    resolve();
                }, 200);
            }
        }, 1000);
    });
}

function triggerFlashEffect() {
    if (!flashEnabled) return;
    flashOverlay.classList.add('snap');
    setTimeout(() => {
        flashOverlay.classList.remove('snap');
    }, 80);
}

// Mengambil 1 frame video beserta filter & status mirror ke dalam Canvas
function captureSingleFrameCanvas() {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = videoElement.videoWidth || 1280;
    frameCanvas.height = videoElement.videoHeight || 720;
    const ctx = frameCanvas.getContext('2d');

    ctx.save();
    // Terapkan filter kamera yang sedang dipilih
    ctx.filter = cameraFilters[currentFilterIndex].css;

    if (isMirrored) {
        ctx.translate(frameCanvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(videoElement, 0, 0, frameCanvas.width, frameCanvas.height);
    ctx.restore();

    return frameCanvas;
}

// ==========================================
// 3. HELPER GAMBAR PROPORSIONAL (CENTER-CROP)
// ==========================================
function drawImageCoverRounded(ctx, sourceCanvas, x, y, w, h, radius = 16) {
    const imgW = sourceCanvas.width;
    const imgH = sourceCanvas.height;
    const targetRatio = w / h;
    const imgRatio = imgW / imgH;

    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) {
        sh = imgH;
        sw = imgH * targetRatio;
        sx = (imgW - sw) / 2;
        sy = 0;
    } else {
        sw = imgW;
        sh = imgW / targetRatio;
        sx = 0;
        sy = (imgH - sh) / 2;
    }

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
    ctx.drawImage(sourceCanvas, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
}

// ==========================================
// 4. GENERATOR PHOTOSTRIP (4-CUT, 2-CUT, 4-STRIP)
// ==========================================
function generatePhotostripResult() {
    if (capturedFrames.length === 0) return;

    const resultCanvas = document.createElement('canvas');
    const ctx = resultCanvas.getContext('2d');

    // Palet Warna Tema Frame
    const themes = {
        white: { bg: '#FFFFFF', innerBg: '#F6F3EC', text: '#7A3E53', border: '#EAE4D2' },
        pink:  { bg: '#FFF0F6', innerBg: '#FFE0EE', text: '#D81B60', border: '#F8BBD0' },
        purple:{ bg: '#F3EEFA', innerBg: '#E6DDF5', text: '#5E35B1', border: '#D1C4E9' }
    };
    const palette = themes[currentTheme] || themes.white;
    const todayStr = new Date().toISOString().slice(0, 10);

    if (currentLayout === '4cut') {
        resultCanvas.width = 600;
        resultCanvas.height = 760;

        // Latar Utama
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

        // Header
        ctx.fillStyle = palette.text;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✨ GLOBAL FOTO - STUDIO ✨', resultCanvas.width / 2, 38);

        // Kotak Kontainer Dalam
        ctx.fillStyle = palette.innerBg;
        ctx.beginPath();
        ctx.roundRect(25, 52, 550, 625, 24);
        ctx.fill();

        const coords = [
            { x: 42, y: 70, w: 248, h: 285 },
            { x: 310, y: 70, w: 248, h: 285 },
            { x: 42, y: 372, w: 248, h: 285 },
            { x: 310, y: 372, w: 248, h: 285 }
        ];

        coords.forEach((c, idx) => {
            const frame = capturedFrames[idx % capturedFrames.length];
            drawImageCoverRounded(ctx, frame, c.x, c.y, c.w, c.h, 16);
        });

        // Footer
        ctx.fillStyle = palette.text;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(todayStr, 35, 718);
        ctx.textAlign = 'right';
        ctx.fillText('PHOTOBOOTH.ID', resultCanvas.width - 35, 718);

    } else if (currentLayout === '2cut') {
        resultCanvas.width = 600;
        resultCanvas.height = 700;

        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

        ctx.fillStyle = palette.text;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✨ GLOBAL FOTO - WIDE DUO ✨', resultCanvas.width / 2, 40);

        const coords = [
            { x: 45, y: 65, w: 510, h: 265 },
            { x: 45, y: 350, w: 510, h: 265 }
        ];

        coords.forEach((c, idx) => {
            const frame = capturedFrames[idx % capturedFrames.length];
            drawImageCoverRounded(ctx, frame, c.x, c.y, c.w, c.h, 18);
        });

        ctx.fillStyle = palette.text;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${todayStr}  •  PHOTOBOOTH STUDIO`, resultCanvas.width / 2, 660);

    } else if (currentLayout === '4strip') {
        resultCanvas.width = 400;
        resultCanvas.height = 940;

        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

        ctx.fillStyle = palette.text;
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GLOBAL FOTO - STUDIO', resultCanvas.width / 2, 38);

        const coords = [
            { x: 35, y: 58, w: 330, h: 185 },
            { x: 35, y: 258, w: 330, h: 185 },
            { x: 35, y: 458, w: 330, h: 185 },
            { x: 35, y: 658, w: 330, h: 185 }
        ];

        coords.forEach((c, idx) => {
            const frame = capturedFrames[idx % capturedFrames.length];
            drawImageCoverRounded(ctx, frame, c.x, c.y, c.w, c.h, 14);
        });

        ctx.fillStyle = palette.text;
        ctx.font = 'bold 13px monospace';
        ctx.fillText('✨ BESTIE EDITION ✨', resultCanvas.width / 2, 882);
        ctx.font = '12px monospace';
        ctx.fillText(todayStr, resultCanvas.width / 2, 905);
    }

    // Gambar Stiker Dekoratif Y2K jika fitur Sticker ON
    if (stickersEnabled) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎀', 35, 38);
        ctx.fillText('💖', resultCanvas.width - 35, 38);
        ctx.fillText('⭐', resultCanvas.width / 2, resultCanvas.height / 2 + 10);
        ctx.fillText('✨', 48, resultCanvas.height - 55);
    }

    // Tampilkan ke elemen preview & tombol unduh
    const dataUrl = resultCanvas.toDataURL('image/png');
    photoPreview.src = dataUrl;
    downloadButton.href = dataUrl;
    downloadButton.download = `photostrip-${currentLayout}-${Date.now()}.png`;
}

// ==========================================
// 5. EVENT LISTENERS KONTROL INTERAKTIF
// ==========================================
startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
captureButton.addEventListener('click', handleShutterClick);

// Ganti Layout (4-Cut, 2-Cut, 4-Strip)
document.querySelectorAll('.layout-box').forEach(box => {
    box.addEventListener('click', () => {
        if (isCapturing) return;
        document.querySelectorAll('.layout-box').forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        currentLayout = box.dataset.layout;

        // Jika sudah ada foto yang diambil, langsung perbarui preview!
        if (capturedFrames.length > 0) {
            generatePhotostripResult();
        }
    });
});

// Ganti Tema Warna Frame (Putih, Pink, Ungu)
document.querySelectorAll('.strip-card-mini').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.strip-card-mini').forEach(c => c.classList.remove('active-theme'));
        card.classList.add('active-theme');
        currentTheme = card.dataset.theme;

        if (capturedFrames.length > 0) {
            generatePhotostripResult();
        }
    });
});

// Tombol Ganti Filter Kamera
filterBtn.addEventListener('click', () => {
    currentFilterIndex = (currentFilterIndex + 1) % cameraFilters.length;
    const selected = cameraFilters[currentFilterIndex];
    videoElement.style.filter = selected.css;
    filterLabel.textContent = selected.name;
});

// Tombol Toggle Stiker Frame
stickerBtn.addEventListener('click', () => {
    stickersEnabled = !stickersEnabled;
    stickerBtn.classList.toggle('active-feature', stickersEnabled);
    stickerBtn.querySelector('.menu-label').textContent = stickersEnabled ? 'Sticker: ON' : 'Sticker: OFF';

    if (capturedFrames.length > 0) {
        generatePhotostripResult();
    }
});

// Tombol Lihat Hasil
scrollResultBtn.addEventListener('click', () => {
    if (resultContainer.style.display !== 'none') {
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Ambil foto terlebih dahulu untuk melihat hasil photostrip kamu!");
    }
});

// Tombol Opsi Kanan: Flash, Timer, Mirror
flashBtn.addEventListener('click', () => {
    flashEnabled = !flashEnabled;
    flashBtn.classList.toggle('active', flashEnabled);
});

timerBtn.addEventListener('click', () => {
    timerSeconds = timerSeconds === 3 ? 5 : (timerSeconds === 5 ? 1 : 3);
    timerBtn.textContent = `${timerSeconds}s`;
});

mirrorBtn.addEventListener('click', () => {
    isMirrored = !isMirrored;
    mirrorBtn.classList.toggle('active', isMirrored);
    videoElement.classList.toggle('unmirrored', !isMirrored);
});

// Tombol Foto Ulang
if (retakeButton) {
    retakeButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => handleShutterClick(), 500);
    });
}
