// lib/prayerTimes.ts
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format } from 'date-fns';
import { PrayerTimeItem } from '@/types';

import { BANTEN_REGIONS, KotaKabupatenBanten } from './constants/bantenRegions';

// Koordinat Resmi Kota Serang, Banten
export const SERANG_COORDINATES = new Coordinates(-6.1104, 106.1640);

export function getRegionPrayerTimes(
  date: Date = new Date(),
  regionName: KotaKabupatenBanten = 'Kota Serang'
): {
  items: PrayerTimeItem[];
  nextPrayerName: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
} {
  const region = BANTEN_REGIONS.find((r) => r.name === regionName);
  const coords = region
    ? new Coordinates(region.coordinates.lat, region.coordinates.lng)
    : SERANG_COORDINATES;

  // Parameter Hisab Kemenag / Muslim World League disesuaikan
  const params = CalculationMethod.MuslimWorldLeague();
  params.fajrAngle = 20.0; // Standar Kemenag RI
  params.ishaAngle = 18.0; // Standar Kemenag RI

  const prayerTimes = new PrayerTimes(coords, date, params);
  const now = new Date();

  const rawTimes = [
    { key: 'Subuh', dateObj: prayerTimes.fajr },
    { key: 'Dzuhur', dateObj: prayerTimes.dhuhr },
    { key: 'Ashar', dateObj: prayerTimes.asr },
    { key: 'Maghrib', dateObj: prayerTimes.maghrib },
    { key: 'Isya', dateObj: prayerTimes.isha },
  ];

  let nextFound = false;
  let nextPrayerName = 'Subuh';

  const items: PrayerTimeItem[] = rawTimes.map((item) => {
    const isPassed = now > item.dateObj;
    let isNext = false;

    if (!isPassed && !nextFound) {
      isNext = true;
      nextFound = true;
      nextPrayerName = item.key;
    }

    return {
      name: item.key,
      time: format(item.dateObj, 'HH:mm'),
      isPassed,
      isNext,
    };
  });

  return {
    items,
    nextPrayerName,
    fajr: format(prayerTimes.fajr, 'HH:mm'),
    dhuhr: format(prayerTimes.dhuhr, 'HH:mm'),
    asr: format(prayerTimes.asr, 'HH:mm'),
    maghrib: format(prayerTimes.maghrib, 'HH:mm'),
    isha: format(prayerTimes.isha, 'HH:mm'),
  };
}

export function getMonthlyRegionPrayerTimes(
  month: number,
  year: number,
  regionName: KotaKabupatenBanten = 'Kota Serang'
) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const jadwal = [];
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month - 1, i);
    const dayName = days[date.getDay()];
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${year}-${pad(month)}-${pad(i)}`;

    const region = BANTEN_REGIONS.find((r) => r.name === regionName);
    const coords = region
      ? new Coordinates(region.coordinates.lat, region.coordinates.lng)
      : SERANG_COORDINATES;

    const params = CalculationMethod.MuslimWorldLeague();
    params.fajrAngle = 20.0;
    params.ishaAngle = 18.0;

    const prayerTimes = new PrayerTimes(coords, date, params);

    // Imsak is 10 minutes before Fajr
    const imsakDate = new Date(prayerTimes.fajr.getTime() - 10 * 60000);

    // Dhuha is around 20 minutes after Sunrise
    const dhuhaDate = new Date(prayerTimes.sunrise.getTime() + 20 * 60000);

    jadwal.push({
      tanggal: i,
      hari: dayName,
      tanggal_lengkap: dateStr,
      imsak: format(imsakDate, 'HH:mm'),
      subuh: format(prayerTimes.fajr, 'HH:mm'),
      terbit: format(prayerTimes.sunrise, 'HH:mm'),
      dhuha: format(dhuhaDate, 'HH:mm'),
      dzuhur: format(prayerTimes.dhuhr, 'HH:mm'),
      ashar: format(prayerTimes.asr, 'HH:mm'),
      maghrib: format(prayerTimes.maghrib, 'HH:mm'),
      isya: format(prayerTimes.isha, 'HH:mm'),
    });
  }

  return { jadwal };
}