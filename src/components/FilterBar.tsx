import React from 'react';
import { Search, ArrowUpDown, X, Tag, Filter, SlidersHorizontal } from 'lucide-react';
import { FilterState, TaskCategory, TaskPriority } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  onResetFilter: () => void;
}

const CATEGORIES: ('all' | TaskCategory)[] = [
  'all',
  'Operasional',
  'Mesin & Peralatan',
  'Kualitas (Quality)',
  'K3 & Safety',
  'IT & Sistem',
  'Umum & Pribadi',
];

const PRIORITIES: ('all' | TaskPriority)[] = ['all', 'Tinggi', 'Sedang', 'Rendah'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
}) => {
  const isFiltered =
    filter.search !== '' ||
    filter.status !== 'all' ||
    filter.category !== 'all' ||
    filter.priority !== 'all';

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md shadow-slate-100 transition-all">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        
        {/* Search Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-indigo-500" />
          </div>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Cari masalah, akar penyebab 5-Why, solusi CAPA, atau PIC..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Reset */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Category */}
          <div className="flex items-center gap-1">
            <select
              value={filter.category}
              onChange={(e) => onFilterChange({ category: e.target.value as any })}
              className="text-xs sm:text-sm font-bold py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-700 cursor-pointer transition-all shadow-2xs"
            >
              <option value="all">📁 Semua Kategori</option>
              {CATEGORIES.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1">
            <select
              value={filter.priority}
              onChange={(e) => onFilterChange({ priority: e.target.value as any })}
              className={`text-xs sm:text-sm font-bold py-3 px-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer transition-all shadow-2xs ${
                filter.priority === 'Tinggi'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/50'
                  : filter.priority === 'Sedang'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-400/50'
                  : filter.priority === 'Rendah'
                  ? 'bg-slate-100 text-slate-700 border-slate-300 ring-2 ring-slate-400/50'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              <option value="all">⚡ Semua Prioritas</option>
              <option value="Tinggi">🔥 Prioritas Tinggi</option>
              <option value="Sedang">⚡ Prioritas Sedang</option>
              <option value="Rendah">📌 Prioritas Rendah</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={filter.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="text-xs sm:text-sm font-bold py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-700 cursor-pointer transition-all shadow-2xs"
            >
              <option value="terbaru">⏳ Terbaru Dibuat</option>
              <option value="terlama">⏳ Terlama Dibuat</option>
              <option value="prioritas">🔥 Prioritas Tertinggi</option>
              <option value="target_terdekat">🎯 Target Terdekat</option>
            </select>
          </div>

          {/* Reset filter button */}
          {isFiltered && (
            <button
              onClick={onResetFilter}
              className="text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Hapus semua filter"
            >
              <X className="w-4 h-4" /> Reset Filter
            </button>
          )}

        </div>

      </div>
    </div>
  );
};



