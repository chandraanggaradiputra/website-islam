'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, PlusCircle, ArrowLeft } from 'lucide-react';

/**
 * ============================================================================
 * Komponen: DkmSubNav (Tab Navigasi Seluler & Tautan Balik Cepat Dasbor DKM)
 * ============================================================================
 * Menyediakan navigasi balik yang jelas saat berada di sub-halaman serta 3 tab
 * cepat horizontal (Dasbor, Profil Masjid, Tambah Kajian).
 * Dirancang memenuhi standar aksesibilitas WCAG 2.2 Level AA:
 * - Target sentuh interaktif min 44px (min-h-[44px])
 * - Kontras warna tinggi dan status aktif jelas (bg-emerald-700 text-white)
 * - Tanda halaman aktif aria-current="page"
 * ============================================================================
 */
export function DkmSubNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dasbor', href: '/dashboard/dkm', icon: LayoutDashboard },
    { label: 'Profil Masjid', href: '/dashboard/dkm/profil-masjid', icon: Building2 },
    { label: 'Tambah Kajian', href: '/dashboard/dkm/tambah-kajian', icon: PlusCircle },
  ];

  const isSubPage = pathname !== '/dashboard/dkm';

  return (
    <div className="mb-6 space-y-3">
      {/* Tombol Balik Cepat jika sedang di Sub-Halaman */}
      {isSubPage && (
        <Link
          href="/dashboard/dkm"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 min-h-[40px] px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"
          aria-label="Kembali ke Dasbor Utama DKM"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dasbor Utama</span>
        </Link>
      )}

      {/* 3 Tab Cepat Horizontal */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard/dkm/profil-masjid' && pathname.startsWith('/dashboard/dkm/profil'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
