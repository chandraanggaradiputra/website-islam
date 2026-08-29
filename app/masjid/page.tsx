import { getMasjidList, getKecamatanList } from '@/lib/wordpress';
import { MasjidCard } from '@/components/masjid/MasjidCard';

import Link from 'next/link';

export const revalidate = 60;

export default async function MasjidPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [masjidList, kecamatanList] = await Promise.all([
    getMasjidList(),
    getKecamatanList(),
  ]);

  const resolvedParams = await Promise.resolve(searchParams);
  const filterKecamatan = resolvedParams.kecamatan as string;

  let filteredMasjid = masjidList;

  if (filterKecamatan) {
    filteredMasjid = filteredMasjid.filter(m => m.kecamatan?.includes(Number(filterKecamatan)));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Direktori Masjid</h1>
        <p className="text-slate-600 dark:text-slate-400">Temukan masjid-masjid sunnah di Kota Serang.</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <Link 
          href="/masjid"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!filterKecamatan ? 'bg-[#093c96] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          Semua Wilayah
        </Link>
        {kecamatanList.map((kec) => (
          <Link 
            key={kec.id}
            href={`/masjid?kecamatan=${kec.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterKecamatan === kec.id.toString() ? 'bg-[#093c96] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {kec.name}
          </Link>
        ))}
      </div>

      {filteredMasjid.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMasjid.map(masjid => (
            <MasjidCard key={masjid.id} masjid={masjid} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <p className="font-medium text-lg mb-1">Masjid tidak ditemukan</p>
          <p className="text-sm">Belum ada data masjid untuk wilayah yang Anda pilih.</p>
        </div>
      )}
    </div>
  );
}
