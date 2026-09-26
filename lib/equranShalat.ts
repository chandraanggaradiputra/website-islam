import { Coordinates } from 'adhan';
import {
  EQuranDailyShalat,
  EQuranShalatData,
  MyQuranHijriResponse,
  MyQuranJadwalResponse,
} from '@/types/prayer';
import {
  BANTEN_MYQURAN_IDS,
  KotaKabupatenBanten,
} from './constants/bantenRegions';
import { getMonthlyRegionPrayerTimes } from './prayerTimes';

export const SERANG_COORDINATES = new Coordinates(-6.1104, 106.164);

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
 * Helper untuk mengambil tanggal Hijriah resmi Kemenag RI dari MyQuran API
 */
export async function getMyQuranHijriDate(): Promise<string | null> {
  try {
    const res = await fetch('https://api.myquran.com/v2/cal/hijr', {
      next: {
        revalidate: 86400, // 24 jam cache
        tags: ['hijri-calendar'],
      },
    });
    if (!res.ok) return null;
    const json: MyQuranHijriResponse = await res.json();
    if (json.status && json.data?.date?.[1]) {
      return json.data.date[1]; // e.g. "13 Rabiul Akhir 1448 H"
    }
    return null;
  } catch (err) {
    console.warn('[getMyQuranHijriDate] Gagal mengambil tanggal hijriah dari MyQuran API:', err);
    return null;
  }
}

/**
 * Fallback generator jadwal sholat lokal menggunakan perhitungan astronomi Adhan
 */
export function getFallbackMonthlyShalat(
  bulan: number,
  tahun: number,
  regionName: KotaKabupatenBanten
): EQuranShalatData {
  const { jadwal } = getMonthlyRegionPrayerTimes(bulan, tahun, regionName);

  let fallbackHijri = '';
  try {
    fallbackHijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    fallbackHijri = '';
  }

  return {
    provinsi: 'Banten',
    kabkota: regionName,
    bulan,
    tahun,
    bulan_nama: INDONESIAN_MONTHS[bulan - 1] || `Bulan ${bulan}`,
    tanggal_hijriah_hari_ini: fallbackHijri || undefined,
    jadwal: jadwal as EQuranDailyShalat[],
  };
}

/**
 * Fetcher Jadwal Sholat Bulanan dari MyQuran API (Sumber resmi Bimas Islam Kemenag RI)
 * Terintegrasi penanggalan Hijriah resmi, Next.js Cache 24 Jam, dan Zero Silent Fallback (Adhan).
 */
export async function getMonthlyShalat(
  regionName: KotaKabupatenBanten = 'Kota Serang',
  bulan?: number,
  tahun?: number
): Promise<EQuranShalatData> {
  const now = new Date();
  const targetBulan = bulan ?? now.getMonth() + 1;
  const targetTahun = tahun ?? now.getFullYear();
  const cityId = BANTEN_MYQURAN_IDS[regionName] || '1106';
  const pad = (n: number) => n.toString().padStart(2, '0');

  try {
    const [scheduleRes, hijriDateToday] = await Promise.all([
      fetch(
        `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${targetTahun}/${pad(targetBulan)}`,
        {
          next: {
            revalidate: 86400, // 24 jam cache
            tags: ['prayer-times', regionName],
          },
        }
      ).catch((err) => {
        console.warn(`[getMonthlyShalat] Network error fetch MyQuran jadwal ${cityId}:`, err);
        return null;
      }),
      getMyQuranHijriDate(),
    ]);

    if (!scheduleRes || !scheduleRes.ok) {
      console.warn(
        `[getMonthlyShalat] MyQuran API status ${scheduleRes?.status ?? 'network error'}. Menggunakan fallback lokal Adhan.`
      );
      const fallback = getFallbackMonthlyShalat(targetBulan, targetTahun, regionName);
      if (hijriDateToday) {
        fallback.tanggal_hijriah_hari_ini = hijriDateToday;
      }
      return fallback;
    }

    const result: MyQuranJadwalResponse = await scheduleRes.json();

    if (
      result.status &&
      result.data &&
      Array.isArray(result.data.jadwal) &&
      result.data.jadwal.length > 0
    ) {
      const todayDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const mappedJadwal: EQuranDailyShalat[] = result.data.jadwal.map((item) => {
        const parts = item.tanggal.split(',');
        const hari = parts[0]?.trim() || '';
        const dayNum = parseInt(item.date.split('-')[2], 10) || 1;
        const isToday = item.date === todayDateStr;

        return {
          tanggal: dayNum,
          tanggal_lengkap: item.date,
          hari,
          imsak: item.imsak,
          subuh: item.subuh,
          terbit: item.terbit,
          dhuha: item.dhuha,
          dzuhur: item.dzuhur,
          ashar: item.ashar,
          maghrib: item.maghrib,
          isya: item.isya,
          tanggal_hijriah: isToday && hijriDateToday ? hijriDateToday : undefined,
        };
      });

      return {
        provinsi: 'Banten',
        kabkota: regionName,
        bulan: targetBulan,
        tahun: targetTahun,
        bulan_nama: INDONESIAN_MONTHS[targetBulan - 1] || `Bulan ${targetBulan}`,
        tanggal_hijriah_hari_ini: hijriDateToday || undefined,
        jadwal: mappedJadwal,
      };
    }

    console.warn('[getMonthlyShalat] Format respons MyQuran tidak sesuai. Menggunakan fallback lokal.');
    const fallback = getFallbackMonthlyShalat(targetBulan, targetTahun, regionName);
    if (hijriDateToday) {
      fallback.tanggal_hijriah_hari_ini = hijriDateToday;
    }
    return fallback;
  } catch (error) {
    console.error('[getMonthlyShalat] Terjadi kesalahan saat fetch API:', error);
    return getFallbackMonthlyShalat(targetBulan, targetTahun, regionName);
  }
}
