'use server';

import { getMonthlyShalat } from '@/lib/equranShalat';
import { KotaKabupatenBanten } from '@/lib/constants/bantenRegions';
import { EQuranShalatData } from '@/types/prayer';

export async function fetchMonthlyPrayerTimesAction(
  regionName: KotaKabupatenBanten,
  bulan: number,
  tahun: number
): Promise<EQuranShalatData> {
  return await getMonthlyShalat(regionName, bulan, tahun);
}
