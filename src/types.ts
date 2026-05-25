export interface HeroStats {
  totalSkkhTerbit: number;
  totalHewanEkor: number;
  totalRetribusiRp: number;
}

export interface MonthlyRecord {
  no: string;
  bulan: string;
  skkh: number;
  hewan: number;
  retribusi: number;
  pct: string;
  isTotal?: boolean;
}

export interface DestinationRecord {
  no: string;
  tujuan: string;
  skkh: number;
  hewan: number;
  retribusi: number;
  isTotal?: boolean;
}

export interface LatestSkkhRecord {
  no: string;
  tanggal: string;
  nomorSKKH: string;
  pemilik: string;
  jenisTernak: string;
  tujuan: string;
  jumlah: number;
  retribusi: number;
  petugas: string;
  lokasi: string;
}

export interface SkkhDashboardResponse {
  uptInfo: string;
  heroStats: HeroStats;
  monthlyData: MonthlyRecord[];
  destinationData: DestinationRecord[];
  latestSKKH: LatestSkkhRecord[];
}
