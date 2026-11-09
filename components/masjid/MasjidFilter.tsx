// components/masjid/MasjidFilter.tsx
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { WPMasjid } from '@/types';
import { MasjidCard } from './MasjidCard';
import { MasjidCardSkeleton } from './MasjidCardSkeleton';
import { Filter, RotateCcw } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';
import { resolveKecamatanName } from '@/lib/wordpress';

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
        
        const alamat = typeof item.acf?.alamat_lengkap === 'string'
          ? item.acf.alamat_lengkap
          : '';
        const masjidName = item.title?.rendered || item.post_title || '';

        // Taxonomy kecamatan dari WP REST API
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

        const itemKecNames = (item.kecamatan || []).map((id) => resolveKecamatanName(id) || '').join(' ').toLowerCase();

        const isKecMatch =
          alamat.toLowerCase().includes(targetKec) ||
          masjidName.toLowerCase().includes(targetKec) ||
          taxonomyKecamatan.includes(targetKec) ||
          itemKecNames.includes(targetKec);

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
      {/* Box Filter dengan Touch Target Minimal 48x48px (WCAG 2.2 SC 2.5.8) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Filter className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
            <span>Filter Direktori Masjid</span>
          </div>
          {(kota || kecamatan || search) && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 min-h-[48px] px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <select
            aria-label="Filter Kota atau Kabupaten Masjid"
            value={kota}
            onChange={handleKotaChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 min-h-[48px] text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Semua Kota/Kabupaten</option>
            {BANTEN_REGIONS.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Kecamatan Masjid"
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            disabled={!kota}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 min-h-[48px] text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 min-h-[48px] text-sm text-slate-800 placeholder-slate-400 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

function MasjidFilterSkeletonFallback() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Filter Box Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Grid 4x Masjid Skeletons */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MasjidCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function MasjidFilter(props: {
  initialMasjid?: WPMasjid[];
}) {
  return (
    <Suspense fallback={<MasjidFilterSkeletonFallback />}>
      <MasjidFilterContent {...props} />
    </Suspense>
  );
}
