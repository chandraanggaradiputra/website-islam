// components/prayer/PrayerTimesWidget.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchMonthlyPrayerTimesAction } from '@/app/actions/prayer';
import { Clock, MapPin, CalendarDays, ArrowRight, LocateFixed, Loader2, Sparkles } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten, findNearestBantenRegion } from '@/lib/constants/bantenRegions';
import { EQuranDailyShalat } from '@/types/prayer';

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

export function PrayerTimesWidget() {
  const [now, setNow] = useState<Date | null>(null);
  const [region, setRegion] = useState<KotaKabupatenBanten>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('banten_mengaji_region');
      if (stored && BANTEN_REGIONS.some((r) => r.name === stored)) {
        return stored as KotaKabupatenBanten;
      }
    }
    return 'Kota Serang';
  });
  const [isLocating, setIsLocating] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<EQuranDailyShalat | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    const timeout = setTimeout(() => setNow(new Date()), 0);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const dayNumber = now ? now.getDate() : 0;
  const monthNumber = now ? now.getMonth() + 1 : 0;
  const yearNumber = now ? now.getFullYear() : 0;

  useEffect(() => {
    if (!dayNumber || !monthNumber || !yearNumber) return;
    let isMounted = true;

    const fetchPrayerTimes = async () => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${yearNumber}-${pad(monthNumber)}-${pad(dayNumber)}`;

      try {
        const data = await fetchMonthlyPrayerTimesAction(region, monthNumber, yearNumber);
        if (!isMounted) return;

        const today =
          data.jadwal.find((d) => d.tanggal_lengkap === dateStr) ||
          data.jadwal[dayNumber - 1];
        if (today) {
          setTodaySchedule(today);
          if (today.tanggal_hijriah) {
            setHijriDate(today.tanggal_hijriah);
          } else if (data.tanggal_hijriah_hari_ini) {
            setHijriDate(data.tanggal_hijriah_hari_ini);
          }
        }
      } catch (error) {
        console.error('Failed to fetch prayer times', error);
      }
    };

    fetchPrayerTimes();

    return () => {
      isMounted = false;
    };
  }, [region, dayNumber, monthNumber, yearNumber]);

  const { prayerItems, nextPrayer } = useMemo(() => {
    if (!now || !todaySchedule) {
      return { prayerItems: [], nextPrayer: 'Subuh' };
    }

    const [year, month, day] = todaySchedule.tanggal_lengkap.split('-');

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return new Date(Number(year), Number(month) - 1, Number(day), h, m);
    };

    const rawTimes = [
      { name: 'Subuh', time: todaySchedule.subuh, dateObj: parseTime(todaySchedule.subuh) },
      { name: 'Terbit', time: todaySchedule.terbit, dateObj: parseTime(todaySchedule.terbit) },
      { name: 'Dzuhur', time: todaySchedule.dzuhur, dateObj: parseTime(todaySchedule.dzuhur) },
      { name: 'Ashar', time: todaySchedule.ashar, dateObj: parseTime(todaySchedule.ashar) },
      { name: 'Maghrib', time: todaySchedule.maghrib, dateObj: parseTime(todaySchedule.maghrib) },
      { name: 'Isya', time: todaySchedule.isya, dateObj: parseTime(todaySchedule.isya) },
    ];

    let nextFound = false;
    let nextName = 'Subuh';

    const items = rawTimes.map((item) => {
      const isPassed = now > item.dateObj;
      let isNext = false;
      if (!isPassed && !nextFound) {
        isNext = true;
        nextFound = true;
        nextName = item.name;
      }
      return {
        name: item.name,
        time: item.time,
        isPassed,
        isNext,
      };
    });

    return { prayerItems: items, nextPrayer: nextName };
  }, [now, todaySchedule]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value as KotaKabupatenBanten;
    setRegion(newRegion);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banten_mengaji_region', newRegion);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestBantenRegion(latitude, longitude);
        setRegion(nearest);
        if (typeof window !== 'undefined') {
          localStorage.setItem('banten_mengaji_region', nearest);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Gagal mendeteksi lokasi. Pastikan izin akses lokasi diberikan.');
        setIsLocating(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  if (!now || !prayerItems.length || !todaySchedule) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl w-full h-44 animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const tanggalMasehi = `${now.getDate()} ${INDONESIAN_MONTHS[now.getMonth()]} ${now.getFullYear()} M`;

  return (
    <div className="bg-gradient-to-br from-[#093c96] to-blue-900 shadow-lg p-5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-white">
      {/* Top Header: Region Picker & Next Prayer Indicator */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <div className="flex items-center gap-2 text-blue-100 min-w-0">
          <MapPin className="w-4 h-4 shrink-0 text-blue-300" />
          <select
            aria-label="Pilih Kota atau Wilayah Sholat"
            value={region}
            onChange={handleRegionChange}
            className="bg-transparent border-none text-white font-medium text-sm focus:ring-0 cursor-pointer outline-none appearance-none hover:text-blue-200 transition-colors truncate"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            {BANTEN_REGIONS.map((r) => (
              <option key={r.id} value={r.name} className="text-slate-900">
                {r.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Deteksi Lokasi Saya"
            aria-label="Deteksi Lokasi Saya"
            className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs shrink-0 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-200" />
          <span>Menuju {nextPrayer}</span>
        </div>
      </div>

      {/* Penanggalan Ganda Masehi & Kalender Hijriah */}
      <div className="flex items-center gap-2 text-xs text-blue-100 font-medium mb-3.5 bg-black/15 px-3 py-1.5 rounded-lg border border-white/10">
        <CalendarDays className="w-3.5 h-3.5 text-blue-300 shrink-0" />
        <span className="truncate">
          {todaySchedule.hari}, {tanggalMasehi}
          {hijriDate ? ` / ${hijriDate}` : ''}
        </span>
      </div>

      {/* Grid 6 Waktu Shalat: Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya */}
      <div className="grid grid-cols-3 min-[480px]:grid-cols-6 gap-2 mb-4">
        {prayerItems.map((item) => (
          <div
            key={item.name}
            className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all text-center ${
              item.isNext
                ? 'bg-white text-[#093c96] shadow-md scale-105 font-bold'
                : 'bg-white/10 text-blue-100 hover:bg-white/15'
            }`}
          >
            <span className="text-xs font-semibold tracking-tight">{item.name}</span>
            <span className="text-sm font-extrabold mt-0.5">{item.time}</span>
          </div>
        ))}
      </div>

      {/* Footer Info & Link Kalender 1 Bulan Penuh */}
      <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-blue-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Jadwal Bimas Islam Kemenag RI</span>
        </span>
        <Link
          href="/jadwal-sholat"
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors group min-h-[36px]"
        >
          <span>Lihat Jadwal 1 Bulan Penuh</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}