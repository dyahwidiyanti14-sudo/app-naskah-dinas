# Panduan Template Naskah Dinas

Folder ini isinya file **Word asli (.docx)** yang jadi cetakan (template) untuk tiap
jenis naskah dinas. Sistem akan mengisi bagian yang berubah-ubah (nomor, tanggal, isi,
dst) langsung ke file ini, dan hasilnya persis format aslinya — tidak ada yang
"ditiru ulang" lewat kode.

## 1. Nama file (WAJIB persis seperti ini)

Taruh 5 file `.docx` di folder ini, dengan nama file **persis** seperti berikut
(huruf kecil semua, pakai tanda hubung `-`, bukan spasi):

| Jenis Naskah Dinas | Nama file yang harus dipakai |
|---|---|
| Surat Dinas Daerah | `surat-dinas.docx` |
| Surat Undangan Daerah | `undangan.docx` |
| Memorandum | `memorandum.docx` |
| Nota Dinas | `nota-dinas.docx` |
| Surat Perintah/Surat Tugas | `surat-perintah-tugas.docx` |

Kalau nama filenya beda dikit aja (misal `Surat_Dinas.docx` atau `surat dinas.docx`),
sistem tidak akan menemukan filenya. Harus sama persis dengan tabel di atas.

## 2. Cara menandai bagian yang harus diisi otomatis

Di dalam file Word aslinya, ganti teks yang seharusnya berubah-ubah (misal nomor
surat, tanggal, isi surat) dengan **tag** berbentuk kurung kurawal satu:

```
{namaTag}
```

Contoh langsung di badan surat:

> Nomor : {nomor}
> Sifat : {sifat}
> Hal : {hal}
>
> {alineaPembuka}

**PENTING saat mengetik tag di Word:**
- Ketik tag dalam SATU kali ketik tanpa jeda (jangan diketik lalu di-edit lagi di
  tengah), karena Word kadang otomatis memecah teks jadi beberapa "potongan"
  format yang bikin tag gagal terbaca.
- Matikan dulu AutoCorrect/AutoFormat kalau bisa (Word: File → Options → Proofing →
  AutoCorrect Options → uncheck "Capitalize first letter of sentences" dsb),
  supaya `{nomor}` tidak berubah jadi `{Nomor}` otomatis.
- Kalau ragu, ketik tag di Notepad dulu, copy, lalu paste ke Word pakai
  **Paste Special → Unformatted Text** biar formatnya nggak berantakan.

## 3. Tag untuk teks biasa (satu baris)

Tinggal tulis `{namaTag}` sesuai daftar di bagian 5 di bawah, taruh di posisi
yang benar di layout Word kamu. Tidak perlu formula apa pun.

## 4. Tag untuk daftar/list (tembusan, menimbang, kepada, dll — jumlah baris bisa beda-beda)

Field seperti **Tembusan**, **Menimbang**, **Mengingat**, **Kepada**, **Untuk**, dan
**Daftar Diundang** jumlah barisnya tidak tetap (kadang 2 baris, kadang 5 baris).
Untuk ini pakai tag **loop** — dibuka dengan `{#namaTag}` dan ditutup `{/namaTag}`,
lalu isi yang mau diulang taruh **di antara** keduanya, dalam paragraf yang sama:

```
Tembusan:
{#tembusanList}
{.}
{/tembusanList}
```

Titik (`{.}`) artinya "isi baris ini". Setiap baris yang kamu tulis di formulir
(dipisah Enter) akan jadi 1 baris berulang mengikuti pola paragraf di atas.

**Aturan penting untuk loop:** `{#namaTag}`, `{.}`, dan `{/namaTag}` harus masing-masing
ada di **paragraf/baris terpisah** (tekan Enter setelahnya) persis seperti contoh —
jangan digabung dalam satu baris yang sama.

## 4b. Tag kondisi (dipakai untuk halaman lampiran yang OPSIONAL)

Untuk **Surat Dinas Daerah** dan **Surat Perintah/Surat Tugas**, penggunanya nanti
akan ditanya lebih dulu: suratnya **1 halaman saja** atau **pakai lampiran** (jadi
lebih dari 1 halaman). Kalau pilih "pakai lampiran", sistem mengirim tag
`adaLampiran` bernilai `true`; kalau tidak, `false`.

Di template Word, bungkus **seluruh halaman lampiran** (termasuk page break-nya)
pakai kondisi `{#adaLampiran}...{/adaLampiran}` supaya halaman itu HANYA muncul
kalau pengguna memang memilih mode "dengan lampiran":

```
{#adaLampiran}
[tekan Ctrl+Enter di sini untuk Page Break, lalu buat halaman lampiran]

LAMPIRAN SURAT
NOMOR: {nomor}
TANGGAL: {tempatTanggal}

{#daftarLampiranList}
{.}
{/daftarLampiranList}
{/adaLampiran}
```

**Cara paling aman supaya page break-nya juga ikut "hilang" saat adaLampiran
bernilai false:** taruh page break itu SEBAGAI PARAGRAF PERTAMA di dalam blok
`{#adaLampiran}`, bukan sebelum tag pembuka `{#adaLampiran}` — karena apa pun di
luar blok kondisi akan selalu tercetak.

Kalau untuk Surat Perintah/Surat Tugas kamu memilih mode "dengan lampiran", daftar
nama TIDAK usah ditulis lagi di badan surat (di bagian "Kepada") — cukup tulis
kalimat rujukan, dan bungkus juga dengan kondisi supaya kalimat "Kepada: 1. ..., 2.
..." (versi tanpa lampiran) tidak ikut muncul:

```
Kepada :
{#adaLampiran}
Sebagaimana tercantum dalam Lampiran Surat Tugas ini.
{/adaLampiran}
{^adaLampiran}
{#kepadaList}
{.}
{/kepadaList}
{/adaLampiran}
```

(`{^adaLampiran}...{/adaLampiran}` adalah kebalikan dari `{#adaLampiran}` — isinya
hanya muncul kalau `adaLampiran` bernilai `false`.)

## 5. Daftar lengkap tag per jenis naskah dinas

### Semua jenis (kop surat)
```
{namaSatker}  {alamatSatker}  {homepageSatker}  {emailSatker}
```

### Surat Dinas Daerah → `surat-dinas.docx`
```
{nomor}  {sifat}  {lampiran}  {hal}  {tempatTanggal}  {yth}
{alineaPembuka}  {alineaIsi}  {alineaPenutup}
{jabatanPengirim}  {namaPengirim}

Loop: {#tembusanList} {.} {/tembusanList}

Kondisi (lihat bagian 4b): {adaLampiran}
Loop lampiran (di dalam blok {#adaLampiran}): {#daftarLampiranList} {.} {/daftarLampiranList}
```

### Surat Undangan Daerah → `undangan.docx`
```
{nomor}  {sifat}  {lampiran}  {hal}  {tempatTanggal}  {yth}
{alineaPembuka}  {hariTanggal}  {waktu}  {tempatAcara}  {acara}  {alineaPenutup}
{jabatanPengirim}  {namaPengirim}

Loop: {#tembusanList} {.} {/tembusanList}
Loop: {#daftarDiundangList} {.} {/daftarDiundangList}
```

### Memorandum → `memorandum.docx`
```
{nomor}  {yth}  {hal}  {isi}  {tempatTanggal}
{jabatanPengirim}  {namaPengirim}

Loop: {#tembusanList} {.} {/tembusanList}
```

### Nota Dinas → `nota-dinas.docx`
```
{nomor}  {yth}  {dari}  {hal}  {tanggal}  {isi}  {namaPengirim}

Loop: {#tembusanList} {.} {/tembusanList}
```

### Surat Perintah/Surat Tugas → `surat-perintah-tugas.docx`
```
{nomor}  {tempatTanggal}  {jabatanPengirim}  {namaPengirim}

Loop: {#menimbangList} {.} {/menimbangList}
Loop: {#mengingatList} {.} {/mengingatList}
Loop: {#untukList} {.} {/untukList}

"Kepada" berbeda tergantung mode (lihat bagian 4b):
Kondisi: {adaLampiran}
- Mode tanpa lampiran (adaLampiran = false): Loop {#kepadaList} {.} {/kepadaList}
- Mode dengan lampiran (adaLampiran = true): kalimat rujukan + halaman lampiran
  berisi Loop {#daftarLampiranList} {.} {/daftarLampiranList}
```

## 6. Setelah upload

1. Upload ke-5 file `.docx` (atau upload satu-satu dulu, tidak apa) ke folder
   `public/templates/` di GitHub — cara upload sama seperti file lain sebelumnya
   (Add file → Upload files).
2. Kasih tau aku jenis naskah dinas mana yang sudah kamu upload, nanti aku cek
   apakah tag-nya sudah kebaca benar oleh sistem, dan aku betulkan kalau ada yang
   meleset.
3. Kalau suatu jenis belum ada file template-nya, sistem otomatis tetap pakai
   cara lama (generate dari kode) supaya fitur yang sudah ada tidak rusak
   sementara migrasi berjalan pelan-pelan, satu jenis per satu jenis.
