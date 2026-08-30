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
}

export interface EQuranShalatData {
  provinsi: string;
  kabkota: string;
  bulan: number | string;
  tahun: string | number;
  bulan_nama?: string;
  jadwal: EQuranDailyShalat[];
}

export interface EQuranShalatResponse {
  code: number;
  message: string;
  data: EQuranShalatData;
}
