'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle, Heart, ShieldCheck, Sparkles, Building2, Wallet } from 'lucide-react';
import Link from 'next/link';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  badge: string;
  color: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bsi',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7304526968',
    accountHolder: 'Chandra Anggara Diputra',
    badge: 'BSI Syariah',
    color: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'aladin',
    bankName: 'Bank Aladin Syariah',
    accountNumber: '50661906210',
    accountHolder: 'Chandra Anggara Diputra',
    badge: 'Aladin Syariah',
    color: 'from-blue-600 to-[#093c96]',
  },
];

export default function DonasiPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  const waConfirmUrl =
    'https://wa.me/6282298148474?text=Assalamualaikum%20Akhi%20Chandra%20Anggara,%20saya%20telah%20menyalurkan%20infaq%20pengembangan%20Website%20Syiar%20Salaf%20Serang.';

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#093c96] via-blue-800 to-slate-900 p-8 md:p-12 text-white shadow-xl shadow-blue-950/20">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/15">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
            <span>Infaq & Dukungan Dakwah Sunnah</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Infaq Pengembangan Syiar Salaf Serang
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Bantu operasional server, digitalisasi direktori masjid, dan penyebaran jadwal kajian ilmiah Islam bermanhaj Salafus Shalih di Kota Serang dan sekitarnya.
          </p>
        </div>
      </div>

      {/* Keutamaan Sedekah Hadits */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 dark:border-blue-900/40 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#093c96] p-2.5 text-white shadow-sm shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Keutamaan Sedekah Jariyah & Membantu Dakwah
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic">
              &quot;Jika seseorang meninggal dunia, maka terputuslah amalannya kecuali tiga perkara (yaitu): sedekah jariyah, ilmu yang dimanfaatkan, dan doa anak yang sholeh.&quot;
            </p>
            <p className="text-xs font-semibold text-[#093c96] dark:text-blue-400">
              (HR. Muslim no. 1631)
            </p>
          </div>
        </div>
      </div>

      {/* Rekening Transfer */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#093c96] dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Nomor Rekening Infaq Resmi
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Silakan salurkan infaq dan donasi sukarela Anda melalui rekening bank syariah berikut:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {BANK_ACCOUNTS.map((acc) => {
            const isCopied = copiedId === acc.id;

            return (
              <div
                key={acc.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${acc.color} text-white shadow-sm`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Bank Penerima
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {acc.bankName}
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {acc.badge}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Nomor Rekening
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white">
                        {acc.accountNumber}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Atas Nama: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{acc.accountHolder}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleCopy(acc.id, acc.accountNumber)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#093c96] text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span>Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Salin No. Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Konfirmasi WhatsApp & Transparansi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-base">Alokasi & Transparansi Infaq</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Seluruh infaq yang masuk dialokasikan untuk pemeliharaan infrastruktur website, biaya domain & hosting, pengadaan modul integrasi API jadwal, serta biaya operasional tim pengembang relawan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Infrastruktur & Server</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Memastikan website selalu cepat & aktif 24/7.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Pengembangan Fitur</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Pencarian jadwal, integrasi DKM, dan peta masjid.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 dark:border-emerald-900/40 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Konfirmasi Cepat
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Konfirmasi Infaq
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Setelah mengirimkan infaq, Anda dapat mengonfirmasi kepada admin agar tercatat dalam pembukuan dakwah.
            </p>
          </div>

          <Link
            href={waConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Konfirmasi via WhatsApp</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
