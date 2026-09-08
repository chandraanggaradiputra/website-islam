import { getKajianList } from '@/lib/wordpress';
import { KajianFilter } from '@/components/kajian/KajianFilter';
import { isKajianExpired } from '@/lib/kajian';
import { archiveExpiredKajian } from '@/lib/actions/kajian';

export const revalidate = 60;

export default async function JadwalKajianPage() {
  const allKajian = await getKajianList();

  // Jalankan arsip otomatis di background untuk kajian aktif yang telah kedaluwarsa
  archiveExpiredKajian(allKajian).catch(() => {});

  // Filter tampilan publik: hanya sertakan kajian yang belum selesai dan belum kedaluwarsa
  const kajianList = allKajian.filter((kajian) => {
    if (kajian.acf?.status_kajian === 'selesai') return false;
    if (isKajianExpired(kajian.acf?.tanggal_kajian, kajian.acf?.jam_selesai, kajian.acf?.jam_mulai)) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Jadwal Kajian</h1>
        <p className="text-slate-600 dark:text-slate-400">Temukan jadwal kajian sunnah di Banten dan sekitarnya.</p>
      </div>

      <KajianFilter initialKajian={kajianList} />
    </div>
  );
}
