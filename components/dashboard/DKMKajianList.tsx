'use client';

import { useState, useTransition, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WPKajian, StatusKajian } from '@/types';
import { isKajianExpired } from '@/lib/kajian';
import { updateKajianByDkm } from '@/lib/actions/kajian';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Pencil,
  X,
  Loader2,
  CalendarOff,
  AlertTriangle,
  Upload,
} from 'lucide-react';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, '');
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  let clean = dateStr.trim();
  if (/^\d{8}$/.test(clean)) {
    clean = `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  const parts = clean.split('-');
  if (parts.length === 3) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    if (!isNaN(day) && month >= 0 && month < 12) {
      return `${day} ${months[month]} ${year}`;
    }
  }
  return dateStr;
}

export function DKMKajianList({ initialKajian }: { initialKajian: WPKajian[] }) {
  const router = useRouter();
  const [kajianList, setKajianList] = useState<WPKajian[]>(initialKajian);
  const [editingKajian, setEditingKajian] = useState<WPKajian | null>(null);

  // State Modal Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusKajian>('aktif');
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenEdit = (kajian: WPKajian) => {
    // Validasi batas waktu sebelum membuka modal
    const expired =
      kajian.acf?.status_kajian === 'selesai' ||
      isKajianExpired(kajian.acf?.tanggal_kajian, kajian.acf?.jam_selesai, kajian.acf?.jam_mulai);

    if (expired) {
      alert('Kajian telah selesai dilaksanakan dan tidak dapat diedit lagi.');
      return;
    }

    setEditingKajian(kajian);
    setSelectedStatus(kajian.acf?.status_kajian === 'libur' ? 'libur' : 'aktif');
    setPosterPreview(kajian.featured_media_url || null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCloseEdit = () => {
    setEditingKajian(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPosterPreview(null);
  };

  const handlePosterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingKajian) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set('id', editingKajian.id.toString());
    formData.set('statusKajian', selectedStatus);

    try {
      const res = await updateKajianByDkm(formData);

      if (res.success) {
        setSuccessMsg(res.message || 'Jadwal kajian berhasil diperbarui.');

        // Update state lokal langsung
        const updatedTitle = formData.get('judul')?.toString() || editingKajian.title.rendered;
        const updatedUstadz = formData.get('namaUstadz')?.toString() || editingKajian.acf?.nama_ustadz || '';
        const updatedKitab = formData.get('kitabBahasan')?.toString() || editingKajian.acf?.kitab_bahasan || '';
        const updatedTanggal = formData.get('tanggalKajian')?.toString() || editingKajian.acf?.tanggal_kajian || '';
        const updatedJamMulai = formData.get('jamMulai')?.toString() || editingKajian.acf?.jam_mulai || '';
        const updatedJamSelesai = formData.get('jamSelesai')?.toString() || editingKajian.acf?.jam_selesai || '';

        setKajianList((prev) =>
          prev.map((item) => {
            if (item.id === editingKajian.id) {
              return {
                ...item,
                title: { rendered: updatedTitle },
                featured_media_url: posterPreview || item.featured_media_url,
                acf: {
                  ...item.acf,
                  status_kajian: selectedStatus,
                  nama_ustadz: updatedUstadz,
                  kitab_bahasan: updatedKitab,
                  tanggal_kajian: updatedTanggal,
                  jam_mulai: updatedJamMulai,
                  jam_selesai: updatedJamSelesai,
                },
              };
            }
            return item;
          })
        );

        startTransition(() => {
          router.refresh();
        });

        setTimeout(() => {
          handleCloseEdit();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Gagal memperbarui jadwal kajian.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {kajianList.length > 0 ? (
          kajianList.map((kajian) => {
            const dateObj = kajian.date ? new Date(kajian.date) : null;
            const isExpired =
              kajian.acf?.status_kajian === 'selesai' ||
              isKajianExpired(kajian.acf?.tanggal_kajian, kajian.acf?.jam_selesai, kajian.acf?.jam_mulai);
            const isLibur = kajian.acf?.status_kajian === 'libur';
            const formattedDate = formatDateDisplay(kajian.acf?.tanggal_kajian);

            return (
              <li
                key={kajian.id}
                className="p-6 flex flex-col gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-xs font-medium text-slate-500 uppercase">
                        {dateObj ? dateObj.toLocaleDateString('id-ID', { month: 'short' }) : 'N/A'}
                      </span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mt-1">
                        {dateObj ? dateObj.getDate() : '-'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {kajian.status === 'publish' && (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-[11px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sedang Tayang
                          </span>
                        )}
                        {kajian.status === 'pending' && (
                          <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md text-[11px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Menunggu Persetujuan
                          </span>
                        )}
                        {kajian.status === 'draft' && (
                          <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md text-[11px] font-bold inline-flex items-center gap-1">
                            Draf / Revisi
                          </span>
                        )}

                        {/* Status Operasional Kajian */}
                        {isExpired ? (
                          <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-md text-[11px] font-bold inline-flex items-center gap-1">
                            <CalendarOff className="w-3 h-3" /> Selesai / Kedaluwarsa
                          </span>
                        ) : isLibur ? (
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-md text-[11px] font-bold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Diliburkan
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">
                        {decodeHtmlEntities(kajian.title.rendered)}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {kajian.acf?.nama_ustadz || 'Ustadz Tidak Diketahui'}
                        </span>
                        {formattedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {kajian.acf?.jam_mulai || '00:00'} - {kajian.acf?.jam_selesai || 'Selesai'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Tombol Edit Kajian */}
                    {isExpired ? (
                      <div className="flex flex-col items-end">
                        <button
                          type="button"
                          disabled
                          title="Kajian telah lewat waktu"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded-lg text-xs font-medium cursor-not-allowed opacity-75 border border-slate-200 dark:border-slate-700"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit Kajian
                        </button>
                        <span className="text-[10px] text-slate-400 mt-1 italic">
                          Kajian telah lewat waktu
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(kajian)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#093c96] hover:bg-[#072a6b] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Kajian
                      </button>
                    )}

                    {kajian.status === 'publish' && kajian.slug && (
                      <Link
                        href={`/jadwal-kajian/${kajian.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-[#093c96] dark:hover:text-blue-400 transition-colors"
                        title="Lihat di Halaman Publik"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Banner Peringatan jika Kajian Diliburkan */}
                {isLibur && !isExpired && (
                  <div className="mt-1 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Kajian ditandai Diliburkan:</strong> Jamaah akan melihat pemberitahuan
                      khusus di website bahwa kajian pekan ini ditiadakan karena udzur.
                    </span>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li className="p-8 text-center text-slate-500 dark:text-slate-400">
            Belum ada kajian yang diajukan oleh masjid ini.
          </li>
        )}
      </ul>

      {/* Modal Dialog Edit Kajian */}
      {editingKajian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Jadwal Kajian</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perbarui informasi kajian atau tandai libur jika pemateri berhalangan.
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-5 overflow-y-auto flex-grow">
              {/* Notifikasi Status */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Pilihan Status Operasional Kajian: Aktif vs Libur */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Status Pelaksanaan Kajian
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('aktif')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedStatus === 'aktif'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aktif (Berjalan Sesuai Jadwal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('libur')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedStatus === 'libur'
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Diliburkan (Udzur / Libur Pekan Ini)</span>
                  </button>
                </div>

                {/* Banner Real-time ketika status libur dipilih */}
                {selectedStatus === 'libur' && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Perhatian: Kajian Akan Ditandai Diliburkan</p>
                      <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-300">
                        Pengunjung di halaman jadwal kajian dan beranda akan melihat badge merah
                        &quot;DILIBURKAN&quot; sehingga jamaah mengetahui ustadz sedang udzur.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Judul & Tema Kajian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul / Tema Kajian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="judul"
                  required
                  defaultValue={decodeHtmlEntities(editingKajian.title.rendered)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                />
              </div>

              {/* Ustadz & Kitab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pemateri / Ustadz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaUstadz"
                    required
                    defaultValue={editingKajian.acf?.nama_ustadz || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kitab Bahasan
                  </label>
                  <input
                    type="text"
                    name="kitabBahasan"
                    defaultValue={editingKajian.acf?.kitab_bahasan || ''}
                    placeholder="Contoh: Kitab Tauhid, Bulughul Maram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
              </div>

              {/* Jenis Kajian & Kategori Jamaah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kajian
                  </label>
                  <select
                    name="jenisKajian"
                    defaultValue={editingKajian.acf?.jenis_kajian || 'rutin'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  >
                    <option value="rutin">Kajian Rutin</option>
                    <option value="tematik">Kajian Tematik / Tabligh Akbar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Jamaah
                  </label>
                  <select
                    name="kategoriJamaah"
                    defaultValue={editingKajian.acf?.kategori_jamaah || 'umum'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  >
                    <option value="umum">Umum (Ikhwan &amp; Akhwat)</option>
                    <option value="khusus_ikhwan">Khusus Ikhwan</option>
                    <option value="khusus_akhwat">Khusus Akhwat</option>
                  </select>
                </div>
              </div>

              {/* Hari & Tanggal Kajian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hari Kajian (Untuk Rutin)
                  </label>
                  <input
                    type="text"
                    name="hariKajian"
                    defaultValue={editingKajian.acf?.hari_kajian || ''}
                    placeholder="Contoh: Ahad, Senin Malam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Kajian (Untuk Tematik)
                  </label>
                  <input
                    type="date"
                    name="tanggalKajian"
                    defaultValue={
                      editingKajian.acf?.tanggal_kajian
                        ? editingKajian.acf.tanggal_kajian.includes('-')
                          ? editingKajian.acf.tanggal_kajian
                          : `${editingKajian.acf.tanggal_kajian.slice(0, 4)}-${editingKajian.acf.tanggal_kajian.slice(4, 6)}-${editingKajian.acf.tanggal_kajian.slice(6, 8)}`
                        : ''
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
              </div>

              {/* Jam Mulai & Jam Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    name="jamMulai"
                    defaultValue={editingKajian.acf?.jam_mulai || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    name="jamSelesai"
                    defaultValue={editingKajian.acf?.jam_selesai || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
              </div>

              {/* Keterangan Waktu & Link Streaming */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan Waktu Tambahan
                  </label>
                  <input
                    type="text"
                    name="waktuKeterangan"
                    defaultValue={editingKajian.acf?.waktu_keterangan || ''}
                    placeholder="Contoh: Ba'da Maghrib s/d Isya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link Streaming (Opsional)
                  </label>
                  <input
                    type="url"
                    name="linkStreaming"
                    defaultValue={editingKajian.acf?.link_streaming || ''}
                    placeholder="https://youtube.com/live/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#093c96] focus:outline-none"
                  />
                </div>
              </div>

              {/* Ganti Poster Kajian */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Poster Kajian
                </label>
                <div className="flex items-center gap-4">
                  {posterPreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      <Image
                        src={posterPreview}
                        alt="Preview Poster"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-grow space-y-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#093c96]" />
                      <span>{posterPreview ? 'Ganti Berkas Poster' : 'Unggah Poster'}</span>
                      <input
                        type="file"
                        name="poster"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Format JPG, PNG, atau WebP. Maksimal 2 MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#093c96] hover:bg-[#072a6b] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
