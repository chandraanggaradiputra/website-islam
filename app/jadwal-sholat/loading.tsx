// app/jadwal-sholat/loading.tsx
import { MonthlyPrayerCalendarSkeleton } from '@/components/prayer/MonthlyPrayerCalendarSkeleton';

export default function JadwalSholatLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <MonthlyPrayerCalendarSkeleton />
    </div>
  );
}
