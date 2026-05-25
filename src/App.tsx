import { useEffect, useState, startTransition } from "react";
import { SkkhDashboardResponse } from "./types";
import Header from "./components/Header";
import StatCard from "./components/StatCard";
import MonthlyChart from "./components/MonthlyChart";
import TrafficChart from "./components/TrafficChart";
import LatestSKKHTable from "./components/LatestSKKHTable";
import AiAssistant from "./components/AiAssistant";
import { FileText, PawPrint, Coins, RefreshCw, ExternalLink, HelpCircle } from "lucide-react";

export default function App() {
  const [data, setData] = useState<SkkhDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string>("-");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSkkhData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch("/api/skkh-data");
      if (!response.ok) {
        throw new Error("Gagal mengambil respon data pemantauan SKKH.");
      }
      const parsedData: SkkhDashboardResponse = await response.json();
      
      startTransition(() => {
        setData(parsedData);
        setLastCheck(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WITA");
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungi database spreadsheet terintegrasi.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Automated background polling every 30 seconds to keep the dashboard real-time synced
  useEffect(() => {
    fetchSkkhData();
    const timer = setInterval(() => {
      fetchSkkhData(true);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center" id="loading-view">
        <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-xl max-w-sm w-full space-y-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <PawPrint className="w-6 h-6 text-emerald-600 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">SI-PEDAS SKKH</h2>
            <p className="text-sm text-gray-500 font-medium">
              Menghubungkan &amp; menyinkronkan data langsung dari Google Sheets Dinas...
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-pulse w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" id="error-view">
        <div className="bg-white p-8 rounded-3xl border border-red-150 shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800">Sinkronisasi Spreadsheet Terputus</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sistem tidak dapat terhubung atau mengonversi data dari tautan Google Sheets publik yang diberikan.
            </p>
            {error && (
              <p className="p-3 bg-red-50 text-red-900 border border-red-100 rounded-xl text-xxs font-mono text-left max-h-[80px] overflow-y-auto">
                Detail: {error}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchSkkhData()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Coba Hubungkan Ulang
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1oHyQDpI2TAMKZXKfl8orld56aH4Dui4u/edit?gid=1736022250#gid=1736022250"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Lihat Spreadsheet <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8" id="dashboard-root">
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Ribbon / Navigation */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono">
              Sistem Monitoring Terpadu (SMT) SKKH
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSkkhData()}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>{isRefreshing ? "Memperbarui..." : "Perbarui Data"}</span>
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1oHyQDpI2TAMKZXKfl8orld56aH4Dui4u/edit?gid=1736022250"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-805 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <span>Sumber Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Header Hero Component */}
        <Header uptInfo={data.uptInfo} lastUpdated={lastCheck} />

        {/* Interactive Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="stats-panel">
          <StatCard
            title="Total SKKH Diperiksa"
            value={data.heroStats.totalSkkhTerbit}
            subtitle="Akumulasi dokumen SKKH yang diperiksa petugas lapangan"
            icon={FileText}
            colorScheme="indigo"
            trend="+12% bulan ini"
          />

          <StatCard
            title="Total Lalu Lintas Ternak"
            value={`${data.heroStats.totalHewanEkor} Ekor`}
            subtitle="Volume populasi hewan yang diperiksa &amp; dilalulintaskan"
            icon={PawPrint}
            colorScheme="emerald"
            trend="Tertinggi: Sapi Bali"
          />

          <StatCard
            title="Capaian Retribusi Daerah"
            value={formatRupiah(data.heroStats.totalRetribusiRp)}
            subtitle="Setoran langsung kas daerah untuk optimalisasi PAD"
            icon={Coins}
            colorScheme="amber"
            trend="100% tersetor resmi"
          />
        </div>

        {/* Double-Panel Graphical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-panel">
          
          {/* Left Large Column (Trends and Records) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <MonthlyChart data={data.monthlyData} />
            <LatestSKKHTable records={data.latestSKKH} />
          </div>

          {/* Right Siderbar Column (Locations and AI Vet Assistant) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <TrafficChart data={data.destinationData} />
            <AiAssistant dashboardData={data} />
          </div>
        </div>

        {/* Footer info brand */}
        <footer className="bg-white rounded-2xl p-6 border border-gray-150/60 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-800">
              SI-PEDAS SKKH — Dinas Peternakan dan Kesehatan Hewan Kabupaten Muna Barat
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              Sistem Pengelolaan Data SKKH Terpadu Muna Barat &copy; {new Date().getFullYear()}. Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
          <div className="text-xxs font-mono text-gray-400 flex items-center gap-1 bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            Platform bersumber Google Sheets &mdash; Sinkronisasi Auto
          </div>
        </footer>

      </div>
    </div>
  );
}
