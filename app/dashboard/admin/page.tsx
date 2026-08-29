import { getSession } from '@/lib/auth';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { AdminKajianActions } from '@/components/dashboard/AdminKajianActions';
import { WPKajian, WPMasjid } from '@/types';
import { getMasjidList, extractFeaturedImage, enrichKajianWithMasjid } from '@/lib/wordpress';
import Image from 'next/image';
import Link from 'next/link';

const WP_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session?.token) {
    return <div className="p-8 text-center">Silakan login sebagai admin.</div>;
  }

  // Fetch data in parallel
  const [resKajian, masjids, resUsers] = await Promise.all([
    fetch(`${WP_BASE_URL}/kajian?status=any&per_page=100&_embed`, {
      headers: { Authorization: `Bearer ${session.token}` },
      next: { revalidate: 0 }
    }),
    getMasjidList(),
    fetch(`${WP_BASE_URL}/users?per_page=100`, {
      headers: { Authorization: `Bearer ${session.token}` },
      next: { revalidate: 0 }
    }).catch(() => null)
  ]);

  const rawKajian: WPKajian[] = resKajian.ok ? await resKajian.json() : [];
  const masjidsList: WPMasjid[] = masjids || [];
  const allKajian: WPKajian[] = enrichKajianWithMasjid(rawKajian, masjidsList);
  const usersList = resUsers?.ok ? await resUsers.json() : [];

  const pendingKajian = allKajian.filter(k => k.status === 'pending');
  const publishedKajian = allKajian.filter(k => k.status === 'publish');

  const totalMasjid = masjids.length;
  // Fallback to DKM count from dummy if fetch failed (e.g. permission issue), but it should succeed with admin token
  const totalDkm = Array.isArray(usersList) ? usersList.length : 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang, {session?.name}</h2>
        <p className="text-slate-500 dark:text-slate-400">Ringkasan aktivitas dan pendaftaran DKM terbaru.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pengurus DKM</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalDkm}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Antrean Pending</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingKajian.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Kajian Aktif</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{publishedKajian.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Masjid Terdaftar</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalMasjid}</h3>
          </div>
        </div>
      </div>

      {/* Antrean Kajian Pending */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Antrean Kajian Pending</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-semibold rounded-tl-lg">Judul Kajian</th>
                  <th className="p-4 font-semibold">Ustadz</th>
                  <th className="p-4 font-semibold">Masjid / Pengaju</th>
                  <th className="p-4 font-semibold">Waktu</th>
                  <th className="p-4 font-semibold rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingKajian.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tidak ada kajian yang menunggu persetujuan.
                    </td>
                  </tr>
                ) : (
                  pendingKajian.map((kajian) => {
                    const ustadz = kajian.acf?.nama_ustadz || 'Tidak diketahui';
                    const masjidName = kajian.masjid_name || 'Belum terhubung';
                    const waktu = kajian.acf?.waktu_keterangan || (kajian.acf?.jam_mulai ? `${kajian.acf.jam_mulai} - ${kajian.acf.jam_selesai || 'Selesai'}` : '');
                    const imgUrl = extractFeaturedImage(kajian) || kajian.featured_media_url;

                    return (
                      <tr key={kajian.id}>
                        <td className="p-4 flex items-center gap-3 min-w-[200px]">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={kajian.title?.rendered || ''} width={40} height={40} className="rounded-lg object-cover w-10 h-10 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white line-clamp-2">{kajian.title?.rendered}</p>
                            <p className="text-slate-500 text-xs truncate max-w-[200px]">{kajian.acf?.kitab_bahasan || 'Tidak ada deskripsi'}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 min-w-[120px]">{ustadz}</td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 min-w-[150px]">
                          <p className="font-medium line-clamp-1">{masjidName}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">Pengaju: {kajian._embedded?.author?.[0]?.name || 'Unknown'}</p>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 min-w-[120px]">
                          <p className="whitespace-nowrap">{kajian.acf?.tanggal_kajian || kajian.acf?.hari_kajian || 'Rutin'}</p>
                          <p className="text-xs text-slate-500 whitespace-nowrap">{waktu}</p>
                        </td>
                        <td className="p-4">
                          <AdminKajianActions id={kajian.id} />
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

      {/* Daftar Seluruh Kajian */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Seluruh Kajian</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-semibold rounded-tl-lg bg-slate-50 dark:bg-slate-800/90">Judul Kajian</th>
                  <th className="p-4 font-semibold bg-slate-50 dark:bg-slate-800/90">Ustadz</th>
                  <th className="p-4 font-semibold bg-slate-50 dark:bg-slate-800/90">Masjid</th>
                  <th className="p-4 font-semibold bg-slate-50 dark:bg-slate-800/90">Status</th>
                  <th className="p-4 font-semibold rounded-tr-lg bg-slate-50 dark:bg-slate-800/90">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allKajian.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tidak ada riwayat kajian.
                    </td>
                  </tr>
                ) : (
                  allKajian.map((kajian) => {
                    const ustadz = kajian.acf?.nama_ustadz || 'Tidak diketahui';
                    const masjidName = kajian.masjid_name || 'Belum terhubung';
                    
                    return (
                      <tr key={`all-${kajian.id}`}>
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1" title={kajian.title?.rendered}>{kajian.title?.rendered}</p>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{ustadz}</td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">
                          <p className="line-clamp-1" title={masjidName}>{masjidName}</p>
                        </td>
                        <td className="p-4">
                          {kajian.status === 'publish' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Published
                            </span>
                          ) : kajian.status === 'pending' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              {kajian.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {kajian.date ? new Date(kajian.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tidak diketahui'}
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

      {/* Daftar Masjid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Masjid Terdaftar di Kota Serang</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masjids.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500">
                Tidak ada masjid terdaftar.
              </div>
            ) : (
              masjids.map(masjid => (
                <div key={masjid.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-4 hover:border-blue-500 transition-colors">
                  {masjid.featured_media_url ? (
                    <Image src={masjid.featured_media_url} alt={masjid.title.rendered} width={60} height={60} className="rounded-lg object-cover w-16 h-16 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="overflow-hidden w-full">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate" title={masjid.title.rendered}>{masjid.title.rendered}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1" title={masjid.acf?.alamat_lengkap}>
                      {masjid.acf?.alamat_lengkap || 'Tidak ada alamat'}
                    </p>
                    <div className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <Link href={`/masjid/${masjid.slug}`}>Lihat Profil</Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
