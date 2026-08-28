// components/layout/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Landmark, BookOpen, type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Jadwal', href: '/jadwal-kajian', icon: Calendar },
  { label: 'Masjid', href: '/masjid', icon: Landmark },
  { label: 'Artikel', href: '/artikel', icon: BookOpen },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi Utama Mobile"
      className="md:hidden right-0 bottom-0 left-0 z-50 fixed flex justify-around items-center bg-white/95 dark:bg-slate-950/95 backdrop-blur px-2 border-slate-200 dark:border-slate-800 border-t h-16"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'text-[#093c96] dark:text-blue-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}