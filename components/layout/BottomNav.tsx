// components/layout/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  Home,
  Calendar,
  Landmark,
  BookOpen,
  LogIn,
  Plus,
  LayoutDashboard,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isFab?: boolean;
  fabColor?: string;
  badge?: string;
}

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuthSession();

  // 1. Items untuk GUEST
  const guestItems: BottomNavItem[] = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Jadwal', href: '/jadwal-kajian', icon: Calendar },
    { label: 'Masjid', href: '/masjid', icon: Landmark },
    { label: 'Artikel', href: '/artikel', icon: BookOpen },
    { label: 'Masuk', href: '/login', icon: LogIn },
  ];

  // 2. Items untuk DKM MASJID
  const dkmItems: BottomNavItem[] = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Jadwal', href: '/jadwal-kajian', icon: Calendar },
    {
      label: 'Tambah',
      href: '/dashboard/dkm/tambah-kajian',
      icon: Plus,
      isFab: true,
      fabColor: 'bg-emerald-600 dark:bg-emerald-600 shadow-emerald-900/30',
    },
    { label: 'Masjid', href: '/dashboard/dkm', icon: Landmark },
    { label: 'Dasbor', href: '/dashboard/dkm', icon: LayoutDashboard },
  ];

  // 3. Items untuk SUPER ADMIN
  const adminItems: BottomNavItem[] = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Jadwal', href: '/jadwal-kajian', icon: Calendar },
    {
      label: 'Moderasi',
      href: '/dashboard/admin',
      icon: ShieldCheck,
      isFab: true,
      fabColor: 'bg-[#093c96] dark:bg-blue-600 shadow-blue-950/40',
    },
    { label: 'Kelola DKM', href: '/dashboard/admin', icon: Users },
    { label: 'Dasbor', href: '/dashboard/admin', icon: LayoutDashboard },
  ];

  const items = role === 'admin' ? adminItems : role === 'dkm' ? dkmItems : guestItems;

  return (
    <nav
      aria-label="Navigasi Bawah Layar Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/95 backdrop-blur-lg px-2 border-t border-slate-200 dark:border-slate-800 dark:bg-slate-950/95 h-16 transition-colors shadow-lg"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.isFab);

        // Jika item adalah Floating Action Button (FAB) di tengah
        if (item.isFab) {
          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              aria-label={item.label}
              className="-mt-6 flex flex-col items-center group relative"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105 active:scale-95 ${
                  item.fabColor || 'bg-[#093c96]'
                }`}
              >
                <Icon className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="mt-1 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-all ${
              isActive
                ? 'text-[#093c96] dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="truncate max-w-[56px] text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}