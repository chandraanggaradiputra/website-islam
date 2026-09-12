import { getKajianList } from '@/lib/wordpress';
import { KajianFilter } from '@/components/kajian/KajianFilter';
import { archiveExpiredKajian } from '@/lib/actions/kajian';
import { PushNotificationManager } from '@/components/pwa/PushNotificationManager';

export const revalidate = 60;

export default async function JadwalKajianPage() {
  const allKajian = await getKajianList();

  // Jalankan arsip otomatis di background untuk kajian aktif yang telah kedaluwarsa
  archiveExpiredKajian(allKajian).catch(() => {});

  // Teruskan seluruh kajian (aktif dan arsip) ke komponen filter ber-tab
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Jadwal Kajian</h1>
        <p className="text-slate-600 dark:text-slate-400">Temukan jadwal kajian sunnah di Banten dan sekitarnya.</p>
      </div>

      <PushNotificationManager mode="card" />

      <KajianFilter initialKajian={allKajian} />
    </div>
  );
}
