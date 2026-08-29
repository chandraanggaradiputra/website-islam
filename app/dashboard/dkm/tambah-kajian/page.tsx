import { getSession } from '@/lib/auth';
import { TambahKajianForm } from '@/components/dashboard/TambahKajianForm';
import { redirect } from 'next/navigation';

export default async function TambahKajianPage() {
  const session = await getSession();

  if (!session || session.role !== 'dkm') {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Jadwal Kajian</h2>
        <p className="text-slate-500 dark:text-slate-400">Silakan isi formulir di bawah ini untuk mempublikasikan jadwal kajian baru.</p>
      </div>

      <TambahKajianForm masjidId={session.masjidId!} masjidName={session.masjidName!} />
    </div>
  );
}
