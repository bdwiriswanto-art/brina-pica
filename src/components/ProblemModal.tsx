import React, { useState, useEffect } from 'react';
import { ProblemItem, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { X, Sparkles, AlertCircle, Check, Loader2, Save, HelpCircle } from 'lucide-react';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problemData: Partial<ProblemItem>) => void;
  initialData?: ProblemItem | null;
}

const CATEGORIES: TaskCategory[] = [
  'Keluarga',
  'operasional putih telur',
  'kualitas putih telur',
  'sistem',
];

const PRIORITIES: TaskPriority[] = ['Tinggi', 'Sedang', 'Rendah'];

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [problem, setProblem] = useState('');
  const [identifikasi, setIdentifikasi] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Keluarga');
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [pic, setPic] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setProblem(initialData.problem || '');
      setIdentifikasi(initialData.identifikasi || '');
      setCorrectiveAction(initialData.correctiveAction || '');
      setCategory(initialData.category || 'Keluarga');
      setPriority(initialData.priority || 'Sedang');
      setStatus(initialData.status || 'open');
      setPic(initialData.pic || '');
      setTargetDate(initialData.targetDate || '');
      setNotes(initialData.notes || '');
    } else {
      // Default new form
      setProblem('');
      setIdentifikasi('');
      setCorrectiveAction('');
      setCategory('Keluarga');
      setPriority('Sedang');
      setStatus('open');
      setPic('');
      // Default target date: 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setTargetDate(d.toISOString().split('T')[0]);
      setNotes('');
    }
    setAiError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleGenerateAi = async () => {
    if (!problem.trim()) {
      setAiError('Silakan ketik deskripsi masalah (Problem) terlebih dahulu agar AI bisa menganalisis.');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, category }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.identifikasi) setIdentifikasi(data.identifikasi);
        if (data.correctiveAction) setCorrectiveAction(data.correctiveAction);
      } else {
        if (data.fallback) {
          if (data.fallback.identifikasi) setIdentifikasi(data.fallback.identifikasi);
          if (data.fallback.correctiveAction) setCorrectiveAction(data.fallback.correctiveAction);
        }
        setAiError(data.error || 'Terjadi kendala saat menghubungi AI. Menggunakan saran standar.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Gagal terhubung ke server AI. Silakan tulis manual atau coba kembali.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setFormError('Deskripsi problem wajib diisi sebelum menyimpan!');
      return;
    }
    setFormError(null);

    onSave({
      problem: problem.trim(),
      identifikasi: identifikasi.trim(),
      correctiveAction: correctiveAction.trim(),
      category,
      priority,
      status,
      pic: pic.trim() || 'Tim Terkait',
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400 border border-indigo-500/30">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialData ? 'Edit Tugas / Problem CAPA' : 'Tambah Problem / Tugas Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi identifikasi akar penyebab (5-Why) dan rencana tindakan perbaikan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {formError && (
            <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 text-xs text-rose-800 font-bold flex items-center justify-between animate-in fade-in duration-200">
              <span>⚠️ {formError}</span>
              <button type="button" onClick={() => setFormError(null)} className="text-rose-600 font-extrabold px-2 cursor-pointer">X</button>
            </div>
          )}
          
          {/* Top Row: Category, Priority, and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Kategori Masalah
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-sm font-medium p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={`w-full text-sm font-bold p-2 border-2 rounded-lg focus:ring-2 focus:outline-none ${
                  priority === 'Tinggi'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : priority === 'Sedang'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="Tinggi">🔥 Prioritas Tinggi (Urgent)</option>
                <option value="Sedang">⚡ Prioritas Sedang (Normal)</option>
                <option value="Rendah">📌 Prioritas Rendah (Rutin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Status Pengerjaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={`w-full text-sm font-bold p-2 border-2 rounded-lg focus:ring-2 focus:outline-none ${
                  status === 'open' 
                    ? 'bg-red-50 border-red-300 text-red-800' 
                    : status === 'on_progress' 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <option value="open">🔴 Open</option>
                <option value="on_progress">🟡 On Progress</option>
                <option value="close">🟢 Close</option>
              </select>
            </div>
          </div>

          {/* Problem Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-800">
                1. Problem (Masalah / Kendala Sehari-hari) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Jelaskan apa yang terjadi / kendala yang dihadapi</span>
            </div>
            <textarea
              rows={2}
              required
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Contoh: Mesin conveyor line 2 berhenti mendadak jam 14:00 saat produksi puncak..."
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium text-slate-800"
            />
          </div>

          {/* AI Helper Button Bar */}
          <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-purple-900/10 p-3.5 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs text-purple-900">
                <span className="font-bold">Bingung menentukan Akar Penyebab (5-Why) atau Solusi?</span>
                <p className="text-slate-600">Klik tombol di kanan agar AI menganalisis & menulis draft otomatis untuk Anda.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateAi}
              disabled={isAiLoading || !problem.trim()}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Sedang Berpikir...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>✨ Generate AI 5-Why & CAPA</span>
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Informasi: </span>
                {aiError}
              </div>
            </div>
          )}

          {/* Identifikasi (Root Cause / 5-Why) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
                2. Identifikasi (Akar Masalah / Root Cause / 5-Why)
              </label>
              <span className="text-xs text-slate-400">Mengapa masalah ini bisa terjadi?</span>
            </div>
            <textarea
              rows={3}
              value={identifikasi}
              onChange={(e) => setIdentifikasi(e.target.value)}
              placeholder="Contoh: Sensor panas berlebih karena kipas pendingin panel listrik penuh debu dan sirkulasi terhambat..."
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm text-slate-800"
            />
          </div>

          {/* Corrective Action */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
                3. Corrective Action (Tindakan Perbaikan & Pencegahan / CAPA)
              </label>
              <span className="text-xs text-slate-400">Langkah nyata apa yang dilakukan agar tidak terulang?</span>
            </div>
            <textarea
              rows={3}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Contoh: 1. Pembersihan menyeluruh filter & kipas panel inverter. 2. Pembuatan jadwal PPM mingguan..."
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm text-slate-800"
            />
          </div>

          {/* Bottom Row: PIC and Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Contoh: Budi (Teknisi Maintenance)"
                className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Target Tanggal Selesai
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Catatan / Update Progress (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Menunggu suku cadang dari vendor tiba hari Rabu..."
              className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
            />
          </div>

        </form>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{initialData ? 'Simpan Perubahan' : 'Tambah Tugas Sekarang'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
