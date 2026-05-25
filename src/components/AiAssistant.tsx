import { useState, FormEvent } from "react";
import { Sparkles, Send, BrainCircuit, ShieldCheck, HelpCircle } from "lucide-react";
import { SkkhDashboardResponse } from "../types";

interface AiAssistantProps {
  dashboardData: SkkhDashboardResponse;
}

export default function AiAssistant({ dashboardData }: AiAssistantProps) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [customQuestion, setCustomQuestion] = useState("");

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Compile statistics for context
  const cleanMonthly = dashboardData.monthlyData.filter(m => !m.isTotal);
  const cleanDest = dashboardData.destinationData.filter(d => !d.isTotal);

  const statsContext = {
    uptInfo: dashboardData.uptInfo,
    ringkasanSistem: {
      totalSKKHKerja: dashboardData.heroStats.totalSkkhTerbit,
      totalHewanEkor: dashboardData.heroStats.totalHewanEkor,
      totalPenerimaanRetribusi: formatRupiah(dashboardData.heroStats.totalRetribusiRp),
    },
    bulanTeraktif: cleanMonthly.slice().sort((a,b) => b.hewan - a.hewan)[0] || null,
    destinasiTerpopuler: cleanDest.slice().sort((a,b) => b.hewan - a.hewan)[0] || null,
    totalKomoditasSKKH: dashboardData.latestSKKH.length,
    daftarLainnya: dashboardData.latestSKKH.map(s => `${s.tanggal}: ${s.pemilik} mengirim ${s.jumlah} ${s.jenisTernak} ke ${s.tujuan}`)
  };

  const executeAnalysis = async (type: string, customPromptText?: string) => {
    setLoading(true);
    setError("");
    setResponse("");

    let contextPrompt = "";
    if (type === "retribusi") {
      contextPrompt = "Tolong berikan analisis khusus mengenai capaian Retribusi Daerah Kabupaten Muna Barat. Bagaimana kontribusi bulanan dan daerah-daerah yang paling banyak menyetor?";
    } else if (type === "traffic") {
      contextPrompt = "Tolong berikan analisis mengenai kelancaran dan penyebaran Lalu Lintas Ternak (Sapi Bali/Lainnya) antar kabupaten. Mana jalur peredaran terpadat, dan sasarannya?";
    } else if (type === "health") {
      contextPrompt = "Sebagai Dinas Kesehatan Hewan, jelaskan langkah-langkah pencegahan penyakit kuku & mulut (PMK) dan rekomendasi pengawasan ternak berdasarkan volume penyebaran di lapangan.";
    } else {
      contextPrompt = customPromptText || `Bantu jawab pertanyaan berikut tentang data SKKH Muna Barat: ${customQuestion}`;
    }

    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summaryData: {
            ...statsContext,
            permintaanTipe: type,
            instruksiTambahan: contextPrompt
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperoleh rekomendasi AI.");
      }

      setResponse(data.analysis || "Tidak ada respon dihasilkan.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungi modul Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSend = (e: FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || loading) return;
    executeAnalysis("custom", customQuestion);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-indigo-950 shadow-lg space-y-6">
      <div className="flex items-center gap-3 border-b border-indigo-800/50 pb-5">
        <div className="p-2.5 bg-indigo-550/40 border border-indigo-500 rounded-xl text-indigo-300">
          <BrainCircuit className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            SI-PEDAS AI Vet-Analyst
            <span className="bg-indigo-500/30 text-indigo-300 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-indigo-500/30">
              Gemini Powered
            </span>
          </h3>
          <p className="text-xs text-indigo-200">
            Asisten cerdas Dinas untuk merangkum kesehatan ternak, peredaran hewan, &amp; kontribusi daerah
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2">
        <span className="text-xxs uppercase tracking-widest text-indigo-300 font-bold font-mono block mb-2.5">
          Pilih Fokus Analisis Cepat:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => executeAnalysis("retribution")}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-950/45 border border-indigo-805/85 hover:bg-indigo-800/30 p-3 rounded-xl text-left text-xs text-indigo-100 hover:text-white transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-extrabold">Capaian Retribusi</div>
              <div className="text-[10px] text-indigo-300">Target &amp; Sumbangsih PAD</div>
            </div>
          </button>

          <button
            onClick={() => executeAnalysis("traffic")}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-950/45 border border-indigo-805/85 hover:bg-indigo-800/30 p-3 rounded-xl text-left text-xs text-indigo-100 hover:text-white transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold">Lalu Lintas Ternak</div>
              <div className="text-[10px] text-indigo-300">Alur Pengiriman Terpadat</div>
            </div>
          </button>

          <button
            onClick={() => executeAnalysis("health")}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-950/45 border border-indigo-805/85 hover:bg-indigo-800/30 p-3 rounded-xl text-left text-xs text-indigo-100 hover:text-white transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="font-extrabold">Rekomendasi Medik</div>
              <div className="text-[10px] text-indigo-300">Sertifikasi &amp; Preventif PMK</div>
            </div>
          </button>
        </div>
      </div>

      {/* Chat Output / Report Pane */}
      <div className="bg-slate-950/80 rounded-xl border border-indigo-950/90 relative min-h-[160px] flex flex-col justify-between">
        <div className="p-4 overflow-y-auto max-h-[350px] custom-scrollbar text-sm space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-indigo-300 gap-3">
              <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-xs font-mono tracking-wider animate-pulse text-indigo-200">
                AI sedang mengkaji rekam transaksi SKKH Kabupaten Muna Barat...
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 rounded-lg text-xs">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {!response && !loading && !error && (
            <div className="flex flex-col items-center justify-center text-center py-6 text-indigo-300/60 max-w-sm mx-auto space-y-2">
              <HelpCircle className="w-8 h-8 text-indigo-400/40" />
              <p className="text-xs font-medium">
                Pilih topik di atas atau tulis pertanyaan khusus kepada asisten data veteriner SI-PEDAS.
              </p>
            </div>
          )}

          {response && !loading && (
            <div className="prose prose-invert prose-xs text-sm leading-relaxed text-indigo-50 font-sans space-y-3">
              {response.split("\n").map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("###")) {
                  return (
                    <h4 key={idx} className="text-emerald-300 font-extrabold text-sm pt-3 border-b border-indigo-950 pb-1">
                      {trimmed.replace("###", "")}
                    </h4>
                  );
                } else if (trimmed.startsWith("##")) {
                  return (
                    <h3 key={idx} className="text-white font-extrabold text-base pt-3">
                      {trimmed.replace("##", "")}
                    </h3>
                  );
                } else if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
                  return (
                    <li key={idx} className="ml-4 list-disc text-indigo-100">
                      {trimmed.substring(1).trim()}
                    </li>
                  );
                } else if (trimmed === "") {
                  return <div key={idx} className="h-2"></div>;
                } else if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.")) {
                  return (
                    <p key={idx} className="text-indigo-150 pl-2">
                      <span className="font-bold text-indigo-300">{trimmed.match(/^\d\./)?.[0]}</span>{" "}
                      {trimmed.replace(/^\d\./, "").trim()}
                    </p>
                  );
                }
                return <p key={idx} className="text-indigo-100">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Custom prompt bar */}
        <form onSubmit={handleCustomSend} className="p-3.5 border-t border-indigo-950/80 bg-slate-950 flex gap-2 rounded-b-xl">
          <input
            type="text"
            placeholder="Tanyakan pola lalu lintas, target retribusi daerah..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 bg-indigo-950/30 border border-indigo-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-indigo-400 outline-none focus:border-indigo-500 font-medium transition-all"
          />
          <button
            type="submit"
            disabled={loading || !customQuestion.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:hover:bg-indigo-600 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
