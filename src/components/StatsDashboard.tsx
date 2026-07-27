import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Layers, Flame, Zap, Bookmark, TrendingUp } from 'lucide-react';
import { TaskPriority } from '../types';

interface StatsDashboardProps {
  total: number;
  open: number;
  onProgress: number;
  close: number;
  prioTinggi: number;
  prioSedang: number;
  prioRendah: number;
  onSelectStatusFilter: (status: 'all' | 'open' | 'on_progress' | 'close') => void;
  onSelectPriorityFilter: (priority: 'all' | TaskPriority) => void;
  activeStatus: string;
  activePriority: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  total,
  open,
  onProgress,
  close,
  prioTinggi,
  prioSedang,
  prioRendah,
  onSelectStatusFilter,
  onSelectPriorityFilter,
  activeStatus,
  activePriority,
}) => {
  const openPct = total > 0 ? Math.round((open / total) * 100) : 0;
  const progressPct = total > 0 ? Math.round((onProgress / total) * 100) : 0;
  const closePct = total > 0 ? Math.round((close / total) * 100) : 0;

  const tinggiPct = total > 0 ? Math.round((prioTinggi / total) * 100) : 0;
  const sedangPct = total > 0 ? Math.round((prioSedang / total) * 100) : 0;
  const rendahPct = total > 0 ? Math.round((prioRendah / total) * 100) : 0;

  return (
    <section className="py-1 space-y-7">
      
      {/* 1. KLASIFIKASI STATUS PROGRESS */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
              Klasifikasi Status Progress
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              (Klik kartu untuk filter cepat)
            </span>
          </div>
          {activeStatus !== 'all' && (
            <button 
              onClick={() => onSelectStatusFilter('all')} 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer shadow-2xs"
            >
              🔄 Reset Status
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Semua Problem */}
          <div 
            onClick={() => onSelectStatusFilter('all')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activeStatus === 'all' 
                ? 'border-indigo-600 ring-4 ring-indigo-600/15 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 shadow-md' 
                : 'border-slate-200/80 shadow-xs hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
                Semua Status
              </span>
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-slate-800">{total}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                100%
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-full transition-all duration-500" />
            </div>
          </div>

          {/* Card 2: Open */}
          <div 
            onClick={() => onSelectStatusFilter(activeStatus === 'open' ? 'all' : 'open')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activeStatus === 'open' 
                ? 'border-rose-600 ring-4 ring-rose-600/15 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/20 shadow-md' 
                : 'border-slate-200/80 shadow-xs hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                Open
              </span>
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-rose-600">{open}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
                {openPct}%
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${openPct}%` }} />
            </div>
          </div>

          {/* Card 3: On Progress */}
          <div 
            onClick={() => onSelectStatusFilter(activeStatus === 'on_progress' ? 'all' : 'on_progress')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activeStatus === 'on_progress' 
                ? 'border-amber-500 ring-4 ring-amber-500/15 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 shadow-md' 
                : 'border-slate-200/80 shadow-xs hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                On Progress
              </span>
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-amber-600">{onProgress}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
                {progressPct}%
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Card 4: Close */}
          <div 
            onClick={() => onSelectStatusFilter(activeStatus === 'close' ? 'all' : 'close')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activeStatus === 'close' 
                ? 'border-emerald-600 ring-4 ring-emerald-600/15 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 shadow-md' 
                : 'border-slate-200/80 shadow-xs hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Closed
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600">{close}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {closePct}%
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${closePct}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* 2. KLASIFIKASI TINGKAT PRIORITAS */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Flame className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
              Klasifikasi Tingkat Prioritas
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              (Klik untuk filter urgensi penanganan)
            </span>
          </div>
          {activePriority !== 'all' && (
            <button 
              onClick={() => onSelectPriorityFilter('all')} 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer shadow-2xs"
            >
              🔄 Reset Prioritas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Prioritas Tinggi */}
          <div 
            onClick={() => onSelectPriorityFilter(activePriority === 'Tinggi' ? 'all' : 'Tinggi')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activePriority === 'Tinggi'
                ? 'border-rose-600 ring-4 ring-rose-600/15 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/20 shadow-md'
                : 'border-slate-200/80 shadow-xs hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                Prioritas Tinggi
              </span>
              <div className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold">
                {tinggiPct}%
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-600">{prioTinggi}</span>
                <span className="text-xs font-semibold text-slate-400">item darurat</span>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
                🔥 Segera
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${tinggiPct}%` }} />
            </div>
          </div>

          {/* Prioritas Sedang */}
          <div 
            onClick={() => onSelectPriorityFilter(activePriority === 'Sedang' ? 'all' : 'Sedang')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activePriority === 'Sedang'
                ? 'border-indigo-600 ring-4 ring-indigo-600/15 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 shadow-md'
                : 'border-slate-200/80 shadow-xs hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
                Prioritas Sedang
              </span>
              <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold">
                {sedangPct}%
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600">{prioSedang}</span>
                <span className="text-xs font-semibold text-slate-400">item normal</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                ⚡ Reguler
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${sedangPct}%` }} />
            </div>
          </div>

          {/* Prioritas Rendah */}
          <div 
            onClick={() => onSelectPriorityFilter(activePriority === 'Rendah' ? 'all' : 'Rendah')}
            className={`group bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
              activePriority === 'Rendah'
                ? 'border-slate-600 ring-4 ring-slate-600/15 bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-md'
                : 'border-slate-200/80 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-slate-500 shrink-0 group-hover:scale-110 transition-transform" />
                Prioritas Rendah
              </span>
              <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                {rendahPct}%
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-700">{prioRendah}</span>
                <span className="text-xs font-semibold text-slate-400">item rutin</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                📌 Rutin
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-500 h-full rounded-full transition-all duration-500" style={{ width: `${rendahPct}%` }} />
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};




