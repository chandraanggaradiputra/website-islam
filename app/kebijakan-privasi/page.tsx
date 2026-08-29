import { ShieldCheck, Database, EyeOff, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi - Syiar Salaf Kota Serang',
  description: 'Kebijakan privasi dan perlindungan data pengguna dan pengurus DKM di portal Syiar Salaf Kota Serang.',
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-[#093c96] dark:text-blue-400 mb-3">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Perlindungan Data & Privasi</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Kebijakan Privasi
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Terakhir diperbarui: 29 Agustus 2026. Kami berkomitmen penuh untuk menjaga amanah data dan privasi seluruh jamaah serta pengurus DKM.
        </p>
      </div>

      {/* Konten Kebijakan */}
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
        
        {/* 1. Informasi yang Kami Kumpulkan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Informasi yang Dikumpulkan
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Dalam rangka memberikan layanan publikasi jadwal kajian yang terverifikasi, portal <strong>Syiar Salaf Kota Serang</strong> mengumpulkan informasi tertentu:
          </p>
          <ul className="space-y-2.5 pl-9 text-sm">
            <li className="flex items-start gap-2.5">
              <Database className="h-4 w-4 text-[#093c96] dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Data Akun Pengurus DKM:</strong> Nama lengkap pengurus, alamat email resmi, serta nomor WhatsApp aktif untuk keperluan verifikasi dan notifikasi jadwal kajian.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Database className="h-4 w-4 text-[#093c96] dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Data Masjid Penyelenggara:</strong> Nama masjid, alamat lengkap, kontak pengurus, tautan lokasi Google Maps, serta jadwal rutin yang didaftarkan untuk konsumsi publik.
              </span>
            </li>
          </ul>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 2. Penggunaan & Perlindungan Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Jaminan Keamanan & Penggunaan Data
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Kami memegang teguh prinsip amanah dalam mengelola data:
          </p>
          <ul className="space-y-2.5 pl-9 text-sm">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bebas Komersialisasi:</strong> Kami <strong>tidak pernah</strong> memperjualbelikan, menyewakan, atau membagikan data kontak pengurus DKM kepada pihak ketiga atau pengiklan komersial.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Keperluan Verifikasi Semata:</strong> Nomor WhatsApp dan email digunakan murni untuk keperluan koordinasi teknis, verifikasi keabsahan kajian, dan konfirmasi infaq.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <EyeOff className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Enkripsi Sandi:</strong> Kata sandi akun DKM dan Admin dienkripsi secara ketat melalui sistem autentikasi WordPress REST API & JWT berstandar industri.
              </span>
            </li>
          </ul>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 3. Penggunaan Cookie & Penyimpanan Sesi */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              3
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Penggunaan Cookie & Sesi
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Portal ini menggunakan cookie sesi yang aman <em>(HTTP-only cookies)</em> khusus untuk:
          </p>
          <ul className="space-y-2 pl-9 text-sm list-disc list-inside">
            <li>Menyimpan token autentikasi sesi saat DKM atau Admin masuk ke area dashboard pengurus.</li>
            <li>Menyimpan preferensi tema tampilan (Mode Terang / Mode Gelap) di peramban Anda.</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
            * Kami tidak menggunakan cookie pelacak pihak ketiga (*third-party advertising trackers*).
          </p>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 4. Hak Pengguna & Penghapusan Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              4
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hak Akses & Penghapusan Data
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Pengurus DKM memiliki hak untuk memperbarui profil masjid, mengubah nomor kontak, atau meminta penghapusan akun beserta riwayat kajian yang pernah diajukan dengan menghubungi Administrator.
          </p>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 5. Kontak Privasi */}
        <section className="space-y-2 pl-9">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Pertanyaan Privasi & Keamanan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau ingin melakukan permintaan terkait data, silakan hubungi kami via email:{' '}
            <a
              href="mailto:admin@maschandigital.id"
              className="font-semibold text-[#093c96] dark:text-blue-400 hover:underline"
            >
              admin@maschandigital.id
            </a>{' '}
            atau WhatsApp di{' '}
            <a
              href="https://wa.me/6282298148474"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#093c96] dark:text-blue-400 hover:underline"
            >
              0822-9814-8474
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
