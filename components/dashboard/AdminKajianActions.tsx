'use client';

import { useState } from 'react';
import { approveKajian, rejectKajian } from '@/lib/actions/kajian';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminKajianActions({ id }: { id: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (confirm('Setujui dan publikasikan kajian ini?')) {
      setIsLoading(true);
      const res = await approveKajian(id);
      setIsLoading(false);
      if (!res.success) alert(res.error);
      else router.refresh();
    }
  };

  const handleReject = async () => {
    if (confirm('Tolak kajian ini? (Akan diubah menjadi draft)')) {
      setIsLoading(true);
      const res = await rejectKajian(id);
      setIsLoading(false);
      if (!res.success) alert(res.error);
      else router.refresh();
    }
  };

  if (isLoading) {
    return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />;
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleApprove}
        className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
      >
        Setujui
      </button>
      <button 
        onClick={handleReject}
        className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
      >
        Tolak
      </button>
    </div>
  );
}
