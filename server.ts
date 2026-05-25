import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy the official Muna Barat emblem to bypass CORS, referer blocker, or hotlinking restrictions in sandbox iframes
app.get("/api/mubar-logo.png", async (req, res) => {
  try {
    const response = await fetch("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lambang_Kabupaten_Muna_Barat.png/300px-Lambang_Kabupaten_Muna_Barat.png", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 1 day
    res.send(buffer);
  } catch (err: any) {
    console.error("Error serving local logo proxy:", err.message);
    // Return a 302 redirect as fallback or handle gracefully
    res.redirect("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lambang_Kabupaten_Muna_Barat.png/300px-Lambang_Kabupaten_Muna_Barat.png");
  }
});

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. AI analysis will be disabled.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Memory Cache for spreadsheet data
let cachedParsedData: any = null;
let lastFetched = 0;
const CACHE_DURATION_MS = 15000; // 15 seconds cache to avoid Google Sheets throttle

// Helper function to parse side-by-side tables and hero values from the 2D sheet
function parseSkkhSheet(rawData: string[][]) {
  let uptInfo = "UPT Pos Pemeriksaan Lalu Lintas Ternak Tondasi  ·  Kab. Muna Barat  ·  Petugas: Sudirman";
  let totalSkkhTerbit = 298;
  let totalHewanEkor = 153;
  let totalRetribusiRp = 15300000;
  
  const monthlyData: any[] = [];
  const destinationData: any[] = [];
  const latestSKKH: any[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const joinRow = row.join(" ");

    // 1. Extract Checkpoint / UPT info
    if (joinRow.includes("UPT Pos Pemeriksaan")) {
      const match = row.find(cell => cell && cell.includes("UPT Pos Pemeriksaan"));
      if (match) uptInfo = match;
    }

    // 2. Extract Hero Stats
    // Row: [, 📋  TOTAL SKKH TERBIT, , , , 🐄  TOTAL HEWAN (EKOR), , , , 💰  TOTAL RETRIBUSI (Rp)]
    if (joinRow.includes("TOTAL SKKH TERBIT") && i + 1 < rawData.length) {
      const nextRow = rawData[i + 1];
      if (nextRow && nextRow.length > 9) {
        const getVal = (val: string) => parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
        totalSkkhTerbit = getVal(nextRow[1] || "298");
        totalHewanEkor = getVal(nextRow[5] || "153");
        totalRetribusiRp = getVal(nextRow[9] || "15300000");
      }
    }

    // 3. Extract Monthly Trend & Destination data
    // When row contains a month name or if row[1] contains "TOTAL"
    const row2Lower = row[2]?.toLowerCase() || "";
    const isMonthRow = (
      row2Lower.includes("januari") ||
      row2Lower.includes("februari") ||
      row2Lower.includes("maret") ||
      row2Lower.includes("april") ||
      row2Lower.includes("mei") ||
      row2Lower.includes("juni") ||
      row2Lower.includes("juli") ||
      row2Lower.includes("agustus") ||
      row2Lower.includes("september") ||
      row2Lower.includes("oktober") ||
      row2Lower.includes("november") ||
      row2Lower.includes("desember")
    ) || (row[1]?.includes("TOTAL"));

    if (row[2] && isMonthRow) {
      const getNumeric = (val: string) => parseInt(val?.replace(/[^\d]/g, "") || "0", 10) || 0;

      // Ensure this is not the header row itself
      if (row[1] !== "No" && !row[1].includes("REKAP")) {
        monthlyData.push({
          no: row[1] || "",
          bulan: row[2],
          skkh: getNumeric(row[3]),
          hewan: getNumeric(row[4]),
          retribusi: getNumeric(row[5]),
          pct: row[6] || "0%",
          isTotal: row[1].includes("TOTAL")
        });
      }

      // Check destination summary columns (covered on indices 8-12)
      if (row[9] && row[9] !== "Daerah Tujuan" && !row[9].includes("REKAP")) {
        destinationData.push({
          no: row[8] || "",
          tujuan: row[9],
          skkh: getNumeric(row[10]),
          hewan: getNumeric(row[11]),
          retribusi: getNumeric(row[12]),
          isTotal: row[8]?.includes("TOTAL") || row[9]?.toLowerCase().includes("total")
        });
      }
    }

    // 4. Extract Latest SKKH Rows
    // Trigger on row[2] matching DD/MM/YYYY text
    if (row[2] && row[2].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const getNumeric = (val: string) => parseInt(val?.replace(/[^\d]/g, "") || "0", 10) || 0;
      latestSKKH.push({
        no: row[1] || "",
        tanggal: row[2],
        nomorSKKH: row[3] || "",
        pemilik: row[4] || "",
        jenisTernak: row[5] || "",
        tujuan: row[6] || "",
        jumlah: getNumeric(row[7]),
        retribusi: getNumeric(row[8]),
        petugas: (row[9] && row[9] !== "-") ? row[9] : "Sudirman",
        lokasi: (row[10] && row[10] !== "-") ? row[10] : "Tondasi",
      });
    }
  }

  return {
    uptInfo,
    heroStats: {
      totalSkkhTerbit,
      totalHewanEkor,
      totalRetribusiRp,
    },
    monthlyData,
    destinationData,
    latestSKKH,
  };
}

// Endpoint to fetch and parse SKKH Spreadsheet
app.get("/api/skkh-data", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedParsedData && now - lastFetched < CACHE_DURATION_MS) {
      return res.json(cachedParsedData);
    }

    const sheetUrl = "https://docs.google.com/spreadsheets/d/1oHyQDpI2TAMKZXKfl8orld56aH4Dui4u/export?format=csv&gid=1736022250";
    
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
    }

    const csvText = await response.text();
    
    // Parse using papa parse without headers to preserve cell index mapping
    const parsed = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: true,
    });

    const structured = parseSkkhSheet(parsed.data);
    cachedParsedData = structured;
    lastFetched = now;

    res.json(structured);
  } catch (error: any) {
    console.error("Error fetching/parsing SKKH data:", error);
    res.status(500).json({
      error: error.message || "Gagal mengambil data SKKH dari Google Sheets.",
    });
  }
});

// Endpoint for AI Analysis using Gemini
app.post("/api/ai-analyze", async (req, res) => {
  try {
    const client = getGeminiClient();
    if (!client) {
      return res.status(503).json({
        error: "Fitur AI Analysis sedang dinonaktifkan karena API Key belum dikonfigurasi.",
      });
    }

    const { summaryData } = req.body;

    const systemInstruction = 
      "Anda adalah seorang Analis Data Veteriner Senior di Dinas Peternakan dan Kesehatan Hewan Kabupaten Muna Barat. " +
      "Tugas Anda adalah membaca ringkasan data SKKH (Surat Keterangan Kesehatan Hewan), lalu lintas ternak, dan retribusi, " +
      "lalu menyusun laporan analisis singkat (bullet points dan kesimpulan) dalam Bahasa Indonesia. " +
      "Gunakan nada bicara yang profesional, informatif, dan optimis mengenai kemajuan daerah. Berikan rekomendasi kebijakan jika diperlukan.";

    const prompt = `Analisis data berikut:\n${JSON.stringify(summaryData, null, 2)}\n\nBerikan kesimpulan trend bulanan, pergerakan lalu lintas ternak teramai, pencapaian retribusi daerah, dan 2 rekomendasi strategis kesehatan hewan untuk Kabupaten Muna Barat.`;

    const result = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ analysis: result.text });
  } catch (error: any) {
    console.error("Error generating Gemini analysis:", error);
    res.status(500).json({
      error: error.message || "Gagal menghasilkan analisis AI.",
    });
  }
});

async function startServer() {
  // Vite dev server setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SI-PEDAS SERVER] Running on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
