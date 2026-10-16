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

/**
 * Konfigurasi penyesuaian penanggalan Hijriah:
 * - HIJRI_OFFSET_DAYS = 2 merepresentasikan koreksi +2 hari dari nilai default MyQuran API (adj = -1 -> adj = 1).
 * - MYQURAN_HIJRI_ADJ = 1 dikirimkan ke ?adj=1 pada endpoint https://api.myquran.com/v2/cal/hijr?adj=1
 *   dan juga digunakan sebagai offset hari (+1 hari) pada fallback Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura')
 *   sehingga keduanya menghasilkan "6 Jumadil Awwal 1448 H" pada Jum'at, 16 Oktober 2026.
 * Dapat dikustomisasi melalui environment variable NEXT_PUBLIC_HIJRI_ADJUSTMENT.
 */
export const HIJRI_OFFSET_DAYS = 2;
export const DEFAULT_MYQURAN_HIJRI_ADJ = 1;

export function getHijriAdjustment(): number {
  const raw = process.env.NEXT_PUBLIC_HIJRI_ADJUSTMENT;
  if (raw !== undefined && raw.trim() !== '') {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return DEFAULT_MYQURAN_HIJRI_ADJ;
}

const DAY_IN_MS = 86_400_000;

/**
 * Normalisasi ejaan nama bulan Hijriah dari output API / Intl agar konsisten.
 */
export function normalizeHijriMonthName(rawText: string): string {
  return rawText
    .replace(/Jumadilawal/gi, 'Jumadil Awwal')
    .replace(/Jumadil Awal/gi, 'Jumadil Awwal')
    .replace(/Jumadilakhir/gi, 'Jumadil Akhir')
    .replace(/Rabiulawal/gi, 'Rabiul Awwal')
    .replace(/Rabiul Awal/gi, 'Rabiul Awwal')
    .replace(/Rabiulakhir/gi, 'Rabiul Akhir')
    .replace(/Zulqaidah/gi, "Dzulqa'dah")
    .replace(/Zulhijah/gi, 'Dzulhijjah')
    .trim();
}

/**
 * Menghitung tanggal Hijriah terformat (e.g. "6 Jumadil Awwal 1448 H") menggunakan
 * Intl Ummul Qura yang telah dikoreksi dengan offset dinamis.
 */
export function formatAdjustedHijriDate(
  baseDate: Date = new Date(),
  adjValue: number = getHijriAdjustment()
): string {
  try {
    const adjustedDate = new Date(baseDate.getTime() + adjValue * DAY_IN_MS);
    const formatted = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(adjustedDate);
    const normalized = normalizeHijriMonthName(formatted);
    return normalized.endsWith('H') ? normalized : `${normalized} H`;
  } catch {
    return '';
  }
}

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
 * dengan dukungan parameter penyesuaian ?adj=${adjValue}.
 */
export async function getMyQuranHijriDate(
  adjValue: number = getHijriAdjustment()
): Promise<string | null> {
  try {
    const url = `https://api.myquran.com/v2/cal/hijr?adj=${encodeURIComponent(String(adjValue))}`;
    const res = await fetch(url, {
      next: {
        revalidate: 3600,
        tags: ['hijri-calendar'],
      },
    });
    if (!res.ok) {
      return formatAdjustedHijriDate(new Date(), adjValue) || null;
    }
    const json: MyQuranHijriResponse = await res.json();
    if (json.status && json.data?.date?.[1]) {
      return normalizeHijriMonthName(json.data.date[1]);
    }
    return formatAdjustedHijriDate(new Date(), adjValue) || null;
  } catch (err) {
    console.warn('[getMyQuranHijriDate] Gagal mengambil tanggal hijriah dari MyQuran API:', err);
    return formatAdjustedHijriDate(new Date(), adjValue) || null;
  }
}

/**
 * Fallback generator jadwal sholat lokal menggunakan perhitungan astronomi Adhan
 * dengan koreksi offset Hijriah dinamis.
 */
export function getFallbackMonthlyShalat(
  bulan: number,
  tahun: number,
  regionName: KotaKabupatenBanten = 'Kota Serang'
): EQuranShalatData {
  const { jadwal } = getMonthlyRegionPrayerTimes(bulan, tahun, regionName);
  const adjValue = getHijriAdjustment();
  const fallbackHijri = formatAdjustedHijriDate(new Date(), adjValue);

  const enrichedJadwal: EQuranDailyShalat[] = (jadwal as EQuranDailyShalat[]).map((item) => {
    const itemDate = new Date(`${item.tanggal_lengkap}T12:00:00+07:00`);
    const itemHijri = !Number.isNaN(itemDate.getTime())
      ? formatAdjustedHijriDate(itemDate, adjValue)
      : undefined;
    return {
      ...item,
      tanggal_hijriah: item.tanggal_hijriah || itemHijri,
    };
  });

  return {
    provinsi: 'Banten',
    kabkota: regionName,
    bulan,
    tahun,
    bulan_nama: INDONESIAN_MONTHS[bulan - 1] || `Bulan ${bulan}`,
    tanggal_hijriah_hari_ini: fallbackHijri || undefined,
    jadwal: enrichedJadwal,
  };
}

/**
 * Fetcher Jadwal Sholat Bulanan dari MyQuran API (Sumber resmi Bimas Islam Kemenag RI)
 * Terintegrasi penanggalan Hijriah terkoreksi (?adj=), Next.js Cache, dan Zero Silent Fallback (Adhan).
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
  const adjValue = getHijriAdjustment();

  try {
    const [scheduleRes, hijriDateToday] = await Promise.all([
      fetch(
        `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${targetTahun}/${pad(targetBulan)}`,
        {
          next: {
            revalidate: 86400,
            tags: ['prayer-times', regionName],
          },
        }
      ).catch((err) => {
        console.warn(`[getMonthlyShalat] Network error fetch MyQuran jadwal ${cityId}:`, err);
        return null;
      }),
      getMyQuranHijriDate(adjValue),
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
      const todayDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);

      const mappedJadwal: EQuranDailyShalat[] = result.data.jadwal.map((item) => {
        const parts = item.tanggal.split(',');
        const hari = parts[0]?.trim() || '';
        const dayNum = parseInt(item.date.split('-')[2], 10) || 1;
        const isToday = item.date === todayDateStr;
        const itemDate = new Date(`${item.date}T12:00:00+07:00`);
        const calculatedHijri = !Number.isNaN(itemDate.getTime())
          ? formatAdjustedHijriDate(itemDate, adjValue)
          : undefined;

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
          tanggal_hijriah: isToday && hijriDateToday ? hijriDateToday : calculatedHijri,
        };
      });

      return {
        provinsi: 'Banten',
        kabkota: regionName,
        bulan: targetBulan,
        tahun: targetTahun,
        bulan_nama: INDONESIAN_MONTHS[targetBulan - 1] || `Bulan ${targetBulan}`,
        tanggal_hijriah_hari_ini: hijriDateToday || formatAdjustedHijriDate(now, adjValue) || undefined,
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

export async function getMonthlyShalatSerang(
  bulan?: number,
  tahun?: number
): Promise<EQuranShalatData> {
  return getMonthlyShalat('Kota Serang', bulan, tahun);
}
