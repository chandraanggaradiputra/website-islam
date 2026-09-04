import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMasjidList } from '@/lib/wordpress';
import { AdminTambahKajianForm } from '@/components/dashboard/AdminTambahKajianForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTambahKajianPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const masjidList = await getMasjidList();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin?tab=kajian"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#093c96] dark:text-blue-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dasbor Admin
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Buat Jadwal Kajian Baru
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Panel Super Admin untuk mempublikasikan jadwal kajian sunnah langsung mewakili masjid mana pun di Provinsi Banten.
          </p>
        </div>
      </div>

      <AdminTambahKajianForm masjidList={masjidList} />
    </div>
  );
}
