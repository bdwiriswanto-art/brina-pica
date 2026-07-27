/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ProblemItem, 
  TaskStatus, 
  FilterState 
} from './types';
import { 
  loadProblemsFromStorage, 
  saveProblemsToStorage, 
  SAMPLE_PROBLEMS 
} from './utils/sampleData';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { FilterBar } from './components/FilterBar';
import { ProblemTable } from './components/ProblemTable';
import { ProblemModal } from './components/ProblemModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { DetailHistoryModal } from './components/DetailHistoryModal';
import { DataManagementModal } from './components/DataManagementModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SaveShareModal } from './components/SaveShareModal';
import { Share2, Download } from 'lucide-react';

export default function App() {
  // Main data state
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: 'all',
    category: 'all',
    priority: 'all',
    sortBy: 'terbaru',
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemItem | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isSaveShareModalOpen, setIsSaveShareModalOpen] = useState(false);

  const [detailProblem, setDetailProblem] = useState<ProblemItem | null>(null);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [sharedDataCandidate, setSharedDataCandidate] = useState<ProblemItem[] | null>(null);

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    return localStorage.getItem("KAIZEN_ACTIVE_ROOM_ID") || "TIM-OPERASIONAL";
  });
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem("KAIZEN_AUTO_SYNC") === "true";
  });

  // Load from local storage on mount and check URL for shared room / data
  useEffect(() => {
    const loaded = loadProblemsFromStorage();
    setProblems(loaded);
    setIsLoaded(true);

    let roomToLoad = activeRoomId;

    // Check for shared_data or room in URL (hash or query)
    try {
      const hashOrSearch = window.location.hash || window.location.search;
      if (hashOrSearch) {
        const params = new URLSearchParams(hashOrSearch.replace(/^#/, '?'));
        
        // Check Room ID first (Live Cloud Sync)
        const r = params.get('room');
        if (r && r.trim()) {
          roomToLoad = r.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
          setActiveRoomId(roomToLoad);
          localStorage.setItem("KAIZEN_ACTIVE_ROOM_ID", roomToLoad);
        }

        // Check offline snapshot shared_data
        const sharedStr = params.get('shared_data') || params.get('data');
        if (sharedStr) {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedStr))));
          if (Array.isArray(decoded) && decoded.length > 0 && decoded[0].id && decoded[0].problem) {
            setSharedDataCandidate(decoded);
          }
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data dari Link Share:', e);
    }

    // Fetch live room data from server
    if (roomToLoad) {
      fetch(`/api/rooms/${roomToLoad}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.roomData && Array.isArray(data.roomData.problems)) {
            setProblems(data.roomData.problems);
            saveProblemsToStorage(data.roomData.problems);
            const timeStr = new Date(data.roomData.updatedAt || Date.now()).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setLastCloudSync(timeStr);
          }
        })
        .catch(err => {
          console.warn("Could not fetch cloud room data:", err);
        });
    }
  }, []);

  // Save to local storage whenever problems change
  useEffect(() => {
    if (isLoaded) {
      saveProblemsToStorage(problems);
    }
  }, [problems, isLoaded]);

  const handleSaveToCloud = async (customRoomId?: string): Promise<{ success: boolean; roomId?: string; error?: string }> => {
    const targetRoom = (customRoomId || activeRoomId || "TIM-OPERASIONAL").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
    setIsSavingCloud(true);
    try {
      const res = await fetch("/api/rooms/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: targetRoom,
          problems,
          lastUpdatedBy: "PIC User"
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveRoomId(targetRoom);
        localStorage.setItem("KAIZEN_ACTIVE_ROOM_ID", targetRoom);
        const timeStr = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastCloudSync(timeStr);
        return { success: true, roomId: targetRoom };
      } else {
        throw new Error(data.error || "Gagal menyimpan ke server");
      }
    } catch (err: any) {
      console.error("Cloud save error:", err);
      return { success: false, error: err.message || "Network error" };
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setIsAutoSyncEnabled(enabled);
    localStorage.setItem("KAIZEN_AUTO_SYNC", enabled ? "true" : "false");
    if (enabled) {
      handleSaveToCloud();
    }
  };

  // Debounced auto-save when problems change if auto-sync is enabled
  useEffect(() => {
    if (isAutoSyncEnabled && activeRoomId && problems.length > 0 && isLoaded) {
      const timer = setTimeout(() => {
        handleSaveToCloud(activeRoomId);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [problems, isAutoSyncEnabled, activeRoomId, isLoaded]);

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    return problems
      .filter((item) => {
        // Search filter
        if (filter.search.trim() !== '') {
          const q = filter.search.toLowerCase();
          const matchProblem = item.problem?.toLowerCase().includes(q);
          const matchIden = item.identifikasi?.toLowerCase().includes(q);
          const matchCapa = item.correctiveAction?.toLowerCase().includes(q);
          const matchPic = item.pic?.toLowerCase().includes(q);
          if (!matchProblem && !matchIden && !matchCapa && !matchPic) return false;
        }

        // Status filter
        if (filter.status !== 'all' && item.status !== filter.status) {
          return false;
        }

        // Category filter
        if (filter.category !== 'all' && item.category !== filter.category) {
          return false;
        }

        // Priority filter
        if (filter.priority !== 'all' && item.priority !== filter.priority) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'terbaru') {
          return b.createdAt.localeCompare(a.createdAt);
        } else if (filter.sortBy === 'terlama') {
          return a.createdAt.localeCompare(b.createdAt);
        } else if (filter.sortBy === 'prioritas') {
          const pVal = (p: string) => (p === 'Tinggi' ? 3 : p === 'Sedang' ? 2 : 1);
          return pVal(b.priority) - pVal(a.priority);
        } else if (filter.sortBy === 'target_terdekat') {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return a.targetDate.localeCompare(b.targetDate);
        }
        return 0;
      });
  }, [problems, filter]);

  // Status and Priority statistics counts
  const stats = useMemo(() => {
    const total = problems.length;
    const open = problems.filter((p) => p.status === 'open').length;
    const onProgress = problems.filter((p) => p.status === 'on_progress').length;
    const close = problems.filter((p) => p.status === 'close').length;

    const prioTinggi = problems.filter((p) => p.priority === 'Tinggi').length;
    const prioSedang = problems.filter((p) => p.priority === 'Sedang').length;
    const prioRendah = problems.filter((p) => p.priority === 'Rendah').length;

    return { total, open, onProgress, close, prioTinggi, prioSedang, prioRendah };
  }, [problems]);

  // Handlers
  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setProblems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.status === newStatus) return item;

        const nowStr = getNowFormatted();
        const actionText = `Status pengerjaan diubah dari ${item.status.toUpperCase()} menjadi ${newStatus.toUpperCase()}`;

        const newHistory = [
          ...item.history,
          {
            id: `hist-${Date.now()}`,
            timestamp: nowStr,
            action: actionText,
            prevStatus: item.status,
            newStatus: newStatus,
          },
        ];

        return {
          ...item,
          status: newStatus,
          updatedAt: nowStr,
          history: newHistory,
        };
      })
    );

    // If detail modal is currently showing this problem, update it as well
    if (detailProblem && detailProblem.id === id) {
      setDetailProblem((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
          updatedAt: getNowFormatted(),
          history: [
            ...prev.history,
            {
              id: `hist-${Date.now()}`,
              timestamp: getNowFormatted(),
              action: `Status diubah menjadi ${newStatus.toUpperCase()}`,
              prevStatus: prev.status,
              newStatus: newStatus,
            },
          ],
        };
      });
    }
  };

  const handleAddOrEditProblem = (data: Partial<ProblemItem>) => {
    const nowStr = getNowFormatted();

    if (editingProblem) {
      // Edit existing
      setProblems((prev) =>
        prev.map((item) => {
          if (item.id !== editingProblem.id) return item;

          const hasStatusChanged = item.status !== data.status;
          const historyItem = hasStatusChanged
            ? {
                id: `hist-${Date.now()}`,
                timestamp: nowStr,
                action: `Diedit oleh user (Status berubah dari ${item.status.toUpperCase()} ke ${data.status?.toUpperCase()})`,
                prevStatus: item.status,
                newStatus: data.status,
              }
            : {
                id: `hist-${Date.now()}`,
                timestamp: nowStr,
                action: 'Tugas diperbarui / diedit detailnya',
              };

          return {
            ...item,
            ...data,
            id: item.id,
            updatedAt: nowStr,
            history: [...item.history, historyItem],
          } as ProblemItem;
        })
      );
    } else {
      // Add new problem
      const newId = `prob-${Date.now().toString().slice(-4)}`;
      const newItem: ProblemItem = {
        id: newId,
        problem: data.problem || 'Tanpa Judul Problem',
        identifikasi: data.identifikasi || '',
        correctiveAction: data.correctiveAction || '',
        status: data.status || 'open',
        category: data.category || 'Operasional',
        priority: data.priority || 'Sedang',
        pic: data.pic || 'Tim Terkait',
        targetDate: data.targetDate || getTargetDateDefault(),
        createdAt: nowStr,
        updatedAt: nowStr,
        notes: data.notes || '',
        history: [
          {
            id: `hist-${Date.now()}`,
            timestamp: nowStr,
            action: 'Tugas / Problem baru didaftarkan ke sistem',
            newStatus: data.status || 'open',
          },
        ],
      };

      setProblems((prev) => [newItem, ...prev]);
    }

    setEditingProblem(null);
  };

  const handleDeleteProblem = (id: string) => {
    setDeleteTargetIds([id]);
  };

  const handleDeleteMultipleProblems = (ids: string[]) => {
    setDeleteTargetIds(ids);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIds.length === 0) return;
    setProblems((prev) => prev.filter((item) => !deleteTargetIds.includes(item.id)));
    if (detailProblem && deleteTargetIds.includes(detailProblem.id)) {
      setDetailProblem(null);
    }
    setDeleteTargetIds([]);
  };

  const handleClearAllProblems = () => {
    setProblems([]);
    setDetailProblem(null);
  };

  const handleAcceptSharedData = () => {
    if (!sharedDataCandidate) return;
    setProblems(sharedDataCandidate);
    saveProblemsToStorage(sharedDataCandidate);
    setSharedDataCandidate(null);
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
    alert(`🎉 Berhasil memuat dan menyimpan ${sharedDataCandidate.length} problem dari Link Share!`);
  };

  const handleIgnoreSharedData = () => {
    setSharedDataCandidate(null);
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
  };

  const handleAddNote = (id: string, noteText: string) => {
    const nowStr = getNowFormatted();
    setProblems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newHistory = [
          ...item.history,
          {
            id: `hist-${Date.now()}`,
            timestamp: nowStr,
            action: 'Catatan perkembangan baru ditambahkan',
            note: noteText,
          },
        ];
        return {
          ...item,
          notes: noteText,
          updatedAt: nowStr,
          history: newHistory,
        };
      })
    );

    if (detailProblem && detailProblem.id === id) {
      setDetailProblem((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          notes: noteText,
          updatedAt: nowStr,
          history: [
            ...prev.history,
            {
              id: `hist-${Date.now()}`,
              timestamp: nowStr,
              action: 'Catatan perkembangan baru ditambahkan',
              note: noteText,
            },
          ],
        };
      });
    }
  };

  const handleOpenEditModal = (problem: ProblemItem) => {
    setEditingProblem(problem);
    setIsAddModalOpen(true);
  };

  const handleOpenAiForProblem = (problem: ProblemItem) => {
    setEditingProblem(problem);
    setIsAddModalOpen(true);
  };

  const handleImportProblems = (imported: ProblemItem[]) => {
    setProblems(imported);
  };

  const handleResetToSample = () => {
    setProblems(SAMPLE_PROBLEMS);
    saveProblemsToStorage(SAMPLE_PROBLEMS);
  };

  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleResetFilter = () => {
    setFilter({
      search: '',
      status: 'all',
      category: 'all',
      priority: 'all',
      sortBy: 'terbaru',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-[#f8fafc] to-[#f8fafc] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white p-3 sm:p-6 lg:p-8 gap-6 max-w-[1600px] mx-auto w-full">
      
      {/* Shared Data Import Banner */}
      {sharedDataCandidate && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-indigo-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-400/20 rounded-2xl border border-amber-400/40 shrink-0">
              <Share2 className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Mendeteksi Data dari Link Share! 🚀
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase">
                  {sharedDataCandidate.length} Problem
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 mt-0.5 max-w-2xl">
                Anda membuka tautan yang berisi data problem dari pengguna lain. Apakah Anda ingin mengimpor dan menyimpan data ini ke dalam tracker Anda?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={handleIgnoreSharedData}
              className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white rounded-xl border border-white/15 transition-all cursor-pointer"
            >
              Tolak / Abaikan
            </button>
            <button
              onClick={handleAcceptSharedData}
              className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-xl shadow-lg shadow-amber-400/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Simpan & Muat Data ({sharedDataCandidate.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <Header
        onOpenAddModal={() => {
          setEditingProblem(null);
          setIsAddModalOpen(true);
        }}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenSaveShareModal={() => setIsSaveShareModalOpen(true)}
        totalCount={stats.total}
        openCount={stats.open}
        onProgressCount={stats.onProgress}
        closeCount={stats.close}
        activeRoomId={activeRoomId}
        onSaveToCloud={() => handleSaveToCloud()}
        isSavingCloud={isSavingCloud}
        lastCloudSync={lastCloudSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        
        {/* Statistics Dashboard Cards */}
        <StatsDashboard
          total={stats.total}
          open={stats.open}
          onProgress={stats.onProgress}
          close={stats.close}
          prioTinggi={stats.prioTinggi}
          prioSedang={stats.prioSedang}
          prioRendah={stats.prioRendah}
          onSelectStatusFilter={(status) => handleFilterChange({ status })}
          onSelectPriorityFilter={(priority) => handleFilterChange({ priority })}
          activeStatus={filter.status}
          activePriority={filter.priority}
        />

        {/* Filter Bar */}
        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          onResetFilter={handleResetFilter}
        />

        {/* Core Table Section */}
        <ProblemTable
          problems={filteredProblems}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteProblem}
          onDeleteMultiple={handleDeleteMultipleProblems}
          onViewDetail={(item) => setDetailProblem(item)}
          onOpenAiForProblem={handleOpenAiForProblem}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md text-slate-500 py-5 px-6 rounded-3xl border border-slate-200/80 text-xs shadow-md shadow-slate-100 mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>Problem & CAPA Tracker Harian</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Sync
            </span>
          </div>
          <div className="text-slate-500">
            Dilengkapi <strong className="text-indigo-600 font-bold">AI Assistant</strong> untuk analisis akar masalah 5-Why & solusi CAPA.
          </div>
        </div>
      </footer>

      {/* Modals */}
      
      {/* 1. Add / Edit Problem Modal */}
      <ProblemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleAddOrEditProblem}
        initialData={editingProblem}
      />

      {/* 2. AI Assistant Consultation Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSaveDirectToTable={(data) => {
          handleAddOrEditProblem(data);
        }}
      />

      {/* 3. Detail & Timeline History Modal */}
      <DetailHistoryModal
        problem={detailProblem}
        onClose={() => setDetailProblem(null)}
        onAddNote={handleAddNote}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteProblem}
      />

      {/* 4. Data Management (Export/Import/Reset) Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        problems={problems}
        onImportProblems={handleImportProblems}
        onResetToSample={handleResetToSample}
        onClearAll={handleClearAllProblems}
      />

      {/* 5. Custom Manual Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTargetIds.length > 0}
        onClose={() => setDeleteTargetIds([])}
        onConfirm={handleConfirmDelete}
        itemCount={deleteTargetIds.length}
        title={deleteTargetIds.length > 1 ? `Hapus ${deleteTargetIds.length} Problem Terpilih` : 'Hapus Problem Ini'}
      />

      {/* 6. Simpan & Share Modal */}
      <SaveShareModal
        isOpen={isSaveShareModalOpen}
        onClose={() => setIsSaveShareModalOpen(false)}
        problems={problems}
        activeRoomId={activeRoomId}
        onSaveToCloud={handleSaveToCloud}
        isSavingCloud={isSavingCloud}
        lastCloudSync={lastCloudSync}
        isAutoSyncEnabled={isAutoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
      />

    </div>
  );
}

// Helper functions for dates
function getNowFormatted(): string {
  const d = new Date();
  const dateStr = d.toISOString().split('T')[0];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

function getTargetDateDefault(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}
