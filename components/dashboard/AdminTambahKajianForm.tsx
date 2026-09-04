'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WPMasjid } from '@/types';
import { createKajianByAdmin } from '@/lib/actions/kajian';
import {
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Upload,
  Loader2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Video,
  X,
} from 'lucide-react';

interface AdminTambahKajianFormProps {
  masjidList: WPMasjid[];
}

export function AdminTambahKajianForm({ masjidList }: AdminTambahKajianFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file poster maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPosterPreview(null);
    }
  };

  const removePoster = () => {
    setPosterPreview(null);
    const fileInput = document.getElementById('poster-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    try {
      const res = await createKajianByAdmin(formData);

      if (res.success) {
        setSuccess('Alhamdulillah, jadwal kajian baru berhasil diterbitkan!');
        setTimeout(() => {
          router.push('/dashboard/admin?tab=kajian');
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || 'Gagal menerbitkan jadwal kajian baru.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan sistem saat memproses formulir.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#093c96]/10 text-[#093c96] dark:text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Formulir Jadwal Kajian Baru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola dan publikasikan jadwal kajian sunnah langsung ke portal publik.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/admin?tab=kajian"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="p-6 md:p-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">Sukses</p>
              <p className="text-xs mt-0.5">{success} Mengalihkan ke halaman kelola kajian...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Masjid Terkait */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Building2 className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
              <span>1. Masjid Penyelenggara</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Masjid Terkait (se-Provinsi Banten) *
              </label>
              <select
                name="masjidTerkait"
                required
                defaultValue=""
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] focus:ring-1 focus:ring-[#093c96] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Masjid Penyelenggara --</option>
                {masjidList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title?.rendered} {m.acf?.kota_kabupaten ? `(${m.acf.kota_kabupaten})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Jadwal kajian akan otomatis dihubungkan ke profil masjid yang dipilih.
              </p>
            </div>
          </div>

          {/* Section 2: Informasi Utama Kajian */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              2. Informasi Materi & Pemateri
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul / Tema Kajian *
              </label>
              <input
                type="text"
                name="judul"
                required
                placeholder="Contoh: Kajian Tematik: Meniti Jalan Golongan yang Selamat"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Asatidz / Pengisi *
                </label>
                <input
                  type="text"
                  name="namaUstadz"
                  required
                  placeholder="Contoh: Ustadz Abu Yahya Badrusalam, Lc."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kitab yang Dibahas (Opsional)
                </label>
                <input
                  type="text"
                  name="kitabBahasan"
                  placeholder="Contoh: Kitabut Tauhid / Riyadhus Shalihin"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Kajian
                </label>
                <select
                  name="jenisKajian"
                  defaultValue="rutin"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="rutin">Kajian Rutin (Pekanan/Bulanan)</option>
                  <option value="tematik">Kajian Tematik / Tabligh Akbar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kategori Jamaah
                </label>
                <select
                  name="kategoriJamaah"
                  defaultValue="umum"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="umum">Umum (Ikhwan & Akhwat)</option>
                  <option value="khusus_ikhwan">Khusus Ikhwan (Laki-laki)</option>
                  <option value="khusus_akhwat">Khusus Akhwat (Wanita)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Waktu Pelaksanaan */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
              <span>3. Waktu Pelaksanaan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hari Kajian
                </label>
                <input
                  type="text"
                  name="hariKajian"
                  placeholder="Contoh: Ahad / Setiap Sabtu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Kajian (Opsional)
                </label>
                <input
                  type="date"
                  name="tanggalKajian"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jam Mulai *
                </label>
                <input
                  type="time"
                  name="jamMulai"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jam Selesai
                </label>
                <input
                  type="time"
                  name="jamSelesai"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Poster & Media */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
              <span>4. Poster / Flyer & Live Streaming</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Upload Poster Kajian (Maks 5MB)
              </label>

              {posterPreview ? (
                <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src={posterPreview}
                    alt="Preview Poster"
                    width={320}
                    height={400}
                    className="max-h-72 w-auto object-contain bg-slate-100 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={removePoster}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                    title="Hapus poster"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="poster-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#093c96] dark:hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors"
                >
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#093c96] dark:text-blue-400 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Klik untuk memilih poster flyer
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, atau WEBP hingga 5MB</p>
                </label>
              )}

              <input
                id="poster-upload"
                type="file"
                name="poster"
                accept="image/*"
                onChange={handlePosterChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>Link Live Streaming (Opsional)</span>
              </label>
              <input
                type="url"
                name="linkStreaming"
                placeholder="https://youtube.com/live/... atau https://facebook.com/..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Section 5: Status & Publikasi */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              5. Pengaturan Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Publikasi Post *
                </label>
                <select
                  name="postStatus"
                  defaultValue="publish"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="publish">Publish (Langsung Tayang di Web Publik)</option>
                  <option value="pending">Pending (Menunggu Moderasi)</option>
                  <option value="draft">Draft (Draf Rahasia)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sebagai Super Admin, jadwal langsung berstatus Publish secara default.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Pelaksanaan Kajian
                </label>
                <select
                  name="statusKajian"
                  defaultValue="aktif"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="aktif">Aktif (Berjalan Normal)</option>
                  <option value="libur">Libur (Sementara Diliburkan)</option>
                  <option value="selesai">Selesai (Arsip)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/dashboard/admin?tab=kajian"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center cursor-pointer"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#093c96] hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerbitkan Jadwal...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Terbitkan Jadwal Kajian</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
