export type TaskStatus = 'open' | 'on_progress' | 'close';

export type TaskCategory = 
  | 'Operasional' 
  | 'Mesin & Peralatan' 
  | 'Kualitas (Quality)' 
  | 'K3 & Safety' 
  | 'IT & Sistem' 
  | 'Umum & Pribadi';

export type TaskPriority = 'Tinggi' | 'Sedang' | 'Rendah';

export interface TaskHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  prevStatus?: TaskStatus;
  newStatus?: TaskStatus;
  note?: string;
}

export interface ProblemItem {
  id: string;
  problem: string;           // Masalah / Kendala
  identifikasi: string;      // Identifikasi / Akar Masalah (Root Cause / 5-Why)
  correctiveAction: string;  // Tindakan Perbaikan / Solusi (CAPA)
  status: TaskStatus;        // 'open' (Merah) | 'on_progress' (Kuning) | 'close' (Hijau)
  category: TaskCategory;
  priority: TaskPriority;
  pic: string;               // Penanggung Jawab (Person In Charge)
  targetDate: string;        // Tanggal target selesai (YYYY-MM-DD)
  createdAt: string;         // Tanggal dibuat (YYYY-MM-DD HH:mm)
  updatedAt?: string;        // Tanggal update terakhir
  notes?: string;            // Catatan tambahan progress
  history: TaskHistoryItem[];// Log riwayat perubahan
}

export interface FilterState {
  search: string;
  status: 'all' | TaskStatus;
  category: 'all' | TaskCategory;
  priority: 'all' | TaskPriority;
  sortBy: 'terbaru' | 'terlama' | 'target_terdekat' | 'prioritas';
}
