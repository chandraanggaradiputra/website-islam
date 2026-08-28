// lib/prayerTimes.ts
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format } from 'date-fns';
import { PrayerTimeItem } from '@/types';

// Koordinat Resmi Kota Serang, Banten
export const SERANG_COORDINATES = new Coordinates(-6.1104, 106.1640);

export function getSerangPrayerTimes(date: Date = new Date()): {
  items: PrayerTimeItem[];
  nextPrayerName: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
} {
  // Parameter Hisab Kemenag / Muslim World League disesuaikan
  const params = CalculationMethod.MuslimWorldLeague();
  params.fajrAngle = 20.0; // Standar Kemenag RI
  params.ishaAngle = 18.0; // Standar Kemenag RI

  const prayerTimes = new PrayerTimes(SERANG_COORDINATES, date, params);
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