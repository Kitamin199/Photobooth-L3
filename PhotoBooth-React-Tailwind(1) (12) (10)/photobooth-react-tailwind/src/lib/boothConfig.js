export const FILTERS = [
  { name: 'Normal', css: 'none' },
  { name: 'Y2K Pink', css: 'contrast(1.08) brightness(1.06) saturate(1.35) hue-rotate(-8deg)' },
  { name: 'Soft Glow', css: 'brightness(1.12) contrast(0.95) saturate(1.1)' },
  { name: 'Vintage', css: 'sepia(0.45) contrast(1.05) brightness(0.98)' },
  { name: 'B&W Mono', css: 'grayscale(1) contrast(1.15)' },
];

export const LAYOUTS = [
  { id: '4cut', name: '4 CUT', description: 'Grid 2×2 (4 Foto)', shots: 4, width: 600, height: 760 },
  { id: '2cut', name: '2 CUT', description: 'Wide Duo (2 Foto)', shots: 2, width: 600, height: 700 },
  { id: '4strip', name: '4 STRIP', description: 'Classic Vertikal (4 Foto)', shots: 4, width: 400, height: 940 },
];

export const THEMES = [
  { id: 'white', name: 'Putih', bg: '#FFFFFF', innerBg: '#F6F3EC', text: '#7A3E53' },
  { id: 'pink', name: 'Pink Y2K', bg: '#FFF0F6', innerBg: '#FFE0EE', text: '#D81B60' },
  { id: 'purple', name: 'Ungu', bg: '#F3EEFA', innerBg: '#E6DDF5', text: '#5E35B1' },
];

export const TIMER_OPTIONS = [3, 5, 1];

export function getLayout(id) {
  return LAYOUTS.find((layout) => layout.id === id) || LAYOUTS[0];
}
