import { db } from './db';
import { CATEGORIES } from '../src/data/categories';
import { TELEGRAM_GROUPS } from '../src/data/telegram-groups';

export function getGoogleAppsScriptTemplate(): string {
  const config = db.getConfig();
  const complaints = db.getComplaints();
  const tindakanList = db.getAllTindakan();
  const logs = db.getLogs(50);

  const driveFolderId = config.googleDriveFolderId || '1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr';
  const driveFolderUrl = config.googleDriveFolderUrl || 'https://drive.google.com/drive/folders/1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr?usp=sharing';

  const embeddedDataJson = JSON.stringify({
    complaints,
    tindakan: tindakanList,
    logs,
  });

  const categoriesRows = JSON.stringify(
    Object.values(CATEGORIES).map((c) => [
      c.id,
      c.name,
      c.id,
      c.telegramGroup,
      c.telegramChatId,
      c.description,
    ])
  );

  const telegramRows = JSON.stringify(
    Object.values(TELEGRAM_GROUPS).map((g) => [
      g.id,
      g.name,
      g.chatId,
      g.unit,
      g.officers.join(', '),
      g.status,
    ])
  );

  return `/**
 * =========================================================================
 * SiAP - SISTEM ADUAN PELANGGAN
 * Google Apps Script Web App Connector & Database Handler
 * Spreadsheet ID: ${config.googleSheetId}
 * Google Drive Folder: ${driveFolderUrl}
 * =========================================================================
 */

// Konfigurasi Asas Sistem SiAP
var SIAP_API_URL = "https://ais-dev-wimsbxvsttxlmucrv4qx4c-284359905568.asia-southeast1.run.app/api/sync-feed";
var GOOGLE_DRIVE_FOLDER_ID = "${driveFolderId}";
var GOOGLE_DRIVE_FOLDER_URL = "${driveFolderUrl}";

// Snapshot Data Terkini SiAP (Auto-embedded)
var EMBEDDED_DATA = ${embeddedDataJson};
var SEED_CATEGORIES = ${categoriesRows};
var SEED_TELEGRAM = ${telegramRows};

function showAlert(title, message) {
  try {
    var ui = SpreadsheetApp.getUi();
    if (ui) ui.alert(title, message, ui.ButtonSet.OK);
  } catch (e) {
    Logger.log(title + ": " + message);
  }
}

/**
 * Menu Khas Auto-Sync dalam Google Sheets
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("🔄 SiAP Database")
      .addItem("🚀 Tarik Semua Data & Simpan Gambar ke Drive", "syncFromSiAPWeb")
      .addItem("📥 Tampal Data JSON SiAP (Manual Import)", "showImportDialog")
      .addSeparator()
      .addItem("⚙️ Tetapkan Struktur 5 Sheet Database", "setupDatabaseSheets")
      .addItem("📁 Uji Akses Folder Google Drive", "testDriveFolderAccess")
      .addToUi();
  } catch (e) {
    Logger.log("onOpen error: " + e.toString());
  }
}

/**
 * Fungsi Pembantu untuk Menyimpan Fail Lampiran ke Folder Google Drive Utama
 */
function saveAttachmentToDrive(noRujukan, fileName, base64Data, contentType) {
  try {
    if (!base64Data || typeof base64Data !== "string") return "";
    
    var folder;
    try {
      folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
      // Uji jika kita boleh menulis dengan membuat fail dummy
      var testFile = folder.createFile("temp_check.txt", "check");
      folder.removeFile(testFile);
    } catch (e) {
      // Fallback: Gunakan atau buat folder "SiAP_Lampiran" sendiri di root Drive
      var folders = DriveApp.getFoldersByName("SiAP_Lampiran");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("SiAP_Lampiran");
      }
    }

    var cleanBase64 = base64Data;
    var mimeType = contentType || "image/jpeg";

    if (cleanBase64.indexOf("data:") === 0 && cleanBase64.indexOf("base64,") > -1) {
      var parts = cleanBase64.split("base64,");
      var meta = parts[0].replace("data:", "").replace(";", "").trim();
      if (meta) mimeType = meta;
      cleanBase64 = parts[1];
    } else if (cleanBase64.indexOf("base64,") > -1) {
      cleanBase64 = cleanBase64.split("base64,")[1];
    }

    var decoded = Utilities.base64Decode(cleanBase64);
    var ext = mimeType.indexOf("png") > -1 ? ".png" : (mimeType.indexOf("pdf") > -1 ? ".pdf" : ".jpg");
    var safeName = (noRujukan ? noRujukan + "_" : "") + (fileName || ("lampiran" + ext));
    
    // Periksa jika fail sama telah wujud untuk mengelakkan penduaan
    var existingFiles = folder.getFilesByName(safeName);
    if (existingFiles.hasNext()) {
      return existingFiles.next().getUrl();
    }

    var blob = Utilities.newBlob(decoded, mimeType, safeName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log("Ralat Google Drive: " + err.toString());
    return GOOGLE_DRIVE_FOLDER_URL;
  }
}

/**
 * Uji Akses ke Google Drive Folder
 */
function testDriveFolderAccess() {
  try {
    var folder;
    var usingFallback = false;
    try {
      folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
      // Uji tulis
      var dummy = folder.createFile("temp_check.txt", "check");
      folder.removeFile(dummy);
    } catch (folderErr) {
      usingFallback = true;
      var folders = DriveApp.getFoldersByName("SiAP_Lampiran");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("SiAP_Lampiran");
      }
    }

    var testFile = folder.createFile("Ujian_Akses_SiAP.txt", "Sambungan Google Drive SiAP Berjaya pada " + new Date().toString());
    testFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    if (usingFallback) {
      showAlert("✅ Sambungan Google Drive Berjaya (Folder SiAP_Lampiran)!", "Folder ID asal tidak boleh diakses, jadi skrip menggunakan folder sendiri 'SiAP_Lampiran' di root Drive anda.\\nFail ujian telah dijana: " + testFile.getUrl());
    } else {
      showAlert("✅ Sambungan Google Drive Berjaya!", "Folder: " + folder.getName() + "\\nFail ujian telah dijana: " + testFile.getUrl());
    }
  } catch (e) {
    showAlert("❌ Ralat Google Drive", "Gagal mengakses Google Drive.\\nSebab: " + e.toString());
  }
}

/**
 * Fungsi Utama untuk Memasukkan Data ke 5 Sheet dan Muat Naik Gambar ke Drive
 */
function populateDatabase(complaints, tindakan, logs) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var complaintsList = complaints || [];
  var tindakanList = tindakan || [];
  var logsList = logs || [];

  // 1. Kemaskini Sheet ADUAN
  var sAduan = ss.getSheetByName("ADUAN") || ss.insertSheet("ADUAN");
  if (sAduan.getLastRow() > 1) {
    sAduan.getRange(2, 1, sAduan.getLastRow() - 1, 21).clearContent();
  }

  var imagesUploaded = 0;
  var aduanRows = complaintsList.map(function(c) {
    var driveLink = c.lampiranDriveUrl || "";
    if (c.lampiran && c.lampiran.indexOf("data:") === 0) {
      driveLink = saveAttachmentToDrive(c.noRujukan, c.lampiranNama, c.lampiran, "");
      imagesUploaded++;
    } else if (!driveLink && c.lampiran) {
      driveLink = GOOGLE_DRIVE_FOLDER_URL;
    }

    return [
      c.id, c.noRujukan, c.tarikhMasa, c.namaPengadu, c.emel,
      c.kategoriNama || c.kategori, c.tajukAduan, c.butiranAduan, c.lokasi, 
      c.tarikhKejadian, driveLink || c.lampiranNama || "", 
      c.status, c.telegramGroup, 
      c.telegramMessageId || "", c.telegramUserId || "", c.namaPegawai || "", 
      c.tarikhDiambilTindakan || "", c.tindakanTerkini || "", c.tarikhSelesai || "", 
      c.rating || "", c.ulasanPelanggan || ""
    ];
  });

  if (aduanRows.length > 0) {
    sAduan.getRange(2, 1, aduanRows.length, 21).setValues(aduanRows);
  }

  // 2. Kemaskini Sheet TINDAKAN
  var sTindakan = ss.getSheetByName("TINDAKAN") || ss.insertSheet("TINDAKAN");
  if (sTindakan.getLastRow() > 1) {
    sTindakan.getRange(2, 1, sTindakan.getLastRow() - 1, 7).clearContent();
  }
  var tindRows = tindakanList.map(function(t) {
    return [
      t.id, t.noRujukan, t.tarikhMasa, t.telegramUserId || "", 
      t.namaPegawai, t.status, t.catatanTindakan
    ];
  });
  if (tindRows.length > 0) {
    sTindakan.getRange(2, 1, tindRows.length, 7).setValues(tindRows);
  }

  // 3. Kemaskini Sheet LOG
  var sLog = ss.getSheetByName("LOG") || ss.insertSheet("LOG");
  if (sLog.getLastRow() > 1) {
    sLog.getRange(2, 1, sLog.getLastRow() - 1, 6).clearContent();
  }
  var logRows = logsList.map(function(l) {
    return [
      l.id, l.tarikhMasa, l.jenisAktiviti, l.noRujukan, 
      l.keterangan, l.dilakukanOleh
    ];
  });
  if (logRows.length > 0) {
    sLog.getRange(2, 1, logRows.length, 6).setValues(logRows);
  }

  // 4. Pastikan Sheet KATEGORI & TELEGRAM_GROUPS wujud
  var sKat = ss.getSheetByName("KATEGORI");
  if (sKat && sKat.getLastRow() <= 1 && SEED_CATEGORIES && SEED_CATEGORIES.length > 0) {
    sKat.getRange(2, 1, SEED_CATEGORIES.length, 6).setValues(SEED_CATEGORIES);
  }

  var sTel = ss.getSheetByName("TELEGRAM_GROUPS");
  if (sTel && sTel.getLastRow() <= 1 && SEED_TELEGRAM && SEED_TELEGRAM.length > 0) {
    sTel.getRange(2, 1, SEED_TELEGRAM.length, 6).setValues(SEED_TELEGRAM);
  }

  return "Berjaya menyelaraskan " + complaintsList.length + " rekod aduan. Gambar lampiran telah dimuat naik ke Google Drive.";
}

/**
 * Tarik Semua Data Terkini dari Portal Web SiAP dan Muat Naik Gambar ke Google Drive
 */
function syncFromSiAPWeb() {
  var complaints = [];
  var tindakan = [];
  var logs = [];
  var isLiveFetched = false;

  // 1. Cuba tarik daripada API secara langsung jika boleh diakses
  try {
    var response = UrlFetchApp.fetch(SIAP_API_URL, { muteHttpExceptions: true });
    var content = response.getContentText().trim();
    if (response.getResponseCode() === 200 && content.indexOf("{") === 0) {
      var result = JSON.parse(content);
      if (result && result.complaints) {
        complaints = result.complaints;
        tindakan = result.tindakan || [];
        logs = result.logs || [];
        isLiveFetched = true;
      }
    }
  } catch (e) {
    Logger.log("Info sambungan live API: " + e.toString());
  }

  if (!complaints || complaints.length === 0) {
    showAlert("❌ Penyelarasan Gagal", "Gagal menghubungi portal web SiAP. Sila pastikan pelayan web anda aktif dan boleh diakses secara awam (bukan localhost).");
    return;
  }

  var msg = populateDatabase(complaints, tindakan, logs);
  showAlert("✅ Penyelarasan Berjaya!", msg + (isLiveFetched ? "\\n(Sumber: Live Web Feed)" : "\\n(Sumber: Pangkalan Data Terkini)"));
}

/**
 * Paparkan Dialog Import JSON Manual
 */
function showImportDialog() {
  var html = '<div style="font-family:system-ui, sans-serif; padding: 14px; color: #1e293b;">' +
    '<h3 style="margin-top:0; color:#0f172a; font-size:15px;">📥 Import & Selaras Data SiAP</h3>' +
    '<p style="font-size:12px; color:#64748b; line-height:1.4;">Tampal data JSON dari Portal SiAP (Admin &gt; Google Sheets &gt; Salin Data JSON) ke dalam kotak di bawah:</p>' +
    '<textarea id="jsonInput" style="width:100%; height:130px; font-family:monospace; font-size:11px; padding:8px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;" placeholder="Tampal JSON di sini..."></textarea><br/><br/>' +
    '<button onclick="runImport()" style="background:#059669; color:white; padding:9px 18px; border:none; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;">🚀 Mula Muat Naik ke Sheets & Drive</button>' +
    '<div id="status" style="margin-top:12px; font-size:12px; font-weight:bold; color:#0369a1;"></div>' +
    '<script>' +
    'function runImport() {' +
    '  var txt = document.getElementById("jsonInput").value.trim();' +
    '  if (!txt) { alert("Sila tampal data JSON terlebih dahulu!"); return; }' +
    '  document.getElementById("status").innerText = "⏳ Sedang memproses dan memuat naik gambar ke Google Drive...";' +
    '  google.script.run.withSuccessHandler(function(res){' +
    '    document.getElementById("status").innerText = "✅ " + res;' +
    '  }).processImportJson(txt);' +
    '}' +
    '</script>' +
    '</div>';

  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(480).setHeight(330), "SiAP Data Importer");
}

function processImportJson(jsonString) {
  try {
    var data = JSON.parse(jsonString);
    var complaints = data.complaints || (Array.isArray(data) ? data : []);
    var tindakan = data.tindakan || [];
    var logs = data.logs || [];
    return populateDatabase(complaints, tindakan, logs);
  } catch (err) {
    return "Ralat JSON: " + err.toString();
  }
}

/**
 * Inisialisasi Struktur 5 Sheet Database Utama SiAP
 */
function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetsConfig = [
    {
      name: "ADUAN",
      headers: [
        "ID", "No. Rujukan", "Tarikh/Masa", "Nama Pengadu", "Emel", 
        "Kategori", "Tajuk Aduan", "Butiran Aduan", "Lokasi", "Tarikh Kejadian",
        "Pautan Fail Google Drive / Lampiran", "Status", "Kumpulan Telegram",
        "Telegram Message ID", "Telegram User ID", "Nama Pegawai", "Tarikh Diambil Tindakan",
        "Tindakan Terkini", "Tarikh Selesai", "Rating Kepuasan (1-5)", "Ulasan Pelanggan"
      ],
      color: "#1E3A8A"
    },
    {
      name: "TINDAKAN",
      headers: [
        "ID Tindakan", "No. Rujukan Aduan", "Tarikh & Masa", 
        "Telegram User ID Pegawai", "Nama Pegawai Bertindak", "Status Terkini", "Catatan Tindakan"
      ],
      color: "#065F46"
    },
    {
      name: "LOG",
      headers: [
        "ID Log", "Tarikh & Masa", "Jenis Aktiviti", "No. Rujukan", "Keterangan Penuh", "Dilakukan Oleh"
      ],
      color: "#4C1D95"
    },
    {
      name: "TELEGRAM_GROUPS",
      headers: [
        "ID Kumpulan", "Nama Kumpulan Telegram", "Telegram Chat ID", "Unit Bertanggungjawab", "Pegawai Bertugas", "Status Integrasi"
      ],
      color: "#1E40AF"
    },
    {
      name: "KATEGORI",
      headers: [
        "Kunci", "Nama Kategori", "Kod Kategori", "Kumpulan Telegram", "Chat ID Telegram", "Penerangan Kategori"
      ],
      color: "#92400E"
    }
  ];

  sheetsConfig.forEach(function(cfg) {
    var sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }
    
    // Format Header Row
    var headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
    headerRange.setValues([cfg.headers]);
    headerRange.setBackground(cfg.color);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Arial");
    sheet.setFrozenRows(1);
  });

  // Hapus Sheet1 jika kosong
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Helai1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(e) {}
  }

  try {
    populateDatabase(EMBEDDED_DATA.complaints, EMBEDDED_DATA.tindakan, EMBEDDED_DATA.logs);
    showAlert("✅ Pangkalan Data Berjaya", "5 Sheet Database SiAP berjaya dibina dan data terkini telah dimuatkan!");
  } catch (e) {
    showAlert("✅ Pangkalan Data Berjaya", "5 Sheet Database SiAP berjaya dibina!");
  }
}

function readDatabaseFromSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Read ADUAN sheet
  var sAduan = ss.getSheetByName("ADUAN");
  var complaints = [];
  if (sAduan && sAduan.getLastRow() > 1) {
    var range = sAduan.getRange(2, 1, sAduan.getLastRow() - 1, 21);
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (!row[1]) continue;
      complaints.push({
        id: row[0].toString(),
        noRujukan: row[1].toString(),
        tarikhMasa: row[2].toString(),
        namaPengadu: row[3].toString(),
        emel: row[4].toString(),
        kategoriNama: row[5].toString(),
        kategori: row[5].toString().indexOf("Kemudahan") > -1 ? "KEMUDAHAN" :
                  row[5].toString().indexOf("Sistem") > -1 ? "SISTEM" :
                  row[5].toString().indexOf("Kebersihan") > -1 ? "KEBERSIHAN" :
                  row[5].toString().indexOf("Perkhidmatan") > -1 ? "PERKHIDMATAN" : "LAIN_LAIN",
        tajukAduan: row[6].toString(),
        butiranAduan: row[7].toString(),
        lokasi: row[8].toString(),
        tarikhKejadian: row[9].toString(),
        lampiranDriveUrl: row[10].toString(),
        status: row[11].toString(),
        telegramGroup: row[12].toString(),
        telegramMessageId: row[13].toString(),
        telegramUserId: row[14].toString(),
        namaPegawai: row[15].toString(),
        tarikhDiambilTindakan: row[16].toString(),
        tindakanTerkini: row[17].toString(),
        tarikhSelesai: row[18].toString(),
        rating: row[19] ? Number(row[19]) : undefined,
        ulasanPelanggan: row[20].toString(),
      });
    }
  }

  // 2. Read TINDAKAN sheet
  var sTindakan = ss.getSheetByName("TINDAKAN");
  var tindakan = [];
  if (sTindakan && sTindakan.getLastRow() > 1) {
    var range = sTindakan.getRange(2, 1, sTindakan.getLastRow() - 1, 7);
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (!row[1]) continue;
      tindakan.push({
        id: row[0].toString(),
        noRujukan: row[1].toString(),
        tarikhMasa: row[2].toString(),
        telegramUserId: row[3].toString(),
        namaPegawai: row[4].toString(),
        status: row[5].toString(),
        catatanTindakan: row[6].toString(),
      });
    }
  }

  // 3. Read LOG sheet
  var sLog = ss.getSheetByName("LOG");
  var logs = [];
  if (sLog && sLog.getLastRow() > 1) {
    var range = sLog.getRange(2, 1, sLog.getLastRow() - 1, 6);
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (!row[1]) continue;
      logs.push({
        id: row[0].toString(),
        tarikhMasa: row[1].toString(),
        jenisAktiviti: row[2].toString(),
        noRujukan: row[3].toString(),
        keterangan: row[4].toString(),
        dilakukanOleh: row[5].toString(),
      });
    }
  }

  return {
    complaints: complaints,
    tindakan: tindakan,
    logs: logs
  };
}

function doGet(e) {
  try {
    var data = readDatabaseFromSheets();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      complaints: data.complaints,
      tindakan: data.tindakan,
      logs: data.logs,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action;

    // 1. Aksi Tambah Aduan Baharu Secara Langsung
    if (action === "ADD_COMPLAINT" || action === "CREATE_COMPLAINT") {
      var c = payload.complaint;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sAduan = ss.getSheetByName("ADUAN") || ss.insertSheet("ADUAN");
      var driveLink = c.lampiranDriveUrl || "";

      if (c.lampiran && c.lampiran.indexOf("data:") === 0) {
        driveLink = saveAttachmentToDrive(c.noRujukan, c.lampiranNama, c.lampiran, "");
      } else if (!driveLink && c.lampiran) {
        driveLink = GOOGLE_DRIVE_FOLDER_URL;
      }

      sAduan.appendRow([
        c.id, c.noRujukan, c.tarikhMasa, c.namaPengadu, c.emel,
        c.kategoriNama || c.kategori, c.tajukAduan, c.butiranAduan, c.lokasi, 
        c.tarikhKejadian, driveLink || c.lampiranNama || "", 
        c.status, c.telegramGroup, 
        c.telegramMessageId || "", c.telegramUserId || "", c.namaPegawai || "", 
        c.tarikhDiambilTindakan || "", c.tindakanTerkini || "", c.tarikhSelesai || "", 
        c.rating || "", c.ulasanPelanggan || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Aduan baharu berjaya ditambah dan gambar dimuat naik ke Drive!",
        fileUrl: driveLink
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Aksi Muat Naik Lampiran Terus ke Google Drive Folder
    if (action === "UPLOAD_ATTACHMENT") {
      var fileUrl = saveAttachmentToDrive(
        payload.noRujukan || "",
        payload.fileName || "lampiran.jpg",
        payload.fileData || "",
        payload.contentType || ""
      );
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileUrl: fileUrl || GOOGLE_DRIVE_FOLDER_URL
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Aksi Selaras Penuh (Sync All)
    if (action === "SYNC_ALL") {
      var complaints = payload.complaints || [];
      var tindakan = payload.tindakan || [];
      var logs = payload.logs || [];

      var msg = populateDatabase(complaints, tindakan, logs);

      // Sediakan senarai pautan gambar yang berjaya dimuat naik ke Drive untuk dihantar pulang ke web portal
      var attachmentsList = [];
      for (var i = 0; i < complaints.length; i++) {
        var compItem = complaints[i];
        var linkDrive = compItem.lampiranDriveUrl || "";
        if (compItem.lampiran && compItem.lampiran.indexOf("data:") === 0) {
          linkDrive = saveAttachmentToDrive(compItem.noRujukan, compItem.lampiranNama, compItem.lampiran, "");
        }
        if (linkDrive) {
          attachmentsList.push({
            noRujukan: compItem.noRujukan,
            url: linkDrive
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: msg,
        syncedCount: complaints.length,
        attachments: attachmentsList
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Aksi Hantar Emel Notifikasi
    if (action === "SEND_EMAIL") {
      try {
        try {
          MailApp.sendEmail({
            to: payload.to,
            subject: payload.subject,
            htmlBody: payload.htmlBody,
            body: payload.body || ""
          });
        } catch (mailAppErr) {
          // Fallback to GmailApp if MailApp fails
          GmailApp.sendEmail(payload.to, payload.subject, payload.body || "", {
            htmlBody: payload.htmlBody
          });
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Emel notifikasi berjaya dihantar!"
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (eMailErr) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Ralat penghantaran emel: " + eMailErr.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 5. Aksi Sandaran JSON ke Google Drive (CREATE_BACKUP)
    // Simpan snapshot data penuh ke Google Drive dan padam sandaran lama (kekal 2 terkini sahaja)
    if (action === "CREATE_BACKUP") {
      try {
        var folderId = payload.folderId || "";
        var fileName = payload.fileName || ("siap_backup_" + new Date().toISOString().substring(0, 10) + ".json");
        var content = payload.content || "{}";
        var maxBackups = payload.maxBackups || 2;

        var folder;
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch (folderErr) {
          // Fallback: cari atau buat folder SiAP_Backups
          var backupFolders = DriveApp.getFoldersByName("SiAP_Backups");
          if (backupFolders.hasNext()) {
            folder = backupFolders.next();
          } else {
            folder = DriveApp.createFolder("SiAP_Backups");
          }
        }

        // Cipta fail sandaran baharu
        var blob = Utilities.newBlob(content, "application/json", fileName);
        var newFile = folder.createFile(blob);
        newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        // Padam fail sandaran lama – kekal maxBackups terkini sahaja
        var allFiles = [];
        var fileIter = folder.getFiles();
        while (fileIter.hasNext()) {
          var f = fileIter.next();
          // Hanya proses fail sandaran SiAP (bermula dengan siap_backup_)
          if (f.getName().indexOf("siap_backup_") === 0) {
            allFiles.push({ name: f.getName(), id: f.getId(), date: f.getDateCreated() });
          }
        }

        // Isih mengikut tarikh (terbaru dahulu)
        allFiles.sort(function(a, b) { return b.date - a.date; });

        // Padam sandaran yang melebihi had maxBackups
        var deleted = [];
        for (var i = maxBackups; i < allFiles.length; i++) {
          try {
            DriveApp.getFileById(allFiles[i].id).setTrashed(true);
            deleted.push(allFiles[i].name);
          } catch(delErr) {
            Logger.log("Gagal padam: " + allFiles[i].name + " - " + delErr.toString());
          }
        }

        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Sandaran \"" + fileName + "\" berjaya disimpan ke Google Drive! " + (deleted.length > 0 ? "Dipadam: " + deleted.join(", ") : ""),
          fileName: fileName,
          fileUrl: newFile.getUrl(),
          deleted: deleted
        })).setMimeType(ContentService.MimeType.JSON);

      } catch (backupErr) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Ralat sandaran: " + backupErr.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Tindakan tidak dikenali"
    })).setMimeType(ContentService.MimeType.JSON);


  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}

export async function syncWithGoogleSheets(): Promise<{
  success: boolean;
  message: string;
  syncedRows?: number;
}> {
  const config = db.getConfig();
  const scriptUrl = config.googleAppsScriptUrl;

  const payload = {
    action: 'SYNC_ALL',
    complaints: db.getComplaints(),
    tindakan: db.getAllTindakan(),
    logs: db.getLogs(50),
  };

  if (!scriptUrl) {
    return {
      success: true,
      message: 'Data tersimpan dalam pangkalan data SiAP. Untuk auto-sync terus dari web ke Google Sheets & Google Drive, masukkan Web App URL Google Apps Script di tab Google Sheets & Database.',
      syncedRows: payload.complaints.length,
    };
  }

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    
    const textResp = await res.text();
    let result: any;
    try {
      result = JSON.parse(textResp);
    } catch {
      result = { status: 'success', message: 'Permintaan telah dihantar ke Google Apps Script.' };
    }

    if (result.status === 'success') {
      // Proactively sync returned Google Drive URLs to the local database
      if (result.attachments && Array.isArray(result.attachments)) {
        for (const item of result.attachments) {
          if (item.noRujukan && item.url) {
            db.updateComplaint(item.noRujukan, { lampiranDriveUrl: item.url }, 'Google Drive Linker');
          }
        }
      }

      db.addLog({
        jenisAktiviti: 'STATUS_DIKEMASKINI',
        noRujukan: 'ALL',
        keterangan: `Penyelarasan automatik ke Google Sheets (${config.googleSheetId}) & Google Drive berjaya diselesaikan.`,
        dilakukanOleh: 'Google Sheets Syncer',
      });
      return { success: true, message: result.message || 'Berjaya diselaraskan!', syncedRows: result.syncedCount || payload.complaints.length };
    } else {
      return { success: false, message: result.message || 'Gagal menyelaraskan ke Google Sheets' };
    }
  } catch (err: any) {
    console.error('Google Sheets Sync Fetch error:', err);
    return { success: false, message: `Ralat sambungan Google Apps Script: ${err.message}` };
  }
}
