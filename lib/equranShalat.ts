import { Coordinates } from 'adhan';
import { EQuranDailyShalat, EQuranShalatData, EQuranShalatResponse } from '@/types/prayer';
import { KotaKabupatenBanten } from './constants/bantenRegions';
import { getMonthlyRegionPrayerTimes } from './prayerTimes';

export const SERANG_COORDINATES = new Coordinates(-6.1104, 106.1640);

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
 * Fallback generator jadwal sholat lokal menggunakan perhitungan astronomi
 */
export function getFallbackMonthlyShalat(
  bulan: number,
  tahun: number,
  regionName: KotaKabupatenBanten
): EQuranShalatData {
  const { jadwal } = getMonthlyRegionPrayerTimes(bulan, tahun, regionName);

  return {
    provinsi: 'Banten',
    kabkota: regionName,
    bulan,
    tahun,
    bulan_nama: INDONESIAN_MONTHS[bulan - 1] || `Bulan ${bulan}`,
    jadwal: jadwal as EQuranDailyShalat[],
  };
}

/**
 * Fetcher Jadwal Sholat Bulanan dari API Resmi EQuran (Bimas Islam Kemenag RI)
 * Dilengkapi dengan Next.js Cache Revalidation 24 Jam dan Fallback Adhan.
 */
export async function getMonthlyShalat(
  regionName: KotaKabupatenBanten = 'Kota Serang',
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
        kabkota: regionName,
        bulan: targetBulan,
        tahun: targetTahun,
      }),
      next: {
        revalidate: 86400, // 24 jam cache
        tags: ['prayer-times', regionName],
      },
    });

    if (!response.ok) {
      console.warn(`[getMonthlyShalat] API HTTP ${response.status}. Menggunakan fallback kalkulasi lokal.`);
      return getFallbackMonthlyShalat(targetBulan, targetTahun, regionName);
    }

    const result: EQuranShalatResponse = await response.json();

    if (result.code === 200 && result.data && Array.isArray(result.data.jadwal) && result.data.jadwal.length > 0) {
      return result.data;
    }

    console.warn('[getMonthlyShalat] Format data API tidak sesuai. Menggunakan fallback lokal.');
    return getFallbackMonthlyShalat(targetBulan, targetTahun, regionName);
  } catch (error) {
    console.error('[getMonthlyShalat] Terjadi kesalahan saat fetch API:', error);
    return getFallbackMonthlyShalat(targetBulan, targetTahun, regionName);
  }
}
