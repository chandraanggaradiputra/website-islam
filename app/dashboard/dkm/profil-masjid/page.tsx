import { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { getMasjidById } from '@/lib/actions/masjid';
import { DKMMasjidProfileForm } from '@/components/dashboard/DKMMasjidProfileForm';
import { Building2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Profil Masjid Saya - Dasbor DKM',
  description: 'Kelola data profil, fasilitas, foto, dan rekening infaq masjid Anda.',
};

export default async function DKMProfilMasjidPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        Silakan login terlebih dahulu untuk mengakses halaman ini.
      </div>
    );
  }

  const masjid = session.masjidId ? await getMasjidById(session.masjidId) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-[#093c96] dark:text-blue-400" />
          <span>Profil Masjid Saya</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Perbarui informasi profil, kontak penanggung jawab, fasilitas, dan rekening infaq {session.masjidName || 'masjid Anda'}.
        </p>
      </div>

      {!masjid ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900/60 dark:bg-yellow-950/30 text-slate-800 dark:text-slate-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-bold text-base text-yellow-900 dark:text-yellow-300">
                Akun Belum Terhubung dengan Data Masjid
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                Akun DKM Anda belum terhubung dengan salah satu data masjid di direktori Kota Serang. Silakan hubungi Administrator atau ajukan pendaftaran masjid baru.
              </p>
              <div className="pt-2">
                <Link
                  href="/daftar-dkm"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-600 text-white text-xs font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Ajukan Pendaftaran Masjid
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <DKMMasjidProfileForm masjid={masjid} />
      )}
    </div>
  );
}
