'use client';

import { useState, useMemo } from 'react';
import { WPKajian } from '@/types';
import { KajianCard } from './KajianCard';

export function KajianFilter({ 
  initialKajian = [], 
  kecamatans = [] 
}: { 
  initialKajian: WPKajian[], 
  kecamatans?: { id: number; name: string }[] 
}) {
  const [kecamatan, setKecamatan] = useState('');
  const [jenis, setJenis] = useState('');
  const [ustadz, setUstadz] = useState('');

  const displayedKajian = useMemo(() => {
    return initialKajian.filter((item) => {
      // Sembunyikan kajian yang sudah selesai
      if (item.acf?.status_kajian === 'selesai') return false;

      // Filter Kecamatan
      if (kecamatan && kecamatan !== '' && kecamatan !== 'semua') {
        const kec = item.masjid_detail?.kecamatan;
        if (!String(kec).toLowerCase().includes(kecamatan.toLowerCase())) return false;
      }
      
      // Filter Jenis Kajian
      if (jenis && jenis !== '' && jenis !== 'semua') {
        if (item.acf?.jenis_kajian?.toLowerCase() !== jenis.toLowerCase()) return false;
      }
      
      // Filter Nama Ustadz
      if (ustadz && ustadz.trim() !== '') {
        const nama = item.acf?.nama_ustadz || '';
        if (!nama.toLowerCase().includes(ustadz.toLowerCase())) return false;
      }
      
      return true;
    });
  }, [initialKajian, kecamatan, jenis, ustadz]);

  return (
    <div className="space-y-6">
      {/* Form Filter dengan value="" pada opsi default */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <select 
          value={kecamatan} 
          onChange={(e) => setKecamatan(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-slate-200"
          aria-label="Filter Kecamatan"
        >
          <option value="">Semua Kecamatan</option>
          {kecamatans.length > 0 ? (
            kecamatans.map((kec) => (
              <option key={kec.id} value={kec.id}>{kec.name}</option>
            ))
          ) : (
            <>
              <option value="Serang">Serang</option>
              <option value="Cipocok Jaya">Cipocok Jaya</option>
              <option value="Kasemen">Kasemen</option>
              <option value="Taktakan">Taktakan</option>
              <option value="Walantaka">Walantaka</option>
              <option value="Curug">Curug</option>
            </>
          )}
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
      
      {/* List Hasil Kajian */}
      {displayedKajian.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedKajian.map((kajian) => (
            <KajianCard key={kajian.id} kajian={kajian} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <p className="font-medium text-lg mb-1">Tidak ada jadwal kajian</p>
          <p className="text-sm">Tidak ada kajian yang sesuai dengan filter pencarian Anda atau jadwal masih kosong.</p>
        </div>
      )}
    </div>
  );
}
