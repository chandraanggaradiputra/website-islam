'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, Calendar, MapPin, Clock, Video, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitKajian } from '@/lib/actions/kajian';
import { WhatsAppScratchpad } from '@/components/dashboard/WhatsAppScratchpad';

const kajianSchema = z
  .object({
    judul: z.string().min(5, 'Judul kajian minimal 5 karakter'),
    penceramah: z.string().min(3, 'Nama penceramah minimal 3 karakter'),
    content: z.string().optional(),
    tanggal: z.string().optional(),
    hariKajian: z.string().optional(),
    jamMulai: z.string().min(1, 'Jam mulai kajian wajib diisi'),
    jamSelesai: z.string().optional(),
    lokasi: z.string().min(1, 'Lokasi / ruangan kajian wajib diisi'),
    linkStreaming: z.string().url('Format URL tautan streaming tidak valid').optional().or(z.literal('')),
    jenisKajian: z.enum(['rutin', 'tematik']),
    kategoriJamaah: z.enum(['umum', 'khusus_ikhwan', 'khusus_akhwat']),
    kitabBahasan: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validasi kondisional: Kajian Rutin wajib memilih Hari, Kajian Tematik wajib memilih Tanggal
    if (data.jenisKajian === 'rutin' && (!data.hariKajian || data.hariKajian.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hariKajian'],
        message: 'Hari kajian wajib dipilih untuk jenis Kajian Rutin (Pekanan / Bulanan)',
      });
    }
    if (data.jenisKajian === 'tematik' && (!data.tanggal || data.tanggal.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tanggal'],
        message: 'Tanggal pelaksanaan wajib diisi untuk jenis Kajian Tematik',
      });
    }
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KajianValues>({
    resolver: zodResolver(kajianSchema),
    defaultValues: {
      content: '',
      jenisKajian: 'rutin',
      kategoriJamaah: 'umum',
      hariKajian: '',
      tanggal: '',
    },
  });

  const selectedJenisKajian = watch('jenisKajian');
  const isKajianRutin = selectedJenisKajian === 'rutin';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: KajianValues) => {
    setErrorMessage(null);
    
    const formData = new FormData();
    formData.append('masjid_terkait', String(masjidId));
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
        alert(
          res.message ||
            'Jazakallahu khairan. Jadwal kajian berhasil dipublikasikan dan langsung tayang di portal Banten Mengaji.'
        );
        router.push('/dashboard/dkm');
        router.refresh();
      } else {
        setErrorMessage(
          res.message ||
            res.error ||
            'Afwan, jadwal kajian belum dapat disimpan. Silakan periksa isian data Anda atau coba beberapa saat lagi.'
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Afwan, terjadi kegagalan jaringan saat mengirim data.');
      }
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
        <input type="hidden" name="masjid_terkait" value={masjidId} />

        {/* Kolom Teks Broadcast WhatsApp (Smart Scratchpad - Opsi A) */}
        <div>
          <WhatsAppScratchpad
            id="content"
            name="content"
            value={watch('content') || ''}
            onChange={(val) => setValue('content', val, { shouldDirty: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-5">
            {/* 1. Judul Kajian */}
            <div>
              <label htmlFor="judul" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Judul / Tema Kajian <span className="text-red-700 dark:text-red-400 font-bold">*</span>
              </label>
              <input
                id="judul"
                type="text"
                aria-label="Judul atau Tema Kajian"
                {...register('judul')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="Contoh: Pembahasan Kitab Tauhid"
              />
              {errors.judul && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{errors.judul.message}</p>}
            </div>

            {/* 2. Penceramah */}
            <div>
              <label htmlFor="penceramah" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Penceramah / Ustadz <span className="text-red-700 dark:text-red-400 font-bold">*</span>
              </label>
              <input
                id="penceramah"
                type="text"
                aria-label="Nama Penceramah atau Ustadz"
                {...register('penceramah')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="Contoh: Ustadz Abu Usamah, Lc."
              />
              {errors.penceramah && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{errors.penceramah.message}</p>}
            </div>

            {/* 3. Jenis Kajian & Kategori Jamaah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jenisKajian" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Jenis Kajian <span className="text-red-700 dark:text-red-400 font-bold">*</span>
                </label>
                <select
                  id="jenisKajian"
                  aria-label="Pilih Jenis Kajian"
                  {...register('jenisKajian')}
                  className="block w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                >
                  <option value="rutin">Kajian Rutin (Pekanan / Bulanan)</option>
                  <option value="tematik">Kajian Tematik (Tabligh Akbar / Bedah Kitab)</option>
                </select>
              </div>
              <div>
                <label htmlFor="kategoriJamaah" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kategori Jamaah <span className="text-red-700 dark:text-red-400 font-bold">*</span>
                </label>
                <select
                  id="kategoriJamaah"
                  aria-label="Pilih Kategori Jamaah"
                  {...register('kategoriJamaah')}
                  className="block w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                >
                  <option value="umum">Umum (Ikhwan & Akhwat)</option>
                  <option value="khusus_ikhwan">Khusus Ikhwan</option>
                  <option value="khusus_akhwat">Khusus Akhwat</option>
                </select>
              </div>
            </div>

            {/* 4. Hari Kajian & Tanggal Pelaksanaan (Kondisional Dinamis) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hariKajian" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hari Kajian{' '}
                  {isKajianRutin ? (
                    <span className="text-xs font-bold text-red-700 dark:text-red-400">* (Wajib untuk Rutin)</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">(Opsional)</span>
                  )}
                </label>
                <select
                  id="hariKajian"
                  aria-label="Pilih Hari Kajian"
                  {...register('hariKajian')}
                  className="block w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#093c96]"
                >
                  <option value="">-- Pilih Hari --</option>
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                  <option value="Ahad">Ahad</option>
                </select>
                {errors.hariKajian && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.hariKajian.message}</p>}
              </div>

              <div>
                <label htmlFor="tanggal" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Pelaksanaan{' '}
                  {!isKajianRutin ? (
                    <span className="text-xs font-bold text-red-700 dark:text-red-400">* (Wajib untuk Tematik)</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">(Opsional untuk Rutin)</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="tanggal"
                    type="date"
                    aria-label="Tanggal Pelaksanaan Kajian"
                    {...register('tanggal')}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                  />
                </div>
                {errors.tanggal && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.tanggal.message}</p>}
              </div>
            </div>

            {/* 5. Jam Mulai & Jam Selesai (Format 24 Jam) */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jamMulai" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jam Mulai <span className="text-red-700 dark:text-red-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="jamMulai"
                      type="time"
                      aria-label="Jam Mulai Kajian"
                      {...register('jamMulai')}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-mono"
                    />
                  </div>
                  {errors.jamMulai && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.jamMulai.message}</p>}
                </div>
                <div>
                  <label htmlFor="jamSelesai" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jam Selesai <span className="text-xs font-medium text-slate-600 dark:text-slate-400">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="jamSelesai"
                      type="time"
                      aria-label="Jam Selesai Kajian"
                      {...register('jamSelesai')}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-mono"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-1 font-medium">
                <span>Format 24 Jam (Contoh: 18.30 untuk Ba&apos;da Maghrib, 20.00 untuk Ba&apos;da Isya)</span>
              </p>
            </div>

            {/* 6. Lokasi / Ruangan */}
            <div>
              <label htmlFor="lokasi" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Lokasi / Ruangan <span className="text-red-700 dark:text-red-400 font-bold">*</span>
              </label>
              <input
                id="lokasi"
                type="text"
                aria-label="Lokasi atau Ruangan Kajian"
                {...register('lokasi')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="Contoh: Ruang Utama Masjid"
              />
              {errors.lokasi && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{errors.lokasi.message}</p>}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div>
              <label htmlFor="poster-upload" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload Poster Kajian</label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer overflow-hidden">
                <input 
                  id="poster-upload"
                  aria-label="Upload poster flyer kajian"
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
                    <p className="font-medium text-slate-800 dark:text-slate-200">Klik untuk upload poster</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">PNG, JPG, maksimal 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="linkStreaming" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Link Live Streaming (Opsional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="linkStreaming"
                  type="url"
                  aria-label="Tautan Live Streaming Kajian"
                  {...register('linkStreaming')}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2"
                  placeholder="https://youtube.com/... atau tautan kajian online lainnya"
                />
              </div>
              {errors.linkStreaming && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{errors.linkStreaming.message}</p>}
            </div>

            <div>
              <label htmlFor="kitabBahasan" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kitab yang Dibahas (Opsional)</label>
              <textarea
                id="kitabBahasan"
                aria-label="Kitab yang Dibahas"
                {...register('kitabBahasan')}
                rows={3}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-[#093c96] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2"
                placeholder="Contoh: Kitab Tauhid, Bulughul Maram, dll."
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
