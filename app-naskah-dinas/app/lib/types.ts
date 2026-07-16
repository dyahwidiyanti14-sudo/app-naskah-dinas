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

// "1_halaman"      : surat cukup 1 halaman, tanpa lampiran isi terpisah.
// "dengan_lampiran": surat lebih dari 1 halaman karena ada lampiran (daftarLampiran wajib diisi).
export type ModeSuratDinas = "1_halaman" | "dengan_lampiran";

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
  modeSurat: ModeSuratDinas;
  // Isi lampiran (satu baris per butir), dipakai kalau modeSurat === "dengan_lampiran".
  // Dicetak sebagai halaman terpisah setelah badan surat, mengikuti nomor & tanggal surat.
  daftarLampiran: string;
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

// "tanpa_lampiran" : surat tugas 1 halaman, nama-nama ditulis langsung di "Kepada" (field kepada).
// "dengan_lampiran": daftar nama banyak, dipindah ke lampiran surat tugas terpisah (field daftarLampiran);
//                    field "kepada" tidak dipakai, badan surat cukup merujuk ke lampiran.
export type ModeSuratTugas = "tanpa_lampiran" | "dengan_lampiran";

export interface SuratPerintahTugasForm {
  nomor: string;
  tempatTanggal: string;
  dasarSurat: string;
  menimbang: string;
  mengingat: string;
  kepada: string;
  untuk: string;
  jabatanPengirim: string;
  namaPengirim: string;
  modeSurat: ModeSuratTugas;
  // Daftar nama/NIP/jabatan (satu baris per orang), dipakai kalau modeSurat === "dengan_lampiran".
  // Dicetak sebagai halaman Lampiran Surat Tugas terpisah.
  daftarLampiran: string;
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
