import { describe, expect, it } from 'vitest';
import { captureFrame } from '../src/lib/camera';
import { centerCrop, renderPhotostrip } from '../src/lib/renderPhotostrip';
import { canvases, mockVideo } from './setup';

const frames = Array.from({ length: 4 }, (_, id) => ({ id, width: 1280, height: 720 }));
const capturedAt = new Date(2026, 10, 3, 12);
const render = (options = {}) => renderPhotostrip({ frames, layoutId: '4cut', themeId: 'white', stickers: false, capturedAt, ...options });

describe('Pengolahan foto', () => {
  it('memotong tengah tanpa meregangkan foto landscape atau portrait', () => {
    expect(centerCrop(1280, 720, 100, 100)).toEqual([280, 0, 720, 720]);
    expect(centerCrop(720, 1280, 100, 100)).toEqual([0, 280, 720, 720]);
    expect(centerCrop(1280, 720, 160, 90)).toEqual([0, 0, 1280, 720]);
  });

  it.each([
    ['4cut', 600, 760, 4], ['2cut', 600, 700, 2], ['4strip', 400, 940, 4],
  ])('%s menaruh setiap foto tepat sekali dan menghasilkan ukuran yang sesuai', (layoutId, width, height, count) => {
    const result = render({ layoutId });
    const ctx = canvases.at(-1);
    expect(result).toMatchObject({ width, height });
    expect(result.src).toMatch(/^data:image\/png;base64,/);
    expect(result.filename).toBe(`photostrip-${layoutId}-${capturedAt.getTime()}.png`);
    expect(ctx.drawImage).toHaveBeenCalledTimes(count);
    expect(ctx.drawImage.mock.calls.map((call) => call[0].id)).toEqual(frames.slice(0, count).map((frame) => frame.id));
    for (const call of ctx.drawImage.mock.calls) {
      const [, , , , , x, y, w, h] = call;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(width);
      expect(y + h).toBeLessThanOrEqual(height);
    }
  });

  it('mengulang pasangan foto ketika hasil 2-cut diganti ke 4-cut', () => {
    render({ frames: frames.slice(0, 2) });
    expect(canvases.at(-1).drawImage.mock.calls.map((call) => call[0].id)).toEqual([0, 1, 0, 1]);
  });

  it('menerapkan palet dan sakelar stiker tanpa mengubah foto sumber', () => {
    render({ themeId: 'pink', stickers: true });
    const ctx = canvases.at(-1);
    expect(ctx.fillStyle).toBe('#D81B60');
    expect(ctx.fillText).toHaveBeenCalledWith('🎀', 35, 38);
    expect(ctx.fillText).toHaveBeenCalledWith('2026-11-03', 35, 718);
    render({ themeId: 'purple', stickers: false });
    expect(canvases.at(-1).fillStyle).toBe('#5E35B1');
    expect(canvases.at(-1).fillText.mock.calls.some(([text]) => text === '🎀')).toBe(false);
    expect(frames[0]).toEqual({ id: 0, width: 1280, height: 720 });
  });

  it('menyimpan filter dan mirror ke frame asli, bukan hanya ke tampilan video', () => {
    const video = mockVideo();
    const canvas = captureFrame(video, { filter: 'grayscale(1)', mirrored: true });
    const ctx = canvases.at(-1);
    expect([canvas.width, canvas.height]).toEqual([1280, 720]);
    expect(ctx.filter).toBe('grayscale(1)');
    expect(ctx.translate).toHaveBeenCalledWith(1280, 0);
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
    expect(ctx.drawImage).toHaveBeenCalledWith(video, 0, 0, 1280, 720);
    captureFrame(video, { mirrored: false });
    expect(canvases.at(-1).scale).not.toHaveBeenCalled();
  });

  it('menolak video yang belum siap agar tidak menghasilkan foto hitam', () => {
    expect(() => captureFrame({ readyState: 0 })).toThrow('Kamera belum siap');
    expect(render({ frames: [] })).toBeNull();
  });
});
