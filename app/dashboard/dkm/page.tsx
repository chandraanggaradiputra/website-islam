import { getSession } from '@/lib/auth';
import { Calendar, Users, Eye, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function DKMDashboard() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dasbor DKM</h2>
          <p className="text-slate-500 dark:text-slate-400">Ringkasan aktivitas kajian {session?.masjidName}</p>
        </div>
        <Link 
          href="/dashboard/dkm/tambah-kajian"
          className="inline-flex items-center justify-center gap-2 bg-[#093c96] hover:bg-[#072a6b] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Calendar className="w-4 h-4" /> Tambah Jadwal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Kajian Bulan Ini', value: '12', icon: Calendar, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { title: 'Total Jamaah Hadir', value: '450+', icon: Users, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { title: 'Dilihat di Website', value: '1.2k', icon: Eye, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
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

      {/* Daftar Kajian Mendatang */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kajian Mendatang</h3>
          <button className="text-sm font-medium text-[#093c96] dark:text-blue-400 hover:underline cursor-pointer">Lihat Semua</button>
        </div>
        <div className="p-0">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Mock Items */}
            {[1, 2, 3].map((_, i) => (
              <li key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-medium text-slate-500 uppercase">SEP</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mt-1">1{i}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Kitab Tauhid (Bab {i + 5})</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Ust. Abu Haidar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">Ba'da Maghrib</span>
                  <button className="p-2 text-slate-400 hover:text-[#093c96] dark:hover:text-blue-400 transition-colors cursor-pointer">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
