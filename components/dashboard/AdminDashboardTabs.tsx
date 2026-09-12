'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  WPKajian,
  WPMasjid,
  DKMRegistrationApplication,
  DKMUserItem,
  SystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
  PushSubscriberStats,
} from '@/types';
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
  createKajianByAdmin,
  updateKajianByAdmin,
  deleteKajian,
} from '@/lib/actions/kajian';
import {
  resetDKMUserPassword,
  updateSystemSettings,
} from '@/lib/actions/admin';
import { sendBroadcastNotification } from '@/lib/actions/push';
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
  KeyRound,
  ShieldCheck,
  Settings,
  Mail,
  Globe,
  MessageCircle,
  Eye,
  EyeOff,
  Sparkles,
  BellRing,
  Send,
  Smartphone,
} from 'lucide-react';

const KECAMATAN_OPTIONS = [
  { id: 2, name: 'Serang' },
  { id: 3, name: 'Cipocok Jaya' },
  { id: 4, name: 'Kasemen' },
  { id: 5, name: 'Taktakan' },
  { id: 6, name: 'Walantaka' },
  { id: 7, name: 'Curug' },
];

import { normalizeFasilitas } from '@/lib/utils/fasilitas';

const FASILITAS_OPTIONS = [
  'Parkir Mobil & Motor',
  'Tempat Wudhu Terpisah',
  'Ruangan Ber-AC',
  'Area Khusus Akhwat (Hijab)',
  'Perpustakaan Kitab',
];

interface AdminDashboardTabsProps {
  initialTab?: string;
  registrations: DKMRegistrationApplication[];
  allKajian: WPKajian[];
  allMasjid: WPMasjid[];
  dkmUsers?: DKMUserItem[];
  initialSettings?: SystemSettings;
  pushStats?: PushSubscriberStats;
}

export function AdminDashboardTabs({
  initialTab = 'dkm',
  registrations,
  allKajian,
  allMasjid,
  dkmUsers = [],
  initialSettings,
  pushStats,
}: AdminDashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState<'dkm' | 'masjid' | 'kajian' | 'pengguna' | 'pengaturan' | 'broadcast'>(
    (tabFromUrl as 'dkm' | 'masjid' | 'kajian' | 'pengguna' | 'pengaturan' | 'broadcast') || 'dkm'
  );

  useEffect(() => {
    if (
      tabFromUrl &&
      ['dkm', 'masjid', 'kajian', 'pengguna', 'pengaturan', 'broadcast'].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl as 'dkm' | 'masjid' | 'kajian' | 'pengguna' | 'pengaturan' | 'broadcast');
    }
  }, [tabFromUrl]);

  const [isPending, startTransition] = useTransition();

  // Search States
  const [searchDKM, setSearchDKM] = useState('');
  const [searchMasjid, setSearchMasjid] = useState('');
  const [searchKajian, setSearchKajian] = useState('');
  const [searchPengguna, setSearchPengguna] = useState('');

  // Modals state
  const [isAddMasjidOpen, setIsAddMasjidOpen] = useState(false);
  const [editingMasjid, setEditingMasjid] = useState<WPMasjid | null>(null);
  const [isAddKajianOpen, setIsAddKajianOpen] = useState(false);
  const [editingKajian, setEditingKajian] = useState<WPKajian | null>(null);
  const [resetTargetUser, setResetTargetUser] = useState<DKMUserItem | null>(null);

  // Settings state
  const [settingsData, setSettingsData] = useState<SystemSettings>(
    initialSettings || DEFAULT_SYSTEM_SETTINGS
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // ============================================================================
  // State Panel Broadcast Web Push Notification
  // ============================================================================
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('/jadwal-kajian');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    sentCount?: number;
    failedCount?: number;
    activeSubscribers?: number;
  } | null>(null);
  const [currentPushStats, setCurrentPushStats] = useState<PushSubscriberStats>(
    pushStats || { totalSubscribers: 0, activeSubscribers: 0 }
  );

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

  const filteredDKMUsers = dkmUsers.filter((u) => {
    const q = searchPengguna.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.masjidName && u.masjidName.toLowerCase().includes(q)) ||
      (u.kecamatanName && u.kecamatanName.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const handleTabChange = (tab: 'dkm' | 'masjid' | 'kajian' | 'pengguna' | 'pengaturan' | 'broadcast') => {
    setActiveTab(tab);
    router.push(`/dashboard/admin?tab=${tab}`);
  };

  /**
   * Mengirim broadcast notifikasi web push ke seluruh subscriber aktif
   */
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      alert('Judul dan pesan notifikasi wajib diisi.');
      return;
    }

    const subscriberCount = currentPushStats.activeSubscribers;
    const confirmMsg = subscriberCount > 0
      ? `Kirim notifikasi ini ke seluruh ${subscriberCount} perangkat jamaah terdaftar?`
      : 'Belum ada perangkat jamaah yang aktif berlangganan notifikasi. Tetap lanjutkan pengujian pengiriman?';

    if (!confirm(confirmMsg)) {
      return;
    }

    setIsSendingBroadcast(true);
    setBroadcastResult(null);

    try {
      const res = await sendBroadcastNotification({
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        url: broadcastUrl.trim() || '/jadwal-kajian',
      });

      setBroadcastResult(res);

      if (res.success) {
        setBroadcastTitle('');
        setBroadcastBody('');
        setBroadcastUrl('/jadwal-kajian');
        if (typeof res.activeSubscribers === 'number') {
          setCurrentPushStats((prev: PushSubscriberStats) => ({
            ...prev,
            activeSubscribers: res.activeSubscribers ?? prev.activeSubscribers,
          }));
        }
      }
    } catch (err: unknown) {
      setBroadcastResult({
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kegagalan koneksi sistem saat mengirim siaran notifikasi.',
      });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);

    try {
      const res = await updateSystemSettings(settingsData);
      if (res.success) {
        setSettingsSuccess(res.message || 'Pengaturan sistem berhasil disimpan.');
      } else {
        setSettingsError(res.error || 'Gagal menyimpan pengaturan sistem.');
      }
    } catch {
      setSettingsError('Terjadi kegagalan koneksi sistem saat menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
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

        <button
          onClick={() => handleTabChange('pengguna')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'pengguna'
              ? 'border-[#093c96] text-[#093c96] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Pengurus DKM ({dkmUsers.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('pengaturan')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'pengaturan'
              ? 'border-[#093c96] text-[#093c96] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Sistem</span>
        </button>

        <button
          onClick={() => handleTabChange('broadcast')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'broadcast'
              ? 'border-[#093c96] text-[#093c96] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Broadcast Notifikasi ({currentPushStats.activeSubscribers})</span>
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
                      const targetMasjidId = app.claimedMasjidId || app.masjidId;
                      const existingMasjid = !isNewMasjid ? allMasjid.find(m => m.id === targetMasjidId) : null;
                      const masjidTitle = isNewMasjid
                        ? app.newMasjidData?.namaMasjid || 'Usulan Masjid Baru'
                        : app.masjidName || existingMasjid?.title?.rendered || `Masjid ID #${targetMasjidId}`;
                      
                      const masjidKota = isNewMasjid 
                        ? app.newMasjidData?.kotaKabupaten 
                        : existingMasjid?.acf?.kota_kabupaten;

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
                                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    ✨ Usulan Masjid Baru
                                  </span>
                                ) : (
                                  <div className="mt-1 space-y-0.5">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      🏛️ Klaim Masjid Terdaftar
                                    </span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      Masjid Terkait: <span className="font-semibold text-slate-800 dark:text-slate-200">{app.masjidName || existingMasjid?.title?.rendered || masjidTitle}</span> (ID: #{targetMasjidId})
                                    </p>
                                  </div>
                                )}
                                {masjidKota && (
                                  <p className="mt-1 text-xs font-semibold text-[#093c96] dark:text-blue-400">
                                    📍 {masjidKota}
                                  </p>
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
              href="/dashboard/admin/tambah-kajian"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#093c96] text-white text-xs font-semibold hover:bg-blue-800 shadow-sm cursor-pointer whitespace-nowrap"
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
                            {kajian.acf?.kota_kabupaten && (
                              <p className="mt-1 text-xs font-semibold text-[#093c96] dark:text-blue-400">
                                📍 {kajian.acf.kota_kabupaten}
                              </p>
                            )}
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
      {/* TAB 4: Pengurus DKM Terdaftar */}
      {/* ========================================================================= */}
      {activeTab === 'pengguna' && (
        <div className="space-y-4">
          {/* Bar Kontrol & Pencarian */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengurus DKM (nama, email, username, masjid, wilayah)..."
                value={searchPengguna}
                onChange={(e) => setSearchPengguna(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#093c96]"
              />
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-center">
              <ShieldCheck className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
              <span>Total: <strong>{filteredDKMUsers.length}</strong> pengurus</span>
            </div>
          </div>

          {/* Daftar Pengurus DKM */}
          {filteredDKMUsers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-semibold text-base">Tidak ada data pengurus DKM yang sesuai.</p>
              <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Pengurus DKM</th>
                      <th className="px-6 py-4">Masjid Binaan</th>
                      <th className="px-6 py-4">Kontak WhatsApp</th>
                      <th className="px-6 py-4">Terdaftar Sejak</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredDKMUsers.map((user) => {
                      const cleanPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
                      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                      const waLink = formattedPhone
                        ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                            `Assalamualaikum Pengurus DKM ${user.name}, ini dari Tim Admin Portal Banten Mengaji.`
                          )}`
                        : null;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#093c96] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-[#093c96]/20 shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {user.email}
                                </p>
                                <span className="inline-block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  @{user.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {user.masjidName ? (
                              <div className="space-y-1">
                                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Building2 className="w-4 h-4 text-[#093c96] dark:text-blue-400 shrink-0" />
                                  <span>{user.masjidName}</span>
                                </p>
                                {user.kecamatanName && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-[#C5A059]/30 px-2 py-0.5 rounded-md">
                                    <MapPin className="w-3 h-3 text-[#C5A059]" />
                                    {user.kecamatanName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                Belum Ditautkan
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {waLink ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{user.phone}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Tidak ada no. WA</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {user.registeredDate
                              ? new Date(user.registeredDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setResetTargetUser(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-[#093c96] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset Password</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Pengaturan Sistem */}
      {/* ========================================================================= */}
      {activeTab === 'pengaturan' && (
        <div className="space-y-6">
          {/* Feedback Notifikasi */}
          {settingsSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
              <button
                onClick={() => setSettingsSuccess(null)}
                className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {settingsError && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200 border border-red-200 dark:border-red-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <span>{settingsError}</span>
              </div>
              <button
                onClick={() => setSettingsError(null)}
                className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Kartu 1: Kontak Resmi & Dukungan */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Kontak Resmi & Layanan Dukungan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Saluran komunikasi resmi Super Admin untuk membantu pengurus DKM dan jamaah.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor WhatsApp Admin (Dukungan DKM) *
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={settingsData.whatsappAdmin}
                      onChange={(e) =>
                        setSettingsData({ ...settingsData, whatsappAdmin: e.target.value })
                      }
                      placeholder="Contoh: 0822-9814-8474"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ditampilkan pada formulir pendaftaran DKM dan halaman kontak publik.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Notifikasi Utama *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={settingsData.emailAdmin}
                      onChange={(e) =>
                        setSettingsData({ ...settingsData, emailAdmin: e.target.value })
                      }
                      placeholder="admin@maschandigital.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Menerima tembusan email permohonan DKM baru & laporan sistem.
                  </p>
                </div>
              </div>
            </div>

            {/* Kartu 2: Rekening Donasi Resmi Portal */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Rekening Infaq & Donasi Resmi Banten Mengaji
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Konfigurasi rekening perbankan yang menjadi rujukan donasi dakwah di halaman /donasi.
                  </p>
                </div>
              </div>

              {/* Rekening Utama */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Rekening Bank Utama (Prioritas 1)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Bank *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsData.donasiBankName}
                      onChange={(e) =>
                        setSettingsData({ ...settingsData, donasiBankName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nomor Rekening *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsData.donasiAccountNumber}
                      onChange={(e) =>
                        setSettingsData({ ...settingsData, donasiAccountNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Atas Nama Rekening *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsData.donasiAccountHolder}
                      onChange={(e) =>
                        setSettingsData({ ...settingsData, donasiAccountHolder: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                </div>

                {/* Rekening Sekunder */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-3">
                  Rekening Bank Sekunder (Prioritas 2)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Bank Sekunder
                    </label>
                    <input
                      type="text"
                      value={settingsData.donasiBankSecondaryName || ''}
                      onChange={(e) =>
                        setSettingsData({ ...settingsData, donasiBankSecondaryName: e.target.value })
                      }
                      placeholder="Bank Aladin Syariah"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nomor Rekening Sekunder
                    </label>
                    <input
                      type="text"
                      value={settingsData.donasiAccountSecondaryNumber || ''}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          donasiAccountSecondaryNumber: e.target.value,
                        })
                      }
                      placeholder="50661906210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Atas Nama Rekening Sekunder
                    </label>
                    <input
                      type="text"
                      value={settingsData.donasiAccountSecondaryHolder || ''}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          donasiAccountSecondaryHolder: e.target.value,
                        })
                      }
                      placeholder="Chandra Anggara Diputra"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#093c96]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#093c96] hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm shadow-[#093c96]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Pengaturan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Pengaturan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Kartu 3: Status Integrasi API */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Status Konektivitas & Integrasi Eksternal API
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pemantauan status integrasi layanan pihak ketiga yang menunjang operasional portal Banten Mengaji.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Service 1: WordPress REST API */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    WordPress Engine
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Penyimpanan data direktori masjid, jadwal kajian, dan artikel sunnah.
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  salaf.maschandigital.id
                </p>
              </div>

              {/* Service 2: Mailketing API CRM */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Mailketing CRM
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pengiriman email transaksional kredensial DKM dan verifikasi akun.
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  api.mailketing.co.id
                </p>
              </div>

              {/* Service 3: EQuran.id API */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    EQuran.id Shalat
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sinkron
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Perhitungan jadwal waktu sholat harian akurat se-Provinsi Banten.
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  equran.id/api/v2
                </p>
              </div>

              {/* Service 4: IndexNow Protocol */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    IndexNow SEO
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Otomatis
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pengindeksan instan URL kajian baru ke Bing, Yandex, dan Naver.
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  api.indexnow.org
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: Siaran Notifikasi Web Push ke Seluruh Jamaah (PWA Native Push) */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          {/* Header & Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kartu 1: Jumlah Subscriber Aktif */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pelanggan Aktif
                  </p>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentPushStats.activeSubscribers}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">perangkat</span>
                </h3>
              </div>
            </div>

            {/* Kartu 2: Standar Pengiriman W3C Push */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Protokol Keamanan
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  VAPID RFC 8292
                </h3>
                <p className="text-[11px] text-slate-400">Terenkripsi WebPush</p>
              </div>
            </div>

            {/* Kartu 3: Target Interaksi Default */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kanal Siaran
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Native Service Worker
                </h3>
                <p className="text-[11px] text-slate-400">Android, Windows & iOS PWA</p>
              </div>
            </div>
          </div>

          {/* Form Siaran & Mockup Pratinjau Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri (7 Kolom): Formulir Siaran Notifikasi */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-[#093c96]/10 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Formulir Broadcast Pesan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pesan akan dikirimkan secara serentak ke semua subscriber Banten Mengaji.
                  </p>
                </div>
              </div>

              {/* Status Alert (Sukses / Gagal) */}
              {broadcastResult && (
                <div
                  className={`mb-6 p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                    broadcastResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}
                >
                  {broadcastResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {broadcastResult.message || (broadcastResult.success ? 'Siaran berhasil diproses.' : 'Gagal mengirim siaran.')}
                    </p>
                    {broadcastResult.error && (
                      <p className="text-[11px] opacity-90">{broadcastResult.error}</p>
                    )}
                    {broadcastResult.success && typeof broadcastResult.sentCount === 'number' && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-medium">
                          Terkirim: {broadcastResult.sentCount}
                        </span>
                        {Number(broadcastResult.failedCount) > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-medium">
                            Dibersihkan (Expired): {broadcastResult.failedCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-5">
                {/* 1. Judul Notifikasi */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Judul Notifikasi <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[11px] font-mono ${broadcastTitle.length > 50 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}`}>
                      {broadcastTitle.length}/60 disarankan
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Contoh: Kajian Spesial Akhir Pekan di Serang"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900 transition-colors"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Gunakan kalimat singkat yang memuat tema atau nama ustadz.
                  </p>
                </div>

                {/* 2. Isi Pesan Notifikasi */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Isi Pesan Notifikasi <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[11px] font-mono ${broadcastBody.length > 140 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}`}>
                      {broadcastBody.length}/150 disarankan
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    maxLength={250}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Contoh: Hadirilah kajian bersama Ustadz Abu Usamah, Lc. membahas Kitab Tauhid. Ba'da Ashar di Masjid Raudhatul Jannah, Kramatwatu. Siapkan infaq terbaik..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900 transition-colors leading-relaxed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Sertakan waktu dan nama masjid agar jamaah mudah mengingat rincian acara.
                  </p>
                </div>

                {/* 3. URL Target (Saat Notifikasi Diklik) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tautan Target (Buka saat Notifikasi Diklik)
                  </label>
                  <input
                    type="text"
                    value={broadcastUrl}
                    onChange={(e) => setBroadcastUrl(e.target.value)}
                    placeholder="/jadwal-kajian atau https://..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 focus:border-[#093c96] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900 font-mono transition-colors"
                  />
                  {/* Preset Buttons */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 mr-1">Rute Cepat:</span>
                    <button
                      type="button"
                      onClick={() => setBroadcastUrl('/jadwal-kajian')}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      /jadwal-kajian
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastUrl('/arsip-video')}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      /arsip-video
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastUrl('/panduan-dkm')}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      /panduan-dkm
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastUrl('/')}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Beranda (/)
                    </button>
                  </div>
                </div>

                {/* Tombol Eksekusi Siaran */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Target: <strong className="text-slate-700 dark:text-slate-300">{currentPushStats.activeSubscribers}</strong> penerima
                  </p>
                  <button
                    type="submit"
                    disabled={isSendingBroadcast}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#093c96] hover:bg-blue-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-[#093c96]/20 active:scale-[0.98]"
                  >
                    {isSendingBroadcast ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim Notifikasi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Notifikasi ke Semua Jamaah</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Kolom Kanan (5 Kolom): Live Preview Mockup Notifikasi HP */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Live Mobile Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#093c96] dark:text-blue-300">
                    Real-Time
                  </span>
                </div>

                {/* Kartu Mockup Notifikasi Smartphone (Modern OS Notification Style) */}
                <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-lg border border-slate-200 dark:border-slate-800 space-y-3 transition-all">
                  {/* Top Bar: Icon + App Name + Timestamp */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5 rounded-md overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src="/banten-mengaji.jpeg"
                          alt="Banten Mengaji"
                          width={20}
                          height={20}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                        BANTEN MENGAJI
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Baru saja</span>
                  </div>

                  {/* Body: Title + Description */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
                      {broadcastTitle.trim() || 'Judul Notifikasi Muncul Di Sini'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed break-words line-clamp-3">
                      {broadcastBody.trim() || 'Isi pesan siaran yang Anda tuliskan akan muncul di bagian ini secara real-time menyerupai tampilan notifikasi pada smartphone jamaah...'}
                    </p>
                  </div>

                  {/* Bottom: Action Badge */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono truncate max-w-[180px] text-[#093c96] dark:text-blue-400">
                      {broadcastUrl.trim() || '/jadwal-kajian'}
                    </span>
                    <span className="text-slate-500">Ketuk untuk membuka</span>
                  </div>
                </div>

                {/* Petunjuk Teknis untuk Admin */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-[#093c96] dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Panduan Siaran Efektif</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed">
                    <li>Notifikasi tampil pada Notification Shade Android, Windows, macOS, & iOS PWA.</li>
                    <li>Sertakan info waktu (misal: Ba&apos;da Maghrib) dan nama masjid dengan jelas.</li>
                    <li>Endpoint yang sudah tidak aktif (HTTP 410/404) akan dibersihkan secara otomatis.</li>
                  </ul>
                </div>
              </div>
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
      {/* MODAL: Tambah / Edit Kajian oleh Admin */}
      {/* ========================================================================= */}
      {(isAddKajianOpen || editingKajian) && (
        <AdminKajianModal
          kajian={editingKajian}
          masjidList={allMasjid}
          onClose={() => {
            setIsAddKajianOpen(false);
            setEditingKajian(null);
          }}
          onSuccess={() => {
            setIsAddKajianOpen(false);
            setEditingKajian(null);
            router.refresh();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: Reset Kata Sandi Pengurus DKM oleh Admin */}
      {/* ========================================================================= */}
      {resetTargetUser && (
        <AdminResetPasswordModal
          user={resetTargetUser}
          onClose={() => setResetTargetUser(null)}
          onSuccess={(msg) => {
            setResetTargetUser(null);
            setSettingsSuccess(msg);
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
    ? normalizeFasilitas(initialMasjid.acf.fasilitas).map((f) =>
        f.replace(/^•\s*/, '').replace(/Akhawat/g, 'Akhwat')
      )
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
    normalizeFasilitas(selectedFasilitas).forEach((f) => formData.append('fasilitas', f));

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
/* Modal Form Jadwal Kajian (Tambah Baru / Edit) oleh Admin */
/* ========================================================================= */
function AdminKajianModal({
  kajian,
  masjidList,
  onClose,
  onSuccess,
}: {
  kajian?: WPKajian | null;
  masjidList: WPMasjid[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = Boolean(kajian && kajian.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (isEdit && kajian) {
      formData.set('id', kajian.id.toString());
    }

    try {
      const res = isEdit
        ? await updateKajianByAdmin(formData)
        : await createKajianByAdmin(formData);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || `Gagal ${isEdit ? 'memperbarui' : 'membuat'} jadwal kajian.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan sistem saat memproses jadwal kajian.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const masjidVal = kajian?.acf?.masjid_terkait;
  const currentMasjidId =
    masjidVal !== undefined
      ? typeof masjidVal === 'number'
        ? masjidVal
        : Array.isArray(masjidVal)
        ? Number(masjidVal[0])
        : typeof masjidVal === 'object' && masjidVal !== null
        ? Number(
            (masjidVal as { id?: number; ID?: number })?.id ||
              (masjidVal as { id?: number; ID?: number })?.ID
          )
        : undefined
      : undefined;

  const rawDate = kajian?.acf?.tanggal_kajian || '';
  const formattedDate =
    rawDate.length === 8
      ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      : rawDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#093c96] dark:text-blue-400" />
            <span>{isEdit ? 'Edit Jadwal Kajian' : 'Buat Jadwal Kajian Baru'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
              defaultValue={kajian?.title?.rendered || ''}
              placeholder="Contoh: Kajian Tafsir Ibnu Katsir"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Asatidz / Pengisi *
              </label>
              <input
                type="text"
                name="namaUstadz"
                required
                defaultValue={kajian?.acf?.nama_ustadz || ''}
                placeholder="Ustadz Abu Fulan"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Masjid Penyelenggara *
              </label>
              <select
                name="masjidTerkait"
                required
                defaultValue={currentMasjidId || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Pilih Masjid Terkait (se-Banten) --</option>
                {masjidList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title?.rendered} {m.acf?.kota_kabupaten ? `(${m.acf.kota_kabupaten})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kitab yang Dibahas
              </label>
              <input
                type="text"
                name="kitabBahasan"
                defaultValue={kajian?.acf?.kitab_bahasan || ''}
                placeholder="Contoh: Kitab Tauhid"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jenis Kajian
              </label>
              <select
                name="jenisKajian"
                defaultValue={kajian?.acf?.jenis_kajian || 'rutin'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="rutin">Kajian Rutin</option>
                <option value="tematik">Kajian Tematik</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori Jamaah
              </label>
              <select
                name="kategoriJamaah"
                defaultValue={kajian?.acf?.kategori_jamaah || 'umum'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="umum">Umum (Ikhwan & Akhwat)</option>
                <option value="khusus_ikhwan">Khusus Ikhwan</option>
                <option value="khusus_akhwat">Khusus Akhwat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hari Kajian
              </label>
              <input
                type="text"
                name="hariKajian"
                defaultValue={kajian?.acf?.hari_kajian || ''}
                placeholder="Ahad / Sabtu"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tanggal (Opsional)
              </label>
              <input
                type="date"
                name="tanggalKajian"
                defaultValue={formattedDate}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jam Mulai *
              </label>
              <input
                type="time"
                name="jamMulai"
                required
                defaultValue={kajian?.acf?.jam_mulai || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jam Selesai
              </label>
              <input
                type="time"
                name="jamSelesai"
                defaultValue={kajian?.acf?.jam_selesai || ''}
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
                defaultValue={kajian?.status || 'publish'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="publish">Publish (Tayang di Web)</option>
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
                defaultValue={kajian?.acf?.status_kajian || 'aktif'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="aktif">Aktif (Berjalan Normal)</option>
                <option value="libur">Libur (Sementara Diliburkan)</option>
                <option value="selesai">Selesai (Arsip)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Link Live Streaming (Opsional)
            </label>
            <input
              type="url"
              name="linkStreaming"
              defaultValue={kajian?.acf?.link_streaming || ''}
              placeholder="https://youtube.com/live/..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm text-slate-900 focus:border-[#093c96] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#093c96] text-white text-xs font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Jadwal Kajian'}</span>
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
/* Modal Form Reset Password Akun Pengurus DKM */
/* ========================================================================= */
function AdminResetPasswordModal({
  user,
  onClose,
  onSuccess,
}: {
  user: DKMUserItem;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Menghasilkan kata sandi acak yang kuat (kombinasi huruf besar, kecil, angka, dan simbol)
   */
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  /**
   * Mengirim permohonan pembaruan kata sandi ke Server Action
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      setError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await resetDKMUserPassword(user.id, newPassword.trim());
      if (res.success) {
        onSuccess(
          res.message || `Kata sandi untuk ${user.name} berhasil diperbarui.`
        );
      } else {
        setError(res.error || 'Gagal memperbarui kata sandi di server WordPress.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi sistem saat memperbarui kata sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
            <span>Reset Kata Sandi DKM</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan Akun Target */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Akun Pengurus Target:
          </p>
          <p className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.email} <span className="text-slate-400">(@{user.username})</span>
          </p>
          {user.masjidName && (
            <p className="text-[11px] text-[#093c96] dark:text-blue-400 font-medium mt-1">
              Masjid: {user.masjidName}
            </p>
          )}
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs border border-red-200 dark:border-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulir Kata Sandi Baru */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kata Sandi Baru *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-semibold text-[#093c96] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Acak Sandi Kuat</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#093c96]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kata sandi ini dapat langsung digunakan pengurus DKM untuk masuk ke portal.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#093c96] hover:bg-blue-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-[#093c96]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kata Sandi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
