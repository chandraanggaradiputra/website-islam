import { Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Syarat & Ketentuan - Syiar Salaf Kota Serang',
  description: 'Tata tertib dan ketentuan penggunaan portal Syiar Salaf Kota Serang bagi jamaah dan pengurus DKM.',
};

export default function SyaratKetentuanPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-[#093c96] dark:text-blue-400 mb-3">
          <Scale className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Dokumen Hukum & Ketentuan</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Syarat & Ketentuan Penggunaan
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Terakhir diperbarui: 29 Agustus 2026. Harap membaca tata tertib dan ketentuan penggunaan portal Syiar Salaf Kota Serang di bawah ini dengan seksama.
        </p>
      </div>

      {/* Konten Utama */}
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
        
        {/* 1. Ketentuan Umum */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Ketentuan Umum
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Portal <strong>Syiar Salaf Kota Serang</strong> adalah media nirlaba independen yang bertujuan untuk memfasilitasi kaum muslimin dalam mendapatkan informasi jadwal kajian ilmiah Islam bermanhaj Salafus Shalih dan direktori masjid sunnah di Kota Serang, Banten, dan sekitarnya.
          </p>
          <p className="text-sm leading-relaxed pl-9">
            Dengan mengakses dan menggunakan portal ini, pengunjung maupun pengurus DKM menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang termaktub dalam halaman ini.
          </p>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 2. Kriteria Publikasi Jadwal Kajian */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Kriteria Publikasi Jadwal Kajian
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Setiap jadwal kajian yang diajukan oleh DKM wajib memenuhi syarat keilmuan dan kriteria manhaj berikut:
          </p>
          <ul className="space-y-2.5 pl-9 text-sm">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bermanhaj Salafus Shalih:</strong> Materi kajian berlandaskan Al-Qur&apos;an dan As-Sunnah sesuai dengan pemahaman para Sahabat Nabi <em>(radhiyallahu &apos;anhum)</em>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Kitab Rujukan Mu&apos;tabar:</strong> Pembahasan mengacu kepada kitab-kitab ulama Ahlus Sunnah wal Jama&apos;ah yang terpercaya.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Larangan Konten:</strong> Dilarang keras mengajukan kajian yang memuat syubhat pemikiran menyimpang, fanatisme golongan (hizbiyyah), maupun konten yang bertentangan dengan syariat Islam.
              </span>
            </li>
          </ul>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 3. Tanggung Jawab Pengurus DKM */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              3
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tanggung Jawab Pengurus DKM
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Pengurus DKM yang memiliki hak akses dashboard berkewajiban:
          </p>
          <ul className="space-y-2 pl-9 text-sm list-disc list-inside">
            <li>Menjamin keakuratan informasi jadwal kajian, nama pemateri/ustadz, waktu, serta lokasi masjid penyelenggara.</li>
            <li>Segera memperbarui status kajian jika terdapat perubahan jadwal, libur, atau pembatalan kajian agar tidak membingungkan jamaah.</li>
            <li>Menjaga kerahasiaan kredensial akun login dan tidak memindahtangankan akun ke pihak yang tidak bertanggung jawab.</li>
          </ul>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 4. Hak Moderasi Administrator */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-[#093c96] dark:bg-blue-950 dark:text-blue-400">
              4
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hak Moderasi Administrator
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-9">
            Administrator portal <strong>Syiar Salaf Kota Serang</strong> memiliki kewenangan penuh untuk:
          </p>
          <ul className="space-y-2 pl-9 text-sm list-disc list-inside">
            <li>Memeriksa, menyetujui, menunda, atau menolak permohonan publikasi jadwal kajian demi menjaga kemurnian dakwah sunnah.</li>
            <li>Menonaktifkan atau menghapus akun DKM yang terbukti melanggar kriteria dan tata tertib ini.</li>
            <li>Mengubah atau memperbarui Syarat & Ketentuan ini sewaktu-waktu demi kemaslahatan dakwah dan ketertiban sistem.</li>
          </ul>
        </section>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 5. Hubungi Kami */}
        <section className="space-y-2 pl-9">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Pertanyaan & Informasi Lanjutan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Jika ada pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi tim kami melalui WhatsApp di{' '}
            <a
              href="https://wa.me/6282298148474"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#093c96] dark:text-blue-400 hover:underline"
            >
              0822-9814-8474
            </a>{' '}
            atau via email di{' '}
            <a
              href="mailto:admin@maschandigital.id"
              className="font-semibold text-[#093c96] dark:text-blue-400 hover:underline"
            >
              admin@maschandigital.id
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
