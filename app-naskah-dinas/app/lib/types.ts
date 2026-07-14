/* ------------------------------------------------------------------ */
/*  Shared types — dipakai oleh halaman utama dan generator .docx      */
/* ------------------------------------------------------------------ */

export type NaskahType =
  | "surat_dinas"
  | "undangan"
  | "memorandum"
  | "nota_dinas"
  | "surat_perintah_tugas";

export interface SatkerInfo {
  nama: string;
  alamat: string;
  homepage: string;
  email: string;
}

export interface SuratDinasForm {
  nomor: string;
  sifat: string;
  lampiran: string;
  hal: string;
  tempatTanggal: string;
  yth: string;
  alineaPembuka: string;
  alineaIsi: string;
  alineaPenutup: string;
  jabatanPengirim: string;
  namaPengirim: string;
  tembusan: string;
}

export interface UndanganForm {
  nomor: string;
  sifat: string;
  lampiran: string;
  hal: string;
  tempatTanggal: string;
  yth: string;
  alineaPembuka: string;
  hariTanggal: string;
  waktu: string;
  tempatAcara: string;
  acara: string;
  alineaPenutup: string;
  jabatanPengirim: string;
  namaPengirim: string;
  tembusan: string;
  daftarDiundang: string;
}

export interface MemorandumForm {
  nomor: string;
  yth: string;
  hal: string;
  isi: string;
  tempatTanggal: string;
  jabatanPengirim: string;
  namaPengirim: string;
  tembusan: string;
}

export interface NotaDinasForm {
  nomor: string;
  yth: string;
  dari: string;
  hal: string;
  tanggal: string;
  isi: string;
  namaPengirim: string;
  tembusan: string;
}

export interface SuratPerintahTugasForm {
  nomor: string;
  tempatTanggal: string;
  menimbang: string;
  mengingat: string;
  kepada: string;
  untuk: string;
  jabatanPengirim: string;
  namaPengirim: string;
}

export interface AllForms {
  naskahType: NaskahType;
  satker: SatkerInfo;
  suratDinas: SuratDinasForm;
  undangan: UndanganForm;
  memorandum: MemorandumForm;
  notaDinas: NotaDinasForm;
  suratPerintahTugas: SuratPerintahTugasForm;
}
