import { ReactNode } from 'react';
import { getSession, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, CalendarPlus, LogOut, Users, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-[#093c96] dark:text-blue-400">
            {isAdmin ? 'Admin Panel' : 'DKM Panel'}
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="p-4 flex-grow">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
            <nav className="space-y-1">
              <Link 
                href={isAdmin ? "/dashboard/admin" : "/dashboard/dkm"}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" /> Dasbor
              </Link>
              {!isAdmin && (
                <Link 
                  href="/dashboard/dkm/tambah-kajian"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <CalendarPlus className="w-5 h-5" /> Tambah Kajian
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link 
                    href="#"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Users className="w-5 h-5" /> Kelola DKM
                  </Link>
                  <Link 
                    href="#"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" /> Semua Kajian
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left font-medium cursor-pointer">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 hidden md:flex">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg text-slate-900 dark:text-white">
              {isAdmin ? 'Super Admin Dashboard' : session.masjidName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-[#093c96] text-white flex items-center justify-center font-bold text-sm">
                {session.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white leading-none">{session.name}</p>
                <p className="text-slate-500 text-xs mt-1">{session.role.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
