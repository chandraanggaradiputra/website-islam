'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getMasjidList } from '@/lib/wordpress';
import { WPMasjid } from '@/types';
import { User, Mail, Phone, Building2, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const dkmRegistrationSchema = z.object({
  namaPengurus: z.string().min(3, 'Nama pengurus minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  noWhatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').max(15, 'Nomor WhatsApp maksimal 15 digit'),
  masjidId: z.coerce.number().min(1, 'Silakan pilih masjid yang Anda urus'),
  catatan: z.string().optional(),
});

type RegistrationValues = z.infer<typeof dkmRegistrationSchema>;

export default function DaftarDKMPage() {
  const [masjidList, setMasjidList] = useState<WPMasjid[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingMasjid, setIsLoadingMasjid] = useState(true);

  useEffect(() => {
    async function loadMasjid() {
      try {
        const list = await getMasjidList();
        setMasjidList(list);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingMasjid(false);
      }
    }
    loadMasjid();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationValues>({
    resolver: zodResolver(dkmRegistrationSchema),
  });

  const onSubmit = async (data: RegistrationValues) => {
    // Simulasi API call pendaftaran
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Payload Pendaftaran:', data);
    setIsSuccess(true);
    reset();
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Pendaftaran Berhasil!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Terima kasih telah mendaftar sebagai pengurus DKM. Tim kami akan memverifikasi data Anda dalam waktu 1x24 jam kerja dan mengirimkan akses dashboard melalui WhatsApp/Email.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link href="/" className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Kembali ke Beranda
          </Link>
          <button onClick={() => setIsSuccess(false)} className="inline-block bg-[#093c96] hover:bg-[#072a6b] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Daftar Masjid Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-6 md:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pendaftaran DKM</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Daftarkan diri Anda untuk mengelola jadwal kajian dan profil masjid secara mandiri melalui Dashboard DKM.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap Pengurus</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              {...register('namaPengurus')}
              className={`block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.namaPengurus ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-[#093c96]'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2`}
              placeholder="Contoh: Fulan bin Fulan"
            />
          </div>
          {errors.namaPengurus && <p className="mt-1.5 text-sm text-red-500">{errors.namaPengurus.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                {...register('email')}
                className={`block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-[#093c96]'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2`}
                placeholder="email@contoh.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">No. WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                {...register('noWhatsapp')}
                className={`block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.noWhatsapp ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-[#093c96]'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2`}
                placeholder="081234567890"
              />
            </div>
            {errors.noWhatsapp && <p className="mt-1.5 text-sm text-red-500">{errors.noWhatsapp.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pilih Masjid Anda</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <select
              {...register('masjidId')}
              disabled={isLoadingMasjid}
              className={`block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.masjidId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-[#093c96]'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 appearance-none disabled:opacity-60`}
            >
              <option value="">{isLoadingMasjid ? 'Memuat daftar masjid...' : '-- Pilih Masjid --'}</option>
              {masjidList.map((m) => (
                <option key={m.id} value={m.id}>{m.title.rendered}</option>
              ))}
            </select>
          </div>
          {errors.masjidId && <p className="mt-1.5 text-sm text-red-500">{errors.masjidId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan Tambahan (Opsional)</label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3.5 pointer-events-none">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <textarea
              {...register('catatan')}
              rows={4}
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2"
              placeholder="Sebutkan posisi Anda di DKM (misal: Ketua, Sekretaris) atau informasi penting lainnya."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-8 flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-[#093c96] hover:bg-[#072a6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#093c96] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...
            </>
          ) : (
            'Kirim Permohonan Akses'
          )}
        </button>
      </form>
    </div>
  );
}
