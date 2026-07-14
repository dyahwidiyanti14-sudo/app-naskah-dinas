import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { AllForms } from "./types";

/* ------------------------------------------------------------------ */
/*  Small helpers (kept local & dependency-free on purpose)            */
/* ------------------------------------------------------------------ */

const FONT = "Arial";
const SIZE_BODY = 24; // 12pt  (docx uses half-points)
const SIZE_SMALL = 20; // 10pt
const SIZE_HEAD = 28; // 14pt
const GRAY = "475569";
const INK = "1e293b";

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
  let n = i;
  let s = "";
  do {
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function run(text: string, opts: { bold?: boolean; italics?: boolean; underline?: boolean; size?: number; color?: string } = {}) {
  return new TextRun({
    text: text.length ? text : " ",
    font: FONT,
    size: opts.size ?? SIZE_BODY,
    bold: opts.bold,
    italics: opts.italics,
    underline: opts.underline ? {} : undefined,
    color: opts.color,
  });
}

function para(
  text: string,
  opts: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    size?: number;
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    after?: number;
  } = {}
) {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { after: opts.after ?? 120 },
    children: [run(text, opts)],
  });
}

function emptyLine(count = 1) {
  return Array.from({ length: count }, () => new Paragraph({ children: [run(" ")] }));
}

function divider() {
  return new Paragraph({
    spacing: { after: 260 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: INK },
    },
    children: [run(" ")],
  });
}

function labelValueRow(label: string, value: string, labelWidth = 10) {
  const padded = label.padEnd(labelWidth, " ");
  return para(`${padded}: ${value || "-"}`, { after: 40 });
}

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

// Jabatan pengirim boleh ditulis lebih dari 1 baris (jabatan panjang dipecah 2 baris,
// mengikuti kaidah penulisan seperti pada nama satker). Koma penutup hanya di baris terakhir.
function jabatanLines(text: string): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((l, i) => (i === lines.length - 1 ? withComma(l) : l));
}

function jabatanParagraphs(text: string, align: Align): Paragraph[] {
  const lines = jabatanLines(text);
  if (!lines.length) return [para("", { align, after: 0 })];
  return lines.map((l) => para(l, { align, after: 0 }));
}

// Deteksi baris bernomor ("1. ...") dan berhuruf ("a. ...") di teks isi bebas
// (Memorandum/Nota Dinas) supaya diberi hanging indent yang rapi, konsisten dengan preview.
// Baris polos yang diawali karakter Tab (ditekan pengguna di kotak isian) diberi
// first-line indent, meniru kaidah pengetikan alinea baku (mis. alinea "Menindaklanjuti…").
interface BodyLine {
  type: "p" | "num" | "sub";
  marker?: string;
  text: string;
  indent?: boolean;
}

// Standar 1 tab Word = 720 twip (~1,27 cm), dipakai sebagai first-line indent.
const TAB_INDENT = 720;

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

function bodyParagraphs(text: string): Paragraph[] {
  const lines = parseBodyLines(text);
  if (!lines.length) return [para("", { after: 160 })];
  return lines.map((l) => {
    if (l.type === "num") {
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
        indent: { left: 340, hanging: 340 },
        children: [run(`${l.marker} `), run(l.text)],
      });
    }
    if (l.type === "sub") {
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
        indent: { left: 680, hanging: 340 },
        children: [run(`${l.marker} `), run(l.text)],
      });
    }
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      indent: l.indent ? { firstLine: TAB_INDENT } : undefined,
      children: [run(l.text)],
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Letterhead (Kop)                                                   */
/* ------------------------------------------------------------------ */

function buildKop(nama: string, alamat: string, homepage: string, email: string): Paragraph[] {
  const namaLines = nama.split("\n").filter(Boolean);
  return [
    ...namaLines.map((l) => para(l.toUpperCase(), { bold: true, size: SIZE_HEAD, after: 20 })),
    para(alamat, { size: SIZE_SMALL, color: GRAY, after: 0 }),
    para(`Homepage: ${homepage}   E-mail: ${email}`, { size: SIZE_SMALL, color: GRAY, after: 0 }),
    divider(),
  ];
}

function buildKopSingkat(nama: string): Paragraph[] {
  const namaLines = nama.split("\n").filter(Boolean);
  return [
    ...namaLines.map((l) =>
      para(l.toUpperCase(), { bold: true, italics: true, align: AlignmentType.CENTER, after: 20 })
    ),
    divider(),
  ];
}

// Kop untuk Memorandum & Nota Dinas: hanya nama satker (tanpa alamat/telp/homepage/e-mail),
// rata tengah, tebal, tanpa cetak miring — sesuai template resmi.
function buildKopMemoNota(nama: string): Paragraph[] {
  const namaLines = nama.split("\n").filter(Boolean);
  return [
    ...namaLines.map((l) =>
      para(l.toUpperCase(), { bold: true, size: SIZE_HEAD, align: AlignmentType.CENTER, after: 20 })
    ),
    divider(),
  ];
}

/* ------------------------------------------------------------------ */
/*  Per-type body builders                                             */
/* ------------------------------------------------------------------ */

function buildSuratDinasBody(f: AllForms["suratDinas"]): Paragraph[] {
  const yth = linesOrDash(f.yth);
  const tembusan = linesOrDash(f.tembusan);
  return [
    labelValueRow("Nomor", f.nomor),
    labelValueRow("Sifat", f.sifat),
    labelValueRow("Lampiran", f.lampiran || "-"),
    labelValueRow("Hal", f.hal),
    para(f.tempatTanggal || "", { align: AlignmentType.RIGHT, after: 220 }),
    para("Yth.", { after: 40 }),
    ...(yth.length ? yth.map((l) => para(l, { after: 20 })) : [para("", { after: 20 })]),
    para("di –", { after: 20 }),
    para("Tempat", { after: 220 }),
    para(f.alineaPembuka, { align: AlignmentType.JUSTIFIED, after: 200 }),
    ...linesOrDash(f.alineaIsi).map((l) => para(l, { align: AlignmentType.JUSTIFIED, after: 160 })),
    para(f.alineaPenutup, { align: AlignmentType.JUSTIFIED, after: 400 }),
    ...jabatanParagraphs(f.jabatanPengirim, AlignmentType.RIGHT),
    ...emptyLine(3),
    para(f.namaPengirim, { align: AlignmentType.RIGHT, bold: true }),
    ...(tembusan.length
      ? [para("Tembusan:", { after: 40 }), ...tembusan.map((t, i) => para(`${i + 1}. ${t}`, { after: 20 }))]
      : []),
  ];
}

function buildUndanganBody(f: AllForms["undangan"]): Paragraph[] {
  const yth = linesOrDash(f.yth);
  const tembusan = linesOrDash(f.tembusan);
  const daftar = linesOrDash(f.daftarDiundang);
  return [
    labelValueRow("Nomor", f.nomor),
    labelValueRow("Sifat", f.sifat),
    labelValueRow("Lampiran", f.lampiran || "-"),
    labelValueRow("Hal", f.hal),
    para(f.tempatTanggal || "", { align: AlignmentType.RIGHT, after: 220 }),
    para("Yth.", { after: 40 }),
    ...(yth.length ? yth.map((l) => para(l, { after: 20 })) : [para("", { after: 20 })]),
    para("di –", { after: 20 }),
    para("Tempat", { after: 220 }),
    para(f.alineaPembuka, { align: AlignmentType.JUSTIFIED, after: 200 }),
    labelValueRow("pada hari/tanggal", f.hariTanggal, 18),
    labelValueRow("waktu", `pukul ${f.waktu || "-"}`, 18),
    labelValueRow("tempat", f.tempatAcara, 18),
    labelValueRow("acara", f.acara, 18),
    para(f.alineaPenutup, { align: AlignmentType.JUSTIFIED, after: 400 }),
    ...jabatanParagraphs(f.jabatanPengirim, AlignmentType.RIGHT),
    ...emptyLine(3),
    para(f.namaPengirim, { align: AlignmentType.RIGHT, bold: true }),
    ...(tembusan.length
      ? [para("Tembusan:", { after: 40 }), ...tembusan.map((t, i) => para(`${i + 1}. ${t}`, { after: 20 }))]
      : []),
    ...(daftar.length
      ? [
          divider(),
          para("Lampiran Surat: Daftar Pejabat/Pegawai yang Diundang", {
            align: AlignmentType.CENTER,
            italics: true,
            size: SIZE_SMALL,
            after: 160,
          }),
          ...daftar.map((t, i) => para(`${i + 1}. ${t}`, { after: 20 })),
        ]
      : []),
  ];
}

function buildMemorandumBody(f: AllForms["memorandum"]): Paragraph[] {
  const tembusan = linesOrDash(f.tembusan);
  return [
    para("MEMORANDUM", { bold: true, align: AlignmentType.CENTER, after: 20 }),
    para(`NOMOR ${f.nomor || "-"}`, { align: AlignmentType.CENTER, after: 260 }),
    labelValueRow("Yth.", f.yth, 6),
    labelValueRow("Hal", f.hal, 6),
    para("", { after: 120 }),
    ...bodyParagraphs(f.isi),
    para("", { after: 200 }),
    para(f.tempatTanggal || "", { align: AlignmentType.RIGHT, after: 0 }),
    ...jabatanParagraphs(f.jabatanPengirim, AlignmentType.RIGHT),
    ...emptyLine(3),
    para(f.namaPengirim, { align: AlignmentType.RIGHT, bold: true }),
    ...(tembusan.length
      ? [para("Tembusan:", { after: 40 }), ...tembusan.map((t, i) => para(`${i + 1}. ${t}`, { after: 20 }))]
      : []),
  ];
}

function buildNotaDinasBody(f: AllForms["notaDinas"]): Paragraph[] {
  const tembusan = linesOrDash(f.tembusan);
  return [
    para("NOTA DINAS", { bold: true, align: AlignmentType.CENTER, after: 20 }),
    para(`NOMOR ${f.nomor || "-"}`, { align: AlignmentType.CENTER, after: 260 }),
    labelValueRow("Yth.", f.yth, 9),
    labelValueRow("Dari", f.dari, 9),
    labelValueRow("Hal", f.hal, 9),
    labelValueRow("Tanggal", f.tanggal, 9),
    para("", { after: 120 }),
    ...bodyParagraphs(f.isi),
    para("", { after: 200 }),
    ...emptyLine(3),
    para(f.namaPengirim, { align: AlignmentType.CENTER, bold: true }),
    ...(tembusan.length
      ? [para("Tembusan:", { after: 40 }), ...tembusan.map((t, i) => para(`${i + 1}. ${t}`, { after: 20 }))]
      : []),
  ];
}

function buildSuratPerintahTugasBody(f: AllForms["suratPerintahTugas"]): Paragraph[] {
  const menimbang = linesOrDash(f.menimbang);
  const mengingat = linesOrDash(f.mengingat);
  const kepada = linesOrDash(f.kepada);
  const untuk = linesOrDash(f.untuk);

  return [
    para("SURAT PERINTAH/SURAT TUGAS", { bold: true, align: AlignmentType.CENTER, after: 20 }),
    para(`NOMOR ${f.nomor || "-"}`, { align: AlignmentType.CENTER, after: 300 }),
    para("Menimbang :", { after: 60 }),
    ...(menimbang.length
      ? menimbang.map((l, i) =>
          para(`${letterAt(i)}. ${l}${i === menimbang.length - 1 ? "." : ";"}`, {
            align: AlignmentType.JUSTIFIED,
            after: 60,
          })
        )
      : [para("a. …", { after: 60 })]),
    para("", { after: 100 }),
    para("Mengingat :", { after: 60 }),
    ...(mengingat.length
      ? mengingat.map((l, i) =>
          para(`${i + 1}. ${l}${i === mengingat.length - 1 ? "." : ";"}`, {
            align: AlignmentType.JUSTIFIED,
            after: 60,
          })
        )
      : [para("1. …", { after: 60 })]),
    para("", { after: 120 }),
    para("Memberi Perintah/Memberi Tugas", { bold: true, align: AlignmentType.CENTER, after: 220 }),
    para("Kepada :", { after: 60 }),
    ...(kepada.length ? kepada.map((l, i) => para(`${i + 1}. ${l};`, { after: 60 })) : [para("1. …", { after: 60 })]),
    ...(kepada.length > 1 ? [para("dan seterusnya.", { italics: true, after: 60 })] : []),
    para("", { after: 100 }),
    para("Untuk :", { after: 60 }),
    ...(untuk.length ? untuk.map((l, i) => para(`${i + 1}. ${l};`, { after: 60 })) : [para("1. …", { after: 60 })]),
    ...(untuk.length > 1 ? [para("dan seterusnya.", { italics: true, after: 60 })] : []),
    para("", { after: 260 }),
    para(f.tempatTanggal || "", { align: AlignmentType.CENTER, after: 0 }),
    ...jabatanParagraphs(f.jabatanPengirim, AlignmentType.CENTER),
    ...emptyLine(3),
    para(f.namaPengirim, { align: AlignmentType.CENTER, bold: true }),
  ];
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

const TITLES: Record<AllForms["naskahType"], string> = {
  surat_dinas: "Surat Dinas Daerah",
  undangan: "Surat Undangan Daerah",
  memorandum: "Memorandum",
  nota_dinas: "Nota Dinas",
  surat_perintah_tugas: "Surat Perintah-Surat Tugas",
};

export function suggestedFileName(data: AllForms): string {
  const nomorRaw =
    "nomor" in data.suratDinas && data.naskahType === "surat_dinas"
      ? data.suratDinas.nomor
      : data.naskahType === "undangan"
      ? data.undangan.nomor
      : data.naskahType === "memorandum"
      ? data.memorandum.nomor
      : data.naskahType === "nota_dinas"
      ? data.notaDinas.nomor
      : data.suratPerintahTugas.nomor;

  const safeNomor = (nomorRaw || "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const base = TITLES[data.naskahType].replace(/\s+/g, "-");
  return safeNomor ? `${base}-${safeNomor}.docx` : `${base}.docx`;
}

// Margin (twips, 1cm ≈ 566.93 twips):
// - Memorandum & Nota Dinas: atas 2cm, kiri 2,5cm, bawah 2,5cm, kanan 2cm.
// - Surat Dinas Daerah, Surat Undangan Daerah, Surat Perintah/Surat Tugas: atas 2cm, kiri 2,5cm, bawah 2,5cm, kanan 2,5cm.
const MARGIN_MEMO_NOTA = { top: 1134, bottom: 1417, left: 1417, right: 1134 };
const MARGIN_SURAT = { top: 1134, bottom: 1417, left: 1417, right: 1417 };

export async function generateNaskahDocxBlob(data: AllForms): Promise<Blob> {
  const isMemoNota = data.naskahType === "memorandum" || data.naskahType === "nota_dinas";
  const isRingkas = data.naskahType === "surat_perintah_tugas";

  const kop = isRingkas
    ? buildKopSingkat(data.satker.nama)
    : isMemoNota
    ? buildKopMemoNota(data.satker.nama)
    : buildKop(data.satker.nama, data.satker.alamat, data.satker.homepage, data.satker.email);

  const margin = isMemoNota ? MARGIN_MEMO_NOTA : MARGIN_SURAT;

  let body: Paragraph[];
  switch (data.naskahType) {
    case "surat_dinas":
      body = buildSuratDinasBody(data.suratDinas);
      break;
    case "undangan":
      body = buildUndanganBody(data.undangan);
      break;
    case "memorandum":
      body = buildMemorandumBody(data.memorandum);
      break;
    case "nota_dinas":
      body = buildNotaDinasBody(data.notaDinas);
      break;
    case "surat_perintah_tugas":
      body = buildSuratPerintahTugasBody(data.suratPerintahTugas);
      break;
    default:
      body = [];
  }

  const doc = new Document({
    creator: "Alat Bantu Penyusunan Naskah Dinas — BPS Provinsi Jawa Tengah",
    title: TITLES[data.naskahType],
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_BODY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin,
          },
        },
        children: [...kop, ...body],
      },
    ],
  });

  return Packer.toBlob(doc);
}
