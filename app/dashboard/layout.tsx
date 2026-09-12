/**
 * ============================================================================
 * Layout Utama: Dasbor Administrator & DKM
 * ============================================================================
 * Berkas ini mengatur tata letak global untuk seluruh halaman di dalam rute
 * /dashboard/*, mengintegrasikan sidebar desktop bergaya Flowbite (DashboardSidebar),
 * bilah navigasi atas (Top Header), serta header adaptif untuk perangkat mobile.
 *
 * Pola Arsitektur:
 * - Server Component Next.js untuk pengecekan sesi autentikasi yang aman
 * - Pengambilan data wilayah masjid secara asinkron untuk memperkaya sidebar DKM
 * - Responsivitas tampilan (Desktop: Sidebar w-64 tetap; Mobile: Header ringkas)
 * ============================================================================
 */

import { ReactNode } from 'react';
import Image from 'next/image';
import { getSession, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { getMasjidById } from '@/lib/actions/masjid';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // --------------------------------------------------------------------------
  // 1. Verifikasi Sesi Pengguna
  // --------------------------------------------------------------------------
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.role === 'admin';

  // --------------------------------------------------------------------------
  // 2. Pengambilan Data Masjid Pelengkap (Khusus DKM)
  // --------------------------------------------------------------------------
  let kecamatanName: string | undefined = undefined;
  if (!isAdmin && session.masjidId) {
    try {
      const masjidData = await getMasjidById(session.masjidId);
      if (masjidData?.acf?.kota_kabupaten) {
        kecamatanName = masjidData.acf.kota_kabupaten;
      }
    } catch {
      // Fallback diam jika pengambilan data wilayah mengalami kendala
      kecamatanName = undefined;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* -------------------------------------------------------------------- */}
      {/* Sidebar Navigasi Desktop (Flowbite Style Modular)                    */}
      {/* -------------------------------------------------------------------- */}
      <DashboardSidebar
        userRole={session.role}
        userName={session.name}
        userEmail={session.email}
        masjidName={session.masjidName}
        masjidId={session.masjidId}
        kecamatanName={kecamatanName}
      />

      {/* -------------------------------------------------------------------- */}
      {/* Area Konten Utama Dasbor                                             */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Header Khusus Mobile (< md) */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-[#093c96] dark:text-blue-400">
            <Image
              src="/banten-mengaji.jpeg"
              alt="Logo Banten Mengaji"
              width={28}
              height={28}
              className="rounded-lg object-cover shadow-sm border border-slate-200/60 dark:border-slate-800 shrink-0"
              priority
            />
            <span>{isAdmin ? 'Admin Panel' : 'DKM Panel'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                title="Logout"
                className="flex items-center gap-1.5 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </header>

        {/* Header Atas Desktop (md+) */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 hidden md:flex">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg text-slate-900 dark:text-white">
              {isAdmin ? 'Super Admin Dashboard' : (session.masjidName || 'Dasbor Pengurus DKM')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-[#093c96] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white leading-none">{session.name}</p>
                <p className="text-slate-500 text-xs mt-1 uppercase font-semibold tracking-wider">{session.role}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Konten Halaman (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
