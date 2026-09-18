import { ReactNode } from 'react';
import { DkmSubNav } from '@/components/dashboard/DkmSubNav';

/**
 * ============================================================================
 * Layout Khusus Area Dasbor Pengurus DKM
 * ============================================================================
 * Menyediakan sub-navigasi seluler dan tautan navigasi balik secara konsisten
 * untuk seluruh sub-halaman DKM (/dashboard/dkm, /dashboard/dkm/profil-masjid,
 * /dashboard/dkm/tambah-kajian).
 * ============================================================================
 */
export default function DKMDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <DkmSubNav />
      {children}
    </div>
  );
}
