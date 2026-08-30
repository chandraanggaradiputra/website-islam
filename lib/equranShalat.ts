// lib/equranShalat.ts
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format, getDaysInMonth, addMinutes, subMinutes } from 'date-fns';
import { EQuranDailyShalat, EQuranShalatData, EQuranShalatResponse } from '@/types/prayer';

// Koordinat Resmi Kota Serang, Banten
export const SERANG_COORDINATES = new Coordinates(-6.1104, 106.1640);

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Fallback generator jadwal sholat lokal menggunakan perhitungan astronomi (Adhan library)
 * Menggunakan standar hisab Kementerian Agama RI (Fajr 20°, Isha 18°)
 * Menyediakan Zero Downtime jika API pihak ketiga tidak merespons.
 */
export function getFallbackMonthlyShalat(bulan: number, tahun: number): EQuranShalatData {
  const targetDate = new Date(tahun, bulan - 1, 1);
  const daysInMonth = getDaysInMonth(targetDate);
  const jadwal: EQuranDailyShalat[] = [];

  const params = CalculationMethod.MuslimWorldLeague();
  params.fajrAngle = 20.0; // Standar Kemenag RI
  params.ishaAngle = 18.0; // Standar Kemenag RI

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(tahun, bulan - 1, day);
    const pt = new PrayerTimes(SERANG_COORDINATES, currentDate, params);

    // Kemenag standard: Imsak 10 menit sebelum Subuh, Dhuha ~25 menit setelah Terbit (Matahari 4°30')
    const imsakDate = subMinutes(pt.fajr, 10);
    const dhuhaDate = addMinutes(pt.sunrise, 25);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const tanggalLengkap = `${tahun}-${pad(bulan)}-${pad(day)}`;
    const hari = INDONESIAN_DAYS[currentDate.getDay()];

    jadwal.push({
      tanggal: day,
      tanggal_lengkap: tanggalLengkap,
      hari,
      imsak: format(imsakDate, 'HH:mm'),
      subuh: format(pt.fajr, 'HH:mm'),
      terbit: format(pt.sunrise, 'HH:mm'),
      dhuha: format(dhuhaDate, 'HH:mm'),
      dzuhur: format(pt.dhuhr, 'HH:mm'),
      ashar: format(pt.asr, 'HH:mm'),
      maghrib: format(pt.maghrib, 'HH:mm'),
      isya: format(pt.isha, 'HH:mm'),
    });
  }

  return {
    provinsi: 'Banten',
    kabkota: 'Kota Serang',
    bulan,
    tahun,
    bulan_nama: INDONESIAN_MONTHS[bulan - 1] || `Bulan ${bulan}`,
    jadwal,
  };
}

/**
 * Fetcher Jadwal Sholat Bulanan Kota Serang dari API Resmi EQuran (Bimas Islam Kemenag RI)
 * Dilengkapi dengan Next.js Cache Revalidation 24 Jam dan Fallback Adhan.
 */
export async function getMonthlyShalatSerang(
  bulan?: number,
  tahun?: number
): Promise<EQuranShalatData> {
  const now = new Date();
  const targetBulan = bulan ?? now.getMonth() + 1;
  const targetTahun = tahun ?? now.getFullYear();

  try {
    const response = await fetch('https://equran.id/api/v2/shalat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provinsi: 'Banten',
        kabkota: 'Kota Serang',
        bulan: targetBulan,
        tahun: targetTahun,
      }),
      next: {
        revalidate: 86400, // 24 jam cache
      },
    });

    if (!response.ok) {
      console.warn(`[getMonthlyShalatSerang] API HTTP ${response.status}. Menggunakan fallback kalkulasi lokal.`);
      return getFallbackMonthlyShalat(targetBulan, targetTahun);
    }

    const result: EQuranShalatResponse = await response.json();

    if (result.code === 200 && result.data && Array.isArray(result.data.jadwal) && result.data.jadwal.length > 0) {
      return result.data;
    }

    console.warn('[getMonthlyShalatSerang] Format data API tidak sesuai. Menggunakan fallback lokal.');
    return getFallbackMonthlyShalat(targetBulan, targetTahun);
  } catch (error) {
    console.error('[getMonthlyShalatSerang] Terjadi kesalahan saat fetch API:', error);
    return getFallbackMonthlyShalat(targetBulan, targetTahun);
  }
}
