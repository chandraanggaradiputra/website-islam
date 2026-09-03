'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WPKajian, WPMasjid, DKMRegistrationApplication } from '@/types';
import {
  approveDKMRegistration,
  rejectDKMRegistration,
} from '@/lib/actions/dkm';
import {
  createMasjidByAdmin,
  updateMasjidByAdmin,
  deleteMasjidByAdmin,
} from '@/lib/actions/masjid';
import {
  approveKajian,
  rejectKajian,
  updateKajianStatus,
  updateKajianByAdmin,
  deleteKajian,
} from '@/lib/actions/kajian';
import {
  Users,
  Building2,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  MapPin,
  Phone,
  CreditCard,
  Upload,
  Loader2,
  Save,
  Check,
} from 'lucide-react';

const KECAMATAN_OPTIONS = [
  { id: 2, name: 'Serang' },
  { id: 3, name: 'Cipocok Jaya' },
  { id: 4, name: 'Kasemen' },
  { id: 5, name: 'Taktakan' },
  { id: 6, name: 'Walantaka' },
  { id: 7, name: 'Curug' },
];

const FASILITAS_OPTIONS = [
  'Parkir Mobil & Motor',
  'Tempat Wudhu Terpisah',
  'Ruangan Ber-AC',
  'Area Khusus Akhwat',
  'Perpustakaan Kitab',
];

interface AdminDashboardTabsProps {
  initialTab?: string;
  registrations: DKMRegistrationApplication[];
  allKajian: WPKajian[];
  allMasjid: WPMasjid[];
}

export function AdminDashboardTabs({
  initialTab = 'dkm',
  registrations,
  allKajian,
  allMasjid,
}: AdminDashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState<'dkm' | 'masjid' | 'kajian'>(
    (activeTabParam as 'dkm' | 'masjid' | 'kajian') || 'dkm'
  );

  const [isPending, startTransition] = useTransition();

  // Search States
  const [searchDKM, setSearchDKM] = useState('');
  const [searchMasjid, setSearchMasjid] = useState('');
  const [searchKajian, setSearchKajian] = useState('');

  // Modals state
  const [isAddMasjidOpen, setIsAddMasjidOpen] = useState(false);
  const [editingMasjid, setEditingMasjid] = useState<WPMasjid | null>(null);
  const [editingKajian, setEditingKajian] = useState<WPKajian | null>(null);

  // Filtered lists
  const filteredDKM = registrations.filter((r) => {
    const q = searchDKM.toLowerCase();
    return (
      r.namaPengurus.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.noWhatsapp.toLowerCase().includes(q) ||
      (r.masjidName && r.masjidName.toLowerCase().includes(q)) ||
      (r.newMasjidData?.namaMasjid && r.newMasjidData.namaMasjid.toLowerCase().includes(q))
    );
  });

  const filteredMasjid = allMasjid.filter((m) => {
    const q = searchMasjid.toLowerCase();
    const title = m.title?.rendered || '';
    const alamat = m.acf?.alamat_lengkap || '';
    return title.toLowerCase().includes(q) || alamat.toLowerCase().includes(q);
  });

  const filteredKajian = allKajian.filter((k) => {
    const q = searchKajian.toLowerCase();
    const title = k.title?.rendered || '';
    const ustadz = k.acf?.nama_ustadz || '';
    const masjid = k.masjid_name || '';
    return (
      title.toLowerCase().includes(q) ||
      ustadz.toLowerCase().includes(q) ||
      masjid.toLowerCase().includes(q)
    );
  });

  const handleTabChange = (tab: 'dkm' | 'masjid' | 'kajian') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/dashboard/admin?${params.toString()}`);
  };

  // Action Handlers
  const handleApproveDKM = async (id: string | number) => {
    if (confirm('Setujui akun DKM ini dan terbitkan data masjid terkait?')) {
      startTransition(async () => {
        const res = await approveDKMRegistration(id);
        if (!res.success) alert(res.error);
        else router.refresh();
      });
    }
  };

  const handleRejectDKM = async (id: string | number) => {
    if (confirm('Tolak permohonan DKM ini?')) {
      startTransition(async () => {
        const res = await rejectDKMRegistration(id);
        if (!res.success) alert(res.error);
        else router.refresh();
      });
    }
  };

  const handleDeleteMasjid = async (id: number, name: string) => {
    if (confirm(`Hapus masjid "${name}" secara permanen? Data kajian terkait mungkin terpengaruh.`)) {
      startTransition(async () => {
        const res = await deleteMasjidByAdmin(id);
        if (!res.success) alert(res.error);
        else router.refresh();
      });
    }
  };

  const handleDeleteKajian = async (id: number, title: string) => {
    if (confirm(`Hapus jadwal kajian "${title}" secara permanen?`)) {
      startTransition(async () => {
        const res = await deleteKajian(id);
        if (!res.success) alert(res.error);
        else router.refresh();
      });
    }
  };

  const handleQuickStatusKajian = async (
    id: number,
    status: 'publish' | 'draft' | 'pending',
    statusKajian?: 'aktif' | 'libur' | 'selesai'
  ) => {
    startTransition(async () => {
      const res = await updateKajianStatus(id, status, statusKajian);
      if (!res.success) alert(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange('dkm')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'dkm'
              ? 'border-[#093c96] text-[#093c96] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Antrean DKM & Usulan Masjid ({registrations.filter((r) => r.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => handleTabChange('masjid')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'masjid'
              ? 'border-[#093c96] text-[#093c96] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Direktori Masjid ({allMasjid.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('kajian')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'kajian'
              ? 'border-[#093c96] text-[#093c96] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kelola Jadwal Kajian ({allKajian.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Antrean Verifikasi DKM & Usulan Masjid Baru */}
      {/* ========================================================================= */}
      {activeTab === 'dkm' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchDKM}
                onChange={(e) => setSearchDKM(e.target.value)}
                placeholder="Cari pengurus, email, nomor WA, atau nama masjid..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Pengurus DKM</th>
                    <th className="p-4">Masjid Terkait / Usulan</th>
                    <th className="p-4">Kontak (Email / WA)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDKM.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Tidak ada permohonan pendaftaran DKM yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredDKM.map((app) => {
                      const isPendingItem = app.status === 'pending';
                      const isNewMasjid = app.isNewMasjid;
                      const masjidTitle = isNewMasjid
                        ? app.newMasjidData?.namaMasjid || 'Usulan Masjid Baru'
                        : app.masjidName || `Masjid ID #${app.masjidId}`;

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {app.namaPengurus}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(app.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            {app.catatan && (
                              <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">
                                &quot;{app.catatan}&quot;
                              </p>
                            )}
                          </td>

                          <td className="p-4 min-w-[220px]">
                            <div className="flex items-start gap-2">
                              <Building2 className="w-4 h-4 text-[#093c96] dark:text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {masjidTitle}
                                </p>
                                {isNewMasjid ? (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    ✨ Usulan Masjid Baru
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    Masjid Terdaftar
                                  </span>
                                )}
                                {isNewMasjid && app.newMasjidData && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {app.newMasjidData.alamatLengkap}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-xs space-y-1">
                            <p className="text-slate-700 dark:text-slate-300">{app.email}</p>
                            <a
                              href={`https://wa.me/${app.noWhatsapp.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#093c96] dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{app.noWhatsapp}</span>
                            </a>
                          </td>

                          <td className="p-4">
                            {app.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                              </span>
                            ) : app.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                <AlertCircle className="w-3.5 h-3.5" /> Ditolak
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">
                                <Clock className="w-3.5 h-3.5" /> Menunggu
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {isPendingItem && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveDKM(app.id)}
                                  disabled={isPending}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui Akun DKM</span>
                                </button>
                                <button
                                  onClick={() => handleRejectDKM(app.id)}
                                  disabled={isPending}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/50 dark:hover:bg-red-900/50 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Kelola Seluruh Direktori Masjid */}
      {/* ========================================================================= */}
      {activeTab === 'masjid' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchMasjid}
                onChange={(e) => setSearchMasjid(e.target.value)}
                placeholder="Cari nama masjid atau alamat di Kota Serang..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              onClick={() => setIsAddMasjidOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#093c96] text-white text-xs font-semibold hover:bg-blue-800 shadow-md shadow-blue-900/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Masjid Baru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Foto & Nama Masjid</th>
                    <th className="p-4">Alamat & Lokasi</th>
                    <th className="p-4">Kontak DKM</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMasjid.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Tidak ada data masjid yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredMasjid.map((masjid) => {
                      const img = masjid.featured_media_url;
                      return (
                        <tr
                          key={masjid.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-4 min-w-[220px]">
                            <div className="flex items-center gap-3">
                              {img ? (
                                <Image
                                  src={img}
                                  alt={masjid.title?.rendered || ''}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                  <Building2 className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {masjid.title?.rendered}
                                </p>
                                <Link
                                  href={`/masjid/${masjid.slug}`}
                                  target="_blank"
                                  className="text-[11px] text-[#093c96] dark:text-blue-400 hover:underline"
                                >
                                  Lihat Halaman Publik →
                                </Link>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 max-w-xs text-xs text-slate-600 dark:text-slate-300">
                            <p className="line-clamp-2">
                              {masjid.acf?.alamat_lengkap || 'Belum ada alamat'}
                            </p>
                          </td>

                          <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                            <p className="font-medium">{masjid.acf?.nama_kontak_dkm || '-'}</p>
                            <p className="text-slate-400">{masjid.acf?.no_wa_dkm || '-'}</p>
                          </td>

                          <td className="p-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {masjid.status || 'Published'}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingMasjid(masjid)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Edit Data</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMasjid(masjid.id, masjid.title?.rendered || '')
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                                title="Hapus Masjid"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Kelola Seluruh Jadwal Kajian */}
      {/* ========================================================================= */}
      {activeTab === 'kajian' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchKajian}
                onChange={(e) => setSearchKajian(e.target.value)}
                placeholder="Cari tema kajian, ustadz, atau masjid..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <Link
              href="/dashboard/dkm/tambah-kajian"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#093c96] text-white text-xs font-semibold hover:bg-blue-800 shadow-md shadow-blue-900/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Jadwal Kajian</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Tema / Judul Kajian</th>
                    <th className="p-4">Ustadz</th>
                    <th className="p-4">Masjid</th>
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredKajian.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Tidak ada data kajian yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredKajian.map((kajian) => {
                      const ustadz = kajian.acf?.nama_ustadz || '-';
                      const masjid = kajian.masjid_name || 'Belum terhubung';
                      const waktu =
                        kajian.acf?.waktu_keterangan ||
                        (kajian.acf?.jam_mulai ? `${kajian.acf.jam_mulai} WIB` : '-');

                      return (
                        <tr
                          key={kajian.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-4 min-w-[200px]">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-2">
                              {kajian.title?.rendered}
                            </p>
                            {kajian.acf?.kitab_bahasan && (
                              <p className="text-xs text-slate-400 truncate max-w-xs">
                                Kitab: {kajian.acf.kitab_bahasan}
                              </p>
                            )}
                          </td>

                          <td className="p-4 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {ustadz}
                          </td>

                          <td className="p-4 text-xs text-slate-700 dark:text-slate-300 min-w-[140px]">
                            <p className="font-medium line-clamp-1">{masjid}</p>
                          </td>

                          <td className="p-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <p className="font-medium">
                              {kajian.acf?.tanggal_kajian || kajian.acf?.hari_kajian || 'Rutin'}
                            </p>
                            <p className="text-slate-400">{waktu}</p>
                          </td>

                          <td className="p-4">
                            {kajian.status === 'publish' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Published
                              </span>
                            ) : kajian.status === 'pending' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {kajian.status}
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Publish / Pending approval buttons */}
                              {kajian.status === 'pending' && (
                                <button
                                  onClick={() => handleQuickStatusKajian(kajian.id, 'publish')}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                                  title="Publikasikan Kajian"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => setEditingKajian(kajian)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteKajian(kajian.id, kajian.title?.rendered || '')
                                }
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 transition-colors cursor-pointer"
                                title="Hapus Kajian"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Tambah Masjid Baru oleh Admin */}
      {/* ========================================================================= */}
      {isAddMasjidOpen && (
        <AdminMasjidModal
          onClose={() => setIsAddMasjidOpen(false)}
          onSuccess={() => {
            setIsAddMasjidOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: Edit Masjid oleh Admin */}
      {/* ========================================================================= */}
      {editingMasjid && (
        <AdminMasjidModal
          initialMasjid={editingMasjid}
          onClose={() => setEditingMasjid(null)}
          onSuccess={() => {
            setEditingMasjid(null);
            router.refresh();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: Edit Kajian oleh Admin */}
      {/* ========================================================================= */}
      {editingKajian && (
        <AdminKajianModal
          kajian={editingKajian}
          masjidList={allMasjid}
          onClose={() => setEditingKajian(null)}
          onSuccess={() => {
            setEditingKajian(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* Modal Form Masjid (Tambah / Edit) */
/* ========================================================================= */
function AdminMasjidModal({
  initialMasjid,
  onClose,
  onSuccess,
}: {
  initialMasjid?: WPMasjid;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initialMasjid);

  const initialFasilitas = Array.isArray(initialMasjid?.acf?.fasilitas)
    ? initialMasjid.acf.fasilitas.map((f) => f.replace(/^•\s*/, ''))
    : [];
  const [selectedFasilitas, setSelectedFasilitas] = useState<string[]>(initialFasilitas);

  const toggleFasilitas = (item: string) => {
    setSelectedFasilitas((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (isEdit && initialMasjid) {
      formData.set('id', initialMasjid.id.toString());
    }

    formData.delete('fasilitas');
    selectedFasilitas.forEach((f) => formData.append('fasilitas', f));

    try {
      const res = isEdit
        ? await updateMasjidByAdmin(formData)
        : await createMasjidByAdmin(formData);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Gagal memproses data masjid.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan koneksi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#093c96] dark:text-blue-400" />
            <span>{isEdit ? 'Edit Data Masjid' : 'Tambah Masjid Baru'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Masjid *
            </label>
            <input
              type="text"
              name="namaMasjid"
              required
              defaultValue={initialMasjid?.title?.rendered || ''}
              placeholder="Contoh: Masjid Al-Muhajirin"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kecamatan
              </label>
              <select
                name="kecamatan"
                defaultValue={initialMasjid?.kecamatan?.[0] || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Pilih Kecamatan --</option>
                {KECAMATAN_OPTIONS.map((kec) => (
                  <option key={kec.id} value={kec.id}>
                    Kec. {kec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Foto Masjid (Opsional)
              </label>
              <input
                type="file"
                name="foto"
                accept="image/*"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#093c96] file:text-white hover:file:bg-blue-800"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alamat Lengkap Masjid
            </label>
            <textarea
              name="alamatLengkap"
              rows={2}
              defaultValue={initialMasjid?.acf?.alamat_lengkap || ''}
              placeholder="Alamat detail..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                No. WhatsApp DKM
              </label>
              <input
                type="tel"
                name="noWaDkm"
                defaultValue={initialMasjid?.acf?.no_wa_dkm || ''}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Kontak DKM
              </label>
              <input
                type="text"
                name="namaKontakDkm"
                defaultValue={initialMasjid?.acf?.nama_kontak_dkm || ''}
                placeholder="Nama Pengurus"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-[#093c96] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fasilitas Masjid
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {FASILITAS_OPTIONS.map((f) => {
                const checked = selectedFasilitas.includes(f);
                return (
                  <label
                    key={f}
                    onClick={() => toggleFasilitas(f)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer text-[11px] ${
                      checked
                        ? 'border-[#093c96] bg-blue-50 text-[#093c96] dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => {}} className="hidden" />
                    <span>{f}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Nama Bank Infaq
              </label>
              <input
                type="text"
                name="namaBank"
                defaultValue={initialMasjid?.acf?.nama_bank || ''}
                placeholder="BSI / BCA"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Nomor Rekening
              </label>
              <input
                type="text"
                name="nomorRekening"
                defaultValue={initialMasjid?.acf?.nomor_rekening || ''}
                placeholder="7123456789"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Atas Nama
              </label>
              <input
                type="text"
                name="atasNamaRekening"
                defaultValue={initialMasjid?.acf?.atas_nama_rekening || ''}
                placeholder="DKM Masjid..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#093c96] text-white text-xs font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Masjid'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Modal Edit Jadwal Kajian oleh Admin */
/* ========================================================================= */
function AdminKajianModal({
  kajian,
  masjidList,
  onClose,
  onSuccess,
}: {
  kajian: WPKajian;
  masjidList: WPMasjid[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('id', kajian.id.toString());

    try {
      const res = await updateKajianByAdmin(formData);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Gagal memperbarui kajian.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan koneksi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMasjidId =
    typeof kajian.acf?.masjid_terkait === 'number'
      ? kajian.acf.masjid_terkait
      : Array.isArray(kajian.acf?.masjid_terkait)
      ? Number(kajian.acf.masjid_terkait[0])
      : typeof kajian.acf?.masjid_terkait === 'object' && kajian.acf.masjid_terkait !== null
      ? Number((kajian.acf.masjid_terkait as { id?: number; ID?: number }).id || (kajian.acf.masjid_terkait as { id?: number; ID?: number }).ID)
      : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#093c96] dark:text-blue-400" />
            <span>Edit Jadwal Kajian</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Judul / Tema Kajian *
            </label>
            <input
              type="text"
              name="judul"
              required
              defaultValue={kajian.title?.rendered || ''}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Asatidz / Pengisi
              </label>
              <input
                type="text"
                name="namaUstadz"
                defaultValue={kajian.acf?.nama_ustadz || ''}
                placeholder="Ustadz Abu Fulan"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Masjid Penyelenggara
              </label>
              <select
                name="masjidTerkait"
                defaultValue={currentMasjidId || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Pilih Masjid --</option>
                {masjidList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title?.rendered}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kitab yang Dibahas
            </label>
            <input
              type="text"
              name="kitabBahasan"
              defaultValue={kajian.acf?.kitab_bahasan || ''}
              placeholder="Contoh: Kitab Tauhid"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hari Kajian
              </label>
              <input
                type="text"
                name="hariKajian"
                defaultValue={kajian.acf?.hari_kajian || ''}
                placeholder="Ahad / Sabtu"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Kajian (Y-m-d)
              </label>
              <input
                type="date"
                name="tanggalKajian"
                defaultValue={kajian.acf?.tanggal_kajian || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jam Mulai
              </label>
              <input
                type="text"
                name="jamMulai"
                defaultValue={kajian.acf?.jam_mulai || ''}
                placeholder="18:30"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Publikasi Post
              </label>
              <select
                name="postStatus"
                defaultValue={kajian.status || 'publish'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="publish">Publish (Tayang)</option>
                <option value="pending">Pending (Menunggu Moderasi)</option>
                <option value="draft">Draft (Draf)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Pelaksanaan Kajian
              </label>
              <select
                name="statusKajian"
                defaultValue={kajian.acf?.status_kajian || 'aktif'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="aktif">Aktif (Berjalan Normal)</option>
                <option value="libur">Libur (Sementara Diliburkan)</option>
                <option value="selesai">Selesai (Arsip)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#093c96] text-white text-xs font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
