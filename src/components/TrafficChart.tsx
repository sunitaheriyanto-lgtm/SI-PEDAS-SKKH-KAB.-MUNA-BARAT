import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DestinationRecord } from "../types";
import { Map, Percent, Landmark } from "lucide-react";

interface TrafficChartProps {
  data: DestinationRecord[];
}

export default function TrafficChart({ data }: TrafficChartProps) {
  // Filter out any "TOTAL" rows
  const cleanData = data.filter(
    (item) =>
      item.tujuan &&
      !item.tujuan.toLowerCase().includes("total") &&
      !item.isTotal &&
      item.tujuan !== "Daerah Tujuan"
  ).sort((a, b) => b.hewan - a.hewan); // Sort by highest animal volume

  const totalAnimals = cleanData.reduce((acc, curr) => acc + curr.hewan, 0);

  const colors = ["#0F766E", "#0D9488", "#14B8A6", "#2DD4BF", "#5EEAD4", "#99F6E4", "#CCFBF1"];

  // Formatter for currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div className="space-y-1 border-b border-gray-150/60 pb-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Map className="w-5 h-5 text-teal-600" />
          Distribusi &amp; Daerah Tujuan Lalu Lintas Ternak
        </h3>
        <p className="text-xs text-gray-500">
          Analisis lokasi tujuan pengiriman ternak berdasarkan jumlah SKKH diperiksa dan total hewan (ekor)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Visual Chart */}
        <div className="lg:col-span-3 h-[280px]">
          {cleanData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
              Data distribusi tujuan belum tersedia
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cleanData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis
                  type="category"
                  dataKey="tujuan"
                  tickLine={false}
                  axisLine={false}
                  width={75}
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#334155" }}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "retribusi" ? formatRupiah(Number(value)) : `${value} unit`,
                    name === "hewan" ? "Hewan (Ekor)" : name === "skkh" ? "SKKH Diperiksa" : "Retribusi",
                  ]}
                  contentStyle={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: "10px", fontSize: "12px" }}
                />
                <Bar dataKey="hewan" fill="#14B8A6" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {cleanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Breakdown List & Shares */}
        <div className="lg:col-span-2 space-y-3.5">
          <h4 className="text-xs uppercase font-extrabold tracking-widest text-gray-400 font-mono">
            Pangsa Pasar &amp; Retribusi Daerah
          </h4>

          <div className="space-y-2.5 max-h-[225px] overflow-y-auto pr-2 custom-scrollbar">
            {cleanData.map((dest, idx) => {
              const share = totalAnimals > 0 ? ((dest.hewan / totalAnimals) * 100).toFixed(1) : "0.0";
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/60 hover:bg-teal-50/40 hover:border-teal-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    ></div>
                    <div>
                      <span className="text-sm font-bold text-slate-700">{dest.tujuan}</span>
                      <div className="flex items-center gap-3 text-xxs text-slate-400 font-medium">
                        <span className="flex items-center gap-0.5">
                          <Percent className="w-3 h-3 text-teal-600" /> {share}% Pangsa
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Landmark className="w-3 h-3 text-teal-600" /> {dest.skkh} SKKH
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-slate-800 font-mono">{dest.hewan} Ekor</div>
                    <div className="text-3xs font-mono text-emerald-600 font-semibold">{formatRupiah(dest.retribusi)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
