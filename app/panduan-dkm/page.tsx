import { Metadata } from 'next';
import Link from 'next/link';
import { UserPlus, ShieldCheck, MailCheck, Mic, Globe, MessageCircle } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPanduanDkmJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Panduan Layanan DKM Masjid | Banten Mengaji',
  description: 'Tata cara pendaftaran masjid dan pengelolaan jadwal kajian Islam di portal Banten Mengaji.',
};

export default function PanduanDKMPage() {
  const panduanSchema = getPanduanDkmJsonLd();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd data={panduanSchema} />
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-slab text-slate-900 dark:text-white tracking-tight">
            Panduan Layanan & Dasbor DKM Masjid
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Panduan lengkap pendaftaran profil masjid dan pengelolaan jadwal kajian dakwah di Banten Mengaji.
          </p>
        </div>

        {/* 5 Langkah Utama */}
        <div className="bg-white dark:bg-surface-darkCard shadow-sm rounded-2xl p-6 sm:p-10 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-2xl font-bold font-slab text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            5 Langkah Utama Penggunaan
          </h2>
          <div className="space-y-8">
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <UserPlus className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Langkah 1: Registrasi Masjid & DKM</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Mengisi formulir di <Link href="/daftar-dkm" className="text-brand-600 dark:text-brand-400 hover:underline">/daftar-dkm</Link> yang mencakup identitas pengurus, nomor WhatsApp aktif, data masjid, foto sampul, dan nomor rekening infaq.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Langkah 2: Proses Verifikasi Super Admin</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Tim Banten Mengaji memvalidasi data masjid demi menjaga keabsahan informasi dakwah sunnah se-Provinsi Banten.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <MailCheck className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Langkah 3: Notifikasi & Akses Akun</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Pengurus menerima pemberitahuan via email/WhatsApp begitu akun disetujui, lalu dapat masuk ke dasbor melalui <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline">/login</Link>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Mic className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Langkah 4: Publikasi Jadwal Kajian</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Masuk ke Dasbor DKM (<Link href="/dashboard/dkm" className="text-brand-600 dark:text-brand-400 hover:underline">/dashboard/dkm</Link>) untuk mengisi jam mulai/selesai, nama asatidz, kitab bahasan, kategori jamaah (Umum, Ikhwan, Akhwat), dan mengunggah poster kajian.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Globe className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Langkah 5: Syiar Otomatis ke Jamaah</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Kajian otomatis tampil di beranda, direktori kajian, kalender jamaah, dan terindeks di mesin pencari.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Kartu Bantuan & CTA */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-6 sm:p-8 border border-brand-200/50 dark:border-brand-800/50 flex flex-col justify-center text-center items-center gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Butuh Bantuan?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Tim dukungan Banten Mengaji siap membantu proses pendaftaran dan publikasi kajian Anda.</p>
            <a 
              href="https://wa.me/6282298148474" 
              target="_blank" 
              rel="noreferrer"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Hubungi WhatsApp
            </a>
          </div>

          <div className="bg-white dark:bg-surface-darkCard shadow-sm rounded-2xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-center text-center items-center gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mulai Sebarkan Kebaikan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Bergabunglah bersama kami mensyiarkan dakwah sunnah di Provinsi Banten.</p>
            <div className="flex flex-col w-full gap-3 mt-2">
              <Link 
                href="/daftar-dkm"
                className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Daftarkan Masjid Sekarang
              </Link>
              <Link 
                href="/login"
                className="w-full flex items-center justify-center border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-semibold py-2.5 px-6 rounded-xl transition-colors dark:border-brand-500 dark:text-brand-400 dark:hover:bg-brand-950"
              >
                Masuk ke Dasbor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
