import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { AllForms, NaskahType } from "./types";

/* ------------------------------------------------------------------ */
/*  Pemetaan nama file template per jenis naskah dinas.                 */
/*  HARUS SAMA PERSIS dengan nama file yang diupload ke                 */
/*  public/templates/ — lihat public/templates/README.md               */
/* ------------------------------------------------------------------ */
const TEMPLATE_FILE: Record<NaskahType, string> = {
  surat_dinas: "/templates/surat-dinas.docx",
  undangan: "/templates/undangan.docx",
  memorandum: "/templates/memorandum.docx",
  nota_dinas: "/templates/nota-dinas.docx",
  surat_perintah_tugas: "/templates/surat-perintah-tugas.docx",
};

function linesOrDash(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// Cek apakah template untuk jenis naskah ini sudah diupload ke public/templates/.
// Dipakai supaya sistem bisa fallback otomatis ke generator kode lama (generateDocx.ts)
// selama template belum tersedia, tanpa bikin fitur yang sudah ada rusak.
export async function templateExists(naskahType: NaskahType): Promise<boolean> {
  try {
    const res = await fetch(TEMPLATE_FILE[naskahType], { method: "HEAD" });
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
        // adaLampiran dipakai sebagai kondisi {#adaLampiran}...{/adaLampiran} di template
        // untuk membungkus halaman lampiran (page break + daftarLampiranList) — hanya
        // muncul kalau pengguna memilih mode "dengan lampiran" di formulir.
        adaLampiran: f.modeSurat === "dengan_lampiran",
        daftarLampiranList: linesOrDash(f.daftarLampiran),
      };
    }
    case "undangan": {
      const f = data.undangan;
      return {
        ...common,
        nomor: f.nomor,
        sifat: f.sifat,
        lampiran: f.lampiran,
        hal: f.hal,
        tempatTanggal: f.tempatTanggal,
        yth: f.yth,
        alineaPembuka: f.alineaPembuka,
        hariTanggal: f.hariTanggal,
        waktu: f.waktu,
        tempatAcara: f.tempatAcara,
        acara: f.acara,
        alineaPenutup: f.alineaPenutup,
        jabatanPengirim: f.jabatanPengirim,
        namaPengirim: f.namaPengirim,
        tembusanList: linesOrDash(f.tembusan),
        daftarDiundangList: linesOrDash(f.daftarDiundang),
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
      const adaLampiran = f.modeSurat === "dengan_lampiran";
      return {
        ...common,
        nomor: f.nomor,
        tempatTanggal: f.tempatTanggal,
        jabatanPengirim: f.jabatanPengirim,
        namaPengirim: f.namaPengirim,
        menimbangList: linesOrDash(f.menimbang),
        mengingatList: linesOrDash(f.mengingat),
        // Kalau dengan_lampiran: kepadaList sengaja dikosongkan — template harus pakai
        // {#adaLampiran} untuk menampilkan teks rujukan "sebagaimana tercantum dalam
        // Lampiran Surat Tugas ini" alih-alih daftar nama di badan surat.
        kepadaList: adaLampiran ? [] : linesOrDash(f.kepada),
        untukList: linesOrDash(f.untuk),
        adaLampiran,
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
  const templateUrl = TEMPLATE_FILE[data.naskahType];
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
