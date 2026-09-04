import Link from 'next/link';
import { ArrowLeft, MessageCircle, KeyRound, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Lupa Password - Banten Mengaji',
  description: 'Prosedur pemulihan kata sandi dan bantuan akun pengurus DKM Banten Mengaji.',
};

export default function LupaPasswordPage() {
  const waHelpUrl =
    'https://wa.me/6282298148474?text=Assalamualaikum%20Admin%20Banten%20Mengaji,%20saya%20pengurus%20DKM%20ingin%20mengajukan%20permohonan%20reset%20password.%0A%0AFormat%20Verifikasi%20Identitas:%0A-%20Nama%20Lengkap:%20%0A-%20Nama%20Masjid%20Terdaftar:%20%0A-%20Email%20Resmi%20Terdaftar:%20';

  return (
    <div className="mx-auto my-10 max-w-lg p-4 sm:p-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Header Title */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#093c96] shadow-sm dark:bg-blue-950/60 dark:text-blue-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pemulihan Password Akun
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pusat bantuan pemulihan akses akun pengurus DKM Banten Mengaji.
          </p>
        </div>

        {/* Informasi Status Fitur (Prinsip 4: Jujur & Transparan, Tanpa Alur Palsu) */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <p className="font-bold text-amber-900 dark:text-amber-300">
                Layanan Reset Mandiri Sedang Sinkronisasi
              </p>
              <p className="leading-relaxed text-xs text-amber-800/90 dark:text-amber-200/90">
                Sistem pengiriman email reset password mandiri saat ini sedang dalam tahap sinkronisasi konfigurasi mail server. Untuk mencegah simulasi palsu dan menjamin validitas akun, pemulihan dilakukan secara terverifikasi bersama Administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Prosedur Verifikasi Keamanan Akun */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Instruksi Verifikasi Identitas
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Untuk melindungi integritas data masjid dan mencegah pengambilalihan akun yang tidak sah, Anda wajib menyertakan rincian berikut saat menghubungi admin:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Nama Lengkap</strong> Pengurus DKM</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Nama Masjid</strong> yang Terdaftar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Alamat Email Resmi</strong> yang Terdaftar</span>
              </li>
            </ul>
          </div>

          {/* Tombol Bantuan WhatsApp Super Admin */}
          <Link
            href={waHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Hubungi Super Admin via WhatsApp (0822-9814-8474)</span>
          </Link>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
            Admin akan mencocokkan identitas pengurus sebelum menerbitkan kredensial baru.
          </p>
        </div>

        {/* Tautan Kembali ke Login */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-[#093c96] hover:underline dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
