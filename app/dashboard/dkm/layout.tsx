import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DkmSubNav } from '@/components/dashboard/DkmSubNav';

export const dynamic = 'force-dynamic';

/**
 * ============================================================================
 * Layout Khusus Area Dasbor Pengurus DKM
 * ============================================================================
 * Menyediakan sub-navigasi seluler dan tautan navigasi balik secara konsisten
 * untuk seluruh sub-halaman DKM (/dashboard/dkm, /dashboard/dkm/profil-masjid,
 * /dashboard/dkm/tambah-kajian).
 * ============================================================================
 */
export default async function DKMDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || !session.token) {
    redirect('/login');
  }
  if (session.role === 'admin') {
    redirect('/dashboard/admin');
  }
  return (
    <div className="w-full">
      <DkmSubNav />
      {children}
    </div>
  );
}
