import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MonthlyRecord } from "../types";
import { TrendingUp, FileSpreadsheet, Award } from "lucide-react";

interface MonthlyChartProps {
  data: MonthlyRecord[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const [activeTab, setActiveTab] = useState<"combo" | "retribution" | "animals">("combo");

  // Filter out overall "TOTAL" rows if some are in the array
  const chartData = data.filter((item) => !item.bulan.toLowerCase().includes("total") && !item.isTotal);

  // Helper to format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getActiveMetricSummary = () => {
    const totalSKKH = chartData.reduce((acc, curr) => acc + curr.skkh, 0);
    const totalAnimals = chartData.reduce((acc, curr) => acc + curr.hewan, 0);
    const totalRetribution = chartData.reduce((acc, curr) => acc + curr.retribusi, 0);

    return { totalSKKH, totalAnimals, totalRetribution };
  };

  const stats = getActiveMetricSummary();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-xl">
          <p className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2 font-mono">
            {label}
          </p>
          <div className="space-y-1.5 text-xs text-gray-600">
            {payload.map((item: any, idx: number) => (
              <p key={idx} className="flex justify-between items-center gap-8 font-medium">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.name}:
                </span>
                <span className="font-bold text-gray-900 font-mono">
                  {item.name.includes("Retribusi") ? formatRupiah(item.value) : `${item.value} unit`}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150/60 pb-5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Tren Pemeriksaan SKKH Bulanan
          </h3>
          <p className="text-xs text-gray-500">
            Grafik pemantauan volume dokumen SKKH dirilis dan total hewan lalu lintas
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab("combo")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "combo"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            SKKH &amp; Hewan
          </button>
          <button
            onClick={() => setActiveTab("animals")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "animals"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Jumlah Ekor
          </button>
          <button
            onClick={() => setActiveTab("retribution")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "retribution"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Retribusi (Rp)
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards inside Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100/80 text-indigo-750 rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xxs uppercase text-gray-400 font-bold font-mono">Terekap SKKH</div>
            <div className="text-sm font-black text-slate-800 font-mono">{stats.totalSKKH} SKKH</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100/80 text-emerald-755 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xxs uppercase text-gray-400 font-bold font-mono">Terekap Hewan</div>
            <div className="text-sm font-black text-slate-800 font-mono">{stats.totalAnimals} Ekor</div>
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 flex items-center gap-3">
          <div className="p-2 bg-amber-100/80 text-amber-755 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xxs uppercase text-gray-400 font-bold font-mono">Terekap Retribusi</div>
            <div className="text-sm font-black text-slate-800 font-mono">{formatRupiah(stats.totalRetribution)}</div>
          </div>
        </div>
      </div>

      {/* Responsive Recharts */}
      <div className="h-[320px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed border-gray-200 rounded-xl">
            <p>Data grafik bulanan tidak tersedia</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="bulan"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 10, fontWeight: "500" }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 10, fontWeight: "500" }}
              />
              {activeTab === "combo" && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748B", fontSize: 10, fontWeight: "500" }}
                />
              )}

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.06)" }} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}
              />

              {activeTab === "combo" && (
                <>
                  <Bar
                    yAxisId="left"
                    name="Hewan (Ekor)"
                    dataKey="hewan"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={35}
                  />
                  <Line
                    yAxisId="right"
                    name="SKKH Diperiksa"
                    type="monotone"
                    dataKey="skkh"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#4F46E5", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}

              {activeTab === "animals" && (
                <Bar
                    yAxisId="left"
                    name="Volume Hewan (Ekor)"
                    dataKey="hewan"
                    fill="#0284C7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                />
              )}

              {activeTab === "retribution" && (
                <Bar
                    yAxisId="left"
                    name="Penerimaan Retribusi (Rp)"
                    dataKey="retribusi"
                    fill="#D97706"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Recapitulation Data Table */}
      <div className="pt-4 border-t border-gray-150">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-800">
              Tabel Rekapitulasi SKKH &amp; Lalu Lintas Bulanan
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              Data akumulatif resmi tahun berjalan bersumber dari Google Sheets
            </p>
          </div>
          <span className="inline-flex px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] items-center font-bold border border-emerald-100 uppercase tracking-wider font-mono">
            {chartData.length} Bulan Terpapar
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-150">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-150 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">SKKH Diperiksa</th>
                <th className="py-2.5 px-3 text-right">Volume Ternak</th>
                <th className="py-2.5 px-3 text-right">Total Retribusi</th>
                <th className="py-2.5 px-3 text-center">Pangsa (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-slate-600 bg-white">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {row.bulan}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-650">
                    {row.skkh} unit
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-650">
                    {row.hewan} ekor
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-705">
                    {formatRupiah(row.retribusi)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                    {row.pct || `${stats.totalSKKH > 0 ? ((row.skkh / stats.totalSKKH) * 100).toFixed(1) : "0"}%`}
                  </td>
                </tr>
              ))}
              
              {/* Accummulative Total footer row */}
              <tr className="bg-slate-55/80 font-black border-t-2 border-slate-200 text-slate-800">
                <td className="py-3 px-3 text-center font-mono text-slate-400">#</td>
                <td className="py-3 px-3 font-extrabold uppercase text-[11px] tracking-wide">TOTAL REKAPITULASI</td>
                <td className="py-3 px-3 text-right font-mono text-indigo-700 text-sm">
                  {stats.totalSKKH} SKKH
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                  {stats.totalAnimals} Ekor
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-800 text-sm">
                  {formatRupiah(stats.totalRetribution)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-800 text-xs">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
