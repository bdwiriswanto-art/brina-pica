import React, { useState } from 'react';
import { 
  ProblemItem, 
  TaskStatus, 
  TaskPriority 
} from '../types';
import { 
  Edit3, 
  Trash2, 
  History, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  MessageSquareText,
  ChevronDown
} from 'lucide-react';

interface ProblemTableProps {
  problems: ProblemItem[];
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onEdit: (problem: ProblemItem) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onViewDetail: (problem: ProblemItem) => void;
  onOpenAiForProblem: (problem: ProblemItem) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  onStatusChange,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onViewDetail,
  onOpenAiForProblem,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(problems.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusSelect = (id: string, newStatus: TaskStatus) => {
    setUpdatingId(id);
    onStatusChange(id, newStatus);
    setTimeout(() => {
      setUpdatingId(null);
    }, 400);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Tinggi':
        return { style: 'bg-rose-100 text-rose-900 border-rose-300 font-black shadow-2xs', label: '🔥 Prioritas TINGGI' };
      case 'Sedang':
        return { style: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold', label: '⚡ Prioritas SEDANG' };
      case 'Rendah':
        return { style: 'bg-slate-100 text-slate-700 border-slate-200 font-medium', label: '📌 Prioritas RENDAH' };
    }
  };

  const getStatusBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case 'open':
        return {
          bg: 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300 ring-rose-400',
          label: 'OPEN',
          icon: <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />,
        };
      case 'on_progress':
        return {
          bg: 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 ring-amber-400',
          label: 'ON PROGRESS',
          icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />,
        };
      case 'close':
        return {
          bg: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300 ring-emerald-400',
          label: 'CLOSED',
          icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />,
        };
    }
  };

  if (problems.length === 0) {
    return (
      <div className="py-12">
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500 mb-4 border border-indigo-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Tidak ada data problem yang ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau filter status Anda, atau klik tombol <strong className="text-indigo-600">"+ Tambah Problem"</strong> di atas untuk mencatat kendala baru.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-100 overflow-hidden">
        
        {/* Table Header Info */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold tracking-wide uppercase text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              Daftar Problem & CAPA
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/80 text-indigo-200 border border-indigo-500/30 shadow-inner">
              {problems.length} item ditemukan
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span>⚡ Klik dropdown di kolom status untuk ubah progres</span>
          </div>
        </div>

        {/* Bulk Actions Toolbar for Manual Deletion */}
        {selectedIds.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs shadow-2xs">✓</span>
              <span>{selectedIds.length} problem dipilih untuk dihapus manual</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Batal Pilih
              </button>
              <button
                onClick={() => {
                  onDeleteMultiple?.(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 rounded-xl shadow-md shadow-rose-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>🗑️ Hapus {selectedIds.length} Terpilih Secara Manual</span>
              </button>
            </div>
          </div>
        )}

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={problems.length > 0 && selectedIds.length === problems.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Pilih semua untuk dihapus manual"
                  />
                </th>
                <th className="py-4 px-3 w-12 text-center">No</th>
                <th className="py-4 px-4 w-40">Klasifikasi & Prioritas</th>
                <th className="py-4 px-4 w-64 text-slate-800 font-extrabold">Kendala / Masalah</th>
                <th className="py-4 px-4 w-64 text-slate-800 font-extrabold">Akar Masalah (5-Why)</th>
                <th className="py-4 px-4 w-64 text-slate-800 font-extrabold">Tindakan (CAPA)</th>
                <th className="py-4 px-4 w-44">PIC & Target</th>
                
                {/* Rightmost column explicitly requested by user */}
                <th className="py-4 px-4 w-48 bg-indigo-50/70 text-indigo-950 border-l border-slate-200/80 font-extrabold text-center">
                  🎯 Status (Klik Ubah)
                </th>

                <th className="py-4 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {problems.map((item, idx) => {
                const badge = getStatusBadgeStyle(item.status);
                const isUpdating = updatingId === item.id;
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-indigo-50/20 transition-colors duration-150 ${
                      item.status === 'close' ? 'bg-emerald-50/20' : ''
                    } ${isUpdating ? 'animate-pulse bg-indigo-50/50' : ''} ${
                      isSelected ? 'bg-rose-50/40 hover:bg-rose-50/60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Pilih problem ini untuk dihapus manual"
                      />
                    </td>

                    {/* No */}
                    <td className="py-4 px-3 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Category & Priority */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1.5">
                        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 line-clamp-1">
                          📁 {item.category}
                        </span>
                        <div>
                          <span className={`inline-block text-[10px] px-2.5 py-1 rounded-lg border ${getPriorityBadge(item.priority).style}`}>
                            {getPriorityBadge(item.priority).label}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Problem */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-800 text-sm leading-snug">
                        {item.problem}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                        <span>🕒 Dibuat: {item.createdAt}</span>
                      </div>
                    </td>

                    {/* Identifikasi (Root Cause) */}
                    <td className="py-4 px-4 align-top">
                      {item.identifikasi ? (
                        <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                          {item.identifikasi}
                        </div>
                      ) : (
                        <div className="text-xs italic text-amber-700 bg-amber-50 p-2.5 rounded-2xl border border-amber-200 flex items-center justify-between">
                          <span>Belum diidentifikasi</span>
                          <button
                            onClick={() => onOpenAiForProblem(item)}
                            className="text-[10px] font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3 h-3" /> AI Bantu
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Corrective Action */}
                    <td className="py-4 px-4 align-top">
                      {item.correctiveAction ? (
                        <div className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-line bg-indigo-50/30 p-3 rounded-2xl border border-indigo-100">
                          {item.correctiveAction}
                        </div>
                      ) : (
                        <div className="text-xs italic text-slate-400">
                          Belum ada tindakan yang dicatat.
                        </div>
                      )}
                      {item.notes && (
                        <div className="mt-2 text-[11px] font-medium text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-100 flex items-start gap-1.5">
                          <MessageSquareText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-500" />
                          <span className="line-clamp-2">Catatan: {item.notes}</span>
                        </div>
                      )}
                    </td>

                    {/* PIC & Target Date */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="line-clamp-1">{item.pic || 'Belum ditunjuk'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Target: {item.targetDate || '-'}</span>
                        </div>
                        {item.updatedAt && (
                          <div className="text-[10px] font-medium text-slate-400 pt-1 border-t border-slate-100">
                            Upd: {item.updatedAt}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* RIGHTMOST COLUMN: Pilihan Status (Real-time) */}
                    <td className="py-4 px-4 align-middle bg-slate-50/50 border-l border-slate-100 text-center">
                      <div className="flex flex-col items-center justify-center">
                        
                        {/* Interactive Status Selector Dropdown */}
                        <div className="relative inline-block w-full max-w-[160px]">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusSelect(item.id, e.target.value as TaskStatus)}
                            className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl font-extrabold text-xs tracking-wide cursor-pointer border-2 transition-all shadow-xs focus:outline-none focus:ring-4 text-center ${badge.bg}`}
                            title="Klik untuk langsung mengubah status pengerjaan"
                          >
                            <option value="open" className="bg-rose-50 text-rose-900 font-bold py-1">
                              🔴 OPEN
                            </option>
                            <option value="on_progress" className="bg-amber-50 text-amber-900 font-bold py-1">
                              🟡 ON PROGRESS
                            </option>
                            <option value="close" className="bg-emerald-50 text-emerald-900 font-bold py-1">
                              🟢 CLOSED
                            </option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-700">
                            <ChevronDown className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewDetail(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          title="Lihat Detail Lengkap & Riwayat Status"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                          title="Edit Tugas / Problem Ini"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Tugas Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="font-medium flex flex-wrap items-center gap-2">
            <span>Total: <strong className="text-slate-800">{problems.length}</strong> problem</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-rose-600 font-bold">🔥 Tinggi: {problems.filter(p => p.priority === 'Tinggi').length}</span>
            <span className="text-indigo-600 font-bold">⚡ Sedang: {problems.filter(p => p.priority === 'Sedang').length}</span>
            <span className="text-slate-600 font-bold">📌 Rendah: {problems.filter(p => p.priority === 'Rendah').length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-bold">
            <span className="text-rose-600">🔴 Open: {problems.filter(p => p.status === 'open').length}</span>
            <span className="text-amber-600">🟡 On Progress: {problems.filter(p => p.status === 'on_progress').length}</span>
            <span className="text-emerald-600">🟢 Closed: {problems.filter(p => p.status === 'close').length}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

