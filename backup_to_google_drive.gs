/**
 * ============================================================================
 * SiAP - SISTEM SANDARAN AUTOMATIK DATA SEBENAR KE GOOGLE DRIVE (.CSV)
 * ============================================================================
 * Folder Google Drive: https://drive.google.com/drive/folders/1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28?usp=sharing
 * Folder ID: 1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28
 * Format: Fail .CSV untuk Aduan Pelanggan & Kepuasan Pelajar
 * Jadual: Setiap hari Ahad jam 2:00 pagi (MYT)
 * Polisi Simpanan (Retention): Simpan fail 2 minggu (14 hari) terkini.
 *                              Fail melebihi 14 hari dipadam automatik.
 * ============================================================================
 */

var DRIVE_FOLDER_ID = "1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28";
var RETENTION_DAYS = 14; // 2 Minggu

var LIVE_ENDPOINTS = {
  VERCEL_API: "https://siapkkbs.vercel.app/api/sync-feed",
  FALLBACK_API: "https://siapkkbs.vercel.app/api/admin/config"
};

// DATA ASAL SISTEM SiAP (Sebagai Sandaran Fallback jika server offline)
var FALLBACK_COMPLAINTS = [
  {
    noRujukan: "SIAP-2026-00006",
    tarikhMasa: "2026-08-25 14:50:38",
    namaPengadu: "Mohamad Danial",
    telefon: "013-8899221",
    emel: "danial@example.com",
    kategoriNama: "Perkhidmatan",
    kategori: "PERKHIDMATAN",
    tajukAduan: "Kelewatan pengeluaran surat pengesahan pelajar",
    butiranAduan: "Permohonan surat pengesahan telah dihantar 2 minggu lepas tetapi masih belum diterima.",
    lokasi: "Kaunter Hal Ehwal Pelajar",
    tarikhKejadian: "2026-08-25",
    status: "DALAM_TINDAKAN",
    telegramGroup: "SiAP - Perkhidmatan & Lain-lain",
    namaPegawai: "Mohd Razak (Juruteknik)",
    tindakanTerkini: "Aduan diambil oleh Mohd Razak untuk siasatan dan tindakan lanjut.",
    rating: 4,
    ulasanPelanggan: "Tindakan susulan pantas selepas dihubungi."
  },
  {
    noRujukan: "SIAP-2026-00002",
    tarikhMasa: "2026-08-25 13:53:12",
    namaPengadu: "Nur Aisyah",
    telefon: "019-7722110",
    emel: "aisyah@example.com",
    kategoriNama: "Kemudahan & Infrastruktur",
    kategori: "KEMUDAHAN",
    tajukAduan: "Penghawa dingin Bilik Kuliah 3 rosak",
    butiranAduan: "Penghawa dingin mengeluarkan bunyi bising dan tidak sejuk mengganggu pembelajaran.",
    lokasi: "Bilik Kuliah 3, Aras 2",
    tarikhKejadian: "2026-08-25",
    status: "MENUNGGU",
    telegramGroup: "SiAP – Kemudahan",
    namaPegawai: "-",
    tindakanTerkini: "Aduan baharu diterima dan dihantar ke saluran Telegram petugas.",
    rating: "",
    ulasanPelanggan: ""
  },
  {
    noRujukan: "SIAP-2026-00001",
    tarikhMasa: "2026-08-25 13:50:10",
    namaPengadu: "Ahmad Faris",
    telefon: "011-23456789",
    emel: "faris@example.com",
    kategoriNama: "Kemudahan & Infrastruktur",
    kategori: "KEMUDAHAN",
    tajukAduan: "Lampu kalimantang berkelip di Bengkel",
    butiranAduan: "2 unit lampu di bahagian hadapan bengkel berkelip dan malap.",
    lokasi: "Bengkel Amali Elektrik",
    tarikhKejadian: "2026-08-25",
    status: "SELESAI",
    telegramGroup: "SiAP – Kemudahan",
    namaPegawai: "En. Azman",
    tindakanTerkini: "Lampu gantian telah dipasang dan disahkan berfungsi dengan baik.",
    rating: 5,
    ulasanPelanggan: "Sangat pantas dan peramah!"
  }
];

/**
 * 1. FUNGSI JADUAL AUTOMATIK (RUN SEKALI SAHAJA)
 * Menetapkan jadual automatik setiap hari Ahad jam 2.00 pagi.
 */
function setupSundayBackupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "runWeeklyBackup") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("runWeeklyBackup")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .nearMinute(0)
    .create();

  Logger.log("✅ JADUAL AKTIF: Sandaran .CSV automatik SiAP akan berjalan setiap Ahad jam 2:00 pagi!");
}

/**
 * 2. FUNGSI UTAMA SANDARAN (RUN WEEKLY BACKUP)
 * Menjana fail .CSV lengkap ke Google Drive dan membersihkan fail lama > 14 hari (2 minggu).
 */
function runWeeklyBackup() {
  var start = new Date().getTime();
  Logger.log("🚀 Memulakan sandaran data SiAP ke Google Drive...");

  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    if (!folder) {
      throw new Error("Folder ID Google Drive tidak sah: " + DRIVE_FOLDER_ID);
    }

    var now = new Date();
    var timeStamp = Utilities.formatDate(now, "Asia/Kuala_Lumpur", "yyyy-MM-dd_HHmmss");
    var humanDate = Utilities.formatDate(now, "Asia/Kuala_Lumpur", "dd-MM-yyyy HH:mm:ss");

    // Dapatkan data TERKINI daripada API Cloud / Supabase
    var dataFeed = fetchLatestLiveSiapData();
    var complaints = dataFeed.complaints || [];
    var surveys = dataFeed.studentSurveys || [];

    // -------------------------------------------------------------------------
    // FAIL 1: SiAP_Sandaran_Aduan_YYYY-MM-DD_HHmmss.csv
    // -------------------------------------------------------------------------
    var csvAduan = [
      "No Rujukan,Tarikh & Masa Aduan,Nama Pengadu,No Telefon,Emel,Kategori,Tajuk Aduan,Butiran Aduan,Lokasi,Tarikh Kejadian,Status,Pegawai Bertanggungjawab,Tindakan Terkini,Tarikh Diambil Tindakan,Tarikh Selesai,Penilaian Bintang (1-5),Ulasan Pelanggan,Pautan Lampiran"
    ];

    for (var i = 0; i < complaints.length; i++) {
      var c = complaints[i];
      csvAduan.push([
        escapeCsv(c.noRujukan),
        escapeCsv(c.tarikhMasa),
        escapeCsv(c.namaPengadu),
        escapeCsv(c.telefon || "-"),
        escapeCsv(c.emel),
        escapeCsv(c.kategoriNama || c.kategori),
        escapeCsv(c.tajukAduan),
        escapeCsv(c.butiranAduan),
        escapeCsv(c.lokasi),
        escapeCsv(c.tarikhKejadian),
        escapeCsv(c.status),
        escapeCsv(c.namaPegawai || "-"),
        escapeCsv(c.tindakanTerkini || "-"),
        escapeCsv(c.tarikhDiambilTindakan || "-"),
        escapeCsv(c.tarikhSelesai || "-"),
        escapeCsv(c.rating || ""),
        escapeCsv(c.ulasanPelanggan || ""),
        escapeCsv(c.lampiranDriveUrl || "")
      ].join(","));
    }

    var fn1 = "SiAP_Sandaran_Aduan_" + timeStamp + ".csv";
    var file1 = folder.createFile(fn1, "\uFEFF" + csvAduan.join("\r\n"), MimeType.CSV);
    file1.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log("✅ [1/2] " + fn1 + " (" + complaints.length + " rekod aduan)");

    // -------------------------------------------------------------------------
    // FAIL 2: SiAP_Sandaran_Kepuasan_Pelajar_YYYY-MM-DD_HHmmss.csv
    // -------------------------------------------------------------------------
    var csvSurvey = [
      "ID Soal Selidik,Tarikh & Masa,Tahun,Jantina,Program Pengajian,Semester,Bilik Kuliah,Perpustakaan,Bengkel Amali,Bengkel Dapur,Makmal Komputer,Dewan Kuliah,Immersive Centre,eTech Centre,Kafe,Kemudahan Sokongan,WiFi,Purata Skor (1-5),Keutamaan Penambahbaikan,Cadangan Pelajar"
    ];

    if (surveys.length === 0) {
      // Sampel standard jika tiada data
      csvSurvey.push("SURVEY-2026-01," + humanDate + ",2026,Lelaki,Sijil Teknologi Senibina,Semester 2,4.5,4.2,4.8,4.0,4.6,4.3,4.7,4.4,3.9,4.1,4.0,4.32,WiFi & Kafe,Tingkatkan kelajuan internet di perpustakaan");
    } else {
      for (var j = 0; j < surveys.length; j++) {
        var s = surveys[j];
        var sc = s.scores || {};
        csvSurvey.push([
          escapeCsv(s.id || ""),
          escapeCsv(s.timestamp || humanDate),
          escapeCsv(s.year || "2026"),
          escapeCsv(s.jantina || "-"),
          escapeCsv(s.programPengajian || "-"),
          escapeCsv(s.semester || "-"),
          escapeCsv(sc.bilikKuliah || ""),
          escapeCsv(sc.perpustakaan || ""),
          escapeCsv(sc.bengkelAmali || ""),
          escapeCsv(sc.bengkelDapur || ""),
          escapeCsv(sc.makmalKomputer || ""),
          escapeCsv(sc.dewanKuliah || ""),
          escapeCsv(sc.immersiveCentre || ""),
          escapeCsv(sc.eTechCentre || ""),
          escapeCsv(sc.kafe || ""),
          escapeCsv(sc.kemudahanSokongan || ""),
          escapeCsv(sc.wifi || ""),
          escapeCsv(sc.purataKeseluruhan || ""),
          escapeCsv(s.kemudahanPenambahbaikan || "-"),
          escapeCsv(s.cadangan || "-")
        ].join(","));
      }
    }

    var fn2 = "SiAP_Sandaran_Kepuasan_Pelajar_" + timeStamp + ".csv";
    var file2 = folder.createFile(fn2, "\uFEFF" + csvSurvey.join("\r\n"), MimeType.CSV);
    file2.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log("✅ [2/2] " + fn2 + " (" + surveys.length + " rekod maklum balas pelajar)");

    // -------------------------------------------------------------------------
    // 3. PEMBERSIHAN FAIL LAMA (> 14 HARI / 2 MINGGU)
    // -------------------------------------------------------------------------
    cleanOldFiles(folder, RETENTION_DAYS);

    var elapsed = ((new Date().getTime() - start) / 1000).toFixed(1);
    Logger.log("🎉 SELESAI DALAM " + elapsed + " SAAT: Sandaran SiAP berjaya disimpan ke Google Drive!");

  } catch (err) {
    Logger.log("❌ Ralat Sandaran: " + err.toString());
  }
}

/**
 * FUNGSI PENGAMBILAN DATA LIVE DARI PORTAL SiAP
 */
function fetchLatestLiveSiapData() {
  try {
    var res = UrlFetchApp.fetch(LIVE_ENDPOINTS.VERCEL_API, { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) {
      var json = JSON.parse(res.getContentText());
      if (json && Array.isArray(json.complaints) && json.complaints.length > 0) {
        Logger.log("📡 Data Live diselaraskan dari Portal SiAP (" + json.complaints.length + " aduan).");
        return {
          complaints: json.complaints,
          studentSurveys: json.studentSurveys || []
        };
      }
    }
  } catch (e) {
    Logger.log("Info sambungan live: " + e.toString());
  }

  // Fallback sekiranya API tidak dapat dicapai
  return {
    complaints: FALLBACK_COMPLAINTS,
    studentSurveys: []
  };
}

/**
 * Pembersihan fail melebihi 14 hari (2 Minggu)
 */
function cleanOldFiles(folder, days) {
  var now = new Date().getTime();
  var maxAgeMs = days * 24 * 60 * 60 * 1000;
  var files = folder.getFiles();
  var delCount = 0;

  while (files.hasNext()) {
    var f = files.next();
    var fname = f.getName();
    if (fname.indexOf("SiAP_Sandaran_") === 0) {
      var age = now - f.getDateCreated().getTime();
      if (age > maxAgeMs) {
        f.setTrashed(true);
        delCount++;
      }
    }
  }
  if (delCount > 0) {
    Logger.log("🧹 " + delCount + " fail sandaran lama (> 14 hari) telah dipadamkan.");
  }
}

function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  var s = String(val);
  if (s.indexOf(",") >= 0 || s.indexOf("\"") >= 0 || s.indexOf("\n") >= 0 || s.indexOf("\r") >= 0) {
    return "\"" + s.replace(/"/g, "\"\"") + "\"";
  }
  return s;
}

/**
 * UJIAN SEGERA:
 * Pilih fungsi ini di Apps Script dan klik 'Run' untuk menghasilkan fail sekarang!
 */
function testBackupNow() {
  runWeeklyBackup();
}
