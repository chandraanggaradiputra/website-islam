'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { WPMasjid } from '@/types';
import { MasjidCard } from './MasjidCard';
import { Filter, RotateCcw } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';

function MasjidFilterContent({
  initialMasjid = [],
}: {
  initialMasjid?: WPMasjid[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Baca parameter awal dari URL
  const [kota, setKota] = useState<KotaKabupatenBanten | ''>((searchParams.get('kota') as KotaKabupatenBanten) || '');
  const [kecamatan, setKecamatan] = useState(searchParams.get('kecamatan') || '');
  const [search, setSearch] = useState('');

  // Sinkronkan URL awal jika parameter berubah via navigasi Next.js
  const currentSearch = searchParams.toString();
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setKota((searchParams.get('kota') as KotaKabupatenBanten) || '');
    setKecamatan(searchParams.get('kecamatan') || '');
  }

  // Ambil daftar kecamatan berdasarkan kota yang dipilih
  const availableKecamatans = useMemo(() => {
    if (!kota) return [];
    const region = BANTEN_REGIONS.find((r) => r.name === kota);
    return region ? region.kecamatan : [];
  }, [kota]);

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKota(e.target.value as KotaKabupatenBanten | '');
    setKecamatan(''); // Reset kecamatan saat kota berubah
  };

  // Logika Filter Presisi
  const displayedMasjid = useMemo(() => {
    return initialMasjid.filter((item) => {
      // 0. Filter Kota / Kabupaten
      if (kota && kota.trim() !== '') {
        const itemKota = item.acf?.kota_kabupaten || 'Kota Serang'; // Zero Silent Fallback
        if (itemKota !== kota) {
          return false;
        }
      }

      // 1. Filter Kecamatan
      if (kecamatan && kecamatan.trim() !== '') {
        const targetKec = kecamatan.trim().toLowerCase();
        
        // Kita juga bisa mencocokkan id kecamatan dari item.kecamatan, 
        // tapi mencocokkan string dari alamat lebih aman untuk masjid karena ACF-nya seringkali hanya alamat string.
        const alamat = typeof item.acf?.alamat_lengkap === 'string'
          ? item.acf.alamat_lengkap
          : '';
        const masjidName = item.title?.rendered || item.post_title || '';

        // Kalau ada relasi taxonomy kecamatan_nama dari WP REST API (opsional):
        const termData = item._embedded?.['wp:term'];
        let taxonomyKecamatan = '';
        if (termData && Array.isArray(termData)) {
          for (const taxArray of termData) {
            for (const term of taxArray) {
              if (term.taxonomy === 'kecamatan') {
                taxonomyKecamatan += term.name.toLowerCase() + ' ';
              }
            }
          }
        }

        const isKecMatch =
          alamat.toLowerCase().includes(targetKec) ||
          masjidName.toLowerCase().includes(targetKec) ||
          taxonomyKecamatan.includes(targetKec);

        if (!isKecMatch) return false;
      }

      // 2. Filter Search Name
      if (search && search.trim() !== '') {
        const masjidName = item.title?.rendered || item.post_title || '';
        if (!masjidName.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [initialMasjid, kota, kecamatan, search]);

  const handleReset = () => {
    setKota('');
    setKecamatan('');
    setSearch('');
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      {/* Box Filter */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Filter className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
            <span>Filter Direktori Masjid</span>
          </div>
          {(kota || kecamatan || search) && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <select
            value={kota}
            onChange={handleKotaChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Semua Kota/Kabupaten</option>
            {BANTEN_REGIONS.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            disabled={!kota}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{kota ? 'Semua Kecamatan' : 'Pilih Kota Dulu'}</option>
            {availableKecamatans.map((kecName) => (
              <option key={kecName} value={kecName}>
                Kec. {kecName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cari Nama Masjid..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Hasil Masjid */}
      {displayedMasjid.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayedMasjid.map((masjid) => (
            <MasjidCard key={masjid.id} masjid={masjid} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            Masjid tidak ditemukan
          </p>
          <p className="text-xs text-slate-400">
            Belum ada data masjid yang sesuai dengan filter pencarian Anda.
          </p>
        </div>
      )}
    </div>
  );
}

export function MasjidFilter(props: {
  initialMasjid?: WPMasjid[];
}) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm text-slate-500">Memuat filter...</div>}>
      <MasjidFilterContent {...props} />
    </Suspense>
  );
}
