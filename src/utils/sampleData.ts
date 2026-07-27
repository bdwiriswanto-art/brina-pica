import { ProblemItem, TaskStatus } from '../types';

export const STORAGE_KEY = 'daily_problem_capa_tracker_v1';

export const SAMPLE_PROBLEMS: ProblemItem[] = [
  {
    id: 'prob-101',
    problem: 'Mesin conveyor line 2 berhenti mendadak setiap jam 14:00 saat beban puncak produksi.',
    identifikasi: 'Sensor panas berlebih (overheat) karena kipas pendingin pada panel inverter listrik penuh dengan tumpukan debu dan sirkulasi udara terhambat.',
    correctiveAction: '1. Pembersihan menyeluruh filter & kipas panel inverter.\n2. Pembuatan jadwal maintenance mingguan (PPM) untuk pengecekan suhu panel listrik.',
    status: 'on_progress',
    category: 'Mesin & Peralatan',
    priority: 'Tinggi',
    pic: 'Budi (Teknisi Maintenance)',
    targetDate: getRelativeDate(2),
    createdAt: getRelativeDateTime(-3),
    updatedAt: getRelativeDateTime(-1),
    notes: 'Kipas cadangan sudah dipesan dari supplier, sedang menunggu pengantaran besok pagi.',
    history: [
      {
        id: 'hist-1',
        timestamp: getRelativeDateTime(-3),
        action: 'Tugas dilaporkan oleh operator line 2',
        newStatus: 'open'
      },
      {
        id: 'hist-2',
        timestamp: getRelativeDateTime(-1),
        action: 'Status diubah ke On Progress - Teknisi mulai pengecekan & pembongkaran panel',
        prevStatus: 'open',
        newStatus: 'on_progress'
      }
    ]
  },
  {
    id: 'prob-102',
    problem: 'Keterlambatan rekapitulasi laporan stock opname mingguan dari gudang bahan baku.',
    identifikasi: 'Formulir pencatatan barang masuk/keluar masih dicatat manual di kertas faktur dan harus diketik ulang satu per satu ke tabel Excel oleh admin gudang.',
    correctiveAction: '1. Implementasi template Google Sheets bersama dengan validasi barcode scanner sederhana.\n2. Pelatihan 30 menit untuk 2 orang admin gudang cara input langsung ke sistem.',
    status: 'close',
    category: 'Operasional',
    priority: 'Sedang',
    pic: 'Siti Rahma (Admin Gudang)',
    targetDate: getRelativeDate(-1),
    createdAt: getRelativeDateTime(-5),
    updatedAt: getRelativeDateTime(0),
    notes: 'Sistem Google Sheets sudah live dan diverifikasi oleh manajer logistik. Waktu rekap berkurang dari 4 jam menjadi 15 menit.',
    history: [
      {
        id: 'hist-3',
        timestamp: getRelativeDateTime(-5),
        action: 'Masalah dicatat saat evaluasi KPI mingguan',
        newStatus: 'open'
      },
      {
        id: 'hist-4',
        timestamp: getRelativeDateTime(-3),
        action: 'Mulai pembuatan template dan uji coba scanner',
        prevStatus: 'open',
        newStatus: 'on_progress'
      },
      {
        id: 'hist-5',
        timestamp: getRelativeDateTime(0),
        action: 'Tugas selesai (Closed) & verifikasi berhasil',
        prevStatus: 'on_progress',
        newStatus: 'close',
        note: 'Sistem berjalan lancar selama 3 hari berturut-turut'
      }
    ]
  },
  {
    id: 'prob-103',
    problem: 'Suhu ruangan server IT mencapai 29°C (melebihi batas aman maksimal 24°C), berisiko server hang.',
    identifikasi: 'AC unit nomor 1 mengalami kebocoran gas freon pada sambungan pipa luar, dan kompresor mati karena indikator tekanan rendah (low pressure switch error).',
    correctiveAction: '1. Panggil vendor servis AC darurat untuk pengelasan pipa & isi ulang freon.\n2. Pasang sensor suhu IoT dengan alarm notifikasi otomatis ke Telegram/WhatsApp IT Support jika suhu > 25°C.',
    status: 'open',
    category: 'IT & Sistem',
    priority: 'Tinggi',
    pic: 'Andri (IT Infrastructure)',
    targetDate: getRelativeDate(1),
    createdAt: getRelativeDateTime(0),
    updatedAt: getRelativeDateTime(0),
    notes: 'Sementara mengaktifkan blower eksternal dan membuka pintu darurat dengan pengawasan security.',
    history: [
      {
        id: 'hist-6',
        timestamp: getRelativeDateTime(0),
        action: 'Alarm suhu server berbunyi, masalah didaftarkan ke tracker',
        newStatus: 'open'
      }
    ]
  },
  {
    id: 'prob-104',
    problem: 'Kemasan kardus box produk kemasan luar sering penyok saat sampai di gudang distributor luar kota.',
    identifikasi: 'Kualitas ketebalan kertas karton dari supplier batch terbaru di bawah standar spesifikasi (bursting strength turun 15%) dan penumpukan di truk melebihi 5 tingkat.',
    correctiveAction: '1. Kirim surat klaim ketidaksesuaian spesifikasi ke supplier karton box.\n2. Ubah SOP pengiriman truk maksimal tumpukan 4 tingkat & gunakan sudut pengaman karton (edge protector).',
    status: 'on_progress',
    category: 'Kualitas (Quality)',
    priority: 'Tinggi',
    pic: 'Dewi (QC Inspector)',
    targetDate: getRelativeDate(4),
    createdAt: getRelativeDateTime(-4),
    updatedAt: getRelativeDateTime(-2),
    notes: 'Supplier sudah mengakui cacat batch dan akan mengirim ganti rugi 500 pcs box baru lusa.',
    history: [
      {
        id: 'hist-7',
        timestamp: getRelativeDateTime(-4),
        action: 'Laporan keluhan pelanggan diteruskan dari tim sales',
        newStatus: 'open'
      },
      {
        id: 'hist-8',
        timestamp: getRelativeDateTime(-2),
        action: 'Audit sampel box & penandatanganan berita acara dengan supplier',
        prevStatus: 'open',
        newStatus: 'on_progress'
      }
    ]
  },
  {
    id: 'prob-105',
    problem: 'Lampu penerangan area parkir motor karyawan mati 4 titik, gelap saat shift malam pulang jam 23:00.',
    identifikasi: 'Korsleting pada MCB jalur taman karena rembesan air hujan masuk ke dalam junction box yang karet seal-nya sudah mengelupas akibat cuaca.',
    correctiveAction: '1. Ganti junction box dengan tipe IP65 waterproof & ganti kabel yang lapisannya terkelupas.\n2. Ganti 4 lampu yang putus dengan lampu LED outdoor hemat energi.',
    status: 'open',
    category: 'K3 & Safety',
    priority: 'Sedang',
    pic: 'Hendra (GA & Safety)',
    targetDate: getRelativeDate(2),
    createdAt: getRelativeDateTime(-1),
    updatedAt: getRelativeDateTime(-1),
    notes: 'Sudah dipasang garis pengaman di sekitar tiang lampu yang mati.',
    history: [
      {
        id: 'hist-9',
        timestamp: getRelativeDateTime(-1),
        action: 'Laporan dari komandan regu satpam shift malam',
        newStatus: 'open'
      }
    ]
  },
  {
    id: 'prob-106',
    problem: 'Hasil cetak label barcode spesifikasi produk pada printer thermal buram dan sulit dibaca oleh barcode scanner kemasan.',
    identifikasi: 'Thermal printhead kotor karena penumpukan residu lem label dan penekanan (printhead pressure) tidak seimbang antara sisi kiri dan kanan.',
    correctiveAction: '1. Bersihkan printhead dengan swab alkohol 90% secara perlahan.\n2. Lakukan kalibrasi ulang tekanan spring printhead & buat poster bergambar SOP pembersihan mingguan di dekat printer.',
    status: 'close',
    category: 'Mesin & Peralatan',
    priority: 'Sedang',
    pic: 'Budi (Teknisi Maintenance)',
    targetDate: getRelativeDate(-3),
    createdAt: getRelativeDateTime(-6),
    updatedAt: getRelativeDateTime(-3),
    notes: 'Barcode sudah dites scan dengan 3 scanner berbeda, pembacaan 100% akurat dan instan.',
    history: [
      {
        id: 'hist-10',
        timestamp: getRelativeDateTime(-6),
        action: 'Keluhan dari operator packing line 1',
        newStatus: 'open'
      },
      {
        id: 'hist-11',
        timestamp: getRelativeDateTime(-5),
        action: 'Teknisi membersihkan printhead & kalibrasi',
        prevStatus: 'open',
        newStatus: 'on_progress'
      },
      {
        id: 'hist-12',
        timestamp: getRelativeDateTime(-3),
        action: 'Verifikasi QC lulus, status ditutup (Close)',
        prevStatus: 'on_progress',
        newStatus: 'close'
      }
    ]
  }
];

function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function getRelativeDateTime(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dateStr = d.toISOString().split('T')[0];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

export function loadProblemsFromStorage(): ProblemItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Initialize with sample data if empty
      saveProblemsToStorage(SAMPLE_PROBLEMS);
      return SAMPLE_PROBLEMS;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SAMPLE_PROBLEMS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load problems from storage:', err);
    return SAMPLE_PROBLEMS;
  }
}

export function saveProblemsToStorage(problems: ProblemItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (err) {
    console.error('Failed to save problems to storage:', err);
  }
}
