'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function KajianFilter({ kecamatans }: { kecamatans: { id: number; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentKecamatan = searchParams.get('kecamatan') || '';
  const currentJenis = searchParams.get('jenis') || '';
  const currentUstadz = searchParams.get('ustadz') || '';

  const [kecamatan, setKecamatan] = useState(currentKecamatan);
  const [jenis, setJenis] = useState(currentJenis);
  const [ustadz, setUstadz] = useState(currentUstadz);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (kecamatan) params.set('kecamatan', kecamatan);
    if (jenis) params.set('jenis', jenis);
    if (ustadz) params.set('ustadz', ustadz);
    
    router.push(`/jadwal-kajian?${params.toString()}`);
  };

  const clearFilters = () => {
    setKecamatan('');
    setJenis('');
    setUstadz('');
    router.push('/jadwal-kajian');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Filter Kajian</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select 
          value={kecamatan} 
          onChange={(e) => setKecamatan(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-slate-200"
          aria-label="Filter Kecamatan"
        >
          <option value="">Semua Kecamatan</option>
          {kecamatans.map((kec) => (
            <option key={kec.id} value={kec.id}>{kec.name}</option>
          ))}
        </select>
        
        <select 
          value={jenis} 
          onChange={(e) => setJenis(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-slate-200"
          aria-label="Filter Jenis Kajian"
        >
          <option value="">Semua Jenis Kajian</option>
          <option value="rutin">Kajian Rutin</option>
          <option value="tematik">Kajian Tematik</option>
        </select>

        <input 
          type="text" 
          placeholder="Nama Ustadz..." 
          value={ustadz}
          onChange={(e) => setUstadz(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-slate-200"
          aria-label="Cari Ustadz"
        />
      </div>
      
      <div className="flex gap-2 mt-4 justify-end">
        <button 
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Reset
        </button>
        <button 
          onClick={applyFilters}
          className="px-4 py-2 text-sm font-medium bg-[#093c96] hover:bg-blue-800 text-white rounded-lg transition-colors"
        >
          Terapkan Filter
        </button>
      </div>
    </div>
  );
}
