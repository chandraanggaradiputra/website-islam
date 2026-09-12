'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { WPKajian } from '@/types';
import { KajianCard } from './KajianCard';
import { Filter, RotateCcw, Calendar, Video } from 'lucide-react';
import { BANTEN_REGIONS, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';
import { isKajianExpired } from '@/lib/kajian';

function KajianFilterContent({
  initialKajian = [],
}: {
  initialKajian?: WPKajian[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab aktif: 'mendatang' (Kajian Mendatang) atau 'arsip' (Arsip & Rekaman)
  const [activeTab, setActiveTab] = useState<'mendatang' | 'arsip'>(
    (searchParams.get('tab') as 'mendatang' | 'arsip') || 'mendatang'
  );

  // Baca parameter filter dari URL
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

  // Fungsi helper penentuan status kajian selesai/lampau
  const isFinished = (item: WPKajian) => {
    if (item.acf?.status_kajian === 'selesai') return true;
    return isKajianExpired(item.acf?.tanggal_kajian, item.acf?.jam_selesai, item.acf?.jam_mulai);
  };

  // Jumlah kajian aktif / mendatang
  const upcomingCount = useMemo(() => {
    return initialKajian.filter((item) => !isFinished(item)).length;
  }, [initialKajian]);

  // Jumlah arsip rekaman kajian
  const archiveCount = useMemo(() => {
    return initialKajian.filter((item) => isFinished(item)).length;
  }, [initialKajian]);

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
      // Pemisahan Tab: Mendatang vs Arsip Selesai
      const finished = isFinished(item);
      if (activeTab === 'mendatang' && finished) return false;
      if (activeTab === 'arsip' && !finished) return false;

      // 0. Filter Kota / Kabupaten
      if (kota && kota.trim() !== '') {
        const itemKota = item.acf?.kota_kabupaten || 'Kota Serang';
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
  }, [initialKajian, activeTab, kota, kecamatan, jenis, jamaah, ustadz]);

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
      {/* Tab Navigasi: Kajian Mendatang vs Arsip & Rekaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('mendatang')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'mendatang'
                ? 'bg-[#093c96] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kajian Mendatang</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'mendatang'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arsip')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'arsip'
                ? 'bg-[#093c96] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Arsip & Rekaman</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'arsip'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {archiveCount}
            </span>
          </button>
        </div>
      </div>

      {/* Banner Penjelasan Tab Arsip */}
      {activeTab === 'arsip' && (
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#093c96] dark:text-blue-300 shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <p className="leading-relaxed">
            Menampilkan rekaman video dan arsip faedah ilmu dari kajian-kajian sunnah yang telah selesai dilaksanakan di Provinsi Banten.
          </p>
        </div>
      )}

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
            {activeTab === 'arsip'
              ? 'Belum ada arsip rekaman kajian yang sesuai dengan filter pencarian Anda.'
              : 'Tidak ada jadwal kajian mendatang yang sesuai dengan filter pencarian Anda.'}
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
