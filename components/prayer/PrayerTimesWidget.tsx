// components/prayer/PrayerTimesWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { getSerangPrayerTimes } from '@/lib/prayerTimes';
import { Clock, MapPin } from 'lucide-react';

export function PrayerTimesWidget() {
  const [now, setNow] = useState<Date | null>(null);

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

  if (!now) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl w-full h-24 animate-pulse" />
    );
  }

  const data = getSerangPrayerTimes(now);
  const times = data.items;
  const nextPrayer = data.nextPrayerName;

  return (
    <div className="bg-gradient-to-br from-[#093c96] to-blue-900 shadow-lg p-5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-blue-100">
          <MapPin className="w-4 h-4" />
          <span className="font-medium text-sm">Kota Serang, Banten</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Menuju {nextPrayer}</span>
        </div>
      </div>

      <div className="gap-2 grid grid-cols-5 text-center">
        {times.map((item) => (
          <div
            key={item.name}
            className={`rounded-xl p-2.5 transition-all ${
              item.isNext
                ? 'bg-white text-[#093c96] shadow-md font-bold scale-105'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <p className={`text-xs ${item.isNext ? 'text-[#093c96]' : 'text-blue-200'}`}>
              {item.name}
            </p>
            <p className="mt-1 font-semibold text-sm tracking-tight">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}