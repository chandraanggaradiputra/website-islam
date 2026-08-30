import { getSession } from '@/lib/auth';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { WPKajian, WPMasjid } from '@/types';
import { getMasjidList, enrichKajianWithMasjid } from '@/lib/wordpress';
import { getStoredRegistrations } from '@/lib/actions/dkm';
import { AdminDashboardTabs } from '@/components/dashboard/AdminDashboardTabs';

export const dynamic = 'force-dynamic';

const WP_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getSession();

  if (!session?.token || session.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Silakan login sebagai administrator.</div>;
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const currentTab = resolvedParams.tab || 'dkm';

  // Fetch data in parallel
  const [resKajian, masjids, resUsers, registrations] = await Promise.all([
    fetch(`${WP_BASE_URL}/kajian?status=any&per_page=100&_embed`, {
      headers: { Authorization: `Bearer ${session.token}` },
      next: { revalidate: 0 },
    }),
    getMasjidList(),
    fetch(`${WP_BASE_URL}/users?per_page=100`, {
      headers: { Authorization: `Bearer ${session.token}` },
      next: { revalidate: 0 },
    }).catch(() => null),
    getStoredRegistrations(),
  ]);

  const rawKajian: WPKajian[] = resKajian.ok ? await resKajian.json() : [];
  const masjidsList: WPMasjid[] = masjids || [];
  const allKajian: WPKajian[] = enrichKajianWithMasjid(rawKajian, masjidsList);
  const usersList = resUsers?.ok ? await resUsers.json() : [];

  const pendingKajian = allKajian.filter((k) => k.status === 'pending');
  const publishedKajian = allKajian.filter((k) => k.status === 'publish');
  const pendingRegistrations = registrations.filter((r) => r.status === 'pending');

  const totalMasjid = masjidsList.length;
  const totalDkm = Array.isArray(usersList) ? usersList.length : registrations.length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Selamat Datang, {session?.name} 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Panel Manajemen Eksekutif & Verifikasi Portal Syiar Salaf Kota Serang.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Antrean DKM
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {pendingRegistrations.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kajian Pending
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {pendingKajian.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kajian Tayang
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {publishedKajian.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Masjid
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totalMasjid}
            </h3>
          </div>
        </div>
      </div>

      {/* 3 Interactive Tabs */}
      <AdminDashboardTabs
        initialTab={currentTab}
        registrations={registrations}
        allKajian={allKajian}
        allMasjid={masjidsList}
      />
    </div>
  );
}
