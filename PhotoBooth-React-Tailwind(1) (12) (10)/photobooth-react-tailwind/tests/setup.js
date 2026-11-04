import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

export let canvases = [];

beforeEach(() => {
  canvases = [];
  const contexts = new WeakMap();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
    if (!contexts.has(this)) {
      const ctx = {
        canvas: this,
        save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(),
        roundRect: vi.fn(), clip: vi.fn(), drawImage: vi.fn(),
        fillRect: vi.fn(), fill: vi.fn(), fillText: vi.fn(),
        translate: vi.fn(), scale: vi.fn(),
      };
      contexts.set(this, ctx);
      canvases.push(ctx);
    }
    return contexts.get(this);
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (type) {
    return `data:${type};base64,${btoa(`${this.width}x${this.height}:${canvases.length}`)}`;
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

export function mockCamera() {
  const track = new EventTarget();
  track.readyState = 'live';
  track.stop = vi.fn(() => { track.readyState = 'ended'; });
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
  return { track, stream, getUserMedia };
}

export function mockVideo() {
  return { videoWidth: 1280, videoHeight: 720, readyState: 4, srcObject: null, play: vi.fn().mockResolvedValue() };
}
