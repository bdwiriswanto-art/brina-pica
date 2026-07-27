import React, { useState } from 'react';
import { ProblemItem, TaskCategory, TaskPriority } from '../types';
import { Sparkles, X, Loader2, ArrowRight, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDirectToTable: (problemData: Partial<ProblemItem>) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Operasional',
  'Mesin & Peralatan',
  'Kualitas (Quality)',
  'K3 & Safety',
  'IT & Sistem',
  'Umum & Pribadi',
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onSaveDirectToTable,
}) => {
  const [problemText, setProblemText] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Operasional');
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [pic, setPic] = useState('Tim Terkait');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI result
  const [result, setResult] = useState<{
    identifikasi: string;
    correctiveAction: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) {
      setError('Tuliskan masalah atau kendala yang dialami!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemText, category }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({
          identifikasi: data.identifikasi || 'Akar masalah berhasil diidentifikasi.',
          correctiveAction: data.correctiveAction || 'Langkah perbaikan telah disiapkan.',
        });
      } else {
        if (data.fallback) {
          setResult(data.fallback);
        }
        setError(data.error || 'Menggunakan analisis standar (offline fallback).');
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungi AI Server. Menggunakan saran standar offline.');
      setResult({
        identifikasi: '1. Mengapa terjadi? Lakukan pengecekan SOP & parameter kerja.\n2. Analisis faktor Man, Machine, Material, Method.',
        correctiveAction: '1. Tindakan Perbaikan Sementara: Isolasi area atau jalankan prosedur manual.\n2. Tindakan Pencegahan Permanen: Update SOP dan lakukan evaluasi mingguan.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToTracker = () => {
    if (!result || !problemText.trim()) return;

    const d = new Date();
    d.setDate(d.getDate() + 3);
    const targetDate = d.toISOString().split('T')[0];

    onSaveDirectToTable({
      problem: problemText.trim(),
      identifikasi: result.identifikasi,
      correctiveAction: result.correctiveAction,
      category,
      priority,
      status: 'open',
      pic: pic.trim() || 'Tim Terkait',
      targetDate,
      notes: 'Di-generate secara otomatis via AI Asisten CAPA',
    });

    onClose();
    // Reset state
    setProblemText('');
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-purple-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-amber-100 to-indigo-200 bg-clip-text text-transparent">
                AI Asisten Root Cause & CAPA (5-Why)
              </h2>
              <p className="text-xs sm:text-sm text-purple-200">
                Konsultasikan kendala operasional Anda, biarkan Gemini AI menyusun analisis & solusi!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-purple-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Ceritakan kendala, masalah, atau tugas sehari-hari yang sedang Anda hadapi:
              </label>
              <textarea
                rows={3}
                required
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Contoh: Mesin packaging sering error di jam 2 siang sehingga target harian kurang 100 karton..."
                className="w-full p-3.5 text-sm bg-slate-50 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full text-xs sm:text-sm font-medium p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full text-xs sm:text-sm font-medium p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="Tinggi">Prioritas Tinggi</option>
                  <option value="Sedang">Prioritas Sedang</option>
                  <option value="Rendah">Prioritas Rendah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Rencana PIC
                </label>
                <input
                  type="text"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Nama / Tim"
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading || !problemText.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Sedang Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>⚡ Analisis Akar Masalah & Solusi Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Result Presentation */}
          {result && (
            <div className="space-y-4 bg-gradient-to-b from-purple-50/50 to-indigo-50/30 p-5 rounded-2xl border-2 border-purple-200/80 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Hasil Rekomendasi AI Kaizen
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900">
                  Siap disimpan ke tabel
                </span>
              </div>

              {/* Identifikasi Box */}
              <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1.5 flex items-center gap-1">
                  🔍 Identifikasi (Akar Penyebab / 5-Why):
                </h4>
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {result.identifikasi}
                </div>
              </div>

              {/* Corrective Action Box */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1">
                  ✅ Corrective & Preventive Action (CAPA):
                </h4>
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {result.correctiveAction}
                </div>
              </div>

              {/* Save directly button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSaveToTracker}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>📥 Simpan ke Tabel Tracker dengan Status OPEN (Merah)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>💡 Setelah disimpan, Anda dapat mengklik status di kolom kanan tabel untuk mengubah ke On Progress / Close.</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 px-3 py-1 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
