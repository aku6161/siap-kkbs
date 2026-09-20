/**
 * =========================================================================
 * SiAP - SKRIP SANDARAN AWAN TERUS KE GOOGLE DRIVE (CLOUD-TO-CLOUD)
 * =========================================================================
 * Skrip ini berjalan 100% di pelayan awan Google (Google Apps Script).
 * Ia menarik data TERUS dari pangkalan data Supabase dan menyimpannya terus
 * ke dalam folder Google Drive sasaran TANPA melalui komputer Mac/lokal.
 *
 * Folder Sasaran Google Drive:
 * PROJEK AI > SISTEM BACKUP > SiAP BACKUP
 * ID Folder: 1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28
 * =========================================================================
 */

// ── KONFIGURASI PANGKALAN DATA & GOOGLE DRIVE ──
var SUPABASE_URL = "https://dliiscfkrzxdjtgphyoq.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWlzY2Zrcnp4ZGp0Z3BoeW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzg4NTgwMiwiZXhwIjoyMTAzNDYxODAyfQ.UE-yGkUitm6jx5bHVYmuOyqoOTTEUumQN-VvWf5OTAw";
var DRIVE_BACKUP_FOLDER_ID = "1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28";
var RETENTION_COPIES = 2; // Simpan 2 minggu / 2 sandaran terkini sahaja

// ── SENARAI LENGKAP 56 SOALAN MAKLUM BALAS KEPUASAN PELAJAR ──
var SURVEY_QUESTIONS = [
  "S1 [Bilik Kuliah 1] Kerusi baik & mencukupi",
  "S2 [Bilik Kuliah 1] Meja baik & mencukupi",
  "S3 [Bilik Kuliah 1] Alat bantu mengajar mencukupi & berfungsi",
  "S4 [Bilik Kuliah 1] Persekitaran bersih & selesa",
  "S5 [Bilik Kuliah 1] Persekitaran selamat",
  "S6 [Bilik Kuliah 1] Capaian WiFi baik",
  "S7 [Bilik Kuliah 2] Kerusi baik & mencukupi",
  "S8 [Bilik Kuliah 2] Meja baik & mencukupi",
  "S9 [Bilik Kuliah 2] Alat bantu mengajar mencukupi & berfungsi",
  "S10 [Bilik Kuliah 2] Persekitaran bersih & selesa",
  "S11 [Bilik Kuliah 2] Persekitaran selamat",
  "S12 [Bilik Kuliah 2] Capaian WiFi baik",
  "S13 [Immersive Centre] Kerusi baik & mencukupi",
  "S14 [Immersive Centre] Meja baik & mencukupi",
  "S15 [Immersive Centre] Alat bantu mengajar mencukupi & berfungsi",
  "S16 [Immersive Centre] Persekitaran bersih & selesa",
  "S17 [Immersive Centre] Persekitaran selamat",
  "S18 [Immersive Centre] Capaian WiFi baik",
  "S19 [Dewan Kuliah] Kerusi baik & mencukupi",
  "S20 [Dewan Kuliah] Meja baik & mencukupi",
  "S21 [Dewan Kuliah] Alat bantu mengajar mencukupi & berfungsi",
  "S22 [Dewan Kuliah] Persekitaran bersih & selesa",
  "S23 [Dewan Kuliah] Persekitaran selamat",
  "S24 [Dewan Kuliah] Capaian WiFi baik",
  "S25 [Makmal Komputer] Komputer berfungsi dengan baik",
  "S26 [Makmal Komputer] Komputer mencukupi untuk pembelajaran",
  "S27 [Makmal Komputer] Kerusi baik & mencukupi",
  "S28 [Makmal Komputer] Persekitaran bersih & selesa",
  "S29 [Makmal Komputer] Persekitaran selamat",
  "S30 [Makmal Komputer] Capaian WiFi baik",
  "S31 [Perpustakaan] Capaian maklumat/rujukan tersusun & mudah",
  "S32 [Perpustakaan] Koleksi bahan bacaan mencukupi",
  "S33 [Perpustakaan] Waktu operasi bersesuaian",
  "S34 [Perpustakaan] Peminjaman & pemulangan mudah/cepat",
  "S35 [Perpustakaan] Persekitaran bersih & selesa",
  "S36 [Perpustakaan] Persekitaran selamat",
  "S37 [Perpustakaan] Capaian WiFi baik",
  "S38 [E-Tech Centre] Layanan kaunter mesra & baik",
  "S39 [E-Tech Centre] Makanan harga berpatutan",
  "S40 [E-Tech Centre] Menu makanan pelbagai",
  "S41 [E-Tech Centre] Meja & kerusi mencukupi",
  "S42 [E-Tech Centre] Persekitaran bersih & selesa",
  "S43 [E-Tech Centre] Makanan/minuman sedap & bersih",
  "S44 [Kemudahan Sokongan] Tempat rehat mencukupi",
  "S45 [Kemudahan Sokongan] Tempat rehat selesa & bersih",
  "S46 [Kemudahan Sokongan] Tandas mencukupi",
  "S47 [Kemudahan Sokongan] Kebersihan tandas baik",
  "S48 [Kemudahan Sokongan] Surau mencukupi",
  "S49 [Kemudahan Sokongan] Surau selesa & bersih",
  "S50 [Kemudahan Sokongan] Asas surau mencukupi",
  "S51 [Kemudahan Sokongan] Tempat letak kenderaan mencukupi",
  "S52 [Bengkel Amali] Peralatan amali mencukupi",
  "S53 [Bengkel Amali] Peralatan amali berfungsi baik",
  "S54 [Bengkel Amali] Persekitaran bengkel bersih & selesa",
  "S55 [Bengkel Amali] Persekitaran bengkel selamat",
  "S56 [Bengkel Amali] Peraturan keselamatan dipamerkan"
];

/**
 * 1. FUNGSI UTAMA: JALANKAN SANDARAN TERUS KE GOOGLE DRIVE SEKARANG
 */
function jalankanSandaranSekarang() {
  var now = new Date();
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  var dateStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '_' + pad(now.getHours()) + '-' + pad(now.getMinutes()) + '-' + pad(now.getSeconds());

  Logger.log("🚀 Memulakan Sandaran Cloud-to-Cloud SiAP pada " + now.toString());

  // 1. Ambil data Aduan dari Supabase
  var complaints = fetchSupabaseTable("siap_complaints");
  Logger.log("📥 Aduan Supabase: " + complaints.length + " rekod");

  // 2. Ambil data Kepuasan Pelajar (56 Soalan Penuh) dari Supabase
  var surveys = fetchSupabaseTable("siap_student_satisfaction");
  Logger.log("📥 Kepuasan Pelajar Supabase (56 Soalan): " + surveys.length + " rekod");

  // 3. Jana CSV (UTF-8 with BOM)
  var compCsv = generateComplaintsCsv(complaints);
  var surveyCsv = generateFullSurveysCsv(surveys);

  var compFileName = "SiAP_Sandaran_Aduan_" + dateStr + ".csv";
  var surveyFileName = "SiAP_Sandaran_Kepuasan_Pelajar_56Soalan_" + dateStr + ".csv";

  // 4. Dapatkan Folder Sasaran Google Drive
  var folder = dapatkanFolderSasaran();
  Logger.log("📂 Folder Sasaran Google Drive: " + folder.getName() + " (ID: " + folder.getId() + ")");

  // 5. Cipta Fail CSV Aduan Terus ke Google Drive
  var compBlob = Utilities.newBlob(compCsv, MimeType.CSV, compFileName);
  var compFile = folder.createFile(compBlob);
  Logger.log("✅ Berjaya simpan Aduan: " + compFileName + " | URL: " + compFile.getUrl());

  // 6. Cipta Fail CSV Kepuasan Pelajar 56 Soalan Terus ke Google Drive
  var surveyBlob = Utilities.newBlob(surveyCsv, MimeType.CSV, surveyFileName);
  var surveyFile = folder.createFile(surveyBlob);
  Logger.log("✅ Berjaya simpan Kepuasan Pelajar (56 Soalan): " + surveyFileName + " | URL: " + surveyFile.getUrl());

  // 7. Auto-Purge: Simpan 2 Salinan Terkini Sahaja (Padam yang lama)
  autoPurgeOldBackups(folder, RETENTION_COPIES);

  Logger.log("🎉 SANDARAN CLOUD-TO-CLOUD SELESAI DENGAN JAYANYA!");
  return {
    success: true,
    aduanFile: compFile.getUrl(),
    kepuasanFile: surveyFile.getUrl()
  };
}

/**
 * Dapatkan Folder Sasaran Google Drive secara Selamat (Safe Resolver)
 */
function dapatkanFolderSasaran() {
  try {
    if (DRIVE_BACKUP_FOLDER_ID) {
      var f = DriveApp.getFolderById(DRIVE_BACKUP_FOLDER_ID);
      if (f) return f;
    }
  } catch (e) {
    Logger.log("Info: ID folder tidak dapat dibuka terus, mencuba navigasi nama...");
  }

  try {
    var folders = DriveApp.getFoldersByName("SiAP BACKUP");
    if (folders.hasNext()) {
      return folders.next();
    }
  } catch (e) {}

  try {
    var root = DriveApp.getRootFolder();
    var parent = getOrCreateSubFolder(root, "PROJEK AI");
    var sub = getOrCreateSubFolder(parent, "SISTEM BACKUP");
    return getOrCreateSubFolder(sub, "SiAP BACKUP");
  } catch (e) {
    return DriveApp.getRootFolder();
  }
}

function getOrCreateSubFolder(parentFolder, folderName) {
  var it = parentFolder.getFoldersByName(folderName);
  if (it.hasNext()) {
    return it.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * 2. TETAPKAN PENJADUAL AUTOMATIK (SETIAP HARI AHAD JAM 2:00 PAGI WAKTU MALAYSIA)
 */
function ciptaTriggerMingguanAhad() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "jalankanSandaranSekarang") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("jalankanSandaranSekarang")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .inTimezone("Asia/Kuala_Lumpur")
    .create();

  Logger.log("⏰ Trigger Mingguan Berjaya Dicipta: Setiap Hari Ahad jam 2:00 Pagi (Waktu Malaysia)");
}

/**
 * 3. PEMBANTU: AMBIL DATA DARI SUPABASE REST API
 */
function fetchSupabaseTable(tableName) {
  var url = SUPABASE_URL + "/rest/v1/" + tableName + "?select=*&order=id.desc";
  var options = {
    method: "get",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText());
    } else {
      Logger.log("⚠️ Ralat Supabase [" + tableName + "]: HTTP " + response.getResponseCode() + " - " + response.getContentText());
      return [];
    }
  } catch (e) {
    Logger.log("❌ Ralat Sambungan Supabase: " + e.toString());
    return [];
  }
}

/**
 * 4. PEMBANTU: JANA CSV ADUAN PELANGGAN
 */
function generateComplaintsCsv(complaints) {
  var headers = [
    "No Rujukan","Tarikh & Masa Aduan","Nama Pengadu","No Telefon",
    "Emel","Kod Kategori","Nama Kategori","Tajuk Aduan","Butiran Aduan",
    "Lokasi Kejadian","Tarikh Kejadian","Status Aduan","Kumpulan Telegram",
    "ID Kumpulan Telegram","ID Telegram Pegawai","Nama Pegawai Bertanggungjawab",
    "Tarikh Tindakan Diambil","Tarikh Selesai","Tindakan Terkini",
    "Penilaian Bintang (1-5)","Ulasan Pelanggan","Tarikh Penilaian",
    "Nama Lampiran","Pautan Lampiran (Google Drive)"
  ];

  var csvLines = [];
  csvLines.push(headers.map(escapeCsvField).join(","));

  for (var i = 0; i < complaints.length; i++) {
    var c = complaints[i];
    var row = [
      c.noRujukan || "", c.tarikhMasa || "", c.namaPengadu || "",
      c.telefon || "", c.emel || "", c.kategori || "",
      c.kategoriNama || "", c.tajukAduan || "", c.butiranAduan || "",
      c.lokasi || "", c.tarikhKejadian || "", c.status || "",
      c.telegramGroup || "", c.telegramGroupId || "", c.telegramUserId || "",
      c.namaPegawai || "", c.tarikhDiambilTindakan || "", c.tarikhSelesai || "",
      c.tindakanTerkini || "", c.rating || "", c.ulasanPelanggan || "",
      c.ratingTarikh || "", c.lampiranNama || "", c.lampiranDriveUrl || ""
    ];
    csvLines.push(row.map(escapeCsvField).join(","));
  }

  return "\uFEFF" + csvLines.join("\r\n");
}

/**
 * 5. PEMBANTU: JANA CSV MAKLUM BALAS KEPUASAN PELAJAR (LENGKAP 56 SOALAN)
 */
function generateFullSurveysCsv(surveys) {
  // Header: Metadata Pelajar + 56 Soalan Lengkap + Purata Kategori + Rumusan
  var headers = [
    "ID Soal Selidik", "Tarikh & Masa", "Tahun", "Jantina", "Program Pengajian", "Semester"
  ];

  // Masukkan kesemua tajuk 56 soalan
  for (var q = 0; q < SURVEY_QUESTIONS.length; q++) {
    headers.push(SURVEY_QUESTIONS[q]);
  }

  // Masukkan purata kategori & maklum balas
  headers.push(
    "Purata Bilik Kuliah (1-5)",
    "Purata Immersive Centre (1-5)",
    "Purata Dewan Kuliah (1-5)",
    "Purata Makmal Komputer (1-5)",
    "Purata Perpustakaan (1-5)",
    "Purata E-Tech Centre / Kafe (1-5)",
    "Purata Kemudahan Sokongan (1-5)",
    "Purata Bengkel Amali (1-5)",
    "Purata WiFi (1-5)",
    "Purata Skor Keseluruhan (1-5)",
    "Keutamaan Penambahbaikan",
    "Cadangan Pelajar"
  );

  var csvLines = [];
  csvLines.push(headers.map(escapeCsvField).join(","));

  for (var i = 0; i < surveys.length; i++) {
    var s = surveys[i];
    var sc = s.scores || {};
    var raw = s.rawScores || [];

    var row = [
      s.id || "",
      s.timestamp || "",
      s.year || "",
      s.jantina || "",
      s.programPengajian || "",
      s.semester || ""
    ];

    // Masukkan skor setiap satu daripada 56 soalan
    for (var j = 0; j < 56; j++) {
      var scoreVal = (raw && raw.length > j && raw[j] !== undefined && raw[j] !== null) ? raw[j] : "";
      row.push(scoreVal);
    }

    // Masukkan purata kategori
    row.push(
      sc.bilikKuliah !== undefined ? sc.bilikKuliah : "",
      sc.immersiveCentre !== undefined ? sc.immersiveCentre : "",
      sc.dewanKuliah !== undefined ? sc.dewanKuliah : "",
      sc.makmalKomputer !== undefined ? sc.makmalKomputer : "",
      sc.perpustakaan !== undefined ? sc.perpustakaan : "",
      (sc.kafe !== undefined ? sc.kafe : (sc.eTechCentre !== undefined ? sc.eTechCentre : "")),
      sc.kemudahanSokongan !== undefined ? sc.kemudahanSokongan : "",
      (sc.bengkelAmali !== undefined ? sc.bengkelAmali : (sc.bengkelDapur !== undefined ? sc.bengkelDapur : "")),
      sc.wifi !== undefined ? sc.wifi : "",
      sc.purataKeseluruhan !== undefined ? sc.purataKeseluruhan : "",
      s.kemudahanPenambahbaikan || "",
      s.cadangan || ""
    );

    csvLines.push(row.map(escapeCsvField).join(","));
  }

  return "\uFEFF" + csvLines.join("\r\n");
}

function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  var str = field.toString().replace(/"/g, '""');
  return '"' + str + '"';
}

/**
 * 6. PEMBANTU: AUTO-PURGE FAIL LEBIH DARI 2 SALINAN TERKINI
 */
function autoPurgeOldBackups(folder, maxCopies) {
  var prefixes = [
    "SiAP_Sandaran_Aduan_",
    "SiAP_Sandaran_Kepuasan_Pelajar_"
  ];

  for (var p = 0; p < prefixes.length; p++) {
    var prefix = prefixes[p];
    var matchingFiles = [];
    var files = folder.getFiles();
    while (files.hasNext()) {
      var f = files.next();
      if (f.getName().indexOf(prefix) === 0 && f.getName().indexOf(".csv") > -1) {
        matchingFiles.push({
          id: f.getId(),
          name: f.getName(),
          created: f.getDateCreated().getTime()
        });
      }
    }

    matchingFiles.sort(function(a, b) {
      return b.created - a.created;
    });

    if (matchingFiles.length > maxCopies) {
      for (var i = maxCopies; i < matchingFiles.length; i++) {
        try {
          var oldFile = DriveApp.getFileById(matchingFiles[i].id);
          oldFile.setTrashed(true);
          Logger.log("🧹 Auto-Purge: Memadam fail lama: " + matchingFiles[i].name);
        } catch (delErr) {
          Logger.log("⚠️ Gagal padam: " + matchingFiles[i].name + " (" + delErr.toString() + ")");
        }
      }
    }
  }

  // Padam sebarang fail JSON lama jika ada
  var allFiles = folder.getFiles();
  while (allFiles.hasNext()) {
    var jsonFile = allFiles.next();
    if (jsonFile.getName().indexOf(".json") > -1) {
      try {
        jsonFile.setTrashed(true);
        Logger.log("🧹 Padam fail JSON: " + jsonFile.getName());
      } catch (e) {}
    }
  }
}

/**
 * 6. PERINGATAN HARIAN TELEGRAM 9:00 PAGI (AUTO REPOST & DELETE MESEJ LAMA)
 */
function hantarPeringatanHarianTelegram9Pagi() {
  var url = "https://siapkkbs.vercel.app/api/cron/daily-reminders";
  var options = {
    method: "get",
    headers: {
      "User-Agent": "google-apps-script-cron"
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("⏰ Respon Peringatan Harian: " + response.getContentText());
  } catch (e) {
    Logger.log("❌ Ralat panggil endpoint peringatan harian: " + e.toString());
  }
}

function ciptaTriggerHarianPeringatan9Pagi() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "hantarPeringatanHarianTelegram9Pagi") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("hantarPeringatanHarianTelegram9Pagi")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .inTimezone("Asia/Kuala_Lumpur")
    .create();

  Logger.log("⏰ Trigger Harian 9:00 AM Berjaya Dicipta: Peringatan akan dihantar semula setiap hari jam 9.00 pagi!");
}

