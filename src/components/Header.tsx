import { useState } from "react";
import { ShieldAlert, MapPin, BadgeCheck } from "lucide-react";
import { mubarLogoBase64 } from "./MubarLogoData";

interface HeaderProps {
  uptInfo: string;
  lastUpdated: string;
}

export default function Header({ uptInfo, lastUpdated }: HeaderProps) {
  const [logoError, setLogoError] = useState(false);

  // Parse elements from uptInfo
  const parts = uptInfo.split("·").map(p => p.trim());
  const checkpointName = parts[0] || "UPT Pos Pemeriksaan Lalu Lintas Ternak Tondasi";
  const regionName = parts[1] || "Kabupaten Muna Barat";
  const mainPetugas = parts[2] || "Petugas Lapangan: Sudirman & Tim";

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800">
      {/* Background Decorative Shapes */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
        {/* official Muna Barat Crest Logo */}
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md group-hover:blur-xl transition-all duration-300"></div>
          <div className="relative bg-white p-2.5 rounded-2xl border border-teal-500/25 shadow-lg flex items-center justify-center w-24 h-28">
            {mubarLogoBase64 && !logoError ? (
              <img
                src={mubarLogoBase64}
                alt="Logo Kabupaten Muna Barat"
                className="h-24 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
                loading="eager"
                onError={() => {
                  setLogoError(true);
                }}
              />
            ) : (
              <svg viewBox="0 0 120 120" className="h-24 w-20 transition-transform duration-300 group-hover:scale-110">
                {/* Shield outer boundary */}
                <path d="M 10 25 C 10 10, 110 10, 110 25 C 110 65, 95 105, 60 115 C 25 105, 10 65, 10 25 Z" fill="#1E3A8A" stroke="#EF4444" strokeWidth="2.5" />
                <path d="M 13 26 C 13 13, 107 13, 107 26 C 107 63, 92 101, 60 111 C 28 101, 13 63, 13 26 Z" fill="#1E40AF" stroke="#FFFFFF" strokeWidth="1.5" />
                
                {/* Yellow Arc Banner Top */}
                <path d="M 14 28 C 30 18, 90 18, 106 28 L 106 38 C 90 28, 30 28, 14 38 Z" fill="#FBBF24" />
                <text x="60" y="32" fontFamily="sans-serif" fontSize="7" fontWeight="900" fill="#000000" textAnchor="middle">MUNA BARAT</text>
                
                {/* Golden Star at the top */}
                <polygon points="60,42 62,47 67,47 63,50 65,55 60,52 55,55 57,50 53,47 58,47" fill="#FBBF24" />
                
                {/* Inside green arc / hill */}
                <path d="M 30 85 Q 60 72 90 85 L 90 92 Q 60 79 30 92 Z" fill="#10B981" />

                {/* Rearing White Horse Silhouette */}
                <path d="M 48,78 C 47,71 50,65 58,64 C 60,61 64,61 68,63 C 67,58 71,56 74,59 C 74,57 78,59 77,62 C 80,60 84,62 82,66 C 80,68 77,67 76,68 L 73,74 L 69,82 C 67,83 65,81 63,78" fill="#FFFFFF" stroke="#000" strokeWidth="0.5" />
                
                {/* Decorative golden grain and cotton represent ribbons */}
                <circle cx="28" cy="55" r="3" fill="#FBBF24" />
                <circle cx="25" cy="65" r="3" fill="#FBBF24" />
                <circle cx="27" cy="75" r="4" fill="#FBBF24" />
                <circle cx="92" cy="55" r="3" fill="#E5E7EB" />
                <circle cx="95" cy="65" r="3" fill="#E5E7EB" />
                <circle cx="93" cy="75" r="4" fill="#E5E7EB" />

                {/* Bottom Yellow Ribbon */}
                <path d="M 28,96 Q 60,103 92,96 L 87,105 Q 60,108 33,105 Z" fill="#FBBF24" />
                <text x="60" y="101" fontFamily="sans-serif" fontSize="5" fontWeight="900" fill="#047857" textAnchor="middle">WITE BARAKATI</text>
                <text x="60" y="109" fontFamily="sans-serif" fontSize="5" fontWeight="900" fill="#1E3A8A" textAnchor="middle">2014</text>
              </svg>
            )}
          </div>
        </div>

        {/* Header Text Info */}
        <div className="text-center md:text-left flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700 px-3 py-1 rounded-full text-xs font-mono tracking-wide text-emerald-300">
            <BadgeCheck className="w-3.5 h-3.5" />
            DINAS PETERNAKAN DAN KESEHATAN HEWAN
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            SI-PEDAS <span className="text-emerald-300">SKKH</span>
          </h1>
          <p className="text-sm sm:text-base text-teal-100 font-medium max-w-2xl leading-relaxed">
            Sistem Pengelolaan Data SKKH Terpadu — Pemantauan Lalu Lintas Ternak &amp; Retribusi Daerah Real-time
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs text-teal-200">
            <div className="flex items-center gap-1.5 bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-850">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Kabupaten Muna Barat, Sulawesi Tenggara</span>
            </div>
          </div>
        </div>

        {/* Live Status and Counter */}
        <div className="shrink-0 flex flex-col items-center md:items-end gap-2 bg-teal-950/50 border border-teal-800/80 p-4 rounded-2xl w-full md:w-auto text-center md:text-right">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Spreadsheet Terhubung</span>
          </div>
          <div className="text-xxs font-mono text-teal-200">
            Data Terupdate Otomatis
          </div>
          <div className="text-xs text-teal-300 font-medium">
            Terakhir dicek: <span className="font-mono text-white">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
