# Panduan Template Naskah Dinas

Folder ini isinya file **Word asli (.docx)** yang jadi cetakan (template) untuk tiap
jenis naskah dinas. Sistem akan mengisi bagian yang berubah-ubah (nomor, tanggal, isi,
dst) langsung ke file ini, dan hasilnya persis format aslinya — tidak ada yang
"ditiru ulang" lewat kode.

## 1. Nama file (WAJIB persis seperti ini)

Taruh file `.docx` di folder ini, dengan nama file **persis** seperti berikut
(huruf kecil semua, pakai tanda hubung `-`, bukan spasi). Total ada **7 file**,
karena **Surat Dinas Daerah** dan **Surat Perintah/Surat Tugas** masing-masing
punya **2 file terpisah** — satu untuk mode "1 halaman / tanpa lampiran", satu
lagi untuk mode "dengan lampiran". Pengguna nanti tinggal pilih mode di formulir,
dan sistem otomatis pakai file yang sesuai — bukan satu file dengan tag kondisi.

| Jenis Naskah Dinas | Mode | Nama file yang harus dipakai |
|---|---|---|
| Surat Dinas Daerah | Cukup 1 halaman | `surat-dinas.docx` |
| Surat Dinas Daerah | Dengan lampiran (banyak halaman) | `surat-dinas-lampiran.docx` |
| Surat Undangan Daerah | — | `undangan.docx` |
| Memorandum | — | `memorandum.docx` |
| Nota Dinas | — | `nota-dinas.docx` |
| Surat Perintah/Surat Tugas | Tanpa lampiran (1 halaman) | `surat-perintah-tugas.docx` |
| Surat Perintah/Surat Tugas | Dengan lampiran (banyak nama) | `surat-perintah-tugas-lampiran.docx` |

Kalau nama filenya beda dikit aja (misal `Surat_Dinas.docx`, `surat dinas.docx`,
atau `surat-dinas-Lampiran.docx`), sistem tidak akan menemukan filenya. Harus sama
persis dengan tabel di atas.

Kamu tidak wajib upload ke-7nya sekaligus — upload satu-satu juga tidak apa. Kalau
suatu file belum ada, sistem otomatis fallback ke generator kode lama untuk
kombinasi jenis+mode itu (lihat bagian 6), jadi fitur yang sudah ada tidak rusak.

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

Field seperti **Tembusan**, **Menimbang**, **Mengingat**, **Kepada**, **Untuk**,
**Daftar Diundang**, dan **Daftar Lampiran** jumlah barisnya tidak tetap (kadang 2
baris, kadang 5 baris). Untuk ini pakai tag **loop** — dibuka dengan `{#namaTag}`
dan ditutup `{/namaTag}`, lalu isi yang mau diulang taruh **di antara** keduanya,
dalam paragraf yang sama:

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

## 4b. Halaman lampiran — file terpisah, bukan tag kondisi

Untuk **Surat Dinas Daerah** dan **Surat Perintah/Surat Tugas**, halaman lampiran
DITULIS LANGSUNG di file `...-lampiran.docx` masing-masing (lihat tabel di bagian
1) — tidak perlu tag kondisi apa pun. Cukup:

1. Buka file `surat-dinas.docx` (atau `surat-perintah-tugas.docx`) yang versi
   tanpa lampiran, **Save As** dengan nama `surat-dinas-lampiran.docx` (atau
   `surat-perintah-tugas-lampiran.docx`).
2. Di file baru itu, setelah badan surat/tanda tangan selesai, tekan
   **Ctrl+Enter** untuk Page Break, lalu ketik halaman lampirannya, misalnya:

   ```
   LAMPIRAN SURAT
   NOMOR: {nomor}
   TANGGAL: {tempatTanggal}

   {#daftarLampiranList}
   {.}
   {/daftarLampiranList}
   ```

3. Khusus **Surat Perintah/Surat Tugas** versi lampiran: di bagian "Kepada" pada
   badan surat, JANGAN pakai `{#kepadaList}` lagi (itu cuma dipakai di file versi
   tanpa lampiran). Ganti dengan kalimat rujukan biasa:

   ```
   Kepada :
   Sebagaimana tercantum dalam Lampiran Surat Tugas ini.
   ```

   Nama-nama yang ditugaskan cukup ditulis di halaman lampiran pakai loop
   `{#daftarLampiranList} {.} {/daftarLampiranList}` seperti contoh di poin 2.

Dengan cara ini, tiap file isinya tetap dan tidak perlu diotak-atik pengguna —
sistem yang otomatis memilih file `surat-dinas.docx` vs `surat-dinas-lampiran.docx`
(begitu juga untuk surat tugas) sesuai mode yang dipilih di formulir.

## 5. Daftar lengkap tag per jenis naskah dinas

### Semua jenis (kop surat)
```
{namaSatker}  {alamatSatker}  {homepageSatker}  {emailSatker}
```

### Surat Dinas Daerah, mode 1 halaman → `surat-dinas.docx`
```
{nomor}  {sifat}  {lampiran}  {hal}  {tempatTanggal}  {yth}
{alineaPembuka}  {alineaIsi}  {alineaPenutup}
{jabatanPengirim}  {namaPengirim}

Loop: {#tembusanList} {.} {/tembusanList}
```

### Surat Dinas Daerah, mode dengan lampiran → `surat-dinas-lampiran.docx`
```
Sama seperti di atas, ditambah halaman lampiran (lihat bagian 4b):
Loop: {#daftarLampiranList} {.} {/daftarLampiranList}
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

### Surat Perintah/Surat Tugas, mode tanpa lampiran → `surat-perintah-tugas.docx`
```
{nomor}  {tempatTanggal}  {jabatanPengirim}  {namaPengirim}

Loop: {#menimbangList} {.} {/menimbangList}
Loop: {#mengingatList} {.} {/mengingatList}
Loop: {#kepadaList} {.} {/kepadaList}
Loop: {#untukList} {.} {/untukList}
```

### Surat Perintah/Surat Tugas, mode dengan lampiran → `surat-perintah-tugas-lampiran.docx`
```
{nomor}  {tempatTanggal}  {jabatanPengirim}  {namaPengirim}

Loop: {#menimbangList} {.} {/menimbangList}
Loop: {#mengingatList} {.} {/mengingatList}
Loop: {#untukList} {.} {/untukList}

"Kepada" pakai kalimat rujukan biasa (bukan loop, lihat bagian 4b), lalu di
halaman lampiran: Loop {#daftarLampiranList} {.} {/daftarLampiranList}
```

## 6. Setelah upload

1. Upload file `.docx` (satu-satu juga tidak apa) ke folder `public/templates/`
   di GitHub — cara upload sama seperti file lain sebelumnya (Add file → Upload
   files).
2. Kasih tau aku jenis naskah dinas + mode mana yang sudah kamu upload, nanti aku
   cek apakah tag-nya sudah kebaca benar oleh sistem, dan aku betulkan kalau ada
   yang meleset.
3. Kalau suatu jenis+mode belum ada file template-nya, sistem otomatis tetap pakai
   cara lama (generate dari kode) supaya fitur yang sudah ada tidak rusak
   sementara migrasi berjalan pelan-pelan, satu file per satu file.
