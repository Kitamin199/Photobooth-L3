import { getLayout, THEMES } from './boothConfig';

const positions = {
  '4cut': [[42, 70, 248, 285], [310, 70, 248, 285], [42, 372, 248, 285], [310, 372, 248, 285]],
  '2cut': [[45, 65, 510, 265], [45, 350, 510, 265]],
  '4strip': [[35, 58, 330, 185], [35, 258, 330, 185], [35, 458, 330, 185], [35, 658, 330, 185]],
};

export function centerCrop(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const ratio = targetWidth / targetHeight;
  if (sourceWidth / sourceHeight > ratio) {
    const width = sourceHeight * ratio;
    return [(sourceWidth - width) / 2, 0, width, sourceHeight];
  }
  const height = sourceWidth / ratio;
  return [0, (sourceHeight - height) / 2, sourceWidth, height];
}

function drawPhoto(ctx, frame, box, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(...box, radius);
  ctx.clip();
  ctx.drawImage(frame, ...centerCrop(frame.width, frame.height, box[2], box[3]), ...box);
  ctx.restore();
}

function localDate(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function renderPhotostrip({ frames, layoutId, themeId, stickers, capturedAt, title }) {
  if (!frames.length) return null;
  const layout = getLayout(layoutId);
  const theme = THEMES.find((item) => item.id === themeId) || THEMES[0];
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Hasil foto tidak dapat dibuat di browser ini.');

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.text;
  ctx.font = `bold ${layout.id === '4strip' ? 15 : 16}px monospace`;
  ctx.textAlign = 'center';
  const heading = layout.id === '2cut'
    ? '✨ GLOBAL FOTO - WIDE DUO ✨'
    : layout.id === '4cut' ? '✨ GLOBAL FOTO - STUDIO ✨' : 'GLOBAL FOTO - STUDIO';
  ctx.fillText(title || heading, canvas.width / 2, layout.id === '2cut' ? 40 : 38);

  if (layout.id === '4cut') {
    ctx.fillStyle = theme.innerBg;
    ctx.beginPath();
    ctx.roundRect(25, 52, 550, 625, 24);
    ctx.fill();
  }

  const radius = layout.id === '2cut' ? 18 : layout.id === '4strip' ? 14 : 16;
  // Saat 2 foto diganti ke layout 4 foto, pasangan foto diulang seperti versi awal.
  positions[layout.id].forEach((box, index) => drawPhoto(ctx, frames[index % frames.length], box, radius));

  const date = localDate(capturedAt);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 14px monospace';
  if (layout.id === '4cut') {
    ctx.textAlign = 'left';
    ctx.fillText(date, 35, 718);
    ctx.textAlign = 'right';
    ctx.fillText('PHOTOBOOTH.ID', 565, 718);
  } else if (layout.id === '2cut') {
    ctx.fillText(`${date}  •  PHOTOBOOTH STUDIO`, 300, 660);
  } else {
    ctx.font = 'bold 13px monospace';
    ctx.fillText('✨ BESTIE EDITION ✨', 200, 882);
    ctx.font = '12px monospace';
    ctx.fillText(date, 200, 905);
  }

  if (stickers) {
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎀', 35, 38);
    ctx.fillText('💖', canvas.width - 35, 38);
    ctx.fillText('⭐', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('✨', 48, canvas.height - 55);
  }

  return {
    src: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    filename: `photostrip-${layout.id}-${capturedAt.getTime()}.png`,
    capturedAt: capturedAt.getTime(),
  };
}
