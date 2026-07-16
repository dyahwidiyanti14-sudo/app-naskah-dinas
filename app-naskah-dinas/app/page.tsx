"use client";

import { useMemo, useState } from "react";
import type {
  NaskahType,
  SatkerInfo,
  SuratDinasForm,
  UndanganForm,
  MemorandumForm,
  NotaDinasForm,
  SuratPerintahTugasForm,
} from "./lib/types";

/* ------------------------------------------------------------------ */
/*  Static config                                                      */
/* ------------------------------------------------------------------ */

const NASKAH_TABS: { key: NaskahType; label: string; desc: string }[] = [
  { key: "surat_dinas", label: "Surat Dinas Daerah", desc: "Korespondensi resmi ke instansi/pejabat lain" },
  { key: "undangan", label: "Surat Undangan Daerah", desc: "Pengganti memo/nota dinas untuk undangan rapat internal" },
  { key: "memorandum", label: "Memorandum", desc: "Komunikasi internal antar pejabat setingkat" },
  { key: "nota_dinas", label: "Nota Dinas", desc: "Komunikasi internal, tanpa jabatan pengirim" },
  { key: "surat_perintah_tugas", label: "Surat Perintah/Surat Tugas", desc: "Penugasan atau perintah kepada pegawai" },
];

const DEFAULT_SATKER: SatkerInfo = {
  nama: "BADAN PUSAT STATISTIK\nPROVINSI JAWA TENGAH",
  alamat: "Jalan Pahlawan Nomor 6 Semarang 50241 Telp. (024) 8412802, Fax (024) 8311195",
  homepage: "http://jateng.bps.go.id/",
  email: "bps3300@bps.go.id",
};

const SRIKANDI_LINK = "https://srikandi.arsip.go.id/";
const DASAR_SURAT = "B-1394/33000/KA.220/2026, 7 Juli 2026 — Penegasan kembali Tata Naskah Dinas";
const ADDENDUM_SURAT = "Tambahan penegasan Tata Naskah Dinas — Ketentuan Tanda Tangan pada Lampiran Surat";

const TEMPLATE_LINKS: Record<NaskahType, string> = {
  surat_dinas:
    "https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas/blob/e944217563d336dd8fc6e56d1c7f7d6c6d02ca78/template%20surat%20dinas%2C%20memorandum%2C%20nota%20dinas/surat%20dinas%20daerah%20%2B%20logo%20SE2026%20-%20KOP%20BPS%20Provinsi%20(2).docx",
  undangan:
    "https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas/blob/e944217563d336dd8fc6e56d1c7f7d6c6d02ca78/template%20surat%20dinas%2C%20memorandum%2C%20nota%20dinas/surat%20dinas%20daerah%20%2B%20logo%20SE2026%20-%20KOP%20BPS%20Provinsi%20(2).docx",
  memorandum:
    "https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas/blob/e944217563d336dd8fc6e56d1c7f7d6c6d02ca78/template%20surat%20dinas%2C%20memorandum%2C%20nota%20dinas/memorandum.docx",
  nota_dinas:
    "https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas/blob/e944217563d336dd8fc6e56d1c7f7d6c6d02ca78/template%20surat%20dinas%2C%20memorandum%2C%20nota%20dinas/nota%20dinas%20(1).docx",
  surat_perintah_tugas:
    "https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas/blob/e944217563d336dd8fc6e56d1c7f7d6c6d02ca78/template%20surat%20dinas%2C%20memorandum%2C%20nota%20dinas/surat%20perintah_surat%20tugas%20daerah.docx",
};

const REPO_LINK = "https://github.com/dyahwidiyanti14-sudo/template-naskah-dinas";

const SIGNATURE_LAMPIRAN_RULE =
  'Tanda Tangan di Lampiran Surat — jika surat ditandatangani basah/konvensional, lampiran surat WAJIB turut ada tanda tangan. Jika surat ditandatangani secara Elektronik/Srikandi, lampiran surat TIDAK PERLU ada tanda tangan.';

const RULES: Record<NaskahType, string[]> = {
  surat_dinas: [
    "Font Arial 12.",
    "Margin halaman: atas 2 cm, kiri 2,5 cm, bawah 2,5 cm, kanan 2,5 cm.",
    "Nomor naskah TIDAK memakai derajat keamanan (B/T), contoh: 1130/33510/VS.220/2026.",
    "Tujuan surat (Yth.) posisi sejajar garis lurus, tidak menjorok.",
    "Jika lebih dari 1 halaman, tiap halaman diberi nomor di bagian atas tengah (-2-, -3-, dst).",
    'Lampiran surat ditulis di sebelah kanan, memuat kata "Lampiran", nomor, dan tanggal surat. Jika lebih dari satu, ditulis "Lampiran 1 Surat", "Lampiran 2 Surat", dst.',
    "Jika badan surat lebih dari 1 halaman, akhir halaman pertama diberi kata sambung di pojok kanan bawah berupa kata pertama halaman berikutnya.",
    "Jabatan pengirim diberi tanda koma di akhir, nama pengirim tanpa gelar.",
    SIGNATURE_LAMPIRAN_RULE,
    "Tentukan dulu di kotak pilihan mode: cukup 1 halaman, atau dengan lampiran (halaman lampiran otomatis mengikuti format nomor & tanggal surat).",
  ],
  undangan: [
    "Menggantikan memorandum/nota dinas untuk undangan rapat internal (memo/nota dinas tidak berlaku lagi untuk keperluan ini).",
    "Font Arial 12, nomor naskah tanpa derajat keamanan.",
    "Margin halaman: atas 2 cm, kiri 2,5 cm, bawah 2,5 cm, kanan 2,5 cm.",
    "Wajib mencantumkan hari/tanggal, pukul, dan tempat acara secara eksplisit.",
    "Jika daftar pejabat/pegawai yang diundang panjang, dibuat sebagai lampiran surat tersendiri.",
    "Jabatan pengirim diberi tanda koma di akhir, nama pengirim tanpa gelar.",
    SIGNATURE_LAMPIRAN_RULE,
  ],
  memorandum: [
    "Font Arial 12.",
    "Margin halaman: atas 2 cm, kiri 2,5 cm, bawah 2,5 cm, kanan 2 cm.",
    "Kop hanya memuat nama satuan kerja (tanpa alamat/telepon/homepage/e-mail).",
    "Nomor naskah TIDAK memakai derajat keamanan (B/T).",
    "Jabatan pengirim diberi tanda koma di akhir.",
    "Nama pengirim tidak dilengkapi gelar dan tidak diberi garis bawah.",
  ],
  nota_dinas: [
    "Font Arial 12.",
    "Margin halaman: atas 2 cm, kiri 2,5 cm, bawah 2,5 cm, kanan 2 cm.",
    "Kop hanya memuat nama satuan kerja (tanpa alamat/telepon/homepage/e-mail).",
    "Nomor naskah TIDAK memakai derajat keamanan (B/T).",
    "TIDAK ADA jabatan pengirim yang dicantumkan (langsung tanda tangan dan nama).",
    "Nama pengirim tidak dilengkapi gelar dan tidak diberi garis bawah.",
  ],
  surat_perintah_tugas: [
    "Font Arial 12.",
    "Margin halaman: atas 2 cm, kiri 2,5 cm, bawah 2,5 cm, kanan 2,5 cm.",
    "Kop hanya memuat nama satuan kerja (tanpa alamat/telepon/homepage/e-mail).",
    'Menimbang diberi huruf berurutan (a, b, c, ...), tiap butir diakhiri titik koma, butir terakhir diakhiri titik.',
    "Mengingat diberi angka berurutan (1, 2, 3, ...).",
    'Bagian "Memberi Perintah/Memberi Tugas" dicetak tebal, rata tengah, sebagai pemisah sebelum Kepada dan Untuk.',
    'Kepada dan Untuk diberi angka berurutan; jika lebih dari satu pihak/kegiatan ditutup dengan "dan seterusnya."',
    "Jabatan pengirim diberi tanda koma di akhir, nama pengirim tanpa gelar.",
    "Tentukan dulu di kotak pilihan mode: tanpa lampiran (1 halaman) atau dengan lampiran (nama-nama dipindah ke Lampiran Surat Tugas tersendiri).",
  ],
};

const SRIKANDI_STEPS: { group: string; steps: string[] }[] = [
  {
    group: "A. Registrasi naskah keluar",
    steps: [
      "Pilih menu Naskah Keluar → Registrasi Naskah Keluar.",
      "Pilih Tipe Form → Naskah Keluar.",
      "Dikirimkan melalui → ketik nama satker pencipta surat (misalnya: BPS Provinsi Jawa Tengah, BPS Kabupaten Cilacap, dst).",
      "Pilih Jenis Naskah, misalnya Surat Dinas Keluar (lazim untuk korespondensi eksternal).",
      "Sifat Naskah → pilih Biasa.",
      "Pilih Klasifikasi sesuai kode klasifikasi surat, misalnya HM.310 Hubungan Antar Lembaga.",
      "Isikan Nomor Naskah.",
      "Isikan Perihal surat.",
      "Isi Ringkas surat — bisa disamakan dengan perihal.",
      "Unggah File Naskah; pastikan template surat sudah sesuai Perka BPS No. 1 Tahun 2023.",
      "Klik Browse untuk memilih sumber file yang akan diunggah.",
      "Pastikan nama file yang diunggah TIDAK mengandung simbol dan numerik (tanda : - _ ( ) @ dsb).",
    ],
  },
  {
    group: "B. Tujuan, verifikator, dan penandatangan",
    steps: [
      "Lampiran Naskah diisi jika ada lampiran selain yang sudah ada di surat (JPG, PDF, XLS, PPT, dsb).",
      "Grup Tujuan dipilih jika tujuan naskah sudah dikelompokkan dalam grup (menu Pengguna → Grup Tujuan Naskah).",
      "Utama (Internal/Eksternal Srikandi) diisi per satuan tujuan bila tujuan tidak dalam grup; pastikan tujuan sudah terdaftar di menu Pengguna → Tujuan Naskah.",
      "Grup Tembusan / Tembusan diisi bila ada tujuan tembusan surat; kosongkan bila tidak ada.",
      "Verifikator diisi pejabat yang memberi verifikasi (setara paraf di surat konvensional), misalnya Kasubbag/Kepala Bagian Umum.",
      "Penandatangan diisi pejabat yang akan menandatangani surat.",
      "Tipe Tanda Tangan → pilih Elektronik.",
      "Visual TTE → pilih QR Code.",
      "Klik Simpan.",
    ],
  },
  {
    group: "C. Preview, koreksi, dan pengiriman",
    steps: [
      "Buka menu Naskah Keluar → Log Naskah Keluar, cari surat yang telah dibuat.",
      "Klik ikon Pensil bila surat masih perlu diperbaiki, atau ikon Mata untuk melihat preview PDF.",
      "Pada preview, periksa posisi barcode/QR code — jika belum presisi, perbaiki lagi lewat ikon Pensil.",
      "Setelah ada perubahan, klik Perbarui PDF agar preview menampilkan hasil terbaru.",
      "Jika file yang diunggah berformat Ms Word, pilih Text Editor untuk mengedit naskah langsung di Srikandi.",
      'Di Text Editor, sesuaikan posisi tanda tangan pengirim dengan menambahkan tanda "$" di depannya (contoh: $ttd_pengirim) agar sistem bisa membaca posisi barcode TTE, lalu klik Kembali.',
      "Setelah edit, klik Perbarui Naskah supaya hasil edit terbaca sistem, lalu cek ulang preview via ikon Mata dan klik Perbarui PDF.",
      "Jika preview surat sudah sesuai, klik Kirim Konsep ke verifikator untuk diverifikasi dan dilanjutkan ke penandatangan.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function withComma(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return t.endsWith(",") ? t : `${t},`;
}

function linesOrDash(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function letterAt(i: number): string {
  // a, b, c, ... z, aa, ab, ...
  let n = i;
  let s = "";
  do {
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

// Baris jabatan pengirim boleh ditulis lebih dari 1 baris (mis. jabatan panjang
// dipecah 2 baris seperti nama satker). Koma penutup otomatis di baris terakhir saja.
function jabatanLines(text: string): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((l, i) => (i === lines.length - 1 ? withComma(l) : l));
}

// Memorandum & Nota Dinas TIDAK boleh memakai derajat keamanan (kode "B-"/"T-").
function hasSecurityCodePrefix(nomor: string): boolean {
  return /^[bt]-/i.test(nomor.trim());
}

// Deteksi baris bernomor ("1. ...") dan berhuruf ("a. ...") di dalam teks isi bebas
// (Memorandum/Nota Dinas), supaya bisa dirender sebagai daftar dengan hanging indent
// yang rapi, alih-alih paragraf polos yang teksnya "berantakan" saat baris terbungkus.
// Baris polos yang diawali karakter Tab diberi first-line indent (menekan tombol Tab
// di kotak isian akan menyisipkan indentasi ini), konsisten dengan hasil .docx.
interface BodyLine {
  type: "p" | "num" | "sub";
  marker?: string;
  text: string;
  indent?: boolean;
}

function parseBodyLines(text: string): BodyLine[] {
  return text
    .split("\n")
    .map((raw) => ({ hasTab: /^[\t ]*\t/.test(raw) || /^ {4,}/.test(raw), trimmed: raw.trim() }))
    .filter((l) => l.trimmed.length > 0)
    .map(({ trimmed: raw, hasTab }) => {
      const numMatch = raw.match(/^(\d{1,2})\.\s*(.*)$/);
      if (numMatch) return { type: "num" as const, marker: `${numMatch[1]}.`, text: numMatch[2] };
      const subMatch = raw.match(/^([a-zA-Z])\.\s*(.*)$/);
      if (subMatch) return { type: "sub" as const, marker: `${subMatch[1].toLowerCase()}.`, text: subMatch[2] };
      return { type: "p" as const, text: raw, indent: hasTab };
    });
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function NaskahDinasPage() {
  const [view, setView] = useState<"buat" | "srikandi" | "pedoman">("buat");
  const [naskahType, setNaskahType] = useState<NaskahType>("surat_dinas");
  const [satker, setSatker] = useState<SatkerInfo>(DEFAULT_SATKER);
  const [copied, setCopied] = useState(false);

  // Mode edit (form) <-> mode preview penuh, sebelum naskah diunduh
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [confirmed, setConfirmed] = useState(false);
  const [downloading, setDownloading] = useState<"docx" | "pdf" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function openPreview() {
    setConfirmed(false);
    setDownloadError(null);
    setMode("preview");
  }

  function backToEdit() {
    setMode("edit");
  }

  const [suratDinas, setSuratDinas] = useState<SuratDinasForm>({
    nomor: "",
    sifat: "Biasa",
    lampiran: "-",
    hal: "",
    tempatTanggal: "",
    yth: "",
    alineaPembuka: "",
    alineaIsi: "",
    alineaPenutup: "Demikian disampaikan, atas perhatian dan kerja sama Saudara, kami ucapkan terima kasih.",
    jabatanPengirim: "",
    namaPengirim: "",
    tembusan: "",
    modeSurat: "1_halaman",
    daftarLampiran: "",
  });

  const [undangan, setUndangan] = useState<UndanganForm>({
    nomor: "",
    sifat: "Biasa",
    lampiran: "1 (satu) set",
    hal: "",
    tempatTanggal: "",
    yth: "",
    alineaPembuka: "",
    hariTanggal: "",
    waktu: "",
    tempatAcara: "",
    acara: "",
    alineaPenutup: "Demikian disampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.",
    jabatanPengirim: "",
    namaPengirim: "",
    tembusan: "",
    daftarDiundang: "",
  });

  const [memorandum, setMemorandum] = useState<MemorandumForm>({
    nomor: "",
    yth: "",
    hal: "",
    isi: "",
    tempatTanggal: "",
    jabatanPengirim: "",
    namaPengirim: "",
    tembusan: "",
  });

  const [notaDinas, setNotaDinas] = useState<NotaDinasForm>({
    nomor: "",
    yth: "",
    dari: "",
    hal: "",
    tanggal: "",
    isi: "",
    namaPengirim: "",
    tembusan: "",
  });

const [suratPerintahTugas, setSuratPerintahTugas] = useState<SuratPerintahTugasForm>({
    nomor: "",
    tempatTanggal: "",
    dasarSurat: "",
    menimbang: "",
    mengingat: "",
    kepada: "",
    untuk: "",
    jabatanPengirim: "",
    namaPengirim: "",
    modeSurat: "tanpa_lampiran",
    daftarLampiran: "",
  });

  const plainText = useMemo(() => {
    const head = `${satker.nama.replace(/\n/g, " ")}\n${satker.alamat}\nHomepage: ${satker.homepage}  E-mail: ${satker.email}`;
    const headShort = satker.nama.replace(/\n/g, " ");

    if (naskahType === "surat_dinas") {
      const f = suratDinas;
      return [
        head,
        "",
        `Nomor    : ${f.nomor || "…"}`,
        `Sifat    : ${f.sifat || "…"}`,
        `Lampiran : ${f.lampiran || "-"}`,
        `Hal      : ${f.hal || "…"}`,
        "",
        f.tempatTanggal || "…, … 20…",
        "",
        "Yth.",
        ...linesOrDash(f.yth || "…"),
        "di –",
        "Tempat",
        "",
        f.alineaPembuka || "…",
        "",
        f.alineaIsi || "…",
        "",
        f.alineaPenutup,
        "",
        withComma(f.jabatanPengirim || "…"),
        "",
        "",
        f.namaPengirim || "…",
        ...(linesOrDash(f.tembusan).length ? ["", "Tembusan:", ...linesOrDash(f.tembusan).map((t, i) => `${i + 1}. ${t}`)] : []),
        ...(f.modeSurat === "dengan_lampiran"
          ? [
              "",
              "=== HALAMAN BERIKUTNYA (LAMPIRAN) ===",
              `LAMPIRAN SURAT — NOMOR: ${f.nomor || "…"} — TANGGAL: ${f.tempatTanggal || "…"}`,
              ...(linesOrDash(f.daftarLampiran).length ? linesOrDash(f.daftarLampiran).map((t, i) => `${i + 1}. ${t}`) : ["1. …"]),
            ]
          : []),
      ].join("\n");
    }

    if (naskahType === "undangan") {
      const f = undangan;
      return [
        head,
        "",
        `Nomor    : ${f.nomor || "…"}`,
        `Sifat    : ${f.sifat || "…"}`,
        `Lampiran : ${f.lampiran || "-"}`,
        `Hal      : ${f.hal || "…"}`,
        "",
        f.tempatTanggal || "…, … 20…",
        "",
        "Yth.",
        ...linesOrDash(f.yth || "…"),
        "di –",
        "Tempat",
        "",
        f.alineaPembuka || "…",
        "",
        `pada hari/tanggal : ${f.hariTanggal || "…"}`,
        `waktu             : pukul ${f.waktu || "…"}`,
        `tempat            : ${f.tempatAcara || "…"}`,
        `acara             : ${f.acara || "…"}`,
        "",
        f.alineaPenutup,
        "",
        withComma(f.jabatanPengirim || "…"),
        "",
        "",
        f.namaPengirim || "…",
        ...(linesOrDash(f.tembusan).length ? ["", "Tembusan:", ...linesOrDash(f.tembusan).map((t, i) => `${i + 1}. ${t}`)] : []),
        ...(linesOrDash(f.daftarDiundang).length
          ? ["", "-- Lampiran: Daftar Pejabat/Pegawai yang Diundang --", ...linesOrDash(f.daftarDiundang).map((t, i) => `${i + 1}. ${t}`)]
          : []),
      ].join("\n");
    }

    if (naskahType === "memorandum") {
      const f = memorandum;
      return [
        head,
        "",
        "MEMORANDUM",
        `NOMOR ${f.nomor || "…"}`,
        "",
        `Yth. : ${f.yth || "…"}`,
        `Hal  : ${f.hal || "…"}`,
        "",
        f.isi || "…",
        "",
        f.tempatTanggal || "…, … 20…",
        withComma(f.jabatanPengirim || "…"),
        "",
        "",
        f.namaPengirim || "…",
        ...(linesOrDash(f.tembusan).length ? ["", "Tembusan:", ...linesOrDash(f.tembusan).map((t, i) => `${i + 1}. ${t}`)] : []),
      ].join("\n");
    }

    if (naskahType === "nota_dinas") {
      const f = notaDinas;
      return [
        head,
        "",
        "NOTA DINAS",
        `NOMOR ${f.nomor || "…"}`,
        "",
        `Yth.     : ${f.yth || "…"}`,
        `Dari     : ${f.dari || "…"}`,
        `Hal      : ${f.hal || "…"}`,
        `Tanggal  : ${f.tanggal || "…"}`,
        "",
        f.isi || "…",
        "",
        "",
        "",
        f.namaPengirim || "…",
        ...(linesOrDash(f.tembusan).length ? ["", "Tembusan:", ...linesOrDash(f.tembusan).map((t, i) => `${i + 1}. ${t}`)] : []),
      ].join("\n");
    }

    // surat_perintah_tugas
    const f = suratPerintahTugas;
    const menimbangLines = linesOrDash(f.menimbang);
    const mengingatLines = linesOrDash(f.mengingat);
    const kepadaLines = linesOrDash(f.kepada);
    const untukLines = linesOrDash(f.untuk);
    return [
     headShort,
      "",
      "SURAT PERINTAH/SURAT TUGAS",
      `NOMOR ${f.nomor || "…"}`,
      "",
      `Dasar : ${f.dasarSurat || "…"}`,
      "",
      "Menimbang :",
      ...(menimbangLines.length ? menimbangLines.map((t, i) => `  ${letterAt(i)}. ${t}`) : ["  a. …"]),
      "",
      "Mengingat :",
      ...(mengingatLines.length ? mengingatLines.map((t, i) => `  ${i + 1}. ${t}`) : ["  1. …"]),
      "",
      "Memberi Perintah/Memberi Tugas",
      "",
      "Kepada :",
      ...(f.modeSurat === "dengan_lampiran"
        ? ["  Sebagaimana tercantum dalam Lampiran Surat Tugas ini."]
        : kepadaLines.length
        ? kepadaLines.map((t, i) => `  ${i + 1}. ${t}`)
        : ["  1. …"]),
      ...(f.modeSurat !== "dengan_lampiran" && kepadaLines.length > 1 ? ["  dan seterusnya."] : []),
      "",
      "Untuk :",
      ...(untukLines.length ? untukLines.map((t, i) => `  ${i + 1}. ${t}`) : ["  1. …"]),
      ...(untukLines.length > 1 ? ["  dan seterusnya."] : []),
      "",
      f.tempatTanggal || "…, … 20…",
      withComma(f.jabatanPengirim || "…"),
      "",
      "",
      f.namaPengirim || "…",
      ...(f.modeSurat === "dengan_lampiran"
        ? [
            "",
            "=== HALAMAN BERIKUTNYA (LAMPIRAN SURAT TUGAS) ===",
            `LAMPIRAN SURAT TUGAS — NOMOR: ${f.nomor || "…"} — TANGGAL: ${f.tempatTanggal || "…"}`,
            ...(linesOrDash(f.daftarLampiran).length ? linesOrDash(f.daftarLampiran).map((t, i) => `${i + 1}. ${t}`) : ["1. …"]),
          ]
        : []),
    ].join("\n");
  }, [naskahType, satker, suratDinas, undangan, memorandum, notaDinas, suratPerintahTugas]);

  async function handleCopy() {
    const ok = await copyText(plainText);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  }

async function handleDownloadDocx() {
    setDownloadError(null);
    if (naskahType === "surat_perintah_tugas" && !suratPerintahTugas.dasarSurat.trim()) {
      setDownloadError(
        "Dasar/Lampiran wajib diisi — cantumkan surat undangan atau surat dinas lain yang mendasari Surat Perintah/Surat Tugas ini sebelum mengunduh."
      );
      return;
    }
    if (naskahType === "surat_perintah_tugas" && suratPerintahTugas.modeSurat === "dengan_lampiran" && !suratPerintahTugas.daftarLampiran.trim()) {
      setDownloadError(
        'Kamu memilih mode "dengan lampiran" — isi dulu Daftar Lampiran (nama-nama yang ditugaskan) sebelum mengunduh.'
      );
      return;
    }
    if (naskahType === "surat_dinas" && suratDinas.modeSurat === "dengan_lampiran" && !suratDinas.daftarLampiran.trim()) {
      setDownloadError(
        'Kamu memilih mode "dengan lampiran" — isi dulu Daftar Lampiran sebelum mengunduh.'
      );
      return;
    }
    setDownloading("docx");
    try {
      const data = { naskahType, satker, suratDinas, undangan, memorandum, notaDinas, suratPerintahTugas };
      const { templateExists, generateFromTemplateBlob } = await import("./lib/generateFromTemplate");
      const { generateNaskahDocxBlob, suggestedFileName } = await import("./lib/generateDocx");

      // Kalau template Word asli untuk jenis naskah ini sudah diupload ke
      // public/templates/, pakai itu (hasil 100% sama format aslinya).
      // Kalau belum ada, tetap pakai generator kode lama supaya fitur tidak rusak.
      const hasTemplate = await templateExists(naskahType);
      const blob = hasTemplate
        ? await generateFromTemplateBlob(data)
        : await generateNaskahDocxBlob(data);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedFileName(data);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal membuat file Word. Silakan coba lagi.";
      setDownloadError(message);
    } finally {
      setDownloading(null);
    }
  }

  function handleDownloadPdf() {
    setDownloadError(null);
    setDownloading("pdf");
    // Cara paling stabil lintas-browser untuk menghasilkan PDF tanpa server:
    // memakai dialog cetak bawaan browser, lalu pilih "Simpan sebagai PDF".
    window.setTimeout(() => {
      window.print();
      setDownloading(null);
    }, 50);
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <header className="border-b border-white/10 bg-ink/95 backdrop-blur px-5 py-6 md:px-10 no-print sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-ink font-black text-sm shadow-lg shadow-orange-900/30">
              BPS
            </div>
            <div>
              <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-1">
                Tata Naskah Dinas · BPS Provinsi Jawa Tengah
              </p>
              <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                Alat Bantu Penyusunan Naskah Dinas
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Isi kolom di sebelah kiri, hasilnya langsung tersusun sebagai draf surat di sebelah kanan sesuai kaidah Perka BPS No. 1 Tahun 2023.
              </p>
            </div>
          </div>
          <div className="text-slate-500 text-xs leading-relaxed md:text-right max-w-sm flex flex-col gap-0.5">
            <p>Dasar: Surat {DASAR_SURAT}</p>
            <p className="text-accent/80">+ {ADDENDUM_SURAT}</p>
          </div>
        </div>

        <nav className="max-w-[1400px] mx-auto flex gap-2 mt-6 flex-wrap">
          {[
            { key: "buat", label: "Buat Naskah Dinas" },
            { key: "srikandi", label: "Panduan SRIKANDI" },
            { key: "pedoman", label: "Pedoman Ringkas" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as typeof view)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                view === tab.key
                  ? "bg-accent text-ink shadow-sm shadow-orange-900/40"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {view === "buat" && mode === "edit" && (
        <main className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* FORM */}
          <div className="no-print flex flex-col gap-5">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">Jenis Naskah Dinas</p>
              <div className="grid grid-cols-1 gap-2">
                {NASKAH_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setNaskahType(t.key)}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      naskahType === t.key
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${naskahType === t.key ? "text-accent" : "text-white"}`}>{t.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <details className="bg-white/5 rounded-2xl p-4 border border-white/10 group">
              <summary className="text-slate-300 text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                Identitas Satuan Kerja (Kop Surat)
                <span className="text-slate-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                <Field label="Nama Satker" as="textarea" rows={2} value={satker.nama} onChange={(v) => setSatker({ ...satker, nama: v })} />
                <Field label="Alamat & Telepon" value={satker.alamat} onChange={(v) => setSatker({ ...satker, alamat: v })} />
                <Field label="Homepage" value={satker.homepage} onChange={(v) => setSatker({ ...satker, homepage: v })} />
                <Field label="E-mail" value={satker.email} onChange={(v) => setSatker({ ...satker, email: v })} />
              </div>
            </details>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Isi Naskah</p>

              {naskahType === "surat_dinas" && (
                <SuratDinasFields value={suratDinas} onChange={setSuratDinas} />
              )}
              {naskahType === "undangan" && (
                <UndanganFields value={undangan} onChange={setUndangan} />
              )}
              {naskahType === "memorandum" && (
                <MemorandumFields value={memorandum} onChange={setMemorandum} />
              )}
              {naskahType === "nota_dinas" && (
                <NotaDinasFields value={notaDinas} onChange={setNotaDinas} />
              )}
              {naskahType === "surat_perintah_tugas" && (
                <SuratPerintahTugasFields value={suratPerintahTugas} onChange={setSuratPerintahTugas} />
              )}
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-2">Aturan wajib jenis ini</p>
              <ul className="text-slate-300 text-xs leading-relaxed list-disc pl-4 flex flex-col gap-1">
                {RULES[naskahType].map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-3 rounded-xl transition-all"
              >
                {copied ? "Tersalin ✓" : "Salin Teks Naskah"}
              </button>
              <button
                onClick={openPreview}
                className="flex-1 bg-accent hover:brightness-110 text-ink font-semibold text-sm py-3 rounded-xl transition-all"
              >
                Preview Penuh →
              </button>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Untuk hasil akhir yang resmi, salin teks ini ke <em>template</em> resmi (
              <a href={TEMPLATE_LINKS[naskahType]} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                unduh template .docx
              </a>
              ) lalu unggah ke SRIKANDI mengikuti panduan pada tab &quot;Panduan SRIKANDI&quot;.
            </p>
          </div>

          {/* PREVIEW (live, mengikuti isian di sebelah kiri) */}
          <div className="flex flex-col items-center gap-4">
            <div className="print-area bg-white text-[#1e293b] w-full max-w-[820px] min-h-[1000px] shadow-2xl rounded-sm px-10 py-10 md:px-14 md:py-12" style={{ fontFamily: "Arial, sans-serif" }}>
              <LetterPreview
                naskahType={naskahType}
                satker={satker}
                suratDinas={suratDinas}
                undangan={undangan}
                memorandum={memorandum}
                notaDinas={notaDinas}
                suratPerintahTugas={suratPerintahTugas}
              />
            </div>
          </div>
        </main>
      )}

      {view === "buat" && mode === "preview" && (
        <main className="max-w-[1000px] mx-auto px-5 md:px-10 py-8 flex flex-col items-center gap-5">
          {/* Toolbar preview */}
          <div className="no-print w-full max-w-[820px] flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={backToEdit}
                className="text-sm text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                ← Kembali ke Edit
              </button>
              <p className="text-slate-500 text-xs">
                Jenis naskah: <span className="text-accent font-medium">{NASKAH_TABS.find((t) => t.key === naskahType)?.label}</span>
              </p>
            </div>

            <label className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent shrink-0"
              />
              <span className="text-sm text-slate-200">
                Saya sudah memeriksa hasil preview di bawah ini dan naskah sudah{" "}
                <span className="text-accent font-semibold">sesuai</span> — nomor, tujuan, isi, dan tanda tangan sudah benar.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadDocx}
                disabled={!confirmed || downloading !== null}
                className="flex-1 bg-accent hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-ink font-semibold text-sm py-3 rounded-xl transition-all"
              >
                {downloading === "docx" ? "Menyiapkan file…" : "Unduh Word (.docx)"}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={!confirmed || downloading !== null}
                className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-all"
              >
                {downloading === "pdf" ? "Membuka dialog cetak…" : "Unduh PDF"}
              </button>
            </div>
            {!confirmed && (
              <p className="text-slate-500 text-xs">
                Centang konfirmasi di atas untuk mengaktifkan tombol unduh.
              </p>
            )}
            {downloadError && <p className="text-red-400 text-xs">{downloadError}</p>}
            <p className="text-slate-500 text-xs leading-relaxed">
              Tombol <strong>Unduh PDF</strong> membuka dialog cetak bawaan browser — pilih tujuan{" "}
              <em>&quot;Save as PDF&quot;</em> / <em>&quot;Simpan sebagai PDF&quot;</em>. Untuk keperluan resmi via SRIKANDI, tetap gunakan{" "}
              <a href={TEMPLATE_LINKS[naskahType]} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                template .docx resmi
              </a>{" "}
              sesuai panduan pada tab &quot;Panduan SRIKANDI&quot;.
            </p>
          </div>

          {/* Preview penuh */}
          <div className="print-area bg-white text-[#1e293b] w-full max-w-[820px] min-h-[1000px] shadow-2xl rounded-sm px-10 py-10 md:px-14 md:py-12" style={{ fontFamily: "Arial, sans-serif" }}>
            <LetterPreview
              naskahType={naskahType}
              satker={satker}
              suratDinas={suratDinas}
              undangan={undangan}
              memorandum={memorandum}
              notaDinas={notaDinas}
              suratPerintahTugas={suratPerintahTugas}
            />
          </div>
        </main>
      )}

      {view === "srikandi" && (
        <main className="max-w-[900px] mx-auto px-5 md:px-10 py-10 no-print">
          <h2 className="text-white text-2xl font-bold mb-2">Panduan Membuat Surat Dinas melalui SRIKANDI</h2>
          <p className="text-slate-400 text-sm mb-8">
            Diringkas dari Lampiran 2, Surat {DASAR_SURAT}. Buka aplikasi di{" "}
            <a href={SRIKANDI_LINK} target="_blank" rel="noopener noreferrer" className="text-accent underline">
              srikandi.arsip.go.id
            </a>.
          </p>

          <div className="flex flex-col gap-8">
            {SRIKANDI_STEPS.map((group) => (
              <div key={group.group} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-accent font-semibold text-sm uppercase tracking-wide mb-4">{group.group}</h3>
                <ol className="flex flex-col gap-3">
                  {group.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-slate-200 text-sm leading-relaxed">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 text-slate-300 text-xs flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-accent/10 border border-accent/30 rounded-2xl p-6 text-slate-300 text-sm leading-relaxed">
            Informasi lebih lanjut terkait penggunaan SRIKANDI dapat menghubungi pegawai yang ditugaskan mengelola arsip di tim/subbag umum masing-masing dan/atau tim arsiparis BPS Provinsi Jawa Tengah.
          </div>
        </main>
      )}

      {view === "pedoman" && (
        <main className="max-w-[900px] mx-auto px-5 md:px-10 py-10 no-print">
          <h2 className="text-white text-2xl font-bold mb-2">Pedoman Ringkas Tata Naskah Dinas</h2>
          <p className="text-slate-400 text-sm mb-8">
            Berdasarkan Peraturan BPS Nomor 1 Tahun 2023 tentang Pedoman Tata Naskah Dinas BPS, ditegaskan kembali melalui Surat {DASAR_SURAT}. Template resmi tersedia di{" "}
            <a href={REPO_LINK} target="_blank" rel="noopener noreferrer" className="text-accent underline">
              repositori GitHub template naskah dinas
            </a>.
          </p>

          <div className="mb-8 bg-accent/10 border border-accent/30 rounded-2xl p-6">
            <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-2">Ketentuan Tambahan · Tanda Tangan di Lampiran Surat</p>
            <ul className="text-slate-200 text-sm leading-relaxed list-disc pl-4 flex flex-col gap-1.5">
              <li>
                Jika surat ditandatangani basah/<strong>konvensional</strong>, maka lampiran surat <strong>harus ada</strong> tanda tangan juga.
              </li>
              <li>
                Jika surat ditandatangani secara <strong>Elektronik/Srikandi</strong>, maka lampiran surat <strong>tidak perlu</strong> ada tanda tangan.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            {NASKAH_TABS.map((t) => (
              <div key={t.key} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <h3 className="text-white font-semibold">{t.label}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={TEMPLATE_LINKS[t.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-300 border border-white/15 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      Unduh template .docx
                    </a>
                    <button
                      onClick={() => {
                        setNaskahType(t.key);
                        setView("buat");
                      }}
                      className="text-xs text-accent border border-accent/40 px-3 py-1.5 rounded-full hover:bg-accent/10 transition-colors"
                    >
                      Buat naskah ini →
                    </button>
                  </div>
                </div>
                <ul className="text-slate-300 text-sm leading-relaxed list-disc pl-4 flex flex-col gap-1.5">
                  {RULES[t.key].map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-3">Kata Sambung Surat</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Apabila badan surat lebih dari 1 halaman, akhir halaman pertama diberi kata sambung di pojok kanan bawah berupa kata pertama halaman berikutnya. Contoh: jika halaman 2 dimulai dengan &quot;7. Lakukan…&quot;, maka pojok kanan bawah halaman 1 dituliskan &quot;7. Lakukan…&quot;.
              </p>
            </div>
          </div>
        </main>
      )}

      <footer className="no-print border-t border-white/10 px-5 md:px-10 py-6 mt-4">
        <p className="max-w-[1400px] mx-auto text-slate-600 text-xs">
          Alat bantu internal — bukan pengganti verifikasi resmi. Naskah final tetap wajib diperiksa dan diunggah melalui SRIKANDI sesuai prosedur.
        </p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field components                                                   */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  onChange,
  as = "input",
  rows = 3,
  placeholder,
  hint,
  allowTab = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  as?: "input" | "textarea";
  rows?: number;
  placeholder?: string;
  hint?: string;
  allowTab?: boolean;
}) {
  // Menyisipkan karakter Tab di posisi kursor alih-alih memindahkan fokus keluar dari
  // kotak isian — dipakai untuk membuat first-line indent alinea (mis. "Menindaklanjuti…"),
  // sesuai kaidah pengetikan naskah dinas.
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab" || !allowTab) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + "\t" + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 1;
    });
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-slate-300 text-xs font-medium">{label}</span>
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTabKey}
          rows={rows}
          placeholder={placeholder}
          className="bg-ink border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent resize-y whitespace-pre-wrap"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-ink border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
        />
      )}
      {hint && <span className="text-slate-500 text-[11px]">{hint}</span>}
    </label>
  );
}

// Tombol pilihan mode surat (dipakai untuk Surat Dinas & Surat Perintah/Surat Tugas):
// memastikan pengguna menentukan dulu apakah suratnya cukup 1 halaman atau
// pakai lampiran (banyak halaman/banyak nama) sebelum mengisi kolom lain.
function ModePicker<T extends string>({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: { value: T; label: string; desc: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="bg-ink border border-white/15 rounded-xl p-3 flex flex-col gap-2">
      <span className="text-slate-300 text-xs font-medium">{question}</span>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
              value === opt.value ? "border-accent bg-accent/10" : "border-white/15 hover:border-white/30"
            }`}
          >
            <p className={`text-sm font-semibold ${value === opt.value ? "text-accent" : "text-white"}`}>{opt.label}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Contoh preview format halaman lampiran yang benar — ditampilkan begitu pengguna
// memilih mode "dengan lampiran", supaya tahu bentuk halaman lanjutan sebelum
// menyambungkan isi lampiran, dan format-nya konsisten dengan yang akan dihasilkan.
function LampiranPreviewExample({ judul, nomor, tempatTanggal }: { judul: string; nomor: string; tempatTanggal: string }) {
  return (
    <div className="bg-white/5 border border-dashed border-accent/40 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed">
      <p className="text-accent font-semibold mb-1.5">Contoh format halaman lampiran (halaman berikutnya)</p>
      <div className="bg-ink/60 rounded-lg p-3 text-center">
        <p className="font-bold">LAMPIRAN {judul.toUpperCase()}</p>
        <p>NOMOR: {nomor || "…"}</p>
        <p className="mb-2">TANGGAL: {tempatTanggal || "…"}</p>
        <div className="border-t border-white/15 my-2" />
        <p className="text-left">1. …</p>
        <p className="text-left">2. …</p>
      </div>
      <p className="mt-2 text-slate-500">
        Halaman lampiran otomatis diletakkan setelah halaman utama (page break), mengikuti nomor & tanggal surat di
        atas. Pastikan isi lampiran mengikuti format ini dulu sebelum menyambungkan file lampiran lain.
      </p>
    </div>
  );
}

function SuratDinasFields({ value, onChange }: { value: SuratDinasForm; onChange: (v: SuratDinasForm) => void }) {
  const set = (k: keyof SuratDinasForm) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <ModePicker
        question="Surat dinas ini seperti apa?"
        value={value.modeSurat}
        onChange={(v) => onChange({ ...value, modeSurat: v })}
        options={[
          { value: "1_halaman", label: "Cukup 1 halaman", desc: "Tanpa lampiran isi terpisah — surat selesai di 1 halaman." },
          { value: "dengan_lampiran", label: "Pakai lampiran (lebih dari 1 halaman)", desc: "Ada lampiran yang dicetak di halaman terpisah setelah surat utama." },
        ]}
      />
      {value.modeSurat === "dengan_lampiran" && (
        <>
          <Field
            label="Isi Daftar Lampiran (satu baris per butir, otomatis diberi angka)"
            as="textarea"
            rows={4}
            value={value.daftarLampiran}
            onChange={set("daftarLampiran")}
            placeholder={"Nama, NIP, Jabatan...\natau butir lampiran lainnya"}
            hint="Wajib diisi kalau memilih mode dengan lampiran."
          />
          <LampiranPreviewExample judul="Surat" nomor={value.nomor} tempatTanggal={value.tempatTanggal} />
        </>
      )}
      <Field label="Nomor Naskah" value={value.nomor} onChange={set("nomor")} placeholder="B-XXX/33000/KA.220/2026" hint="Tanpa derajat keamanan B/T" />
      <Field label="Sifat" value={value.sifat} onChange={set("sifat")} />
      <Field label="Lampiran" value={value.lampiran} onChange={set("lampiran")} hint="Jika basah, lampiran ikut ditandatangani; jika elektronik/Srikandi, tidak perlu" />
      <Field label="Hal" value={value.hal} onChange={set("hal")} />
      <Field label="Tempat, Tanggal" value={value.tempatTanggal} onChange={set("tempatTanggal")} placeholder="Semarang, 10 Juli 2026" />
      <Field label="Yth. (satu baris per tujuan)" as="textarea" value={value.yth} onChange={set("yth")} placeholder={"1. Kepala Bagian Umum...\n2. Kepala BPS Kabupaten/Kota..."} />
      <Field label="Alinea Pembuka" as="textarea" value={value.alineaPembuka} onChange={set("alineaPembuka")} />
      <Field label="Alinea Isi" as="textarea" rows={4} value={value.alineaIsi} onChange={set("alineaIsi")} />
      <Field label="Alinea Penutup" as="textarea" value={value.alineaPenutup} onChange={set("alineaPenutup")} />
      <Field
        label="Jabatan Pengirim"
        as="textarea"
        rows={2}
        value={value.jabatanPengirim}
        onChange={set("jabatanPengirim")}
        placeholder={"Kepala Badan Pusat Statistik\nProvinsi Jawa Tengah"}
        hint="Jika jabatan panjang, pisah jadi 2 baris (Enter). Koma otomatis ditambahkan di baris terakhir."
      />
      <Field label="Nama Pengirim" value={value.namaPengirim} onChange={set("namaPengirim")} hint="Tanpa gelar" />
      <Field label="Tembusan (satu baris per tujuan, opsional)" as="textarea" value={value.tembusan} onChange={set("tembusan")} />
    </>
  );
}

function UndanganFields({ value, onChange }: { value: UndanganForm; onChange: (v: UndanganForm) => void }) {
  const set = (k: keyof UndanganForm) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <Field label="Nomor Naskah" value={value.nomor} onChange={set("nomor")} placeholder="B-XX/33000/KA.730/2026" hint="Tanpa derajat keamanan B/T" />
      <Field label="Sifat" value={value.sifat} onChange={set("sifat")} />
      <Field label="Lampiran" value={value.lampiran} onChange={set("lampiran")} hint="Jika basah, lampiran ikut ditandatangani; jika elektronik/Srikandi, tidak perlu" />
      <Field label="Hal" value={value.hal} onChange={set("hal")} placeholder="Undangan Rapat ..." />
      <Field label="Tempat, Tanggal" value={value.tempatTanggal} onChange={set("tempatTanggal")} placeholder="Semarang, 28 Januari 2026" />
      <Field label="Yth. (satu baris per tujuan)" as="textarea" value={value.yth} onChange={set("yth")} placeholder={"1. Ketua Tim Kerja\n2. PJK Bagian Umum"} />
      <Field label="Alinea Pembuka" as="textarea" value={value.alineaPembuka} onChange={set("alineaPembuka")} placeholder="Dalam rangka ..., Ketua Tim Kerja/PJK Bagian Umum mengundang pegawai terlampir untuk hadir" />
      <Field label="Hari/Tanggal Acara" value={value.hariTanggal} onChange={set("hariTanggal")} placeholder="Rabu / 28 Januari 2026" />
      <Field label="Waktu" value={value.waktu} onChange={set("waktu")} placeholder="08.00 s.d 12.00 WIB" />
      <Field label="Tempat Acara" value={value.tempatAcara} onChange={set("tempatAcara")} placeholder="Ruang Rapat SB 2" />
      <Field label="Acara" value={value.acara} onChange={set("acara")} />
      <Field label="Alinea Penutup" as="textarea" value={value.alineaPenutup} onChange={set("alineaPenutup")} />
      <Field
        label="Jabatan Pengirim"
        as="textarea"
        rows={2}
        value={value.jabatanPengirim}
        onChange={set("jabatanPengirim")}
        placeholder={"Kepala Badan Pusat Statistik\nProvinsi Jawa Tengah"}
        hint="Jika jabatan panjang, pisah jadi 2 baris (Enter). Koma otomatis ditambahkan di baris terakhir."
      />
      <Field label="Nama Pengirim" value={value.namaPengirim} onChange={set("namaPengirim")} hint="Tanpa gelar" />
      <Field label="Tembusan (opsional)" as="textarea" value={value.tembusan} onChange={set("tembusan")} />
      <Field
        label="Daftar Pejabat/Pegawai yang Diundang (satu baris per nama, opsional — dibuat sebagai lampiran)"
        as="textarea"
        rows={4}
        value={value.daftarDiundang}
        onChange={set("daftarDiundang")}
      />
    </>
  );
}

function MemorandumFields({ value, onChange }: { value: MemorandumForm; onChange: (v: MemorandumForm) => void }) {
  const set = (k: keyof MemorandumForm) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <Field label="Nomor Naskah" value={value.nomor} onChange={set("nomor")} placeholder="1130/33510/VS.220/2026" hint="Tanpa derajat keamanan B/T" />
      {hasSecurityCodePrefix(value.nomor) && (
        <p className="text-amber-400 text-xs -mt-2 flex items-start gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2">
          <span>⚠️</span>
          <span>
            Nomor Memorandum tidak boleh memakai kode/derajat keamanan (awalan &quot;B-&quot; atau &quot;T-&quot;). Hapus awalan tersebut dari nomor naskah.
          </span>
        </p>
      )}
      <Field label="Yth." value={value.yth} onChange={set("yth")} />
      <Field label="Hal" value={value.hal} onChange={set("hal")} />
      <Field label="Isi" as="textarea" rows={5} value={value.isi} onChange={set("isi")} hint="Boleh diawali angka (1. ...) atau huruf (a. ...) untuk daftar bernomor. Tekan Tab di awal baris untuk membuat indentasi alinea (mis. alinea “Menindaklanjuti...”)" />
      <Field label="Tempat, Tanggal" value={value.tempatTanggal} onChange={set("tempatTanggal")} placeholder="Semarang, 10 Juli 2026" />
      <Field
        label="Jabatan Pengirim"
        as="textarea"
        rows={2}
        value={value.jabatanPengirim}
        onChange={set("jabatanPengirim")}
        placeholder={"Kepala Badan Pusat Statistik\nProvinsi Jawa Tengah"}
        hint="Jika jabatan panjang, pisah jadi 2 baris (Enter). Koma otomatis ditambahkan di baris terakhir."
      />
      <Field label="Nama Pengirim" value={value.namaPengirim} onChange={set("namaPengirim")} hint="Tanpa gelar" />
      <Field label="Tembusan (opsional)" as="textarea" value={value.tembusan} onChange={set("tembusan")} />
    </>
  );
}

function NotaDinasFields({ value, onChange }: { value: NotaDinasForm; onChange: (v: NotaDinasForm) => void }) {
  const set = (k: keyof NotaDinasForm) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <Field label="Nomor Naskah" value={value.nomor} onChange={set("nomor")} placeholder="1130/33714/VS.220/2026" hint="Tanpa derajat keamanan B/T" />
      {hasSecurityCodePrefix(value.nomor) && (
        <p className="text-amber-400 text-xs -mt-2 flex items-start gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2">
          <span>⚠️</span>
          <span>
            Nomor Nota Dinas tidak boleh memakai kode/derajat keamanan (awalan &quot;B-&quot; atau &quot;T-&quot;). Hapus awalan tersebut dari nomor naskah.
          </span>
        </p>
      )}
      <Field label="Yth." value={value.yth} onChange={set("yth")} placeholder="Ketua Tim Kerja" />
      <Field label="Dari" value={value.dari} onChange={set("dari")} placeholder="Kepala Subbagian Umum" />
      <Field label="Hal" value={value.hal} onChange={set("hal")} />
      <Field label="Tanggal" value={value.tanggal} onChange={set("tanggal")} placeholder="10 Juli 2026" />
      <Field label="Isi" as="textarea" rows={5} value={value.isi} onChange={set("isi")} hint="Boleh diawali angka (1. ...) atau huruf (a. ...) untuk daftar bernomor. Tekan Tab di awal baris untuk membuat indentasi alinea (mis. alinea “Menindaklanjuti...”)" />
      <Field label="Nama Pengirim" value={value.namaPengirim} onChange={set("namaPengirim")} hint="Tanpa gelar, tanpa jabatan pengirim" />
      <Field label="Tembusan (opsional)" as="textarea" value={value.tembusan} onChange={set("tembusan")} />
    </>
  );
}

function SuratPerintahTugasFields({ value, onChange }: { value: SuratPerintahTugasForm; onChange: (v: SuratPerintahTugasForm) => void }) {
  const set = (k: keyof SuratPerintahTugasForm) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <ModePicker
        question="Surat tugas ini seperti apa?"
        value={value.modeSurat}
        onChange={(v) => onChange({ ...value, modeSurat: v })}
        options={[
          { value: "tanpa_lampiran", label: "Tanpa lampiran (1 halaman)", desc: "Nama yang ditugaskan sedikit, ditulis langsung di kolom Kepada." },
          { value: "dengan_lampiran", label: "Pakai lampiran (banyak nama)", desc: "Daftar nama panjang, dipindah ke halaman Lampiran Surat Tugas tersendiri." },
        ]}
      />
   <Field label="Nomor Naskah" value={value.nomor} onChange={set("nomor")} placeholder="800/1234/2026" hint="Tanpa derajat keamanan B/T" />
      <Field
        label="Dasar / Lampiran (wajib)"
        as="textarea"
        rows={2}
        value={value.dasarSurat}
        onChange={set("dasarSurat")}
        placeholder={"Surat Undangan Nomor .../..., tanggal ..., perihal ...\natau Surat Dinas Nomor ... tanggal ..."}
        hint="Wajib diisi — sebutkan nomor & tanggal surat undangan atau surat dinas lain yang menjadi dasar penugasan ini."
      />
      {!value.dasarSurat.trim() && (
        <p className="text-amber-400 text-xs -mt-2 flex items-start gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2">
          <span>⚠️</span>
          <span>Surat Perintah/Surat Tugas wajib melampirkan dasar berupa surat undangan/surat dinas lain. Kotak ini tidak boleh kosong saat diunduh.</span>
        </p>
      )}
      <Field label="Tempat, Tanggal" value={value.tempatTanggal} onChange={set("tempatTanggal")} placeholder="Semarang, 10 Juli 2026" />
      <Field
        label="Menimbang (satu baris per butir, otomatis diberi huruf a, b, c, ...)"
        as="textarea"
        rows={3}
        value={value.menimbang}
        onChange={set("menimbang")}
        placeholder={"bahwa untuk kelancaran kegiatan ... perlu menugaskan pegawai...\nbahwa pegawai yang tersebut namanya di bawah ini dipandang cakap..."}
      />
      <Field
        label="Mengingat (satu baris per butir, otomatis diberi angka 1, 2, 3, ...)"
        as="textarea"
        rows={3}
        value={value.mengingat}
        onChange={set("mengingat")}
        placeholder={"Peraturan BPS Nomor ... tentang ...\nSurat Keputusan ... tentang ..."}
      />
      {value.modeSurat === "tanpa_lampiran" ? (
        <Field
          label="Kepada (satu baris per nama/jabatan, otomatis diberi angka)"
          as="textarea"
          rows={3}
          value={value.kepada}
          onChange={set("kepada")}
          placeholder={"Nama, NIP, Jabatan..."}
        />
      ) : (
        <>
          <p className="text-slate-400 text-xs -mb-1">
            Kolom &quot;Kepada&quot; otomatis diisi kalimat rujukan ke lampiran (&quot;Sebagaimana tercantum dalam Lampiran Surat
            Tugas ini.&quot;) — isi nama-namanya di kolom Daftar Lampiran di bawah.
          </p>
          <Field
            label="Daftar Lampiran — nama yang ditugaskan (satu baris per nama, otomatis diberi angka)"
            as="textarea"
            rows={5}
            value={value.daftarLampiran}
            onChange={set("daftarLampiran")}
            placeholder={"Nama, NIP, Jabatan...\nNama, NIP, Jabatan..."}
            hint="Wajib diisi kalau memilih mode dengan lampiran."
          />
          <LampiranPreviewExample judul="Surat Tugas" nomor={value.nomor} tempatTanggal={value.tempatTanggal} />
        </>
      )}
      <Field
        label="Untuk (satu baris per uraian tugas, otomatis diberi angka)"
        as="textarea"
        rows={3}
        value={value.untuk}
        onChange={set("untuk")}
        placeholder={"Melaksanakan ...\nMelaporkan hasil pelaksanaan tugas..."}
      />
      <Field
        label="Jabatan Pengirim"
        as="textarea"
        rows={2}
        value={value.jabatanPengirim}
        onChange={set("jabatanPengirim")}
        placeholder={"Kepala Badan Pusat Statistik\nProvinsi Jawa Tengah"}
        hint="Jika jabatan panjang, pisah jadi 2 baris (Enter). Koma otomatis ditambahkan di baris terakhir."
      />
      <Field label="Nama Pengirim" value={value.namaPengirim} onChange={set("namaPengirim")} hint="Tanpa gelar" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Letter preview                                                     */
/* ------------------------------------------------------------------ */

function LetterPreview({
  naskahType,
  satker,
  suratDinas,
  undangan,
  memorandum,
  notaDinas,
  suratPerintahTugas,
}: {
  naskahType: NaskahType;
  satker: SatkerInfo;
  suratDinas: SuratDinasForm;
  undangan: UndanganForm;
  memorandum: MemorandumForm;
  notaDinas: NotaDinasForm;
  suratPerintahTugas: SuratPerintahTugasForm;
}) {
  const satkerLines = satker.nama.split("\n").filter(Boolean);

  const Kop = (
    <div className="flex items-start gap-4 border-b-2 border-[#1e293b] pb-3 mb-6">
      <div className="w-14 h-14 shrink-0 rounded bg-[#1e40af]/10 border border-[#1e40af]/30 flex items-center justify-center text-[9px] text-[#1e40af] font-bold text-center leading-tight">
        LOGO
        <br />
        BPS
      </div>
      <div>
        <p className="font-bold text-[15px] leading-tight whitespace-pre-line">{satker.nama}</p>
        <p className="text-[11px] text-slate-600 mt-0.5">{satker.alamat}</p>
        <p className="text-[11px] text-slate-600">
          Homepage: {satker.homepage} E-mail: {satker.email}
        </p>
      </div>
    </div>
  );

  // Simplified letterhead used by Surat Perintah/Surat Tugas: logo + org name only, no address block.
  const KopSingkat = (
    <div className="flex flex-col items-center text-center border-b-2 border-[#1e293b] pb-3 mb-6">
      <div className="w-14 h-14 shrink-0 rounded bg-[#1e40af]/10 border border-[#1e40af]/30 flex items-center justify-center text-[9px] text-[#1e40af] font-bold text-center leading-tight mb-2">
        LOGO
        <br />
        BPS
      </div>
      {satkerLines.map((l, i) => (
        <p key={i} className="font-bold italic text-[14px] leading-tight uppercase">
          {l}
        </p>
      ))}
    </div>
  );

  // Letterhead used by Memorandum & Nota Dinas: nama satker saja, tanpa alamat/telp/homepage/e-mail,
  // rata tengah, tebal, tanpa cetak miring — sesuai template resmi.
  const KopMemoNota = (
    <div className="text-center border-b-2 border-[#1e293b] pb-3 mb-6">
   {satkerLines.map((l, i) => (
        <p key={i} className="font-bold text-[14px] leading-tight uppercase">
          {l}
        </p>
      ))}
    </div>
  );

  if (naskahType === "surat_dinas") {
    const f = suratDinas;
    return (
      <div className="text-[13px] leading-relaxed">
        {Kop}
        <div className="flex justify-between mb-6">
          <table className="text-[13px]">
            <tbody>
              <tr><td className="pr-3 align-top">Nomor</td><td className="pr-2 align-top">:</td><td>{f.nomor || <Ph />}</td></tr>
              <tr><td className="pr-3 align-top">Sifat</td><td className="pr-2 align-top">:</td><td>{f.sifat || <Ph />}</td></tr>
              <tr><td className="pr-3 align-top">Lampiran</td><td className="pr-2 align-top">:</td><td>{f.lampiran || "-"}</td></tr>
              <tr><td className="pr-3 align-top">Hal</td><td className="pr-2 align-top">:</td><td className="font-semibold">{f.hal || <Ph />}</td></tr>
            </tbody>
          </table>
          <p className="whitespace-nowrap">{f.tempatTanggal || <Ph text="Tempat, Tanggal" />}</p>
        </div>

        <p className="mb-1">Yth.</p>
        <div className="mb-1 pl-0">
          {linesOrDash(f.yth).length ? linesOrDash(f.yth).map((l, i) => <p key={i}>{l}</p>) : <Ph />}
        </div>
        <p>di –</p>
        <p className="mb-4">Tempat</p>

        <p className="mb-3 text-justify">{f.alineaPembuka || <Ph />}</p>
        <p className="mb-3 text-justify whitespace-pre-line">{f.alineaIsi || <Ph />}</p>
        <p className="mb-8 text-justify">{f.alineaPenutup || <Ph />}</p>

        <div className="ml-auto w-[280px] text-center">
          {jabatanLines(f.jabatanPengirim).length ? (
            jabatanLines(f.jabatanPengirim).map((l, i) => <p key={i}>{l}</p>)
          ) : (
            <Ph />
          )}
          <div className="h-16" />
          <p className="font-semibold">{f.namaPengirim || <Ph />}</p>
        </div>

        {linesOrDash(f.tembusan).length > 0 && (
          <div className="mt-8">
            <p>Tembusan:</p>
            {linesOrDash(f.tembusan).map((t, i) => (
              <p key={i}>{i + 1}. {t}</p>
            ))}
          </div>
        )}

        {f.lampiran && f.lampiran !== "-" && (
          <div className="mt-8 pt-3 border-t border-dashed border-slate-300 text-[11px] text-slate-500">
            Catatan: {f.lampiran} — pastikan status tanda tangan lampiran mengikuti ketentuan (basah = ikut ditandatangani, elektronik/Srikandi = tidak perlu tanda tangan).
          </div>
        )}

        {f.modeSurat === "dengan_lampiran" && (
          <div className="mt-10 pt-6 border-t-4 border-double border-slate-300">
            <p className="text-center text-[10px] text-slate-400 mb-3 uppercase tracking-wide">· · · Halaman Berikutnya · · ·</p>
            <p className="text-center font-bold">LAMPIRAN SURAT</p>
            <p className="text-center">NOMOR: {f.nomor || <Ph />}</p>
            <p className="text-center mb-3">TANGGAL: {f.tempatTanggal || <Ph />}</p>
            <div className="border-t border-[#1e293b] mb-3" />
            {linesOrDash(f.daftarLampiran).length ? (
              linesOrDash(f.daftarLampiran).map((t, i) => <p key={i}>{i + 1}. {t}</p>)
            ) : (
              <Ph text="Isi Daftar Lampiran belum diisi" />
            )}
          </div>
        )}
      </div>
    );
  }

  if (naskahType === "undangan") {
    const f = undangan;
    return (
      <div className="text-[13px] leading-relaxed">
        {Kop}
        <div className="flex justify-between mb-6">
          <table className="text-[13px]">
            <tbody>
              <tr><td className="pr-3 align-top">Nomor</td><td className="pr-2 align-top">:</td><td>{f.nomor || <Ph />}</td></tr>
              <tr><td className="pr-3 align-top">Sifat</td><td className="pr-2 align-top">:</td><td>{f.sifat || <Ph />}</td></tr>
              <tr><td className="pr-3 align-top">Lampiran</td><td className="pr-2 align-top">:</td><td>{f.lampiran || "-"}</td></tr>
              <tr><td className="pr-3 align-top">Hal</td><td className="pr-2 align-top">:</td><td className="font-semibold">{f.hal || <Ph />}</td></tr>
            </tbody>
          </table>
          <p className="whitespace-nowrap">{f.tempatTanggal || <Ph text="Tempat, Tanggal" />}</p>
        </div>

        <p className="mb-1">Yth.</p>
        <div className="mb-1">
          {linesOrDash(f.yth).length ? linesOrDash(f.yth).map((l, i) => <p key={i}>{l}</p>) : <Ph />}
        </div>
        <p>di –</p>
        <p className="mb-4">Tempat</p>

        <p className="mb-3 text-justify">{f.alineaPembuka || <Ph />}</p>

        <table className="text-[13px] mb-3">
          <tbody>
            <tr><td className="pr-3 align-top">pada hari/tanggal</td><td className="pr-2 align-top">:</td><td>{f.hariTanggal || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">waktu</td><td className="pr-2 align-top">:</td><td>pukul {f.waktu || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">tempat</td><td className="pr-2 align-top">:</td><td>{f.tempatAcara || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">acara</td><td className="pr-2 align-top">:</td><td>{f.acara || <Ph />}</td></tr>
          </tbody>
        </table>

        <p className="mb-8 text-justify">{f.alineaPenutup || <Ph />}</p>

        <div className="ml-auto w-[280px] text-center">
          {jabatanLines(f.jabatanPengirim).length ? (
            jabatanLines(f.jabatanPengirim).map((l, i) => <p key={i}>{l}</p>)
          ) : (
            <Ph />
          )}
          <div className="h-16" />
          <p className="font-semibold">{f.namaPengirim || <Ph />}</p>
        </div>

        {linesOrDash(f.tembusan).length > 0 && (
          <div className="mt-8">
            <p>Tembusan:</p>
            {linesOrDash(f.tembusan).map((t, i) => (
              <p key={i}>{i + 1}. {t}</p>
            ))}
          </div>
        )}

        {linesOrDash(f.daftarDiundang).length > 0 && (
          <div className="mt-10 pt-6 border-t border-dashed border-slate-300">
            <p className="text-center text-[11px] text-slate-500 mb-2">— Lampiran Surat: Daftar Pejabat/Pegawai yang Diundang —</p>
            {linesOrDash(f.daftarDiundang).map((t, i) => (
              <p key={i}>{i + 1}. {t}</p>
            ))}
            <p className="mt-4 text-[11px] text-slate-500 italic">
              Ingat: jika surat ditandatangani basah/konvensional, lampiran ini turut ditandatangani. Jika elektronik/Srikandi, tidak perlu tanda tangan.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (naskahType === "memorandum") {
    const f = memorandum;
    return (
      <div className="text-[13px] leading-relaxed">
        {KopMemoNota}
        <div className="text-center mb-6">
          <p className="font-bold tracking-wide">MEMORANDUM</p>
          <p>NOMOR {f.nomor || <Ph />}</p>
        </div>

        <table className="text-[13px] mb-4">
          <tbody>
            <tr><td className="pr-3 align-top">Yth.</td><td className="pr-2 align-top">:</td><td>{f.yth || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">Hal</td><td className="pr-2 align-top">:</td><td className="font-semibold">{f.hal || <Ph />}</td></tr>
          </tbody>
        </table>

        <div className="mb-8">
          <BodyText text={f.isi} />
        </div>

        <div className="ml-auto w-[280px] text-right">
          <p>{f.tempatTanggal || <Ph text="Tempat, Tanggal" />}</p>
          {jabatanLines(f.jabatanPengirim).length ? (
            jabatanLines(f.jabatanPengirim).map((l, i) => <p key={i}>{l}</p>)
          ) : (
            <Ph />
          )}
          <div className="h-16" />
          <p className="font-semibold">{f.namaPengirim || <Ph />}</p>
        </div>

        {linesOrDash(f.tembusan).length > 0 && (
          <div className="mt-8">
            <p>Tembusan:</p>
            {linesOrDash(f.tembusan).map((t, i) => (
              <p key={i}>{i + 1}. {t}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (naskahType === "nota_dinas") {
    const f = notaDinas;
    return (
      <div className="text-[13px] leading-relaxed">
        {KopMemoNota}
        <div className="text-center mb-6">
          <p className="font-bold tracking-wide">NOTA DINAS</p>
          <p>NOMOR {f.nomor || <Ph />}</p>
        </div>

        <table className="text-[13px] mb-4">
          <tbody>
            <tr><td className="pr-3 align-top">Yth.</td><td className="pr-2 align-top">:</td><td>{f.yth || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">Dari</td><td className="pr-2 align-top">:</td><td>{f.dari || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">Hal</td><td className="pr-2 align-top">:</td><td className="font-semibold">{f.hal || <Ph />}</td></tr>
            <tr><td className="pr-3 align-top">Tanggal</td><td className="pr-2 align-top">:</td><td>{f.tanggal || <Ph />}</td></tr>
          </tbody>
        </table>

        <div className="mb-8">
          <BodyText text={f.isi} />
        </div>

        <div className="ml-auto w-[280px] text-center">
          <div className="h-16" />
          <p className="font-semibold">{f.namaPengirim || <Ph />}</p>
        </div>

        {linesOrDash(f.tembusan).length > 0 && (
          <div className="mt-8">
            <p>Tembusan:</p>
            {linesOrDash(f.tembusan).map((t, i) => (
              <p key={i}>{i + 1}. {t}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // surat_perintah_tugas
  const f = suratPerintahTugas;
  const menimbangLines = linesOrDash(f.menimbang);
  const mengingatLines = linesOrDash(f.mengingat);
  const kepadaLines = linesOrDash(f.kepada);
  const untukLines = linesOrDash(f.untuk);

  return (
    <div className="text-[13px] leading-relaxed">
   {KopSingkat}
      <div className="text-center mb-6">
        <p className="font-bold tracking-wide">SURAT PERINTAH/SURAT TUGAS</p>
        <p>NOMOR {f.nomor || <Ph />}</p>
      </div>

      <p className="mb-4 text-[13px]">
        <span className="font-semibold">Dasar</span> : {f.dasarSurat || <Ph />}
      </p>

      <table className="text-[13px] mb-4 w-full" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td className="pr-3 align-top w-[110px]">Menimbang</td>
            <td className="pr-2 align-top">:</td>
            <td>
              {menimbangLines.length ? (
                <ol className="flex flex-col gap-1">
                  {menimbangLines.map((l, i) => (
                    <li key={i} className="flex gap-2">
                      <span>{letterAt(i)}.</span>
                      <span className="text-justify">{l}{i === menimbangLines.length - 1 ? "." : ";"}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Ph />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="text-[13px] mb-4 w-full pt-2 border-t border-[#1e293b]" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td className="pr-3 align-top w-[110px] pt-2">Mengingat</td>
            <td className="pr-2 align-top pt-2">:</td>
            <td className="pt-2">
              {mengingatLines.length ? (
                <ol className="flex flex-col gap-1">
                  {mengingatLines.map((l, i) => (
                    <li key={i} className="flex gap-2">
                      <span>{i + 1}.</span>
                      <span className="text-justify">{l}{i === mengingatLines.length - 1 ? "." : ";"}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Ph />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-center font-bold my-5">Memberi Perintah/Memberi Tugas</p>

      <table className="text-[13px] mb-4 w-full border-t border-[#1e293b] pt-2" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td className="pr-3 align-top w-[110px] pt-2">Kepada</td>
            <td className="pr-2 align-top pt-2">:</td>
            <td className="pt-2">
              {f.modeSurat === "dengan_lampiran" ? (
                <p className="text-justify">Sebagaimana tercantum dalam Lampiran Surat Tugas ini.</p>
              ) : kepadaLines.length ? (
                <>
                  <ol className="flex flex-col gap-1">
                    {kepadaLines.map((l, i) => (
                      <li key={i} className="flex gap-2">
                        <span>{i + 1}.</span>
                        <span className="text-justify">{l};</span>
                      </li>
                    ))}
                  </ol>
                  {kepadaLines.length > 1 && <p className="mt-1 italic text-slate-500">dan seterusnya.</p>}
                </>
              ) : (
                <Ph />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="text-[13px] mb-8 w-full" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td className="pr-3 align-top w-[110px]">Untuk</td>
            <td className="pr-2 align-top">:</td>
            <td>
              {untukLines.length ? (
                <>
                  <ol className="flex flex-col gap-1">
                    {untukLines.map((l, i) => (
                      <li key={i} className="flex gap-2">
                        <span>{i + 1}.</span>
                        <span className="text-justify">{l};</span>
                      </li>
                    ))}
                  </ol>
                  {untukLines.length > 1 && <p className="mt-1 italic text-slate-500">dan seterusnya.</p>}
                </>
              ) : (
                <Ph />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="ml-auto w-[280px] text-center">
        <p>{f.tempatTanggal || <Ph text="Tempat, Tanggal" />}</p>
        {jabatanLines(f.jabatanPengirim).length ? (
          jabatanLines(f.jabatanPengirim).map((l, i) => <p key={i}>{l}</p>)
        ) : (
          <Ph />
        )}
        <div className="h-16" />
        <p className="font-semibold">{f.namaPengirim || <Ph />}</p>
      </div>

      {f.modeSurat === "dengan_lampiran" && (
        <div className="mt-10 pt-6 border-t-4 border-double border-slate-300">
          <p className="text-center text-[10px] text-slate-400 mb-3 uppercase tracking-wide">· · · Halaman Berikutnya · · ·</p>
          <p className="text-center font-bold">LAMPIRAN SURAT TUGAS</p>
          <p className="text-center">NOMOR: {f.nomor || <Ph />}</p>
          <p className="text-center mb-3">TANGGAL: {f.tempatTanggal || <Ph />}</p>
          <div className="border-t border-[#1e293b] mb-3" />
          {linesOrDash(f.daftarLampiran).length ? (
            linesOrDash(f.daftarLampiran).map((t, i) => <p key={i}>{i + 1}. {t}</p>)
          ) : (
            <Ph text="Isi Daftar Lampiran belum diisi" />
          )}
        </div>
      )}
    </div>
  );
}

function Ph({ text = "…" }: { text?: string }) {
  return <span className="text-slate-300 italic">{text}</span>;
}

// Merender teks isi bebas (Memorandum/Nota Dinas) dengan mengenali baris bernomor
// ("1. ...") dan berhuruf ("a. ...") lalu memberi hanging indent yang rapi,
// alih-alih menumpuk sebagai paragraf polos yang berantakan saat baris terbungkus.
function BodyText({ text }: { text: string }) {
  const lines = parseBodyLines(text);
  if (!lines.length) {
    return (
      <p className="text-justify">
        <Ph />
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {lines.map((l, i) => {
        if (l.type === "num") {
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0">{l.marker}</span>
              <span className="text-justify">{l.text}</span>
            </div>
          );
        }
        if (l.type === "sub") {
          return (
            <div key={i} className="flex gap-2 pl-6">
              <span className="shrink-0">{l.marker}</span>
              <span className="text-justify">{l.text}</span>
            </div>
          );
        }
        return (
          <p key={i} className="text-justify" style={l.indent ? { textIndent: "1.27cm" } : undefined}>
            {l.text}
          </p>
        );
      })}
    </div>
  );
}
