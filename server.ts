import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for AI Root Cause & Corrective Action Assistant
  app.post("/api/analyze-problem", async (req, res) => {
    try {
      const { problem, category } = req.body;
      if (!problem) {
        return res.status(400).json({ error: "Deskripsi masalah tidak boleh kosong." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY belum dikonfigurasi di secrets.",
          fallback: {
            identifikasi: "Analisis Manual disarankan: Lakukan metode 5-Why atau Fishbone Diagram untuk mengidentifikasi penyebab utama dari masalah ini.",
            correctiveAction: "1. Tindakan Perbaikan Segera (Containment Action): Atasi gejala utama.\n2. Tindakan Pencegahan (Preventive Action): Buat SOP atau standar baru agar tidak terulang."
          }
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Kamu adalah seorang ahli continuous improvement (Kaizen, 5-Why, CAPA - Corrective and Preventive Action) dan problem solver profesional.
Tolong bantu analisis masalah sehari-hari / operasional berikut ini:
Kategori: ${category || "Umum"}
Masalah: "${problem}"

Berikan respons DALAM FORMAT JSON SAJA (tanpa markdown backtick atau teks lain di luar JSON) dengan struktur persis seperti ini:
{
  "identifikasi": "Analisis penyebab akar masalah (Root Cause / 5-Why singkat dan jelas dalam 2-3 poin atau paragraf padat).",
  "correctiveAction": "Langkah-langkah tindakan perbaikan nyata dan praktis (Corrective & Preventive Action) yang bisa dilakukan sehari-hari oleh tim atau PIC terkait dalam 2-4 poin yang jelas."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text ? response.text.trim() : "";
      // Strip markdown code block formatting if present
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (e) {
        // If JSON parsing fails, return formatted text
        return res.json({
          identifikasi: text || "Identifikasi penyebab berdasarkan analisis awal.",
          correctiveAction: "Lakukan perbaikan sesuai temuan analisis penyebab di atas dan evaluasi berkala."
        });
      }
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      return res.status(500).json({
        error: "Gagal memproses analisis AI: " + (error.message || "Unknown error"),
        fallback: {
          identifikasi: "Periksa kembali parameter atau lakukan analisis akar masalah dengan tim kerja.",
          correctiveAction: "Lakukan briefing harian dan tetapkan action plan terukur dengan PIC."
        }
      });
    }
  });

  // Vite middleware for development or Static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
