import React from 'react';
import { PlusCircle, Sparkles, Database, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Clock, Share2, CloudUpload, Cloud } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenAiModal: () => void;
  onOpenDataModal: () => void;
  onOpenSaveShareModal: () => void;
  totalCount?: number;
  openCount?: number;
  onProgressCount?: number;
  closeCount?: number;
  activeRoomId?: string;
  onSaveToCloud?: () => void;
  isSavingCloud?: boolean;
  lastCloudSync?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenAiModal,
  onOpenDataModal,
  onOpenSaveShareModal,
  totalCount = 0,
  openCount = 0,
  onProgressCount = 0,
  closeCount = 0,
  activeRoomId = 'TIM-OPERASIONAL',
  onSaveToCloud,
  isSavingCloud = false,
  lastCloudSync = null,
}) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800/80">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Logo & Title Section */}
        <div className="flex items-start sm:items-center space-x-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 sm:p-4 rounded-2xl shadow-lg shadow-indigo-500/25 text-white flex items-center justify-center shrink-0 border border-indigo-400/30">
            <ShieldAlert className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Problem & CAPA Tracker Harian
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-xs" title="Link Share Live Sync Aktif">
                <Cloud className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Ruang: <strong className="text-white">{activeRoomId || 'TIM-OPERASIONAL'}</strong></span>
                {lastCloudSync && <span className="text-blue-200 text-[10px] font-normal">({lastCloudSync})</span>}
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Catat kendala operasional, analisis akar masalah metode <span className="text-indigo-300 font-semibold">5-Why</span>, & pantau penyelesaian secara terintegrasi.
            </p>

            {/* Quick Status Bar inside Header */}
            {totalCount > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Total: <strong className="text-white">{totalCount}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Open: <strong className="text-rose-200">{openCount}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  On Progress: <strong className="text-amber-200">{onProgressCount}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Closed: <strong className="text-emerald-200">{closeCount}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-purple-400/30 transition-all active:scale-95 cursor-pointer"
            title="Gunakan AI untuk analisis akar masalah & saran perbaikan"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>AI Asisten</span>
          </button>

          <button
            onClick={onOpenDataModal}
            className="inline-flex items-center gap-2 px-3.5 py-3 text-sm font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Export, Import, atau Reset Data"
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Data</span>
          </button>

          <button
            onClick={onOpenSaveShareModal}
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-extrabold rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40 transition-all active:scale-95 cursor-pointer"
            title="Simpan & Bagikan Tautan beserta Data"
          >
            <Share2 className="w-4 h-4 text-slate-950" />
            <span>Simpan & Share</span>
          </button>

          {onSaveToCloud && (
            <button
              onClick={onSaveToCloud}
              disabled={isSavingCloud}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-extrabold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simpan langsung ke server agar siapapun yang membuka link melihat update terbaru!"
            >
              <CloudUpload className={`w-4 h-4 text-amber-300 ${isSavingCloud ? 'animate-spin' : 'animate-bounce'}`} />
              <span>{isSavingCloud ? 'Menyimpan...' : 'Simpan Update Link'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Problem</span>
          </button>
        </div>

      </div>
    </header>
  );
};



