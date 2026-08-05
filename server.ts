import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// In-memory cache & persistence for Shared Cloud Rooms (Live Auto-Update)
const roomsCache = new Map<string, { roomId: string; problems: any[]; updatedAt: string; lastUpdatedBy?: string }>();
const DATA_DIR = path.join(process.cwd(), "data");
const ROOMS_FILE = path.join(DATA_DIR, "rooms_backup.json");

// Load initial rooms from file if exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(ROOMS_FILE)) {
    const raw = fs.readFileSync(ROOMS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      Object.entries(parsed).forEach(([key, val]: [string, any]) => {
        roomsCache.set(key, val);
      });
    }
  }
} catch (e) {
  console.warn("Could not load rooms from file, using in-memory only:", e);
}

function saveRoomsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, any> = {};
    roomsCache.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write rooms backup to disk:", e);
  }
}

// Global Map to store SSE clients per room
const sseClients = new Map<string, express.Response[]>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // SSE Endpoint: Listen for live updates
  app.get("/api/rooms/:roomId/events", (req, res) => {
    const { roomId } = req.params;
    const cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-") || "DEFAULT-ROOM";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!sseClients.has(cleanRoomId)) {
      sseClients.set(cleanRoomId, []);
    }
    sseClients.get(cleanRoomId)!.push(res);

    req.on("close", () => {
      const clients = sseClients.get(cleanRoomId) || [];
      sseClients.set(cleanRoomId, clients.filter(c => c !== res));
    });
  });

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

  // API Endpoint: Save / Update Shared Room Data (Live Cloud Sync)
  app.post("/api/rooms/save", (req, res) => {
    try {
      const { roomId, problems, lastUpdatedBy } = req.body;
      if (!roomId || typeof roomId !== "string") {
        return res.status(400).json({ error: "Room ID wajib diisi" });
      }
      if (!Array.isArray(problems)) {
        return res.status(400).json({ error: "Data problems tidak valid" });
      }

      const cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-") || "DEFAULT-ROOM";
      const roomData = {
        roomId: cleanRoomId,
        problems,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: lastUpdatedBy || "PIC User",
      };

      roomsCache.set(cleanRoomId, roomData);
      saveRoomsToFile();

      // Broadcast to SSE clients
      const clients = sseClients.get(cleanRoomId);
      if (clients) {
        clients.forEach(client => {
          client.write(`data: ${JSON.stringify(roomData)}\n\n`);
        });
      }

      return res.json({
        success: true,
        message: `Berhasil menyimpan ${problems.length} problem ke Ruangan Cloud [${cleanRoomId}]`,
        roomData,
      });
    } catch (err: any) {
      console.error("Save Room Error:", err);
      return res.status(500).json({ error: "Gagal menyimpan data ke server." });
    }
  });

  // API Endpoint: Load Shared Room Data (Live Cloud Sync)
  app.get("/api/rooms/:roomId", (req, res) => {
    try {
      const { roomId } = req.params;
      const cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-") || "DEFAULT-ROOM";
      
      const roomData = roomsCache.get(cleanRoomId);
      if (!roomData) {
        return res.status(404).json({
          success: false,
          error: `Ruangan '${cleanRoomId}' belum memiliki data tersimpan.`,
        });
      }

      return res.json({
        success: true,
        roomData,
      });
    } catch (err: any) {
      console.error("Load Room Error:", err);
      return res.status(500).json({ error: "Gagal memuat data dari server." });
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
