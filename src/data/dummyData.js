// Data dummy untuk simulasi sistem deteksi dini risiko depresi dari teks Twitter/X

export const ringkasan = {
  totalCuitanDianalisis: 18420,
  totalAkunTerpantau: 1342,
  risikoTinggi: 86,
  risikoSedang: 241,
  risikoRendah: 1015,
  akurasiModel: 0.932,
  f1Score: 0.918,
  latensiPipelineMs: 412,
}

// Tren harian jumlah deteksi per level risiko (14 hari terakhir)
export const trenHarian = [
  { tanggal: '09 Jun', tinggi: 4, sedang: 14, rendah: 58 },
  { tanggal: '10 Jun', tinggi: 6, sedang: 17, rendah: 61 },
  { tanggal: '11 Jun', tinggi: 5, sedang: 15, rendah: 55 },
  { tanggal: '12 Jun', tinggi: 8, sedang: 19, rendah: 63 },
  { tanggal: '13 Jun', tinggi: 7, sedang: 22, rendah: 70 },
  { tanggal: '14 Jun', tinggi: 9, sedang: 20, rendah: 66 },
  { tanggal: '15 Jun', tinggi: 6, sedang: 18, rendah: 59 },
  { tanggal: '16 Jun', tinggi: 10, sedang: 24, rendah: 72 },
  { tanggal: '17 Jun', tinggi: 11, sedang: 26, rendah: 75 },
  { tanggal: '18 Jun', tinggi: 9, sedang: 21, rendah: 68 },
  { tanggal: '19 Jun', tinggi: 8, sedang: 19, rendah: 64 },
  { tanggal: '20 Jun', tinggi: 12, sedang: 27, rendah: 80 },
  { tanggal: '21 Jun', tinggi: 13, sedang: 25, rendah: 77 },
  { tanggal: '22 Jun', tinggi: 11, sedang: 23, rendah: 73 },
]

// Distribusi performa tiga model untuk perbandingan
export const performaModel = [
  { model: 'SVM', akurasi: 0.871, f1: 0.852, presisi: 0.860, recall: 0.845 },
  { model: 'Random Forest', akurasi: 0.904, f1: 0.889, presisi: 0.895, recall: 0.883 },
  { model: 'XGBoost', akurasi: 0.932, f1: 0.918, presisi: 0.921, recall: 0.915 },
]

// Daftar cuitan yang sudah diklasifikasi (untuk halaman Riwayat & Detail)
export const daftarCuitan = [
  {
    id: 'TWT-10231',
    akun: '@langit_senja__',
    waktu: '22 Jun 2026, 09:14',
    teks: 'gatau lagi harus gimana, rasanya capek banget tapi ga ada yang nyadar. pengen istirahat aja dari semuanya',
    risiko: 'tinggi',
    skor: 0.91,
    model: 'XGBoost',
    statusTinjau: 'Menunggu tinjauan pakar',
  },
  {
    id: 'TWT-10230',
    akun: '@kopi_dingin21',
    waktu: '22 Jun 2026, 08:52',
    teks: 'deadline numpuk minggu ini, tidur cuma 3 jam tiap hari. badan udah ga karuan',
    risiko: 'sedang',
    skor: 0.64,
    model: 'XGBoost',
    statusTinjau: 'Ditinjau',
  },
  {
    id: 'TWT-10229',
    akun: '@nyalakecil_',
    waktu: '22 Jun 2026, 08:30',
    teks: 'akhirnya kelar juga revisi skripsi bab 3, alhamdulillah dosen pembimbing baik banget',
    risiko: 'rendah',
    skor: 0.12,
    model: 'XGBoost',
    statusTinjau: 'Ditinjau',
  },
  {
    id: 'TWT-10228',
    akun: '@hujan_di_jkt',
    waktu: '22 Jun 2026, 07:58',
    teks: 'kadang ngerasa sendirian banget walau lagi rame-rame sama temen. aneh ya',
    risiko: 'sedang',
    skor: 0.58,
    model: 'Random Forest',
    statusTinjau: 'Menunggu tinjauan pakar',
  },
  {
    id: 'TWT-10227',
    akun: '@senyum_palsu_',
    waktu: '22 Jun 2026, 07:21',
    teks: 'udah cape jujur sama diri sendiri, tiap hari cuma pura-pura baik baik aja di depan orang',
    risiko: 'tinggi',
    skor: 0.88,
    model: 'XGBoost',
    statusTinjau: 'Eskalasi ke konselor',
  },
  {
    id: 'TWT-10226',
    akun: '@anak_kosan99',
    waktu: '21 Jun 2026, 22:40',
    teks: 'libur akhirnya! mau masak enak dulu ah baru lanjut tugas besok',
    risiko: 'rendah',
    skor: 0.08,
    model: 'SVM',
    statusTinjau: 'Ditinjau',
  },
  {
    id: 'TWT-10225',
    akun: '@dini_hr',
    waktu: '21 Jun 2026, 21:55',
    teks: 'makin sering ga napsu makan belakangan ini, semua rasanya hambar aja',
    risiko: 'tinggi',
    skor: 0.85,
    model: 'XGBoost',
    statusTinjau: 'Menunggu tinjauan pakar',
  },
  {
    id: 'TWT-10224',
    akun: '@rafi_oktv',
    waktu: '21 Jun 2026, 20:12',
    teks: 'seru banget nonton bareng anak futsal tadi sore, udah lama ga ketawa segini lepas',
    risiko: 'rendah',
    skor: 0.05,
    model: 'Random Forest',
    statusTinjau: 'Ditinjau',
  },
]

// Penjelasan XAI (SHAP & LIME) khusus untuk satu cuitan contoh (TWT-10231)
export const penjelasanXAI = {
  'TWT-10231': {
    shap: [
      { fitur: 'frekuensi kata ganti "aku/gua"', kontribusi: 0.21 },
      { fitur: 'kosakata afek negatif ("capek", "gatau")', kontribusi: 0.27 },
      { fitur: 'kata isolasi sosial ("ga ada yang nyadar")', kontribusi: 0.19 },
      { fitur: 'frasa keinginan menghindar ("istirahat dari semuanya")', kontribusi: 0.16 },
      { fitur: 'panjang & struktur kalimat fragmentaris', kontribusi: 0.08 },
    ],
    limeHighlight: [
      { teks: 'gatau lagi harus gimana', bobot: 0.62 },
      { teks: 'rasanya capek banget', bobot: 0.78 },
      { teks: 'ga ada yang nyadar', bobot: 0.71 },
      { teks: 'pengen istirahat aja dari semuanya', bobot: 0.69 },
    ],
    catatanKlinis:
      'Pola linguistik menunjukkan ekspresi keletihan emosional dan rasa tidak terlihat oleh lingkungan sosial. Disarankan tinjauan lanjutan oleh konselor sebelum kontak langsung dilakukan.',
  },
}

export function getRiskColor(risiko) {
  switch (risiko) {
    case 'tinggi':
      return { bg: 'bg-rust-soft', text: 'text-rust', dot: 'bg-rust' }
    case 'sedang':
      return { bg: 'bg-amber-soft', text: 'text-amber', dot: 'bg-amber' }
    default:
      return { bg: 'bg-teal-soft', text: 'text-teal', dot: 'bg-teal' }
  }
}
