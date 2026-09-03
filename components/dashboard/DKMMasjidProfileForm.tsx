'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { WPMasjid } from '@/types';
import { updateMasjidProfile } from '@/lib/actions/masjid';
import {
  Building2,
  MapPin,
  Phone,
  User,
  CreditCard,
  Globe,
  Video,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';

const FASILITAS_CHOICES = [
  'Parkir Mobil & Motor',
  'Tempat Wudhu Terpisah',
  'Ruangan Ber-AC',
  'Area Khusus Akhwat',
  'Perpustakaan Kitab',
];

export function DKMMasjidProfileForm({ masjid }: { masjid: WPMasjid }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State untuk Image Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    masjid.featured_media_url || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fasilitas
  const initialFasilitas = Array.isArray(masjid.acf?.fasilitas)
    ? masjid.acf.fasilitas.map((f) => f.replace(/^•\s*/, ''))
    : [];
  const [selectedFasilitas, setSelectedFasilitas] = useState<string[]>(initialFasilitas);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const toggleFasilitas = (item: string) => {
    setSelectedFasilitas((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('masjidId', masjid.id.toString());

    // Masukkan fasilitas terpilih
    formData.delete('fasilitas');
    selectedFasilitas.forEach((f) => {
      formData.append('fasilitas', f);
    });

    try {
      const res = await updateMasjidProfile(formData);
      if (res.success) {
        setSuccessMessage(res.message || 'Profil masjid berhasil diperbarui.');
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan perubahan profil masjid.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bersihkan konten HTML default untuk textarea
  const cleanDeskripsi = masjid.content?.rendered
    ? masjid.content.rendered.replace(/<[^>]*>?/gm, '').trim()
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bagian 1: Foto Utama Masjid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
          <span>Foto Utama Masjid</span>
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-40 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={masjid.title?.rendered || 'Foto Masjid'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              name="foto"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih / Ganti Foto</span>
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Format: JPG, PNG, WEBP. Maksimal 2MB. Resolusi lanskap direkomendasikan.
            </p>
          </div>
        </div>
      </div>

      {/* Bagian 2: Profil & Alamat */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
          <span>Profil & Lokasi Masjid</span>
        </h3>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nama Masjid (Tetap)
          </label>
          <input
            type="text"
            disabled
            value={masjid.title?.rendered || ''}
            className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            * Perubahan nama masjid resmi dapat diajukan ke Super Admin.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Deskripsi / Profil Masjid
          </label>
          <textarea
            name="deskripsi"
            rows={4}
            defaultValue={cleanDeskripsi}
            placeholder="Tuliskan sejarah singkat, visi dakwah, atau kegiatan rutin masjid..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alamat Lengkap Masjid
            </label>
            <textarea
              name="alamatLengkap"
              rows={3}
              defaultValue={masjid.acf?.alamat_lengkap || ''}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota Serang..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tautan Google Maps
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="url"
                name="googleMapsUrl"
                defaultValue={masjid.acf?.google_maps_url || ''}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Mempermudah jamaah membuka rute navigasi menuju masjid.
            </p>
          </div>
        </div>
      </div>

      {/* Bagian 3: Kontak & Pengurus */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
          <span>Kontak Resmi Pengurus DKM</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nomor WhatsApp DKM
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                name="noWaDkm"
                defaultValue={masjid.acf?.no_wa_dkm || ''}
                placeholder="08123456789"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Kontak Penanggung Jawab
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="namaKontakDkm"
                defaultValue={masjid.acf?.nama_kontak_dkm || ''}
                placeholder="Nama Pengurus DKM"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 4: Checklist Fasilitas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Fasilitas yang Tersedia di Masjid
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FASILITAS_CHOICES.map((fasilitas) => {
            const isChecked = selectedFasilitas.includes(fasilitas);
            return (
              <label
                key={fasilitas}
                onClick={() => toggleFasilitas(fasilitas)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  isChecked
                    ? 'border-[#093c96] bg-blue-50/70 text-[#093c96] dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="rounded border-slate-300 text-[#093c96] focus:ring-[#093c96]"
                />
                <span>{fasilitas}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bagian 5: Rekening Infaq & Media Sosial */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
          <span>Rekening Infaq & Media Sosial Masjid</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Bank
            </label>
            <input
              type="text"
              name="namaBank"
              defaultValue={masjid.acf?.nama_bank || ''}
              placeholder="Contoh: BSI / Mandiri"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nomor Rekening Infaq
            </label>
            <input
              type="text"
              name="nomorRekening"
              defaultValue={masjid.acf?.nomor_rekening || ''}
              placeholder="Contoh: 7123456789"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Atas Nama Rekening
            </label>
            <input
              type="text"
              name="atasNamaRekening"
              defaultValue={masjid.acf?.atas_nama_rekening || ''}
              placeholder="Contoh: DKM Masjid Al-Ikhlas"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tautan Akun Instagram
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="url"
                name="instagramUrl"
                defaultValue={masjid.acf?.instagram_url || ''}
                placeholder="https://www.instagram.com/dkm_masjid"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tautan Saluran YouTube
            </label>
            <div className="relative">
              <Video className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="url"
                name="youtubeUrl"
                defaultValue={masjid.acf?.youtube_url || ''}
                placeholder="https://www.youtube.com/@dkm_masjid"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Simpan */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#093c96] text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md shadow-blue-900/20 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Perubahan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
