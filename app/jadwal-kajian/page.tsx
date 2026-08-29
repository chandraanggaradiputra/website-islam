import { getKajianList, getKecamatanList } from '@/lib/wordpress';
import { KajianCard } from '@/components/kajian/KajianCard';
import { KajianFilter } from '@/components/kajian/KajianFilter';

export const revalidate = 60;

export default async function JadwalKajianPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [kajianList, kecamatanList] = await Promise.all([
    getKajianList(),
    getKecamatanList(),
  ]);

  const resolvedParams = await Promise.resolve(searchParams);
  const filterKecamatan = resolvedParams.kecamatan as string;
  const filterJenis = resolvedParams.jenis as string;
  const filterUstadz = resolvedParams.ustadz as string;

  let filteredKajian = kajianList.filter(k => k.acf.status_kajian !== 'selesai');

  if (filterKecamatan) {
    filteredKajian = filteredKajian.filter(k => {
      if (typeof k.acf.masjid_terkait === 'object' && k.acf.masjid_terkait?.kecamatan) {
        return k.acf.masjid_terkait.kecamatan.includes(Number(filterKecamatan));
      }
      return false;
    });
  }

  if (filterJenis) {
    filteredKajian = filteredKajian.filter(k => k.acf.jenis_kajian === filterJenis);
  }

  if (filterUstadz) {
    filteredKajian = filteredKajian.filter(k => 
      k.acf.nama_ustadz.toLowerCase().includes(filterUstadz.toLowerCase())
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Jadwal Kajian</h1>
        <p className="text-slate-600 dark:text-slate-400">Temukan jadwal kajian sunnah di Kota Serang dan sekitarnya.</p>
      </div>

      <KajianFilter kecamatans={kecamatanList} />

      {filteredKajian.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKajian.map(kajian => (
            <KajianCard key={kajian.id} kajian={kajian} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <p className="font-medium text-lg mb-1">Tidak ada jadwal kajian</p>
          <p className="text-sm">Tidak ada kajian yang sesuai dengan filter pencarian Anda atau jadwal masih kosong.</p>
        </div>
      )}
    </div>
  );
}
