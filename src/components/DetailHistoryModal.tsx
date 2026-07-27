import React, { useState } from 'react';
import { ProblemItem, TaskStatus } from '../types';
import { X, History, Clock, User, Calendar, Tag, ShieldAlert, CheckCircle2, MessageSquareText, Send, Trash2 } from 'lucide-react';

interface DetailHistoryModalProps {
  problem: ProblemItem | null;
  onClose: () => void;
  onAddNote: (id: string, note: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onDelete?: (id: string) => void;
}

export const DetailHistoryModal: React.FC<DetailHistoryModalProps> = ({
  problem,
  onClose,
  onAddNote,
  onStatusChange,
  onDelete,
}) => {
  const [newNote, setNewNote] = useState('');

  if (!problem) return null;

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(problem.id, newNote.trim());
    setNewNote('');
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-400 font-extrabold';
      case 'on_progress':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400 font-extrabold';
      case 'close':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400 font-extrabold';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'open': return '🔴 OPEN';
      case 'on_progress': return '🟡 ON PROGRESS';
      case 'close': return '🟢 CLOSE';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400 border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Detail & Riwayat Tugas</h2>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  ID: {problem.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lacak jejak waktu, perubahan status, dan catatan perkembangan perbaikan
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

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Info Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                  📁 {problem.category}
                </span>
                <span>•</span>
                <span className="font-bold text-slate-700">Prioritas: {problem.priority}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> PIC: <strong>{problem.pic || '-'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Target: <strong>{problem.targetDate || '-'}</strong>
                </span>
              </div>
            </div>

            {/* Quick Status Selector in Detail Modal */}
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Status Saat Ini:</span>
              <select
                value={problem.status}
                onChange={(e) => onStatusChange(problem.id, e.target.value as TaskStatus)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer ${getStatusStyle(problem.status)}`}
              >
                <option value="open">🔴 Open</option>
                <option value="on_progress">🟡 On Progress</option>
                <option value="close">🟢 Close</option>
              </select>
            </div>
          </div>

          {/* Core Fields */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Masalah / Kendala Sehari-hari
              </h4>
              <p className="text-sm sm:text-base font-bold text-slate-900 bg-white p-3 rounded-xl border border-slate-200 leading-snug">
                {problem.problem}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center gap-1">
                🔍 Identifikasi (Akar Masalah / 5-Why)
              </h4>
              <div className="text-sm text-slate-800 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100 whitespace-pre-line leading-relaxed">
                {problem.identifikasi || <span className="italic text-slate-400">Belum diidentifikasi</span>}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1">
                ✅ Corrective Action (Tindakan Perbaikan)
              </h4>
              <div className="text-sm font-medium text-slate-800 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 whitespace-pre-line leading-relaxed">
                {problem.correctiveAction || <span className="italic text-slate-400">Belum ada tindakan perbaikan yang dicatat</span>}
              </div>
            </div>
          </div>

          {/* Add Note Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-indigo-600" /> Tambah Catatan / Update Progress
            </h4>
            <form onSubmit={handleSendNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Tulis update progress baru untuk tim (misal: Suku cadang sudah tiba di gudang)..."
                className="flex-1 text-xs sm:text-sm p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan Log</span>
              </button>
            </form>
            {problem.notes && (
              <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                <strong className="text-slate-800">Catatan Terakhir: </strong> {problem.notes}
              </div>
            )}
          </div>

          {/* Timeline History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> Riwayat Waktu & Perubahan Status
            </h4>
            
            <div className="relative pl-6 border-l-2 border-indigo-200 space-y-4 my-2">
              {problem.history && problem.history.length > 0 ? (
                problem.history.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative group">
                    {/* Dot */}
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                    
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono font-bold text-slate-600">{hist.timestamp}</span>
                        {hist.newStatus && (
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            hist.newStatus === 'open' ? 'bg-red-100 text-red-700' :
                            hist.newStatus === 'on_progress' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            → {hist.newStatus === 'open' ? 'OPEN' : hist.newStatus === 'on_progress' ? 'ON PROGRESS' : 'CLOSE'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800">{hist.action}</p>
                      {hist.note && (
                        <p className="text-xs text-indigo-700 bg-indigo-50/50 p-1.5 rounded border border-indigo-100 italic">
                          "{hist.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">Belum ada riwayat aktivitas yang tercatat.</div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span>Dibuat pada: {problem.createdAt}</span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(problem.id);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Problem Ini</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
