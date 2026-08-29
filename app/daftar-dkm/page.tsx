import { Metadata } from 'next';
import { getMasjidList } from '@/lib/wordpress';
import { DaftarDKMForm } from '@/components/dashboard/DaftarDKMForm';

export const metadata: Metadata = {
  title: 'Pendaftaran DKM - Syiar Salaf Kota Serang',
  description: 'Daftarkan diri Anda untuk mengelola jadwal kajian dan profil masjid secara mandiri melalui Dashboard DKM.',
};

export default async function DaftarDKMPage() {
  const listMasjid = await getMasjidList();

  return (
    <div className="max-w-2xl mx-auto my-12 p-6 md:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pendaftaran DKM</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Daftarkan diri Anda untuk mengelola jadwal kajian dan profil masjid secara mandiri melalui Dashboard DKM.
        </p>
      </div>

      <DaftarDKMForm masjidList={listMasjid} />
    </div>
  );
}
