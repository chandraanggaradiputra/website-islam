import { redirect } from 'next/navigation';

/**
 * Pengalihan Cepat: /dashboard/dkm/profil -> /dashboard/dkm/profil-masjid
 * Menjamin URL alias profil masjid selalu valid dan tidak menyebabkan dead-link.
 */
export default function DKMProfilAliasPage() {
  redirect('/dashboard/dkm/profil-masjid');
}
