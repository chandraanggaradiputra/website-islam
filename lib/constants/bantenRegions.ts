export type KotaKabupatenBanten =
  | 'Kota Serang'
  | 'Kota Cilegon'
  | 'Kota Tangerang'
  | 'Kota Tangerang Selatan'
  | 'Kabupaten Serang'
  | 'Kabupaten Pandeglang'
  | 'Kabupaten Lebak'
  | 'Kabupaten Tangerang';

export interface BantenRegion {
  id: string;
  name: KotaKabupatenBanten;
  slug: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  kecamatan: string[];
}

export const BANTEN_REGIONS: BantenRegion[] = [
  {
    id: 'kota_serang',
    name: 'Kota Serang',
    slug: 'kota-serang',
    coordinates: { lat: -6.120000, lng: 106.150276 },
    kecamatan: ['Serang', 'Cipocok Jaya', 'Kasemen', 'Taktakan', 'Walantaka', 'Curug'],
  },
  {
    id: 'kota_cilegon',
    name: 'Kota Cilegon',
    slug: 'kota-cilegon',
    coordinates: { lat: -6.017384, lng: 106.024094 },
    kecamatan: ['Cibeber', 'Cilegon', 'Citangkil', 'Ciwandan', 'Gerogol', 'Jombang', 'Pulomerak', 'Purwakarta'],
  },
  {
    id: 'kota_tangerang',
    name: 'Kota Tangerang',
    slug: 'kota-tangerang',
    coordinates: { lat: -6.170133, lng: 106.640327 },
    kecamatan: ['Batuceper', 'Benda', 'Cibodas', 'Ciledug', 'Cipondoh', 'Jatiuwung', 'Karangtengah', 'Karawaci', 'Larangan', 'Neglasari', 'Periuk', 'Pinang', 'Tangerang'],
  },
  {
    id: 'kota_tangerang_selatan',
    name: 'Kota Tangerang Selatan',
    slug: 'kota-tangerang-selatan',
    coordinates: { lat: -6.288620, lng: 106.717888 },
    kecamatan: ['Ciputat', 'Ciputat Timur', 'Pamulang', 'Pondok Aren', 'Serpong', 'Serpong Utara', 'Setu'],
  },
  {
    id: 'kab_serang',
    name: 'Kabupaten Serang',
    slug: 'kabupaten-serang',
    coordinates: { lat: -6.150000, lng: 106.000000 },
    kecamatan: ['Anyar', 'Baren', 'Baros', 'Binuang', 'Bojonegara', 'Carenang', 'Cikande', 'Cikeusal', 'Cinangka', 'Ciomas', 'Ciruas', 'Gunungsari', 'Jawilan', 'Kibin', 'Kopo', 'Kragilan', 'Kramatwatu', 'Lebakwangi', 'Mancak', 'Pabuaran', 'Padarincang', 'Pamarayan', 'Petir', 'Pontang', 'Pulo Ampel', 'Tanara', 'Tirtayasa', 'Tunjung Teja', 'Waringinkurung'],
  },
  {
    id: 'kab_pandeglang',
    name: 'Kabupaten Pandeglang',
    slug: 'kabupaten-pandeglang',
    coordinates: { lat: -6.308900, lng: 106.106000 },
    kecamatan: ['Banjar', 'Cadasari', 'Carita', 'Cibaliung', 'Cibitung', 'Cigeulis', 'Cikedal', 'Cikeusik', 'Cimanggu', 'Cimanuk', 'Cipeucang', 'Cisata', 'Jiput', 'Kaduhejo', 'Karang Tanjung', 'Koroncong', 'Labuan', 'Majasari', 'Mandalawangi', 'Mekarjaya', 'Menes', 'Munjul', 'Pagelaran', 'Pandeglang', 'Panimbang', 'Patia', 'Picung', 'Pulosari', 'Saketi', 'Sindangresmi', 'Sobang', 'Sukaresmi', 'Sumur'],
  },
  {
    id: 'kab_lebak',
    name: 'Kabupaten Lebak',
    slug: 'kabupaten-lebak',
    coordinates: { lat: -6.579400, lng: 106.248600 },
    kecamatan: ['Banjarsari', 'Bayah', 'Bojongmanik', 'Cibadak', 'Cibeber', 'Cigemblong', 'Cihara', 'Cijaku', 'Cikulur', 'Cileles', 'Cilograng', 'Cimarga', 'Cipanas', 'Cirinten', 'Curugbitung', 'Gunungkencana', 'Kalanganyar', 'Lebak Gedong', 'Leuwidamar', 'Maja', 'Malingping', 'Muncang', 'Panggarangan', 'Panggarangan', 'Rangkasbitung', 'Sajira', 'Sobang', 'Wanasalam'],
  },
  {
    id: 'kab_tangerang',
    name: 'Kabupaten Tangerang',
    slug: 'kabupaten-tangerang',
    coordinates: { lat: -6.180000, lng: 106.450000 },
    kecamatan: ['Balaraja', 'Cikupa', 'Cisauk', 'Cisoka', 'Curug', 'Gunung Kaler', 'Jambe', 'Jayanti', 'Kelapa Dua', 'Kemiri', 'Kosambi', 'Kresek', 'Kronjo', 'Legok', 'Mauk', 'Mekar Baru', 'Pagedangan', 'Pakuhaji', 'Panongan', 'Pasar Kemis', 'Rajeg', 'Sepatan', 'Sepatan Timur', 'Sindang Jaya', 'Solear', 'Sukadiri', 'Sukamulya', 'Teluknaga', 'Tigaraksa'],
  },
];
