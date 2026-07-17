import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { AllForms } from "./types";

/* ------------------------------------------------------------------ */
/*  Pemetaan nama file template.                                        */
/*  HARUS SAMA PERSIS dengan nama file yang diupload ke                 */
/*  public/templates/ — lihat public/templates/README.md.               */
/*                                                                       */
/*  Surat Dinas & Surat Perintah/Surat Tugas punya 2 file template      */
/*  terpisah (bukan 1 file dengan tag kondisi): satu untuk mode          */
/*  "1 halaman / tanpa lampiran", satu lagi untuk mode "dengan           */
/*  lampiran". Sistem otomatis pilih file mana yang dipakai sesuai       */
/*  pilihan mode yang ditentukan pengguna di formulir.                   */
/* ------------------------------------------------------------------ */
function resolveTemplatePath(data: AllForms): string {
  switch (data.naskahType) {
    case "surat_dinas":
      return data.suratDinas.modeSurat === "dengan_lampiran"
        ? "/templates/surat-dinas-lampiran.docx"
        : "/templates/surat-dinas.docx";
    case "undangan":
      // Undangan tidak punya template sendiri — sesuai keputusan, reuse file
      // surat-dinas.docx / surat-dinas-lampiran.docx. Pilih versi lampiran kalau
      // ada daftar pejabat/pegawai yang diundang, sama seperti aturan modeSurat
      // pada Surat Dinas biasa.
      return linesOrDash(data.undangan.daftarDiundang).length > 0
        ? "/templates/surat-dinas-lampiran.docx"
        : "/templates/surat-dinas.docx";
    case "memorandum":
      return "/templates/memorandum.docx";
    case "nota_dinas":
      return "/templates/nota-dinas.docx";
    case "surat_perintah_tugas":
      return data.suratPerintahTugas.modeSurat === "dengan_lampiran"
        ? "/templates/surat-perintah-tugas-lampiran.docx"
        : "/templates/surat-perintah-tugas.docx";
    default:
      return "";
  }
}

function linesOrDash(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// Cek apakah template untuk kombinasi jenis naskah + mode (1 halaman / dengan
// lampiran) ini sudah diupload ke public/templates/. Dipakai supaya sistem bisa
// fallback otomatis ke generator kode lama (generateDocx.ts) selama file
// template yang bersangkutan belum tersedia, tanpa bikin fitur yang sudah ada rusak.
export async function templateExists(data: AllForms): Promise<boolean> {
  const path = resolveTemplatePath(data);
  if (!path) return false;
  try {
    const res = await fetch(path, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// Susun data yang akan disuntikkan ke tag-tag di template Word, sesuai
// daftar tag di public/templates/README.md bagian 5.
function buildTagData(data: AllForms): Record<string, unknown> {
  const common = {
    namaSatker: data.satker.nama,
    alamatSatker: data.satker.alamat,
    homepageSatker: data.satker.homepage,
    emailSatker: data.satker.email,
    // Penanda posisi tanda tangan untuk SRIKANDI. Template menulisnya sebagai
    // literal teks "$" + "{ttd_pengirim}" di bagian tanda tangan, supaya saat
    // diunggah ke SRIKANDI dan dibuka via Text Editor, admin tinggal cari teks
    // "$ttd_pengirim" untuk menandai posisi barcode TTE (lihat panduan SRIKANDI
    // langkah "Text Editor"). Karena "{ttd_pengirim}" kebetulan pakai delimiter
    // yang sama dengan tag docxtemplater, kita HARUS isi nilainya di sini —
    // kalau tidak, docxtemplater akan menggantinya jadi teks "undefined".
    ttd_pengirim: "ttd_pengirim",
  };

  switch (data.naskahType) {
    case "surat_dinas": {
      const f = data.suratDinas;
      return {
        ...common,
        nomor: f.nomor,
        sifat: f.sifat,
        lampiran: f.lampiran,
        hal: f.hal,
        tempatTanggal: f.tempatTanggal,
        yth: f.yth,
        alineaPembuka: f.alineaPembuka,
        alineaIsi: f.alineaIsi,
        alineaPenutup: f.alineaPenutup,
        jabatanPengirim: f.jabatanPengirim,
        namaPengirim: f.namaPengirim,
        tembusanList: linesOrDash(f.tembusan),
        // Hanya dipakai kalau file template yang dipilih adalah versi
        // surat-dinas-lampiran.docx (lihat public/templates/README.md).
        daftarLampiranList: linesOrDash(f.daftarLampiran),
      };
    }
    case "undangan": {
      const f = data.undangan;
      // Undangan mengisi file surat-dinas.docx / surat-dinas-lampiran.docx yang sama
      // dengan Surat Dinas biasa, jadi tag-nya HARUS mengikuti tag di template itu
      // (alineaIsi, daftarLampiranList) — bukan tag khusus undangan.docx yang lama.
      const alineaIsi = [
        `hari/tanggal : ${f.hariTanggal || "-"}`,
        `waktu        : pukul ${f.waktu || "-"}`,
        `tempat       : ${f.tempatAcara || "-"}`,
        `acara        : ${f.acara || "-"}`,
      ].join("\n");
      return {
        ...common,
        nomor: f.nomor,
        sifat: f.sifat,
        lampiran: f.lampiran,
        hal: f.hal,
        tempatTanggal: f.tempatTanggal,
        yth: f.yth,
        alineaPembuka: f.alineaPembuka,
        alineaIsi,
        alineaPenutup: f.alineaPenutup,
        jabatanPengirim: f.jabatanPengirim,
        namaPengirim: f.namaPengirim,
        tembusanList: linesOrDash(f.tembusan),
        // Dipakai kalau template yang dipilih adalah surat-dinas-lampiran.docx.
        daftarLampiranList: linesOrDash(f.daftarDiundang),
      };
    }
    case "memorandum": {
      const f = data.memorandum;
      return {
        ...common,
        nomor: f.nomor,
        yth: f.yth,
        hal: f.hal,
        isi: f.isi,
        tempatTanggal: f.tempatTanggal,
        jabatanPengirim: f.jabatanPengirim,
        namaPengirim: f.namaPengirim,
        tembusanList: linesOrDash(f.tembusan),
      };
    }
    case "nota_dinas": {
      const f = data.notaDinas;
      return {
        ...common,
        nomor: f.nomor,
        yth: f.yth,
        dari: f.dari,
        hal: f.hal,
        tanggal: f.tanggal,
        isi: f.isi,
        namaPengirim: f.namaPengirim,
        tembusanList: linesOrDash(f.tembusan),
      };
    }
    case "surat_perintah_tugas": {
      const f = data.suratPerintahTugas;
      return {
        ...common,
        nomor: f.nomor,
        tempatTanggal: f.tempatTanggal,
        jabatanPengirim: f.jabatanPengirim,
        namaPengirim: f.namaPengirim,
        menimbangList: linesOrDash(f.menimbang),
        mengingatList: linesOrDash(f.mengingat),
        // Dipakai kalau file template yang dipilih adalah versi tanpa lampiran
        // (surat-perintah-tugas.docx).
        kepadaList: linesOrDash(f.kepada),
        untukList: linesOrDash(f.untuk),
        // Dipakai kalau file template yang dipilih adalah versi dengan lampiran
        // (surat-perintah-tugas-lampiran.docx) — lihat public/templates/README.md.
        daftarLampiranList: linesOrDash(f.daftarLampiran),
      };
    }
    default:
      return common;
  }
}

// Ambil file template asli dari public/templates/, isi tag-tagnya dengan data
// form, dan hasilkan file .docx baru yang formatnya 100% mengikuti template asli.
export async function generateFromTemplateBlob(data: AllForms): Promise<Blob> {
  const templateUrl = resolveTemplatePath(data);
  const res = await fetch(templateUrl);
  if (!res.ok) {
    throw new Error(
      `Template ${templateUrl} belum ditemukan di public/templates/. ` +
        `Upload dulu filenya sesuai public/templates/README.md.`
    );
  }
  const arrayBuffer = await res.arrayBuffer();

  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
  });

  try {
    doc.render(buildTagData(data));
  } catch (error: unknown) {
    // docxtemplater melempar error terstruktur kalau ada tag di Word yang
    // salah tulis / tidak ditutup — kita rangkai jadi pesan yang jelas.
    const err = error as { properties?: { errors?: Array<{ properties?: { explanation?: string } }> } };
    const details = err.properties?.errors
      ?.map((e) => e.properties?.explanation)
      .filter(Boolean)
      .join("; ");
    throw new Error(
      details
        ? `Ada tag di template Word yang bermasalah: ${details}`
        : "Gagal mengisi template Word. Cek kembali penulisan tag sesuai README."
    );
  }

  return doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
