import { getSession } from '@/lib/auth';
import { Calendar, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import Link from 'next/link';
import { WPKajian } from '@/types';
import { getMasjidList, enrichKajianWithMasjid } from '@/lib/wordpress';
import { DKMKajianList } from '@/components/dashboard/DKMKajianList';

async function getDKMKajian(token: string, masjidId?: number) {
  try {
    const [res, masjids] = await Promise.all([
      fetch('https://salaf.maschandigital.id/wp-json/wp/v2/kajian?status=publish,pending,draft&per_page=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        next: { revalidate: 0 }
      }),
      getMasjidList()
    ]);

    if (!res.ok) return [];
    const kajianList: WPKajian[] = await res.json();
    const enrichedList = enrichKajianWithMasjid(kajianList, masjids || []);
    
    // Filter by masjidId if it exists
    if (masjidId) {
      return enrichedList.filter(k => {
        const raw = k.acf?.masjid_terkait as unknown;
        let targetId: number | null = null;
        if (Array.isArray(raw) && raw.length > 0) {
          const first = raw[0];
          targetId = typeof first === 'object' && first !== null 
            ? Number((first as { ID?: number; id?: number }).ID || (first as { ID?: number; id?: number }).id) 
            : Number(first);
        } else if (typeof raw === 'object' && raw !== null) {
          targetId = Number((raw as { ID?: number; id?: number }).ID || (raw as { ID?: number; id?: number }).id);
        } else if (raw) {
          targetId = Number(raw);
        }
        return Number(targetId) === Number(masjidId);
      });
    }
    return enrichedList;
  } catch {
    return [];
  }
}

export default async function DKMDashboard() {
  const session = await getSession();
  
  const kajianList = session?.token ? await getDKMKajian(session.token, session.masjidId) : [];
  
  const totalKajian = kajianList.length;
  const activeKajian = kajianList.filter(k => k.status === 'publish').length;
  const pendingKajian = kajianList.filter(k => k.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dasbor DKM</h2>
          <p className="text-slate-500 dark:text-slate-400">Ringkasan aktivitas kajian {session?.masjidName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/dkm/profil-masjid"
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            <Building2 className="w-4 h-4 text-[#093c96] dark:text-blue-400" /> Profil Masjid
          </Link>
          <Link 
            href="/dashboard/dkm/tambah-kajian"
            className="inline-flex items-center justify-center gap-2 bg-[#093c96] hover:bg-[#072a6b] text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            <Calendar className="w-4 h-4" /> Tambah Jadwal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Kajian Masjid Ini', value: totalKajian.toString(), icon: Calendar, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { title: 'Kajian Sedang Tayang', value: activeKajian.toString(), icon: CheckCircle2, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { title: 'Menunggu Persetujuan', value: pendingKajian.toString(), icon: Clock, color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Kajian Masjid</h3>
        </div>
        <div className="p-0">
          <DKMKajianList initialKajian={kajianList} />
        </div>
      </div>
    </div>
  );
}
