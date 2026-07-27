import React, { useState, useEffect } from 'react';
import { ProblemItem } from '../types';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  Globe,
  Send,
  Cloud,
  CloudUpload,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SaveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: ProblemItem[];
  activeRoomId?: string;
  onSaveToCloud?: (customRoomId?: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
  isSavingCloud?: boolean;
  lastCloudSync?: string | null;
  isAutoSyncEnabled?: boolean;
  onToggleAutoSync?: (enabled: boolean) => void;
}

// Official Cloud Studio URL
const OFFICIAL_APP_URL = "https://ais-pre-vnc3fgc2zblolk36qffoux-1062940152486.asia-southeast1.run.app";

export const SaveShareModal: React.FC<SaveShareModalProps> = ({
  isOpen,
  onClose,
  problems,
  activeRoomId = 'TIM-OPERASIONAL',
  onSaveToCloud,
  isSavingCloud = false,
  lastCloudSync = null,
  isAutoSyncEnabled = false,
  onToggleAutoSync,
}) => {
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedDataUrl, setCopiedDataUrl] = useState(false);
  const [copiedReportText, setCopiedReportText] = useState(false);
  const [copiedLiveUrl, setCopiedLiveUrl] = useState(false);
  
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [roomInput, setRoomInput] = useState(activeRoomId);
  const [liveShareUrl, setLiveShareUrl] = useState<string | null>(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopiedAppUrl(false);
      setCopiedDataUrl(false);
      setCopiedReportText(false);
      setCopiedLiveUrl(false);
      setGeneratedShareUrl(null);
      setRoomInput(activeRoomId || 'TIM-OPERASIONAL');
      const baseUrl = window.location.origin && window.location.origin !== 'null' 
        ? window.location.origin + window.location.pathname 
        : OFFICIAL_APP_URL;
      setLiveShareUrl(`${baseUrl.replace(/\/$/, '')}/#room=${(activeRoomId || 'TIM-OPERASIONAL').toUpperCase()}`);
    }
  }, [isOpen, activeRoomId]);

  if (!isOpen) return null;

  const handleSaveLiveCloud = async () => {
    if (!onSaveToCloud || !roomInput.trim()) return;
    const cleanRoom = roomInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
    const result = await onSaveToCloud(cleanRoom);
    if (result.success) {
      const baseUrl = window.location.origin && window.location.origin !== 'null' 
        ? window.location.origin + window.location.pathname 
        : OFFICIAL_APP_URL;
      setLiveShareUrl(`${baseUrl.replace(/\/$/, '')}/#room=${cleanRoom}`);
    } else {
      alert("⚠️ Gagal menyimpan ke Cloud: " + (result.error || "Unknown error"));
    }
  };

  const handleCopyLiveUrl = () => {
    if (!liveShareUrl) return;
    navigator.clipboard.writeText(liveShareUrl);
    setCopiedLiveUrl(true);
    setTimeout(() => setCopiedLiveUrl(false), 2500);
  };

  // Safe UTF-8 to Base64 encoder
  const encodeDataForUrl = (data: ProblemItem[]): string => {
    try {
      const jsonStr = JSON.stringify(data);
      return btoa(unescape(encodeURIComponent(jsonStr)));
    } catch (e) {
      console.error('Failed to encode data for URL:', e);
      return '';
    }
  };

  const handleGenerateDataUrl = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const encoded = encodeDataForUrl(problems);
      // Use clean URL with hash parameter
      const baseUrl = window.location.origin && window.location.origin !== 'null' 
        ? window.location.origin + window.location.pathname 
        : OFFICIAL_APP_URL;
      
      const fullUrl = `${baseUrl.replace(/\/$/, '')}/#shared_data=${encoded}`;
      setGeneratedShareUrl(fullUrl);
      setIsGenerating(false);
    }, 400);
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(OFFICIAL_APP_URL);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  const handleCopyDataUrl = () => {
    if (!generatedShareUrl) return;
    navigator.clipboard.writeText(generatedShareUrl);
    setCopiedDataUrl(true);
    setTimeout(() => setCopiedDataUrl(false), 2500);
  };

  const handleDownloadBackupFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `problem-capa-backup-${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyWhatsAppReport = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const openCount = problems.filter(p => p.status === 'open').length;
    const progressCount = problems.filter(p => p.status === 'on_progress').length;
    const closeCount = problems.filter(p => p.status === 'close').length;

    let text = `📊 *LAPORAN PROBLEM & CAPA TRACKER HARIAN*\n`;
    text += `📅 Tanggal: ${today}\n`;
    text += `📈 Total: ${problems.length} | 🔴 Open: ${openCount} | 🟡 On Progress: ${progressCount} | 🟢 Closed: ${closeCount}\n\n`;

    const activeProblems = problems.filter(p => p.status !== 'close');
    if (activeProblems.length > 0) {
      text += `*🔥 DAFTAR PROBLEM AKTIF / URGENT:*\n`;
      activeProblems.forEach((p, idx) => {
        const prioIcon = p.priority === 'Tinggi' ? '🔴' : p.priority === 'Sedang' ? '🟡' : '🟢';
        text += `${idx + 1}. ${prioIcon} *[${p.priority}]* ${p.problem}\n`;
        text += `   👤 PIC: ${p.pic || '-'} | 🎯 Target: ${p.targetDate || '-'}\n`;
        text += `   📌 Status: *${p.status === 'open' ? 'OPEN' : 'ON PROGRESS'}*\n`;
        if (p.correctiveAction) {
          const firstAction = p.correctiveAction.split('\n')[0].replace(/^[0-9+-\.\s]+/, '');
          text += `   🔧 CAPA: ${firstAction}...\n`;
        }
        text += `\n`;
      });
    } else {
      text += `✅ *Semua problem saat ini berstatus CLOSED! Luar biasa!*\n\n`;
    }

    text += `🌐 *Link Aplikasi Tracker:* ${OFFICIAL_APP_URL}`;

    navigator.clipboard.writeText(text);
    setCopiedReportText(true);
    setTimeout(() => setCopiedReportText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/15">
              <Share2 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <span>Simpan & Share Tracker</span>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {problems.length} Item
                </span>
              </h3>
              <p className="text-xs text-indigo-200">Bagikan tautan aplikasi atau simpan data Anda saat ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          
          {/* OPTION 1: LIVE CLOUD SYNC (Auto-Update) */}
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/90 p-5 rounded-2xl border-2 border-blue-500/80 shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600 animate-pulse" />
                <span>1. Link Share Cloud Auto-Update (Live Sync)</span>
              </h4>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                ⭐ REKOMENDASI UTAMA
              </span>
            </div>
            <p className="text-xs text-blue-900/90 leading-relaxed">
              Ingin siapa pun yang membuka link selalu melihat <strong>update terbaru secara otomatis</strong> setiap kali Anda menekan tombol Simpan? Gunakan Ruangan Cloud ini:
            </p>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-blue-900">
                Nama Ruangan / Kode Kerja (Room ID):
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '-'))}
                  placeholder="Contoh: TIM-OPERASIONAL atau KAIZEN-01"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-blue-300 rounded-xl text-xs font-mono font-bold text-blue-950 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 uppercase"
                />
                <button
                  onClick={handleSaveLiveCloud}
                  disabled={isSavingCloud || !roomInput.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isSavingCloud ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4 text-amber-300" />
                      <span>💾 Simpan & Aktifkan Link Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {liveShareUrl && (
              <div className="space-y-3 pt-2 border-t border-blue-200/60 animate-in fade-in duration-200">
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-extrabold text-emerald-900">✅ Berhasil Disimpan ke Server Cloud!</span>
                    <span className="font-normal text-emerald-800">Siapa pun yang membuka link di bawah akan otomatis memuat {problems.length} problem dari ruangan <strong>[{roomInput}]</strong> dan melihat update terbaru saat Anda klik Simpan!</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveShareUrl}
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold text-blue-950 select-all focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={handleCopyLiveUrl}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      copiedLiveUrl
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    {copiedLiveUrl ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Link Live Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Link Live</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Auto-Sync Toggle */}
                {onToggleAutoSync && (
                  <div className="pt-1 flex items-center gap-2.5 bg-white/80 p-3 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      id="auto-sync-checkbox"
                      checked={isAutoSyncEnabled}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="w-4 h-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="auto-sync-checkbox" className="text-xs text-blue-950 font-bold cursor-pointer select-none flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Auto-Simpan ke Cloud (Setiap ada perubahan tabel, link otomatis mengupdate ke semua orang!)</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OPTION 2: OFFICIAL APP LINK (No data embedded) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>2. Link Aplikasi Resmi (Tanpa Data / Penyimpanan Lokal)</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-400">Umum & Cepat</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gunakan link ini jika Anda ingin membagikan aplikasi ke rekan kerja atau atasan agar mereka dapat membuka aplikasi di HP/Laptop mereka (dengan penyimpanan lokal masing-masing):
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={OFFICIAL_APP_URL}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                onClick={handleCopyAppUrl}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  copiedAppUrl
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {copiedAppUrl ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OPTION 3: SHARE LINK WITH EMBEDDED DATA (Simpan & Share Data) */}
          <div className="bg-gradient-to-br from-purple-50/60 via-slate-50/50 to-purple-50/60 p-5 rounded-2xl border border-purple-200/80 shadow-inner space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <span>3. Link Snapshot Permanen (Offline di dalam URL)</span>
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300">
                Alternatif Tanpa Server
              </span>
            </div>
            <p className="text-xs text-indigo-900/90 leading-relaxed">
              Ingin membuat tautan statis yang membungkus <strong className="text-purple-700">{problems.length} problem saat ini</strong> tanpa perlu koneksi ke server? Tekan tombol di bawah ini:
            </p>

            {!generatedShareUrl ? (
              <button
                onClick={handleGenerateDataUrl}
                disabled={isGenerating || problems.length === 0}
                className="w-full py-3 px-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mempersiapkan Link & Menyimpan Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>⚡ Generate Link Share ({problems.length} Problem Saat Ini)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3 pt-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Link berhasil dibuat! Siap pun yang membuka tautan ini akan diminta untuk memuat {problems.length} problem Anda.</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedShareUrl}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-mono text-purple-950 select-all focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <button
                    onClick={handleCopyDataUrl}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      copiedDataUrl
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                    }`}
                  >
                    {copiedDataUrl ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Link Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Link Data</span>
                      </>
                    )}
                  </button>
                </div>

                {generatedShareUrl.length > 2000 && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span><strong>Catatan:</strong> Karena data cukup banyak, link ini panjang. Jika dikirim via aplikasi yang membatasi teks, gunakan fitur "Simpan File JSON" di bawah.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OPTION 4: SAVE TO FILE & WHATSAPP REPORT */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>4. Simpan File Backup & Laporan WhatsApp / Email</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda juga dapat menyimpan file cadangan ke komputer/HP Anda atau menyalin ringkasan teks otomatis untuk laporan di grup WhatsApp/Email:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleDownloadBackupFile}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>📥 Simpan File Backup (.JSON)</span>
              </button>

              <button
                onClick={handleCopyWhatsAppReport}
                className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl border transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-98 ${
                  copiedReportText
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                {copiedReportText ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Laporan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>💬 Salin Laporan WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100/80 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Semua data tersimpan aman secara offline & real-time</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
