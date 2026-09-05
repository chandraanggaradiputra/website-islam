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
  Map,
  Lock,
  Eye,
  EyeOff,
  Upload,
  X,
  ImageIcon,
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
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
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
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Konfirmasi password tidak cocok dengan password',
      });
    }
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fotoMasjid, setFotoMasjid] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);

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
      password: '',
      confirmPassword: '',
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFotoError('File harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFotoError('Ukuran file foto maksimal 5MB.');
      return;
    }

    setFotoMasjid(file);
    const objectUrl = URL.createObjectURL(file);
    setFotoPreview(objectUrl);
  };

  const handleRemoveFoto = () => {
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoMasjid(null);
    setFotoPreview(null);
    setFotoError(null);
  };

  const onSubmit = async (data: DKMFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('namaPengurus', data.namaPengurus.trim());
      formData.append('email', data.email.trim());
      formData.append('password', data.password);
      formData.append('noWhatsapp', data.noWhatsapp.trim());
      formData.append('kotaKabupaten', data.kotaKabupaten);
      formData.append('masjidOption', data.masjidOption);

      if (isNewMasjid) {
        formData.append('isNewMasjid', 'true');
        if (data.namaMasjidBaru) formData.append('namaMasjidBaru', data.namaMasjidBaru.trim());
        if (data.kecamatan) formData.append('kecamatanNama', data.kecamatan);
        if (data.alamatMasjid) formData.append('alamatMasjid', data.alamatMasjid.trim());
        
        const cleanUrl = data.googleMapsUrl?.trim();
        if (cleanUrl && cleanUrl.startsWith('http')) {
          formData.append('googleMapsUrl', cleanUrl);
        }

        if (data.fasilitas && data.fasilitas.length > 0) {
          data.fasilitas.forEach((f) => formData.append('fasilitas', f));
        }
        if (data.namaBank?.trim()) formData.append('namaBank', data.namaBank.trim());
        if (data.nomorRekening?.trim()) formData.append('nomorRekening', data.nomorRekening.trim());
        if (data.atasNamaRekening?.trim()) formData.append('atasNamaRekening', data.atasNamaRekening.trim());

        if (fotoMasjid) {
          formData.append('fotoMasjid', fotoMasjid);
        }
      }

      if (data.catatan?.trim()) {
        formData.append('catatan', data.catatan.trim());
      }

      const res = await submitDaftarDKM(formData);

      if (res.success) {
        setIsSuccess(true);
        reset();
        handleRemoveFoto();
      } else {
        setErrorMessage(res.error || 'Gagal mengajukan pendaftaran DKM.');
      }
    } catch (err: unknown) {
      console.error('[onSubmit Error]:', err);
      const errorText = err instanceof Error ? err.message : 'Terjadi kesalahan koneksi saat mengirim formulir.';
      setErrorMessage(errorText);
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
            <li>Admin akan meninjau data masjid dan keaslian data kontak DKM.</li>
            <li>Saat disetujui, akun pengurus WordPress Anda akan otomatis diaktifkan dengan email dan password yang Anda daftarkan.</li>
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
          <span>1. Data Pengurus & Akun DKM</span>
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
              Email Resmi Pengurus (Untuk Login) *
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

        {/* Input Password & Konfirmasi Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password Akun DKM (Untuk Login) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Konfirmasi Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
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

            {/* Media Uploader Foto Profil Masjid */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Foto / Profil Masjid (Opsional, Maks. 5MB)
              </label>
              {fotoPreview ? (
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 flex items-center gap-3">
                  <img
                    src={fotoPreview}
                    alt="Pratinjau Masjid"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {fotoMasjid?.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(fotoMasjid ? (fotoMasjid.size / 1024 / 1024).toFixed(2) : 0)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFoto}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="fotoMasjidInput"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="fotoMasjidInput"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#093c96] dark:hover:border-blue-500 rounded-xl p-4 bg-white dark:bg-slate-900 cursor-pointer transition-colors text-center"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Klik untuk mengunggah foto masjid
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Format: JPG, PNG, WEBP (Maksimal 5MB)
                    </span>
                  </label>
                </div>
              )}
              {fotoError && (
                <p className="mt-1 text-xs text-red-500">{fotoError}</p>
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
