import { getKajianList, getKecamatanList } from '@/lib/wordpress';
import { KajianFilter } from '@/components/kajian/KajianFilter';

export const revalidate = 60;

export default async function JadwalKajianPage() {
  const [kajianList, kecamatanList] = await Promise.all([
    getKajianList(),
    getKecamatanList(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Jadwal Kajian</h1>
        <p className="text-slate-600 dark:text-slate-400">Temukan jadwal kajian sunnah di Kota Serang dan sekitarnya.</p>
      </div>

      <KajianFilter initialKajian={kajianList} kecamatans={kecamatanList} />
    </div>
  );
}
