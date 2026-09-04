// components/prayer/PrayerTimesWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRegionPrayerTimes } from '@/lib/prayerTimes';
import { Clock, MapPin, CalendarDays, ArrowRight, LocateFixed, Loader2 } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten, findNearestBantenRegion } from '@/lib/constants/bantenRegions';

export function PrayerTimesWidget() {
  const [now, setNow] = useState<Date | null>(null);
  const [region, setRegion] = useState<KotaKabupatenBanten>('Kota Serang');
  const [isLocating, setIsLocating] = useState(false);

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

  if (!now) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl w-full h-24 animate-pulse" />
    );
  }

  const data = getRegionPrayerTimes(now, region);
  const times = data.items;
  const nextPrayer = data.nextPrayerName;

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
        {times.map((item, index) => {
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