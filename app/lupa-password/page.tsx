'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, MessageCircle, Loader2, KeyRound } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function LupaPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Simulasi pengiriman request pemulihan password
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmittedEmail(data.email);
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubmittedEmail('');
    reset();
  };

  const waHelpUrl =
    'https://wa.me/6282298148474?text=Assalamualaikum%20Admin%20Syiar%20Salaf%20Serang,%20saya%20pengurus%20DKM%20ingin%20meminta%20bantuan%20reset%20password%20akun.';

  return (
    <div className="mx-auto my-10 max-w-md p-4 sm:p-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Header Title */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#093c96] shadow-sm dark:bg-blue-950/60 dark:text-blue-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lupa Password
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Masukkan alamat email yang terdaftar untuk menerima petunjuk pemulihan kata sandi akun Anda.
          </p>
        </div>

        {isSubmitted ? (
          /* Notifikasi Sukses */
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Instruksi Telah Dikirim
                  </p>
                  <p className="leading-relaxed">
                    Jika email <strong className="font-semibold text-slate-900 dark:text-white">{submittedEmail}</strong> terdaftar di sistem kami, instruksi pemulihan password telah dikirimkan.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Silakan periksa kotak masuk (inbox) atau folder spam email Anda.
            </p>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Kirim Ulang ke Email Lain
            </button>
          </div>
        ) : (
          /* Form Input Email */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email Akun *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:border-[#093c96] focus:ring-[#093c96] dark:border-slate-800'
                  }`}
                  placeholder="pengurus@masjid.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#093c96] py-2.5 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#072a6b] focus:outline-none focus:ring-2 focus:ring-[#093c96] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Kirim Petunjuk Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Pemisah Garis */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Atau Bantuan Cepat
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Tombol Bantuan WhatsApp Super Admin */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  Bantuan Super Admin via WhatsApp
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pengurus DKM yang mengalami kendala akses atau lupa alamat email dapat menghubungi Super Admin secara langsung.
                </p>
              </div>
            </div>

            <Link
              href={waHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Hubungi Admin via WhatsApp</span>
            </Link>
          </div>
        </div>

        {/* Tautan Kembali ke Login */}
        <div className="mt-6 text-center">
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
