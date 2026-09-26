// types/prayer.ts

export interface EQuranDailyShalat {
  tanggal: number;
  tanggal_lengkap: string; // Format: YYYY-MM-DD
  hari: string; // e.g. "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"
  imsak: string; // Format: HH:mm
  subuh: string; // Format: HH:mm
  terbit: string; // Format: HH:mm
  dhuha: string; // Format: HH:mm
  dzuhur: string; // Format: HH:mm
  ashar: string; // Format: HH:mm
  maghrib: string; // Format: HH:mm
  isya: string; // Format: HH:mm
  tanggal_hijriah?: string; // Format: "13 Rabiul Akhir 1448 H"
}

export interface EQuranShalatData {
  provinsi: string;
  kabkota: string;
  bulan: number | string;
  tahun: string | number;
  bulan_nama?: string;
  tanggal_hijriah_hari_ini?: string; // e.g. "13 Rabiul Akhir 1448 H"
  jadwal: EQuranDailyShalat[];
}

export interface EQuranShalatResponse {
  code: number;
  message: string;
  data: EQuranShalatData;
}

export interface MyQuranHijriResponse {
  status: boolean;
  message?: string;
  data?: {
    date: [string, string, string]; // [Hari, Tanggal Hijriah, Tanggal Masehi]
    num: [number, number, number, number, number, number, number];
  };
}

export interface MyQuranJadwalItem {
  tanggal: string; // e.g. "Sabtu, 26/09/2026"
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string; // "2026-09-26"
}

export interface MyQuranJadwalResponse {
  status: boolean;
  message?: string;
  data?: {
    id: string | number;
    lokasi: string;
    daerah: string;
    jadwal: MyQuranJadwalItem[] | MyQuranJadwalItem;
  };
}
