// app/jadwal-sholat/page.tsx
import { Metadata } from 'next';
import { MonthlyPrayerCalendar } from '@/components/prayer/MonthlyPrayerCalendar';

export const revalidate = 86400; // 24 jam revalidasi

interface PageProps {
  searchParams: Promise<{
    bulan?: string;
    tahun?: string;
  }>;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const now = new Date();
  const bulan = params.bulan ? parseInt(params.bulan, 10) : now.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun, 10) : now.getFullYear();

  const validBulan = !isNaN(bulan) && bulan >= 1 && bulan <= 12 ? bulan : now.getMonth() + 1;
  const validTahun = !isNaN(tahun) && tahun >= 2020 && tahun <= 2050 ? tahun : now.getFullYear();
  const namaBulan = MONTH_NAMES[validBulan - 1];

  return {
    title: `Jadwal Sholat & Imsakiyah Kota Serang ${namaBulan} ${validTahun} - Kemenag RI`,
    description: `Jadwal waktu sholat, imsak, terbit, dhuha, subuh, dzuhur, ashar, maghrib, dan isya sebulan penuh untuk wilayah Kota Serang, Banten bulan ${namaBulan} ${validTahun} resmi standar Bimas Islam Kemenag RI.`,
    openGraph: {
      title: `Jadwal Sholat & Imsakiyah Kota Serang ${namaBulan} ${validTahun}`,
      description: `Jadwal sholat 1 bulan penuh wilayah Kota Serang, Banten standar Bimas Islam Kemenag RI. Dilengkapi fitur cetak PDF dan jadwal hari ini.`,
    },
  };
}

export default async function JadwalSholatPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();

  const parsedBulan = params.bulan ? parseInt(params.bulan, 10) : now.getMonth() + 1;
  const parsedTahun = params.tahun ? parseInt(params.tahun, 10) : now.getFullYear();

  const validBulan =
    !isNaN(parsedBulan) && parsedBulan >= 1 && parsedBulan <= 12
      ? parsedBulan
      : now.getMonth() + 1;
  const validTahun =
    !isNaN(parsedTahun) && parsedTahun >= 2020 && parsedTahun <= 2050
      ? parsedTahun
      : now.getFullYear();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <MonthlyPrayerCalendar
        bulan={validBulan}
        tahun={validTahun}
      />
    </div>
  );
}
