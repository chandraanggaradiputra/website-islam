'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, Calendar, MapPin, Clock, Video, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitKajian } from '@/lib/actions/kajian';

const kajianSchema = z.object({
  judul: z.string().min(5, 'Judul kajian minimal 5 karakter'),
  penceramah: z.string().min(3, 'Nama penceramah minimal 3 karakter'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  waktu: z.string().min(1, 'Waktu wajib diisi'),
  lokasi: z.string().min(1, 'Lokasi wajib diisi'),
  linkStreaming: z.string().url('URL tidak valid').optional().or(z.literal('')),
  jenisKajian: z.enum(['rutin', 'tematik']),
  kategoriJamaah: z.enum(['umum', 'khusus_ikhwan', 'khusus_akhwat']),
  deskripsi: z.string().optional(),
});

type KajianValues = z.infer<typeof kajianSchema>;

interface TambahKajianFormProps {
  masjidId: number;
  masjidName: string;
}

export function TambahKajianForm({ masjidId, masjidName }: TambahKajianFormProps) {
  const router = useRouter();
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KajianValues>({
    resolver: zodResolver(kajianSchema),
    defaultValues: {
      jenisKajian: 'tematik',
      kategoriJamaah: 'umum',
    }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: KajianValues) => {
    setErrorMessage(null);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string);
      }
    });

    const fileInput = document.getElementById('poster-upload') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('poster', fileInput.files[0]);
    }

    try {
      const res = await submitKajian(formData);
      if (res.success) {
        alert("Alhamdulillah, jadwal kajian berhasil diajukan dan sedang menunggu persetujuan Admin.");
        router.push('/dashboard/dkm');
      } else {
        setErrorMessage(res.error || 'Terjadi kesalahan saat mengajukan kajian.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan jaringan.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-8">
        
        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Masjid Info (Locked) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-[#093c96] dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Masjid Penyelenggara</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{masjidName}</p>
            </div>
          </div>
          <div className="self-start md:self-center shrink-0">
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Otomatis Terkunci
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Judul Kajian</label>
              <input
                type="text"
                {...register('judul')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="Contoh: Pembahasan Kitab Tauhid"
              />
              {errors.judul && <p className="mt-1.5 text-sm text-red-500">{errors.judul.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Penceramah / Ustadz</label>
              <input
                type="text"
                {...register('penceramah')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="Contoh: Ustadz Fulan bin Fulan"
              />
              {errors.penceramah && <p className="mt-1.5 text-sm text-red-500">{errors.penceramah.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tanggal</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    {...register('tanggal')}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                  />
                </div>
                {errors.tanggal && <p className="mt-1.5 text-sm text-red-500">{errors.tanggal.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Waktu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    {...register('waktu')}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                  />
                </div>
                {errors.waktu && <p className="mt-1.5 text-sm text-red-500">{errors.waktu.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lokasi / Ruangan</label>
              <input
                type="text"
                {...register('lokasi')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="Contoh: Ruang Utama Masjid"
              />
              {errors.lokasi && <p className="mt-1.5 text-sm text-red-500">{errors.lokasi.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jenis Kajian</label>
                <select
                  {...register('jenisKajian')}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                >
                  <option value="rutin">Rutin</option>
                  <option value="tematik">Tematik</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kategori Jamaah</label>
                <select
                  {...register('kategoriJamaah')}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                >
                  <option value="umum">Umum</option>
                  <option value="khusus_ikhwan">Khusus Ikhwan</option>
                  <option value="khusus_akhwat">Khusus Akhwat</option>
                </select>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload Poster Kajian</label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer overflow-hidden">
                <input 
                  id="poster-upload"
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {posterPreview ? (
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={posterPreview} alt="Preview Poster" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium">Ubah Gambar</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImagePlus className="w-8 h-8" />
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Klik untuk upload poster</p>
                    <p className="text-xs mt-1">PNG, JPG, maksimal 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Link Live Streaming (Opsional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  {...register('linkStreaming')}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2"
                  placeholder="https://youtube.com/..."
                />
              </div>
              {errors.linkStreaming && <p className="mt-1.5 text-sm text-red-500">{errors.linkStreaming.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Tambahan (Opsional)</label>
              <textarea
                {...register('deskripsi')}
                rows={3}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2"
                placeholder="Informasi kitab yang dibahas, catatan, dll."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/30 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#093c96] hover:bg-[#072a6b] text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
            </>
          ) : (
            'Terbitkan Kajian'
          )}
        </button>
      </div>
    </form>
  );
}
