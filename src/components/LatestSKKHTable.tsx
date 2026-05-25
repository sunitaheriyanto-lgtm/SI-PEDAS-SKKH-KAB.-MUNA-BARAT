import { useState } from "react";
import { LatestSkkhRecord } from "../types";
import { Search, Filter, ClipboardList, Calendar, Users, Award, MapPin } from "lucide-react";

interface LatestSKKHTableProps {
  records: LatestSkkhRecord[];
}

export default function LatestSKKHTable({ records }: LatestSKKHTableProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [selectedDest, setSelectedDest] = useState("all");

  // Get unique species and destinations for filtering options
  const uniqueSpecies = Array.from(new Set(records.map((r) => r.jenisTernak).filter(Boolean)));
  const uniqueDests = Array.from(new Set(records.map((r) => r.tujuan).filter(Boolean)));

  // Formatter for currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter and search logic
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.pemilik.toLowerCase().includes(search.toLowerCase()) ||
      rec.nomorSKKH.toLowerCase().includes(search.toLowerCase()) ||
      rec.tujuan.toLowerCase().includes(search.toLowerCase()) ||
      (rec.petugas && rec.petugas.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecies = selectedSpecies === "all" || rec.jenisTernak === selectedSpecies;
    const matchesDest = selectedDest === "all" || rec.tujuan === selectedDest;

    return matchesSearch && matchesSpecies && matchesDest;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150/60 pb-5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Detail Log Pemeriksaan SKKH &amp; Lalu Lintas
          </h3>
          <p className="text-xs text-gray-500">
            Daftar lengkap transaksi SKKH, jenis hewan, dan retribusi disetor petugas lapangan
          </p>
        </div>

        {/* Counter Badge */}
        <div className="bg-indigo-50 border border-indigo-150 text-indigo-805 text-xs font-semibold px-3 py-1.5 rounded-full">
          Ditemukan: <span className="font-mono text-indigo-900 font-extrabold">{filteredRecords.length}</span> / {records.length} SKKH
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pemilik, nomor SKKH, petugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 transition-all placeholder-gray-400 text-slate-800"
          />
        </div>

        {/* Filter Species */}
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 bg-white cursor-pointer appearance-none text-slate-700 font-medium"
          >
            <option value="all">Semua Ternak</option>
            {uniqueSpecies.map((sp, idx) => (
              <option key={idx} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Destination */}
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedDest}
            onChange={(e) => setSelectedDest(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 bg-white cursor-pointer appearance-none text-slate-700 font-medium"
          >
            <option value="all">Semua Tujuan</option>
            {uniqueDests.map((dst, idx) => (
              <option key={idx} value={dst}>
                Ke {dst}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-150">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-55/80 border-b border-gray-150 text-xxs font-extrabold uppercase tracking-wider text-slate-500 font-mono">
              <th className="py-3 px-4 text-center">No</th>
              <th className="py-3 px-4">Tanggal / SKKH</th>
              <th className="py-3 px-4">Nama Pemilik</th>
              <th className="py-3 px-4">Komoditas &amp; Jumlah</th>
              <th className="py-3 px-4">Tujuan</th>
              <th className="py-3 px-4 shrink-0 text-right">Retribusi</th>
              <th className="py-3 px-4">Petugas &amp; Pos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-slate-650 bg-white">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 font-medium">
                  Tidak ada kecocokan data pemeriksaan SKKH.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                  {/* No Column */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-center text-slate-400">
                    {idx + 1}
                  </td>
                  
                  {/* Date & SKKH Column */}
                  <td className="py-3.5 px-4 space-y-1 max-w-[200px] truncate">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{rec.tanggal}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono select-all truncate shrink-0" title={rec.nomorSKKH}>
                      {rec.nomorSKKH}
                    </div>
                  </td>

                  {/* Owner Column */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {rec.pemilik}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Pemilik / Peternak</div>
                  </td>

                  {/* Commodity & Amount */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{rec.jenisTernak}</span>
                    </div>
                    <div className="pt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                        {rec.jumlah} Ekor
                      </span>
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{rec.tujuan}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Antar Kabupaten / Kota</div>
                  </td>

                  {/* Retribution Column */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-black font-mono text-emerald-700">
                      {formatRupiah(rec.retribusi)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Disetor Kas Daerah</div>
                  </td>

                  {/* Officer & Location */}
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="font-bold text-slate-700">
                      {rec.petugas}
                    </div>
                    <div className="text-3xs text-gray-400 bg-gray-50 border border-gray-150 rounded px-1.5 py-0.5 inline-block font-mono">
                      Pos: {rec.lokasi}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
