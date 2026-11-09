// components/prayer/MonthlyPrayerCalendarSkeleton.tsx
import { Sparkles, MapPin, Printer, Calendar } from 'lucide-react';

export function MonthlyPrayerCalendarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Header Banner Skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-[#093c96]/80 via-blue-800/80 to-indigo-950/80 p-6 md:p-8 text-white shadow-xl relative overflow-hidden min-h-[220px]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-100 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 opacity-60" />
              <div className="h-3.5 w-44 bg-white/20 rounded" />
            </div>
            <div className="h-8 w-72 md:w-96 bg-white/20 rounded-lg" />
            <div className="flex items-center gap-2 text-blue-100/70 text-sm">
              <MapPin className="w-4 h-4 shrink-0 text-blue-300 opacity-60" />
              <div className="h-4 w-60 bg-white/20 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 min-h-[48px] w-40">
              <Printer className="w-4 h-4 text-white/50" />
              <div className="h-4 w-24 bg-white/30 rounded" />
            </div>
          </div>
        </div>

        {/* 8 Slot Sholat Hari Ini Skeleton */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-4 rounded-full bg-yellow-300/40" />
            <div className="h-4 w-52 bg-white/20 rounded" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
            {['Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map((name) => (
              <div key={name} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 space-y-1.5">
                <span className="text-blue-200/70 text-[11px] block">{name}</span>
                <div className="h-4 w-10 mx-auto bg-white/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigasi Pilihan Bulan & Wilayah Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[110px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#093c96]/40 dark:text-blue-400/40 shrink-0" />
              <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="hidden md:block h-10 w-44 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <div className="h-10 w-36 md:hidden bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            </div>
          </div>
        </div>

        {/* 12 Bulan Skeleton Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>

      {/* Tabel 30 Hari Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-3 text-left w-28 md:w-36">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </th>
                {['Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map((label) => (
                  <th key={label} className="py-3.5 px-2">
                    <div className="h-4 w-10 mx-auto bg-slate-200 dark:bg-slate-700 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Array.from({ length: 15 }).map((_, idx) => (
                <tr key={idx} className="h-11">
                  <td className="py-2.5 px-3 text-left">
                    <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  {Array.from({ length: 8 }).map((_, cellIdx) => (
                    <td key={cellIdx} className="py-2.5 px-2">
                      <div className="h-4 w-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
