'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { WPMasjid } from '@/types';
import { submitDaftarDKM } from '@/lib/actions/dkm';
import { BANTEN_REGIONS, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';
import {
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Send,
  CheckCircle2,
  MapPin,
  Compass,
  CreditCard,
  Sparkles,
  AlertCircle,
  PlusCircle,
  Map,
} from 'lucide-react';

const FASILITAS_OPTIONS = [
  'Parkir Mobil & Motor',
  'Tempat Wudhu Terpisah',
  'Ruangan Ber-AC',
  'Area Khusus Akhwat',
  'Perpustakaan Kitab',
];

const dkmSchema = z
  .object({
    namaPengurus: z.string().min(3, 'Nama pengurus minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    noWhatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
    kotaKabupaten: z.string().min(1, 'Pilih kota/kabupaten asal masjid'),
    masjidOption: z.string().min(1, 'Pilih masjid yang Anda kelola'),
    // Field Tambahan jika Masjid Belum Terdaftar (NEW_MASJID)
    namaMasjidBaru: z.string().optional(),
    kecamatan: z.string().optional(),
    alamatMasjid: z.string().optional(),
    googleMapsUrl: z.string().optional(),
    fasilitas: z.array(z.string()).optional(),
    namaBank: z.string().optional(),
    nomorRekening: z.string().optional(),
    atasNamaRekening: z.string().optional(),
    catatan: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.masjidOption === 'NEW_MASJID') {
      if (!data.namaMasjidBaru || data.namaMasjidBaru.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['namaMasjidBaru'],
          message: 'Nama masjid baru wajib diisi (minimal 3 karakter)',
        });
      }
      if (!data.kecamatan || data.kecamatan === '0' || data.kecamatan === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['kecamatan'],
          message: 'Pilih kecamatan lokasi masjid',
        });
      }
      if (!data.alamatMasjid || data.alamatMasjid.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['alamatMasjid'],
          message: 'Alamat lengkap masjid wajib diisi (minimal 5 karakter)',
        });
      }
    } else {
      const idNum = Number(data.masjidOption);
      if (isNaN(idNum) || idNum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['masjidOption'],
          message: 'Pilih salah satu masjid terdaftar atau daftarkan masjid baru',
        });
      }
    }
  });

type DKMFormValues = z.infer<typeof dkmSchema>;

export function DaftarDKMForm({ masjidList = [] }: { masjidList: WPMasjid[] }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DKMFormValues>({
    resolver: zodResolver(dkmSchema),
    defaultValues: {
      namaPengurus: '',
      email: '',
      noWhatsapp: '',
      kotaKabupaten: '',
      masjidOption: '0',
      namaMasjidBaru: '',
      kecamatan: '',
      alamatMasjid: '',
      googleMapsUrl: '',
      fasilitas: [],
      namaBank: '',
      nomorRekening: '',
      atasNamaRekening: '',
      catatan: '',
    },
  });

  const selectedKota = watch('kotaKabupaten') as KotaKabupatenBanten;
  const selectedMasjidOption = watch('masjidOption');
  const isNewMasjid = selectedMasjidOption === 'NEW_MASJID';

  const filteredKecamatans = useMemo(() => {
    if (!selectedKota) return [];
    const region = BANTEN_REGIONS.find((r) => r.name === selectedKota);
    return region ? region.kecamatan : [];
  }, [selectedKota]);

  const filteredMasjidList = useMemo(() => {
    if (!selectedKota) return masjidList;
    return masjidList.filter(m => (m.acf?.kota_kabupaten || 'Kota Serang') === selectedKota);
  }, [selectedKota, masjidList]);

  const onSubmit = async (data: DKMFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const cleanUrl = data.googleMapsUrl?.trim();
      const validUrl = cleanUrl && cleanUrl.startsWith('http') ? cleanUrl : undefined;

      const payload = {
        namaPengurus: data.namaPengurus.trim(),
        email: data.email.trim(),
        noWhatsapp: data.noWhatsapp.trim(),
        kotaKabupaten: data.kotaKabupaten as KotaKabupatenBanten,
        masjidOption: data.masjidOption,
        masjidId: isNewMasjid ? undefined : Number(data.masjidOption),
        isNewMasjid,
        namaMasjidBaru: isNewMasjid ? data.namaMasjidBaru?.trim() : undefined,
        kecamatan: undefined,
        kecamatanNama: isNewMasjid ? data.kecamatan : undefined,
        alamatMasjid: isNewMasjid ? data.alamatMasjid?.trim() : undefined,
        googleMapsUrl: isNewMasjid ? validUrl : undefined,
        fasilitas: isNewMasjid && data.fasilitas && data.fasilitas.length > 0 ? data.fasilitas : undefined,
        namaBank: isNewMasjid && data.namaBank?.trim() ? data.namaBank.trim() : undefined,
        nomorRekening: isNewMasjid && data.nomorRekening?.trim() ? data.nomorRekening.trim() : undefined,
        atasNamaRekening: isNewMasjid && data.atasNamaRekening?.trim() ? data.atasNamaRekening.trim() : undefined,
        catatan: data.catatan?.trim() || undefined,
      };

      const res = await submitDaftarDKM(payload);

      if (res.success) {
        setIsSuccess(true);
        reset();
      } else {
        setErrorMessage(res.error || 'Gagal mengajukan pendaftaran DKM.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kesalahan koneksi saat mengirim formulir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 md:p-12 text-center dark:border-emerald-800 dark:bg-emerald-950/40 shadow-sm animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="mt-6 text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
          Permohonan Pendaftaran Berhasil Diajukan!
        </h3>
        <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          <em>Jazakumullahu khairan.</em> Data kepengurusan DKM{' '}
          {isNewMasjid && 'beserta usulan masjid baru '}
          telah masuk ke antrean verifikasi Administrator Syiar Salaf Kota Serang.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto text-left">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Langkah Selanjutnya:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Admin akan meninjau data masjid dan keaslian nomor WhatsApp.</li>
            <li>Anda akan menerima konfirmasi aktivasi akun DKM via WhatsApp/Email.</li>
          </ul>
        </div>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Ajukan Pendaftaran Lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bagian 1: Informasi Kontak Pengurus DKM */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#093c96] dark:text-blue-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>1. Data Pengurus / Penanggung Jawab DKM</span>
        </h3>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nama Lengkap Pengurus DKM *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              {...register('namaPengurus')}
              type="text"
              placeholder="Contoh: Abu Ahmad Farhan"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
            />
          </div>
          {errors.namaPengurus && (
            <p className="mt-1 text-xs text-red-500">{errors.namaPengurus.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.noWhatsapp && (
              <p className="mt-1 text-xs text-red-500">{errors.noWhatsapp.message}</p>
            )}
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Bagian 2: Pilihan Masjid (Hibrid: Terdaftar / Baru) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#093c96] dark:text-blue-400 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>2. Masjid yang Dikelola</span>
        </h3>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Kota / Kabupaten Asal Masjid *
          </label>
          <div className="relative">
            <Map className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select
              {...register('kotaKabupaten')}
              onChange={(e) => {
                register('kotaKabupaten').onChange(e);
                setValue('masjidOption', '0'); // Reset masjid when kota changes
                setValue('kecamatan', '');     // Reset kecamatan
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
            >
              <option value="">-- Pilih Kota / Kabupaten --</option>
              {BANTEN_REGIONS.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          {errors.kotaKabupaten && (
            <p className="mt-1 text-xs text-red-500">{errors.kotaKabupaten.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pilih Masjid *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select
              {...register('masjidOption')}
              disabled={!selectedKota}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="0">{selectedKota ? `-- Pilih Masjid Terdaftar di ${selectedKota} --` : '-- Pilih Kota / Kabupaten Dulu --'}</option>
              <option
                value="NEW_MASJID"
                className="font-bold text-[#093c96] bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300"
              >
                ➕ Masjid Saya Belum Terdaftar (Daftarkan Masjid Baru)
              </option>
              {filteredMasjidList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title?.rendered}
                </option>
              ))}
            </select>
          </div>
          {errors.masjidOption && (
            <p className="mt-1 text-xs text-red-500">{errors.masjidOption.message}</p>
          )}
        </div>

        {/* Form Dinamis jika memilih "NEW_MASJID" */}
        {isNewMasjid && (
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-5 md:p-6 dark:border-blue-900/60 dark:bg-blue-950/30 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center gap-2 text-[#093c96] dark:text-blue-300 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Formulir Usulan Pendaftaran Masjid Baru</span>
            </div>

            {/* Nama Masjid Baru */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Masjid Baru *
              </label>
              <input
                {...register('namaMasjidBaru')}
                type="text"
                placeholder="Contoh: Masjid Al-Ikhlas Serang Baru"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {errors.namaMasjidBaru && (
                <p className="mt-1 text-xs text-red-500">{errors.namaMasjidBaru.message}</p>
              )}
            </div>

            {/* Kecamatan */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kecamatan di {selectedKota || 'Kota Serang'} *
              </label>
              <div className="relative">
                <Compass className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                  {...register('kecamatan')}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {filteredKecamatans.map((kecName) => (
                    <option key={kecName} value={kecName}>
                      Kec. {kecName}
                    </option>
                  ))}
                </select>
              </div>
              {errors.kecamatan && (
                <p className="mt-1 text-xs text-red-500">{errors.kecamatan.message}</p>
              )}
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alamat Lengkap Masjid *
              </label>
              <textarea
                {...register('alamatMasjid')}
                rows={2}
                placeholder="Jalan, RT/RW, Kelurahan, Patokan lokasi..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {errors.alamatMasjid && (
                <p className="mt-1 text-xs text-red-500">{errors.alamatMasjid.message}</p>
              )}
            </div>

            {/* Link Google Maps */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Link Google Maps (Opsional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  {...register('googleMapsUrl')}
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Checklist Fasilitas */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Fasilitas Masjid
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {FASILITAS_OPTIONS.map((fasilitas) => (
                  <label
                    key={fasilitas}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-[#093c96] dark:hover:border-blue-500 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={fasilitas}
                      {...register('fasilitas')}
                      className="rounded border-slate-300 text-[#093c96] focus:ring-[#093c96]"
                    />
                    <span>{fasilitas}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rekening Infaq */}
            <div className="pt-2 border-t border-blue-200/80 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-[#093c96] dark:text-blue-400" />
                <span>Informasi Rekening Infaq Masjid (Opsional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  {...register('namaBank')}
                  type="text"
                  placeholder="Nama Bank (BSI / BCA)"
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  {...register('nomorRekening')}
                  type="text"
                  placeholder="Nomor Rekening"
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  {...register('atasNamaRekening')}
                  type="text"
                  placeholder="Atas Nama Rekening"
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Bagian 3: Catatan */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Catatan / Keterangan Tambahan (Opsional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <textarea
            {...register('catatan')}
            rows={3}
            placeholder="Tuliskan amanah kepengurusan Anda di DKM atau rincian tambahan masjid..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#093c96] py-3 text-sm font-semibold text-white transition-all hover:bg-blue-800 disabled:opacity-50 shadow-md shadow-blue-900/20 cursor-pointer"
      >
        <Send className="h-4 w-4" />
        <span>{isSubmitting ? 'Mengirim Permohonan...' : isNewMasjid ? 'Daftarkan DKM & Usulkan Masjid Baru' : 'Ajukan Pendaftaran DKM'}</span>
      </button>
    </form>
  );
}
