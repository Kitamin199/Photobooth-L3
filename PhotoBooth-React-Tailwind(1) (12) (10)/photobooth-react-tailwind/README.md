# PhotoBooth — React + Tailwind CSS

Migrasi dari proyek `PhotoBooth-rapi(7)` ke **React 19**, **Tailwind CSS 4**, dan **Vite 8**. Landing page mengadaptasi susunan FunCam dengan palet pastel PhotoBooth.

## Menjalankan di laptop

1. Pasang Node.js **22.12 atau lebih baru**. Node.js 20.19+ juga didukung.
2. Ekstrak ZIP, lalu buka folder **photobooth-react-tailwind** di VS Code.
3. Buka **Terminal → New Terminal**. Pastikan `package.json` terlihat di folder terminal tersebut.
4. Jalankan:

```bash
npm install
npm run dev
```

5. Buka alamat **Local** yang ditampilkan terminal, biasanya `http://localhost:5173`.
6. Klik **Studio Booth → Nyalakan Kamera**, lalu izinkan kamera.

Terminal harus tetap berjalan selama website dipakai. Hentikan dengan **Ctrl + C**. Pada penggunaan berikutnya cukup `npm run dev`; instalasi ulang diperlukan jika dependensi berubah atau folder `node_modules` dihapus.

**Jangan membuka `index.html` dengan klik dua kali atau Live Server.** Proyek React ini dijalankan melalui Vite.

## Fitur yang tersedia

- Demo kamera di beranda dan galeri frame dengan filter layout.
- Kamera depan dengan preview langsung serta tombol nyala/mati.
- Layout 4 Cut, 2 Cut, dan 4 Strip.
- Warna frame putih, pink Y2K, dan ungu pastel.
- Filter Normal, Y2K Pink, Soft Glow, Vintage, dan B&W Mono.
- Timer 1, 3, atau 5 detik; efek flash layar; mirror; dan stiker.
- Unduh hasil PNG, ubah frame/layout/stiker setelah memotret, serta foto ulang.
- Kamera dan timer dibersihkan ketika sesi dibatalkan atau halaman ditinggalkan.

Foto diproses di browser dan tidak dikirim ke server. Hasil sesi tidak disimpan otomatis setelah halaman ditutup atau di-refresh; unduh PNG untuk menyimpannya. Jika hasil 2 Cut diubah menjadi layout 4 foto, pasangan foto akan diulang seperti pada versi awal.


## File yang bisa diedit

| Kebutuhan | File |
| --- | --- |
| Judul, deskripsi, tombol, dan fitur beranda | `src/pages/HomePage.jsx` |
| Demo kamera di beranda | `src/components/StudioDemo.jsx` |
| Galeri frame | `src/components/FrameGallery.jsx` |
| Logo teks dan menu navigasi | `src/components/Navbar.jsx` |
| Susunan halaman studio | `src/pages/BoothPage.jsx` |
| Tampilan kamera dan kontrol | `src/components/booth/` |
| Proses kamera, countdown, dan sesi foto | `src/hooks/usePhotobooth.js` |
| Daftar filter, layout, warna, dan timer | `src/lib/boothConfig.js` |
| Ukuran, tulisan, dan posisi foto pada PNG | `src/lib/renderPhotostrip.js` |
| Pengambilan frame kamera | `src/lib/camera.js` |
| Palet utama, font, dan animasi shutter | `src/styles.css` |
| Foto/aset gambar | `public/images/` |

Style komponen memakai utility Tailwind pada atribut **`className`**, misalnya `bg-pink`, `rounded-full`, `md:grid-cols-3`, dan `text-sm`. Warna `pink`, `cream`, `yellow`, `lavender`, dan `plum` berasal dari blok `@theme` di `src/styles.css`.

Tailwind 4 memakai `@import "tailwindcss"` dan plugin `@tailwindcss/vite` dalam `vite.config.js`; tidak memerlukan `tailwind.config.js` untuk konfigurasi ini. CSS tambahan dibatasi untuk token, dasar halaman, aksesibilitas, dan animasi.

`index.html` dan `booth.html` adalah dua pintu masuk Vite. Keduanya memuat `src/main.jsx`, lalu `App.jsx` memilih halaman berdasarkan `data-page`. Dengan demikian tautan `booth.html` tetap bisa dibuka langsung tanpa pengaturan router khusus.

## Build dan pemeriksaan

```bash
npm test
npm run build
npm run preview
```

- `npm test`: 21 pengujian untuk halaman, hasil frame, serta siklus kamera dan timer.
- `npm run build`: membuat folder `dist/` untuk hosting statis.
- `npm run preview`: memeriksa hasil build melalui alamat yang ditampilkan terminal.
- Untuk instalasi persis sesuai versi yang diuji, gunakan `npm ci` sebagai pengganti `npm install`.

Upload **isi folder `dist/`** ke hosting jika ingin memublikasikannya. Hosting harus memakai **HTTPS** agar kamera dapat digunakan. Seluruh gambar disertakan di `public/images` dan ikut masuk ke hasil build; Google Fonts memakai internet dengan font cadangan jika tidak tersedia.

## Jika ada kendala

| Kendala | Yang diperiksa |
| --- | --- |
| `Missing script: dev` | Terminal harus berada di folder yang berisi `package.json` dari ZIP ini. |
| `vite is not recognized` | Jalankan `npm install` terlebih dahulu. |
| Versi Node.js tidak didukung | Cek `node -v`, kemudian gunakan versi sesuai syarat di atas. |
| Kamera tidak diizinkan | Izinkan kamera dari ikon di samping alamat browser, lalu klik Nyalakan Kamera lagi. |
| Kamera sedang dipakai | Tutup aplikasi lain yang menggunakan kamera. |
| Kamera tidak bekerja lewat alamat IP lokal di HP | Gunakan hosting HTTPS; pengecualian localhost hanya berlaku di perangkat yang membuka localhost tersebut. |

## Validasi migrasi

Build produksi berhasil. Seluruh 21 pengujian otomatis lulus. Beranda, studio, dan perubahan opsi diperiksa di browser. Pengujian media/canvas menggunakan simulasi; kamera fisik dan hasil tangkapan nyata perlu dicoba pada perangkatmu, disarankan Chrome atau Edge terbaru.

Tidak ada backend, API key, atau akun tambahan yang perlu dikonfigurasi. `node_modules` tidak disertakan dalam ZIP agar ukuran unduhan tetap kecil.
