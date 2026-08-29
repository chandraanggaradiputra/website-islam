'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { WPMasjid } from '@/types';
import { Building2, User, Mail, Phone, FileText, Send, CheckCircle2 } from 'lucide-react';

const dkmSchema = z.object({
  namaPengurus: z.string().min(3, 'Nama pengurus minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  noWhatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  masjidId: z.coerce.number().min(1, 'Pilih masjid yang Anda kelola'),
  catatan: z.string().optional(),
});

type DKMFormValues = z.infer<typeof dkmSchema>;

export function DaftarDKMForm({ masjidList = [] }: { masjidList: WPMasjid[] }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DKMFormValues>({
    resolver: zodResolver(dkmSchema),
    defaultValues: {
      namaPengurus: '',
      email: '',
      noWhatsapp: '',
      masjidId: 0,
      catatan: '',
    },
  });

  const onSubmit = async (data: DKMFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulasikan pendaftaran / simpan permohonan
      console.log('Permohonan DKM:', data);
      setIsSuccess(true);
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          Permohonan Pendaftaran Berhasil Diajukan
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Jazakumullahu khairan. Data Anda sedang dalam proses verifikasi oleh Administrator Syiar Salaf Kota Serang.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Nama Lengkap Pengurus DKM *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            {...register('namaPengurus')}
            type="text"
            placeholder="Contoh: Fulan bin Fulan"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        {errors.namaPengurus && (
          <p className="mt-1 text-xs text-red-500">{errors.namaPengurus.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Email Resmi Pengurus *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            {...register('email')}
            type="email"
            placeholder="nama@masjid.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Nomor WhatsApp Aktif *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            {...register('noWhatsapp')}
            type="tel"
            placeholder="08123456789"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        {errors.noWhatsapp && (
          <p className="mt-1 text-xs text-red-500">{errors.noWhatsapp.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Pilih Masjid yang Dikelola *
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <select
            {...register('masjidId')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="0">-- Pilih Masjid di Kota Serang --</option>
            {masjidList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title?.rendered}
              </option>
            ))}
          </select>
        </div>
        {errors.masjidId && (
          <p className="mt-1 text-xs text-red-500">{errors.masjidId.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Catatan / Informasi Tambahan (Opsional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <textarea
            {...register('catatan')}
            rows={3}
            placeholder="Jelaskan posisi Anda di DKM atau informasi terkait masjid..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#093c96] py-3 text-sm font-semibold text-white transition-all hover:bg-blue-800 disabled:opacity-50 shadow-md shadow-blue-900/20"
      >
        <Send className="h-4 w-4" />
        <span>{isSubmitting ? 'Mengirim Permohonan...' : 'Ajukan Pendaftaran DKM'}</span>
      </button>
    </form>
  );
}
