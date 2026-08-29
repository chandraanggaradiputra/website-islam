import { getSession } from '@/lib/auth';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { AdminKajianActions } from '@/components/dashboard/AdminKajianActions';
import { WPKajian } from '@/types';

async function getPendingKajian(token: string): Promise<WPKajian[]> {
  try {
    const res = await fetch('https://salaf.maschandigital.id/wp-json/wp/v2/kajian?status=pending&_embed', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const session = await getSession();
  const pendingKajian = session?.token ? await getPendingKajian(session.token) : [];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang, {session?.name}</h2>
        <p className="text-slate-500 dark:text-slate-400">Ringkasan aktivitas dan pendaftaran DKM terbaru.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        {[
          { title: 'Total DKM', value: '24', icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { title: 'Menunggu Verifikasi', value: '3', icon: Clock, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
          { title: 'Kajian Aktif', value: '156', icon: BookOpen, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { title: 'Pendaftaran Disetujui', value: '12', icon: CheckCircle, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Antrean Kajian */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Antrean Kajian Pending</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-semibold rounded-tl-lg">Judul Kajian</th>
                  <th className="p-4 font-semibold">Ustadz</th>
                  <th className="p-4 font-semibold">Pengirim</th>
                  <th className="p-4 font-semibold">Tanggal Diajukan</th>
                  <th className="p-4 font-semibold rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingKajian.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tidak ada kajian yang menunggu persetujuan.
                    </td>
                  </tr>
                ) : (
                  pendingKajian.map((kajian) => (
                    <tr key={kajian.id}>
                      <td className="p-4">
                        <p className="font-medium text-slate-900 dark:text-white">{kajian.title?.rendered}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[200px]">{kajian.acf?.kitab_bahasan || 'Tidak ada deskripsi'}</p>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{kajian.acf?.nama_ustadz}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">
                        {/* Type definition of WPKajian might not have _embedded.author mapped correctly, we just try our best safely */}
                        {kajian._embedded?.author?.[0]?.name || 'Unknown'}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">
                        {kajian.date ? new Date(kajian.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tidak diketahui'}
                      </td>
                      <td className="p-4">
                        <AdminKajianActions id={kajian.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
