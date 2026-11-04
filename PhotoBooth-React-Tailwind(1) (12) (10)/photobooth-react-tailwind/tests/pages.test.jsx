import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '../src/pages/HomePage';
import BoothPage from '../src/pages/BoothPage';
import App from '../src/App';
import { mockCamera } from './setup';

describe('Halaman dan kontrol', () => {
  it('menampilkan demo dan memfilter galeri frame', () => {
    render(<App><HomePage /></App>);
    expect(screen.getByRole('link', { name: 'Coba kamera' }).getAttribute('href')).toBe('#demo');
    expect(screen.getByRole('link', { name: 'Buka studio lengkap' }).getAttribute('href')).toBe('./booth.html');
    const gallery = document.getElementById('frames');
    expect(within(gallery).queryByRole('heading', { name: 'Template frame' })).toBeNull();
    fireEvent.click(within(gallery).getByRole('button', { name: 'Pilih layout 2 CUT' }));
    expect(within(gallery).getAllByRole('figure')).toHaveLength(8);
    fireEvent.click(within(gallery).getByRole('button', { name: 'Cute' }));
    expect(within(gallery).getAllByRole('figure')).toHaveLength(2);
    expect(within(gallery).getByRole('link', { name: 'Gunakan frame Pinkiesh Leopard' }).getAttribute('href')).toBe('./booth.html?frame=pinkiesh&layout=2cut');
  });

  it('mengubah opsi, mengunci kontrol saat capture, lalu menyediakan unduhan', async () => {
    vi.useFakeTimers();
    mockCamera();
    render(<App page="booth"><BoothPage /></App>);
    const video = screen.getByLabelText('Video kamera');
    Object.defineProperties(video, { readyState: { value: 4 }, videoWidth: { value: 1280 }, videoHeight: { value: 720 } });
    expect(screen.getByRole('button', { name: 'Ambil foto photostrip' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /2 CUT/ }));
    expect(screen.getByRole('button', { name: /2 CUT/ }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Warna frame Pink Y2K' }));
    fireEvent.click(screen.getByRole('button', { name: /Timer 3 detik/ }));
    fireEvent.click(screen.getByRole('button', { name: /Timer 5 detik/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Normal' }));
    expect(video.style.filter).toContain('hue-rotate');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Nyalakan Kamera' })); });
    fireEvent.click(screen.getByRole('button', { name: 'Ambil foto photostrip' }));
    expect(screen.getByRole('button', { name: 'Y2K Pink' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: /2 CUT/ }).closest('fieldset').disabled).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); });
    const download = screen.getByRole('link', { name: 'Simpan Ke Galeri' });
    expect(download.getAttribute('href')).toMatch(/^data:image\/png/);
    expect(download.getAttribute('download')).toMatch(/^photostrip-2cut-\d+\.png$/);
    expect(screen.getByRole('img', { name: 'Hasil photostrip kamu' }).getAttribute('width')).toBe('600');
    expect(screen.getByRole('button', { name: 'Y2K Pink' }).disabled).toBe(false);
  });
});
