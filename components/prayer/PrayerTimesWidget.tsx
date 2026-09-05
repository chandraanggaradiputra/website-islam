// components/prayer/PrayerTimesWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMonthlyPrayerTimesAction } from '@/app/actions/prayer';
import { Clock, MapPin, CalendarDays, ArrowRight, LocateFixed, Loader2 } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten, findNearestBantenRegion } from '@/lib/constants/bantenRegions';
import { EQuranDailyShalat } from '@/types/prayer';

export function PrayerTimesWidget() {
  const [now, setNow] = useState<Date | null>(null);
  const [region, setRegion] = useState<KotaKabupatenBanten>('Kota Serang');
  const [isLocating, setIsLocating] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<EQuranDailyShalat | null>(null);
  const [nextPrayer, setNextPrayer] = useState('Subuh');
  const [prayerItems, setPrayerItems] = useState<{name: string, time: string, isPassed: boolean, isNext: boolean}[]>([]);

  useEffect(() => {
    // Sinkronisasi region dari localStorage (Hydration Safe)
    const storedRegion = typeof window !== 'undefined' ? localStorage.getItem('banten_mengaji_region') : null;
    if (storedRegion && BANTEN_REGIONS.some((r) => r.name === storedRegion)) {
      setRegion(storedRegion as KotaKabupatenBanten);
    }

    const timeout = setTimeout(() => setNow(new Date()), 0);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!now) return;
    const fetchPrayerTimes = async () => {
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${year}-${pad(month)}-${pad(now.getDate())}`;
      
      try {
        const data = await fetchMonthlyPrayerTimesAction(region, month, year);
        const today = data.jadwal.find(d => d.tanggal_lengkap === dateStr) || data.jadwal[now.getDate() - 1];
        if (today) setTodaySchedule(today);
      } catch (error) {
        console.error("Failed to fetch prayer times", error);
      }
    };
    
    fetchPrayerTimes();
  }, [region, now?.getDate(), now?.getMonth(), now?.getFullYear()]);

  useEffect(() => {
    if (!now || !todaySchedule) return;

    const [year, month, day] = todaySchedule.tanggal_lengkap.split('-');
    
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return new Date(Number(year), Number(month) - 1, Number(day), h, m);
    };

    const rawTimes = [
      { name: 'Subuh', time: todaySchedule.subuh, dateObj: parseTime(todaySchedule.subuh) },
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

    setPrayerItems(items);
    setNextPrayer(nextName);
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
      alert("Browser Anda tidak mendukung deteksi lokasi otomatis.");
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
        alert("Gagal mendeteksi lokasi. Pastikan izin akses lokasi diberikan.");
        setIsLocating(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  if (!now || !prayerItems.length) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl w-full h-40 animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#093c96] to-blue-900 shadow-lg p-5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-white">
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2 text-blue-100 min-w-0">
          <MapPin className="w-4 h-4 shrink-0" />
          <select
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
            className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>Menuju {nextPrayer}</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 min-[450px]:grid-cols-5 mb-4">
        {prayerItems.map((item, index) => {
          const isFirstThree = index < 3;
          const colSpanClass = isFirstThree 
            ? 'col-span-2 min-[450px]:col-span-1' 
            : 'col-span-3 min-[450px]:col-span-1';

          return (
            <div
              key={item.name}
              className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all text-center ${colSpanClass} ${
                item.isNext
                  ? 'bg-white text-[#093c96] shadow-md scale-105 font-bold'
                  : 'bg-white/10 text-blue-100 hover:bg-white/15'
              }`}
            >
              <span className="text-xs font-semibold tracking-tight">{item.name}</span>
              <span className="text-sm font-extrabold mt-0.5">{item.time}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-blue-200 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
          <span>Jadwal Bimas Islam Kemenag</span>
        </span>
        <Link
          href="/jadwal-sholat"
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1 rounded-lg transition-colors group"
        >
          <span>Lihat Jadwal 1 Bulan Penuh</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}