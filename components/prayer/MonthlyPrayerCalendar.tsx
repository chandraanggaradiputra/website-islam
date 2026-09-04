'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EQuranDailyShalat } from '@/types/prayer';
import { getMonthlyRegionPrayerTimes } from '@/lib/prayerTimes';
import { BANTEN_REGIONS, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';
import {
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import clsx from 'clsx';

interface MonthlyPrayerCalendarProps {
  bulan: number;
  tahun: number;
}

const MONTH_NAMES = [
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

export function MonthlyPrayerCalendar({
  bulan,
  tahun,
}: MonthlyPrayerCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentMonth = bulan;
  const currentYear = tahun;

  const [region, setRegion] = useState<KotaKabupatenBanten>('Kota Serang');

  useEffect(() => {
    const storedRegion = typeof window !== 'undefined' ? localStorage.getItem('banten_mengaji_region') : null;
    if (storedRegion && BANTEN_REGIONS.some((r) => r.name === storedRegion)) {
      setRegion(storedRegion as KotaKabupatenBanten);
    }
  }, []);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value as KotaKabupatenBanten;
    setRegion(newRegion);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banten_mengaji_region', newRegion);
    }
  };

  const [currentData, setCurrentData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    startTransition(async () => {
      try {
        const { fetchMonthlyPrayerTimesAction } = await import('@/app/actions/prayer');
        const data = await fetchMonthlyPrayerTimesAction(region, currentMonth, currentYear);
        if (isMounted) {
          setCurrentData(data);
        }
      } catch (error) {
        console.error(error);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [region, currentMonth, currentYear]);

  // Tanggal Hari Ini (dalam format YYYY-MM-DD)
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const isCurrentRealMonth =
    now.getFullYear() === currentYear && now.getMonth() + 1 === currentMonth;

  // Navigasi ke bulan lain
  const changeMonth = (newBulan: number, newTahun: number = currentYear) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('bulan', newBulan.toString());
      params.set('tahun', newTahun.toString());
      router.push(`/jadwal-sholat?${params.toString()}`);
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      changeMonth(12, currentYear - 1);
    } else {
      changeMonth(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      changeMonth(1, currentYear + 1);
    } else {
      changeMonth(currentMonth + 1, currentYear);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const todaySchedule = currentData?.jadwal.find(
    (item: EQuranDailyShalat) => item.tanggal_lengkap === todayStr
  );

  if (!currentData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
        <Clock className="w-8 h-8 mb-4 opacity-50" />
        <p>Memuat jadwal sholat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner - Screen Only */}
      <div className="print:hidden rounded-2xl bg-gradient-to-br from-[#093c96] via-blue-800 to-indigo-950 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Standar Bimas Islam Kemenag RI</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Jadwal Sholat & Imsakiyah {region}
            </h1>
            <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0 text-blue-300" />
              <span>Wilayah {region}, Banten dan sekitarnya (WIB / UTC+7)</span>
            </p>
          </div>

          {/* Tombol Cetak / PDF */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#093c96] hover:bg-blue-50 font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Highlight Sholat Hari Ini jika berada di bulan berjalan */}
        {isCurrentRealMonth && todaySchedule && (
          <div className="mt-6 pt-5 border-t border-white/15">
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-blue-200">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span>
                Waktu Sholat Hari Ini ({todaySchedule.hari},{' '}
                {todaySchedule.tanggal} {MONTH_NAMES[currentMonth - 1]}{' '}
                {currentYear}):
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <span className="text-blue-200 text-[11px] block">Imsak</span>
                <span className="font-bold text-sm text-white">{todaySchedule.imsak}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 ring-1 ring-white/30">
                <span className="text-blue-200 text-[11px] block">Subuh</span>
                <span className="font-bold text-sm text-white">{todaySchedule.subuh}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <span className="text-blue-200 text-[11px] block">Terbit</span>
                <span className="font-bold text-sm text-white">{todaySchedule.terbit}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <span className="text-blue-200 text-[11px] block">Dhuha</span>
                <span className="font-bold text-sm text-white">{todaySchedule.dhuha}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 ring-1 ring-white/30">
                <span className="text-blue-200 text-[11px] block">Dzuhur</span>
                <span className="font-bold text-sm text-white">{todaySchedule.dzuhur}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 ring-1 ring-white/30">
                <span className="text-blue-200 text-[11px] block">Ashar</span>
                <span className="font-bold text-sm text-white">{todaySchedule.ashar}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 ring-1 ring-white/30">
                <span className="text-blue-200 text-[11px] block">Maghrib</span>
                <span className="font-bold text-sm text-white">{todaySchedule.maghrib}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 ring-1 ring-white/30">
                <span className="text-blue-200 text-[11px] block">Isya</span>
                <span className="font-bold text-sm text-white">{todaySchedule.isya}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header Khusus Tampilan Cetak (Print Version Header) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
          Jadwal Sholat & Imsakiyah {region}
        </h1>
        <p className="text-sm font-semibold text-slate-700">
          Bulan {MONTH_NAMES[currentMonth - 1]} {currentYear} • Provinsi Banten (Kemenag RI)
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Diterbitkan oleh Banten Mengaji (maschandigital.id)
        </p>
      </div>

      {/* Navigasi Pilihan Bulan & Wilayah */}
      <div className="print:hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#093c96] dark:text-blue-400 shrink-0" />
              <h2 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h2>
            </div>
            {/* Region Selector */}
            <select
              value={region}
              onChange={handleRegionChange}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#093c96]/20 outline-none hover:border-[#093c96]/50 transition-colors cursor-pointer"
            >
              {BANTEN_REGIONS.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {isPending && (
              <span className="text-xs text-slate-400 animate-pulse">Memuat...</span>
            )}
          </div>

          {/* Tombol Panah Prev / Next */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <button
              onClick={handlePrevMonth}
              disabled={isPending}
              aria-label="Bulan Sebelumnya"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              disabled={isPending}
              aria-label="Bulan Selanjutnya"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Pilihan Bulan (Jan - Des) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {MONTH_NAMES.map((name, index) => {
            const monthNumber = index + 1;
            const isSelected = monthNumber === currentMonth;
            return (
              <button
                key={name}
                type="button"
                onClick={() => changeMonth(monthNumber, currentYear)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer',
                  isSelected
                    ? 'bg-[#093c96] text-white shadow-md dark:bg-blue-600 font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabel Jadwal Sholat 30 Hari Penuh */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:border-slate-300 print:shadow-none print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 print:bg-slate-100 print:text-black">
                <th className="py-3 px-3 text-left w-24 md:w-36">Tanggal</th>
                <th className="py-3 px-2 text-slate-600 dark:text-slate-400 print:text-black">Imsak</th>
                <th className="py-3 px-2 text-[#093c96] dark:text-blue-400 print:text-black font-extrabold">Subuh</th>
                <th className="py-3 px-2 text-slate-600 dark:text-slate-400 print:text-black">Terbit</th>
                <th className="py-3 px-2 text-slate-600 dark:text-slate-400 print:text-black">Dhuha</th>
                <th className="py-3 px-2 text-[#093c96] dark:text-blue-400 print:text-black font-extrabold">Dzuhur</th>
                <th className="py-3 px-2 text-[#093c96] dark:text-blue-400 print:text-black font-extrabold">Ashar</th>
                <th className="py-3 px-2 text-[#093c96] dark:text-blue-400 print:text-black font-extrabold">Maghrib</th>
                <th className="py-3 px-2 text-[#093c96] dark:text-blue-400 print:text-black font-extrabold">Isya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-300">
              {currentData.jadwal.map((item: EQuranDailyShalat) => {
                const isToday = item.tanggal_lengkap === todayStr;
                const isJumat = item.hari.toLowerCase() === 'jumat';

                return (
                  <tr
                    key={item.tanggal_lengkap}
                    className={clsx(
                      'transition-colors font-mono md:font-sans',
                      isToday
                        ? 'bg-blue-50 dark:bg-blue-950/70 font-semibold text-[#093c96] dark:text-blue-300 ring-2 ring-[#093c96]/30 dark:ring-blue-500/40 print:bg-slate-200'
                        : isJumat
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    )}
                  >
                    {/* Tanggal & Hari */}
                    <td className="py-2.5 px-3 text-left whitespace-nowrap font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className={clsx(
                          'font-bold text-xs md:text-sm',
                          isToday ? 'text-[#093c96] dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'
                        )}>
                          {item.tanggal} {MONTH_NAMES[currentMonth - 1].slice(0, 3)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">
                          • {item.hari}
                        </span>
                        {isToday && (
                          <span className="print:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#093c96] text-white dark:bg-blue-600 ml-1">
                            Hari Ini
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Waktu Sholat */}
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400 font-medium">
                      {item.imsak}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                      {item.subuh}
                    </td>
                    <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400">
                      {item.terbit}
                    </td>
                    <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400">
                      {item.dhuha}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                      {item.dzuhur}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                      {item.ashar}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                      {item.maghrib}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                      {item.isya}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Keterangan & Catatan Kaki */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 print:bg-white print:border-slate-300">
          <div className="flex items-start gap-1.5">
            <Info className="w-4 h-4 text-[#093c96] dark:text-blue-400 shrink-0 mt-0.5 print:hidden" />
            <p className="leading-relaxed">
              <strong>Sumber Data:</strong> Kalkulasi lokal akurasi tinggi menggunakan Adhan Library standar Bimas Islam Kemenag RI.
              Waktu sholat berlaku untuk wilayah {region} dan sekitarnya (WIB).
            </p>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            * Imsak ditetapkan 10 menit sebelum waktu Subuh. Waktu Dhuha dianjurkan dimulai sekitar 20-25 menit setelah matahari terbit (tinggi matahari ± 4°30').
          </p>
        </div>
      </div>
    </div>
  );
}
