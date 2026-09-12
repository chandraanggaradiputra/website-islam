import { Metadata } from 'next';
import Link from 'next/link';
import {
  UserPlus,
  ShieldCheck,
  MailCheck,
  Mic,
  Globe,
  MessageCircle,
  Smartphone,
  Video,
  Share2,
  CheckCircle2,
  Sparkles,
  PlayCircle
} from 'lucide-react';
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

        {/* Modul Panduan Tambahan: PWA & Arsip Video */}
        <div className="space-y-8">
          {/* Kartu 1: Panduan Instalasi PWA (Android & iOS) */}
          <div className="bg-white dark:bg-surface-darkCard shadow-sm rounded-2xl p-6 sm:p-10 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#093c96] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#093c96]/10 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-300">
                  Fitur Aplikasi
                </span>
                <h2 className="text-2xl font-bold font-slab text-slate-900 dark:text-white mt-1">
                  Panduan Pasang Aplikasi (PWA Banten Mengaji)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Akses informasi kajian dan jadwal sholat tanpa repot membuka browser setiap kali. Aplikasi PWA ini sangat ringan, responsif, dan hemat kuota.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              {/* Petunjuk Android (Chrome) */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs">
                    1
                  </span>
                  <h3>Pengguna Android (Google Chrome)</h3>
                </div>
                <ol className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-4 list-decimal leading-relaxed">
                  <li>Buka website <span className="font-semibold text-slate-800 dark:text-slate-200">bantenmengaji.id</span> di Google Chrome.</li>
                  <li>Tunggu banner instalasi muncul di bilah bawah layar, lalu ketuk tombol <span className="font-semibold text-[#093c96] dark:text-blue-400">"Pasang Sekarang"</span>.</li>
                  <li>Atau ketuk menu titik tiga (<span className="font-semibold">⋮</span>) di kanan atas, lalu pilih <span className="font-semibold text-slate-800 dark:text-slate-200">"Tambahkan ke Layar Utama"</span> / <span className="font-semibold text-slate-800 dark:text-slate-200">"Instal Aplikasi"</span>.</li>
                  <li>Ikon aplikasi Banten Mengaji siap digunakan langsung dari layar utama handphone Anda.</li>
                </ol>
              </div>

              {/* Petunjuk iOS (Safari) */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center text-xs">
                    2
                  </span>
                  <h3>Pengguna iPhone & iPad (Safari)</h3>
                </div>
                <ol className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-4 list-decimal leading-relaxed">
                  <li>Buka website <span className="font-semibold text-slate-800 dark:text-slate-200">bantenmengaji.id</span> menggunakan peramban resmi <span className="font-semibold">Safari</span>.</li>
                  <li>Ketuk tombol <span className="font-semibold text-slate-800 dark:text-slate-200">Bagikan (Share)</span> (ikon kotak berpanah ke atas <Share2 className="w-3.5 h-3.5 inline text-blue-600" />) di bilah bawah.</li>
                  <li>Gulir menu ke bawah lalu pilih opsi <span className="font-semibold text-[#093c96] dark:text-blue-400">"Tambahkan ke Layar Utama" (Add to Home Screen)</span>.</li>
                  <li>Ketuk tombol <span className="font-semibold text-slate-800 dark:text-slate-200">"Tambah"</span> di pojok kanan atas untuk menyelesaikan pemasangan.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span>
                <strong>Keunggulan PWA:</strong> Tidak membebani memori smartphone, tidak perlu update manual lewat toko aplikasi, dan memuat jadwal kajian secara instan.
              </span>
            </div>
          </div>

          {/* Kartu 2: Panduan Menyematkan Rekaman Kajian (Untuk Pengurus DKM) */}
          <div className="bg-white dark:bg-surface-darkCard shadow-sm rounded-2xl p-6 sm:p-10 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-[#8f702f] dark:text-[#E8C27A] flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#8f702f] dark:text-[#E8C27A] border border-[#C5A059]/30">
                  Untuk Pengurus DKM
                </span>
                <h2 className="text-2xl font-bold font-slab text-slate-900 dark:text-white mt-1">
                  Panduan Menyematkan Rekaman Kajian (YouTube)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Jadikan kajian di masjid Anda sebagai arsip ilmu yang terus mengalirkan pahala jariyah dengan menyematkan video rekaman YouTube.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#093c96] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Salin Link Video</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Salin tautan rekaman atau siaran langsung dari channel YouTube masjid Anda (bisa link biasa, live, atau shorts).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#093c96] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Buka Dasbor DKM</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Masuk ke <Link href="/dashboard/dkm" className="text-[#093c96] dark:text-blue-400 font-semibold hover:underline">/dashboard/dkm</Link>, lalu pilih jadwal kajian yang telah selesai dilaksanakan dan klik tombol Edit.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#093c96] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tempel Link & Faedah</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tempel URL YouTube pada kolom <em>Link Streaming / Rekaman</em>, dan ketik poin-poin mutiara faedah pada kolom Catatan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#093c96] text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Otomatis Terarsip</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Simpan perubahan. Jadwal otomatis berpindah ke tab <strong>Arsip & Rekaman</strong> dengan badge hijau serta pemutar video aktif.
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
