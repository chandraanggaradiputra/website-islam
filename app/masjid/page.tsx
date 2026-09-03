import { getMasjidList } from '@/lib/wordpress';
import { MasjidFilter } from '@/components/masjid/MasjidFilter';

export const revalidate = 60;

export default async function MasjidPage() {
  const masjidList = await getMasjidList();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Direktori Masjid</h1>
        <p className="text-slate-600 dark:text-slate-400">Temukan masjid-masjid sunnah di Banten dan sekitarnya.</p>
      </div>

      <MasjidFilter initialMasjid={masjidList} />
    </div>
  );
}
