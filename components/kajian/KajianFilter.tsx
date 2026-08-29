'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { WPKajian } from '@/types';
import { KajianCard } from './KajianCard';
import { Filter, RotateCcw } from 'lucide-react';

function KajianFilterContent({
  initialKajian = [],
  kecamatans = [],
}: {
  initialKajian?: WPKajian[];
  kecamatans?: { id: number; name: string }[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Baca parameter awal dari URL (misal dari tautan Footer)
  const urlKecamatan = searchParams.get('kecamatan') || '';
  const urlJenis = searchParams.get('jenis') || '';

  const [kecamatan, setKecamatan] = useState(urlKecamatan);
  const [jenis, setJenis] = useState(urlJenis);
  const [ustadz, setUstadz] = useState('');

  // Sinkronkan state jika URL berubah (misal saat klik tautan Kecamatan di Footer)
  useEffect(() => {
    setKecamatan(searchParams.get('kecamatan') || '');
    setJenis(searchParams.get('jenis') || '');
  }, [searchParams]);

  // Logika Filter Presisi
  const displayedKajian = useMemo(() => {
    return initialKajian.filter((item) => {
      // 1. Filter Kecamatan (Mencocokkan ke acf.kecamatan, alamat_lengkap, dan nama masjid)
      if (kecamatan && kecamatan.trim() !== '' && kecamatan !== 'semua') {
        const targetKec = kecamatan.trim().toLowerCase();
        const matchedMasjid = item.masjid_detail;

        const masjidAcfRecord = matchedMasjid?.acf as unknown as Record<string, unknown> | undefined;
        const kajianAcfRecord = item.acf as unknown as Record<string, unknown> | undefined;

        const acfKec = typeof masjidAcfRecord?.kecamatan === 'string' ? masjidAcfRecord.kecamatan : '';
        const alamat = typeof masjidAcfRecord?.alamat_lengkap === 'string'
          ? masjidAcfRecord.alamat_lengkap
          : typeof kajianAcfRecord?.alamat_lengkap === 'string'
          ? kajianAcfRecord.alamat_lengkap
          : '';
        const masjidName = item.masjid_name || matchedMasjid?.title?.rendered || '';

        const isKecMatch =
          acfKec.toLowerCase().includes(targetKec) ||
          alamat.toLowerCase().includes(targetKec) ||
          masjidName.toLowerCase().includes(targetKec);

        if (!isKecMatch) return false;
      }

      // 2. Filter Jenis Kajian (rutin / tematik)
      if (jenis && jenis.trim() !== '' && jenis !== 'semua') {
        if (item.acf?.jenis_kajian?.toLowerCase() !== jenis.toLowerCase()) {
          return false;
        }
      }

      // 3. Filter Nama Ustadz
      if (ustadz && ustadz.trim() !== '') {
        const nama = item.acf?.nama_ustadz || '';
        if (!nama.toLowerCase().includes(ustadz.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [initialKajian, kecamatan, jenis, ustadz]);

  const handleReset = () => {
    setKecamatan('');
    setJenis('');
    setUstadz('');
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      {/* Box Filter */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Filter className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
            <span>Filter Jadwal Kajian</span>
          </div>
          {(kecamatan || jenis || ustadz) && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Semua Kecamatan</option>
            {kecamatans && kecamatans.length > 0 ? (
              kecamatans.map((kec) => (
                <option key={kec.id} value={kec.name}>
                  Kec. {kec.name}
                </option>
              ))
            ) : (
              <>
                <option value="Serang">Kec. Serang</option>
                <option value="Cipocok Jaya">Kec. Cipocok Jaya</option>
                <option value="Kasemen">Kec. Kasemen</option>
                <option value="Taktakan">Kec. Taktakan</option>
                <option value="Walantaka">Kec. Walantaka</option>
                <option value="Curug">Kec. Curug</option>
              </>
            )}
          </select>

          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Semua Jenis Kajian</option>
            <option value="rutin">Kajian Rutin</option>
            <option value="tematik">Kajian Tematik</option>
          </select>

          <input
            type="text"
            placeholder="Cari Nama Ustadz..."
            value={ustadz}
            onChange={(e) => setUstadz(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Hasil Kajian */}
      {displayedKajian.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {displayedKajian.map((kajian) => (
            <KajianCard key={kajian.id} kajian={kajian} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Tidak ada jadwal kajian yang sesuai dengan filter pencarian Anda.
          </p>
        </div>
      )}
    </div>
  );
}

export function KajianFilter(props: {
  initialKajian?: WPKajian[];
  kecamatans?: { id: number; name: string }[];
}) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm text-slate-500">Memuat filter...</div>}>
      <KajianFilterContent {...props} />
    </Suspense>
  );
}
