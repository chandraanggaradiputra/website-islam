'use client';

import { useState } from 'react';
import { approveKajian, rejectKajian } from '@/lib/actions/kajian';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export function AdminKajianActions({ id }: { id: number }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (confirm('Setujui dan publikasikan kajian ini?')) {
      setIsLoading(true);
      const res = await approveKajian(id);
      setIsLoading(false);
      if (!res.success) {
        showToast(res.error || 'Gagal menyetujui kajian.', 'error');
      } else {
        showToast('Kajian berhasil disetujui dan dipublikasikan.', 'success');
        router.refresh();
      }
    }
  };

  const handleReject = async () => {
    if (confirm('Tolak kajian ini? (Akan diubah menjadi draft)')) {
      setIsLoading(true);
      const res = await rejectKajian(id);
      setIsLoading(false);
      if (!res.success) {
        showToast(res.error || 'Gagal menolak kajian.', 'error');
      } else {
        showToast('Kajian ditolak dan diubah menjadi draf.', 'info');
        router.refresh();
      }
    }
  };

  if (isLoading) {
    return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />;
  }

  return (
    <div className="flex gap-2 items-center">
      <button 
        onClick={handleApprove}
        className="min-h-[44px] px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
      >
        Setujui
      </button>
      <button 
        onClick={handleReject}
        className="min-h-[44px] px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
      >
        Tolak
      </button>
    </div>
  );
}
