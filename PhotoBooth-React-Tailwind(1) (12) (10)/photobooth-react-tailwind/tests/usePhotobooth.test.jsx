import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import usePhotobooth from '../src/hooks/usePhotobooth';
import { canvases, mockCamera, mockVideo } from './setup';

function setup() {
  const camera = mockCamera();
  const hook = renderHook(usePhotobooth, { wrapper: StrictMode });
  hook.result.current.videoRef.current = mockVideo();
  return { ...hook, ...camera };
}

describe('Siklus kamera React', () => {
  it('menangani izin ditolak dan dapat dinyalakan kembali', async () => {
    const { result, getUserMedia, stream } = setup();
    getUserMedia.mockRejectedValueOnce(new DOMException('Denied', 'NotAllowedError'));
    await act(async () => { await result.current.startCamera(); });
    expect(result.current.cameraStatus).toBe('idle');
    expect(result.current.error).toContain('Izin kamera');
    await act(async () => { await result.current.startCamera(); });
    expect(result.current.cameraStatus).toBe('live');
    expect(result.current.videoRef.current.srcObject).toBe(stream);
    expect(result.current.error).toBe('');
  });

  it('mencegah permintaan kamera ganda dan menghentikan izin yang datang setelah batal', async () => {
    const { result, getUserMedia, track, stream } = setup();
    let resolve;
    getUserMedia.mockReturnValue(new Promise((done) => { resolve = done; }));
    let pending;
    act(() => { pending = result.current.startCamera(); result.current.startCamera(); });
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    act(() => result.current.stopCamera());
    await act(async () => { resolve(stream); await pending; });
    expect(track.stop).toHaveBeenCalled();
    expect(result.current.cameraStatus).toBe('idle');
    expect(result.current.videoRef.current.srcObject).toBeNull();
  });

  it.each(['unmount', 'pagehide'])('melepas kamera saat %s', async (event) => {
    const { result, track, unmount } = setup();
    await act(async () => { await result.current.startCamera(); });
    act(() => event === 'unmount' ? unmount() : window.dispatchEvent(new Event('pagehide')));
    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it('melepas stream yang baru didapat setelah komponen dilepas', async () => {
    const { result, getUserMedia, track, stream, unmount } = setup();
    let resolve;
    getUserMedia.mockReturnValue(new Promise((done) => { resolve = done; }));
    let pending;
    act(() => { pending = result.current.startCamera(); });
    unmount();
    await act(async () => { resolve(stream); await pending; });
    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it('membatalkan hitung mundur dan membersihkan timer ketika kamera dihentikan', async () => {
    vi.useFakeTimers();
    const { result, track } = setup();
    await act(async () => { await result.current.startCamera(); });
    let pending;
    act(() => { pending = result.current.capture(); });
    expect(result.current.countdown).toBe(3);
    await act(async () => { result.current.stopCamera(); await pending; });
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.countdown).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(track.stop).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([['2cut', 2], ['4cut', 4], ['4strip', 4]])('menyelesaikan %s lalu dapat mengganti warna dan foto ulang', async (layoutId, count) => {
    vi.useFakeTimers();
    const { result } = setup();
    await act(async () => { await result.current.startCamera(); });
    act(() => { result.current.setLayoutId(layoutId); result.current.cycleTimer(); result.current.cycleTimer(); });
    expect(result.current.timer).toBe(1);
    let pending;
    act(() => { pending = result.current.capture(); result.current.capture(); });
    expect(result.current.shot).toEqual({ current: 1, total: count });
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); await pending; });
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.preview.src).toMatch(/^data:image\/png/);
    expect(canvases.filter((ctx) => ctx.drawImage.mock.calls.some(([image]) => image === result.current.videoRef.current))).toHaveLength(count);
    const filename = result.current.preview.filename;
    act(() => result.current.setThemeId('pink'));
    expect(result.current.preview.filename).toBe(filename);
    expect(canvases.at(-1).fillStyle).toBe('#D81B60');
    act(() => result.current.toggleStickers());
    expect(canvases.at(-1).fillText.mock.calls.some(([text]) => text === '🎀')).toBe(false);
    act(() => { pending = result.current.capture(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); await pending; });
    expect(result.current.preview.filename).not.toBe(filename);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pulih dari kamera terputus di tengah sesi tanpa hasil parsial', async () => {
    vi.useFakeTimers();
    const { result, track } = setup();
    await act(async () => { await result.current.startCamera(); });
    let pending;
    act(() => { pending = result.current.capture(); });
    await act(async () => { track.dispatchEvent(new Event('ended')); await pending; });
    expect(result.current.cameraStatus).toBe('idle');
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.error).toContain('terputus');
    expect(result.current.preview).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('memulihkan kontrol setelah frame gagal ditangkap', async () => {
    vi.useFakeTimers();
    const { result } = setup();
    await act(async () => { await result.current.startCamera(); });
    result.current.videoRef.current.readyState = 0;
    let pending;
    act(() => { pending = result.current.capture(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); await pending; });
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.error).toContain('belum siap');
    expect(result.current.preview).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
