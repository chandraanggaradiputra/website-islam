import { getSession } from '@/lib/auth';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getSession();

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

      {/* Recent Registrations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pendaftaran DKM Terbaru</h3>
          <button className="text-sm font-medium text-[#093c96] dark:text-blue-400 hover:underline cursor-pointer">Lihat Semua</button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-semibold rounded-tl-lg">Nama Pengurus</th>
                  <th className="p-4 font-semibold">Masjid</th>
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Mock Data */}
                <tr>
                  <td className="p-4">
                    <p className="font-medium text-slate-900 dark:text-white">Ahmad Fauzi</p>
                    <p className="text-slate-500 text-xs">ahmad@example.com</p>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">Masjid At Taqwa Wildan</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">29 Aug 2026</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      Menunggu
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-700 font-medium cursor-pointer">Setujui</button>
                      <button className="text-red-600 hover:text-red-700 font-medium cursor-pointer">Tolak</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
