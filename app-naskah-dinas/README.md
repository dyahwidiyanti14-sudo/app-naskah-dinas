# Alat Bantu Penyusunan Naskah Dinas — BPS Provinsi Jawa Tengah

Aplikasi web (Next.js 14 + TypeScript + Tailwind CSS) untuk menyusun draf naskah dinas
sesuai Perka BPS No. 1 Tahun 2023 dan penegasan Tata Naskah Dinas terbaru, mengikuti
template resmi di [repositori GitHub template naskah dinas](https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas).

Jenis naskah yang didukung:

- Surat Dinas Daerah
- Surat Undangan Daerah
- Memorandum
- Nota Dinas
- Surat Perintah/Surat Tugas

Termasuk ketentuan tambahan **Tanda Tangan di Lampiran Surat**:
- Surat ditandatangani basah/konvensional → lampiran surat **harus** ikut ditandatangani.
- Surat ditandatangani Elektronik/Srikandi → lampiran surat **tidak perlu** tanda tangan.

## Alur Edit → Preview → Unduh

1. **Mode Edit**: isi form di sebelah kiri, hasil naskah langsung terlihat *live* di preview sebelah kanan.
2. Klik **"Preview Penuh →"** untuk masuk ke **Mode Preview**: naskah ditampilkan penuh satu halaman.
3. Centang konfirmasi **"naskah sudah sesuai"** untuk mengaktifkan tombol unduh.
4. Pilih format unduhan:
   - **Unduh Word (.docx)** — menghasilkan file Word asli (bukan gambar/PDF) berisi teks yang sudah diisi, dibuat langsung di browser memakai library [`docx`](https://www.npmjs.com/package/docx), font Arial 12 sesuai kaidah Perka BPS No. 1/2023.
   - **Unduh PDF** — membuka dialog cetak bawaan browser; pilih tujuan cetak *"Save as PDF"*.
5. Klik **"← Kembali ke Edit"** kapan saja untuk memperbaiki isian.

Kedua proses unduh berjalan sepenuhnya di sisi klien (browser) — tidak ada server/API tambahan, sehingga aman dan cepat saat di-deploy sebagai situs statis di Vercel.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy ke Vercel

1. Push folder ini ke repositori GitHub (bisa repo baru atau ditambahkan ke repo yang sudah ada).
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → pilih repositori tersebut.
3. Framework Preset otomatis terdeteksi sebagai **Next.js** — tidak perlu ubah pengaturan build.
   - Build Command: `next build` (default)
   - Output Directory: default (`.next`)
4. Klik **Deploy**. Setelah selesai, aplikasi dapat diakses melalui domain `*.vercel.app`
   yang diberikan (atau domain kustom yang ditambahkan di pengaturan project Vercel).

Alternatif tanpa GitHub, menggunakan Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Struktur proyek

```
app/
  layout.tsx     -> layout root + metadata halaman
  page.tsx       -> seluruh logika form & preview naskah dinas
  globals.css    -> Tailwind directives + style cetak (print)
```

## Catatan

Aplikasi ini adalah **alat bantu penyusunan draf**, bukan pengganti alur resmi.
Naskah final tetap wajib diperiksa dan diunggah melalui SRIKANDI sesuai prosedur
pada tab "Panduan SRIKANDI" di aplikasi.
