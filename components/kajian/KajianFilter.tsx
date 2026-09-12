'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { WPKajian } from '@/types';
import { KajianCard } from './KajianCard';
import { Filter, RotateCcw } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';

function KajianFilterContent({
  initialKajian = [],
}: {
  initialKajian?: WPKajian[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Baca parameter awal dari URL
  const [kota, setKota] = useState<KotaKabupatenBanten | ''>((searchParams.get('kota') as KotaKabupatenBanten) || '');
  const [kecamatan, setKecamatan] = useState(searchParams.get('kecamatan') || '');
  const [jenis, setJenis] = useState(searchParams.get('jenis') || '');
  const [jamaah, setJamaah] = useState(searchParams.get('jamaah') || '');
  const [ustadz, setUstadz] = useState('');

  // Sinkronkan URL awal jika parameter berubah via navigasi Next.js
  const currentSearch = searchParams.toString();
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setKota((searchParams.get('kota') as KotaKabupatenBanten) || '');
    setKecamatan(searchParams.get('kecamatan') || '');
    setJenis(searchParams.get('jenis') || '');
    setJamaah(searchParams.get('jamaah') || '');
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
  const displayedKajian = useMemo(() => {
    return initialKajian.filter((item) => {
      // 0. Filter Kota / Kabupaten
      if (kota && kota.trim() !== '') {
        const itemKota = item.acf?.kota_kabupaten || 'Kota Serang'; // Zero Silent Fallback (Default ke Kota Serang jika data lama)
        if (itemKota !== kota) {
          return false;
        }
      }

      // 1. Filter Kecamatan
      if (kecamatan && kecamatan.trim() !== '') {
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

      // 2. Filter Jenis Kajian
      if (jenis && jenis.trim() !== '' && jenis !== 'semua') {
        if (item.acf?.jenis_kajian?.toLowerCase() !== jenis.toLowerCase()) {
          return false;
        }
      }
      
      // 3. Filter Kategori Jamaah
      if (jamaah && jamaah.trim() !== '' && jamaah !== 'semua') {
        const itemKategori = (item.acf?.kategori_jamaah || '').toLowerCase();
        const filterKategori = jamaah.toLowerCase();

        const isAkhwatFilter = filterKategori.includes('akhwat') || filterKategori.includes('akhawat');
        const isAkhwatItem = itemKategori.includes('akhwat') || itemKategori.includes('akhawat');

        if (isAkhwatFilter) {
          if (!isAkhwatItem) return false;
        } else if (itemKategori !== filterKategori) {
          return false;
        }
      }

      // 4. Filter Nama Ustadz
      if (ustadz && ustadz.trim() !== '') {
        const nama = item.acf?.nama_ustadz || '';
        if (!nama.toLowerCase().includes(ustadz.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [initialKajian, kota, kecamatan, jenis, jamaah, ustadz]);

  const handleReset = () => {
    setKota('');
    setKecamatan('');
    setJenis('');
    setJamaah('');
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
          {(kota || kecamatan || jenis || jamaah || ustadz) && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
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

          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Semua Jenis Kajian</option>
            <option value="rutin">Kajian Rutin</option>
            <option value="tematik">Kajian Tematik</option>
          </select>

          <select
            value={jamaah}
            onChange={(e) => setJamaah(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Semua Jamaah</option>
            <option value="umum">Umum</option>
            <option value="khusus_ikhwan">Khusus Ikhwan</option>
            <option value="khusus_akhwat">Khusus Akhwat</option>
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
}) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm text-slate-500">Memuat filter...</div>}>
      <KajianFilterContent {...props} />
    </Suspense>
  );
}
