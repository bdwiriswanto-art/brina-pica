import React, { useRef, useState } from 'react';
import { ProblemItem } from '../types';
import { X, Download, Upload, RotateCcw, FileSpreadsheet, FileJson, AlertTriangle, Trash2 } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: ProblemItem[];
  onImportProblems: (imported: ProblemItem[]) => void;
  onResetToSample: () => void;
  onClearAll?: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  problems,
  onImportProblems,
  onResetToSample,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'reset' | 'clear' | 'import';
    message: string;
    data?: ProblemItem[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Kategori',
      'Prioritas',
      'Problem (Masalah)',
      'Identifikasi (Akar Penyebab)',
      'Corrective Action',
      'Status',
      'PIC',
      'Target Date',
      'Tanggal Dibuat',
      'Catatan',
    ];

    const rows = problems.map((item) => [
      item.id,
      item.category,
      item.priority,
      `"${(item.problem || '').replace(/"/g, '""')}"`,
      `"${(item.identifikasi || '').replace(/"/g, '""')}"`,
      `"${(item.correctiveAction || '').replace(/"/g, '""')}"`,
      item.status.toUpperCase(),
      `"${(item.pic || '').replace(/"/g, '""')}"`,
      item.targetDate,
      item.createdAt,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-problem-capa-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(problems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-problem-tracker-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setConfirmAction({
            type: 'import',
            message: `Berhasil membaca ${parsed.length} item tugas dari file backup. Gantikan data saat ini dengan data backup ini?`,
            data: parsed,
          });
        } else {
          setErrorMessage('Format JSON tidak valid! Pastikan file backup yang dipilih sesuai format dari aplikasi ini.');
        }
      } catch (err) {
        setErrorMessage('Gagal memparsing file JSON. Pastikan file tidak rusak.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = () => {
    setConfirmAction({
      type: 'reset',
      message: 'Apakah Anda yakin ingin mereset semua data ke data sampel awal? Data yang belum di-export akan digantikan.',
    });
  };

  const handleConfirmClear = () => {
    setConfirmAction({
      type: 'clear',
      message: 'Apakah Anda yakin ingin MENGHAPUS SEMUA DATA problem secara permanen dan mengosongkan tracker?',
    });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'import' && confirmAction.data) {
      onImportProblems(confirmAction.data);
      onClose();
    } else if (confirmAction.type === 'reset') {
      onResetToSample();
      onClose();
    } else if (confirmAction.type === 'clear' && onClearAll) {
      onClearAll();
      onClose();
    }
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <span>Manajemen Data, Export, & Reset</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-slate-800 text-sm">
          
          {/* Export section */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              1. Export Data ({problems.length} Item)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCsv}
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Export ke CSV (Excel)</span>
              </button>

              <button
                onClick={handleExportJson}
                className="p-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-xl text-indigo-800 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <FileJson className="w-5 h-5 text-indigo-600" />
                <span>Backup ke JSON</span>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              2. Restore / Import dari JSON
            </h4>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-5 h-5 text-slate-600" />
              <span>Pilih File Backup JSON & Restore</span>
            </button>
          </div>

          {/* Reset & Clear section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> 3. Zona Reset & Kosongkan Data
            </h4>

            {errorMessage && (
              <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 text-xs text-rose-800 font-bold flex items-center justify-between">
                <span>⚠️ {errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-rose-600 font-extrabold px-2">X</button>
              </div>
            )}

            {confirmAction ? (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-300 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-2.5 text-rose-900 text-xs font-bold">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-extrabold">Konfirmasi Tindakan</p>
                    <p className="font-normal text-rose-800 mt-1">{confirmAction.message}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeAction}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-800 space-y-3">
                <p>
                  Atur ulang data Anda. Pilih reset ke sampel awal atau kosongkan tabel sepenuhnya jika Anda ingin mulai mengisi dari nol secara manual.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleConfirmReset}
                    className="w-full py-2.5 px-4 bg-white hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-300 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    <span>Reset ke Sampel</span>
                  </button>
                  {onClearAll && (
                    <button
                      onClick={handleConfirmClear}
                      className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Kosongkan Semua Data</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
