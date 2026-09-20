#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SiAP - Skrip Sandaran Automatik (Format CSV Sahaja)
===================================================
Ambil data TERUS dari Supabase -> simpan fail CSV ke Google Drive folder & backups/
Tiada dependencies luaran - hanya Python standard library.

Penggunaan:
  python3 siap_backup.py
"""

import os, sys, json, csv, io, glob, datetime, urllib.request, urllib.error

SUPABASE_URL = "https://dliiscfkrzxdjtgphyoq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWlzY2Zrcnp4ZGp0Z3BoeW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzg4NTgwMiwiZXhwIjoyMTAzNDYxODAyfQ.UE-yGkUitm6jx5bHVYmuOyqoOTTEUumQN-VvWf5OTAw"

GOOGLE_DRIVE_FOLDER = "/Users/shamsuddinamin/Library/CloudStorage/GoogleDrive-aku6161@gmail.com/My Drive/PROJEK AI/SISTEM BACKUP/SiAP BACKUP"
LOCAL_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backups")

RETENTION_COPIES = 2

# Jadual yang WUJUD dalam Supabase
TABLE_COMPLAINTS = "siap_complaints"
TABLE_TINDAKAN   = "siap_tindakan"
TABLE_LOGS       = "siap_logs"
TABLE_EMAILS     = "siap_emails"
TABLE_SURVEYS_CANDIDATES = [
    "siap_student_satisfaction",
    "siap_student_surveys",
    "siap_kepuasan_pelajar",
    "student_satisfaction",
]

def fetch_table(table_name, silent=False):
    """Ambil semua rekod dari jadual. Return (data, found)."""
    all_records = []
    page, page_size = 0, 1000
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit={page_size}&offset={page*page_size}"
        req = urllib.request.Request(url)
        req.add_header("apikey", SUPABASE_KEY)
        req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if not isinstance(data, list):
                    if not silent:
                        print(f"  WARN: Respons tidak dijangka dari {table_name}")
                    return [], False
                all_records.extend(data)
                if len(data) < page_size:
                    break
                page += 1
        except urllib.error.HTTPError as e:
            if not silent:
                body = e.read().decode("utf-8")
                if e.code != 404:
                    print(f"  ERROR HTTP {e.code} dari '{table_name}': {body}")
            return all_records, (e.code != 404)
        except Exception as e:
            if not silent:
                print(f"  ERROR ambil '{table_name}': {e}")
            return all_records, False
    return all_records, True

def find_surveys_table():
    """Cari nama jadual kepuasan pelajar yang betul."""
    for candidate in TABLE_SURVEYS_CANDIDATES:
        data, found = fetch_table(candidate, silent=True)
        if found:
            return candidate, data
    return None, []

def generate_complaints_csv(complaints):
    headers = [
        "No Rujukan","Tarikh & Masa Aduan","Nama Pengadu","No Telefon",
        "Emel","Kod Kategori","Nama Kategori","Tajuk Aduan","Butiran Aduan",
        "Lokasi Kejadian","Tarikh Kejadian","Status Aduan","Kumpulan Telegram",
        "ID Kumpulan Telegram","ID Telegram Pegawai","Nama Pegawai Bertanggungjawab",
        "Tarikh Tindakan Diambil","Tarikh Selesai","Tindakan Terkini",
        "Penilaian Bintang (1-5)","Ulasan Pelanggan","Tarikh Penilaian",
        "Nama Lampiran","Pautan Lampiran (Google Drive)"
    ]
    output = io.StringIO()
    output.write("\ufeff")
    w = csv.writer(output, quoting=csv.QUOTE_ALL, lineterminator="\r\n")
    w.writerow(headers)
    for c in complaints:
        w.writerow([
            c.get("noRujukan",""), c.get("tarikhMasa",""), c.get("namaPengadu",""),
            c.get("telefon",""), c.get("emel",""), c.get("kategori",""),
            c.get("kategoriNama",""), c.get("tajukAduan",""), c.get("butiranAduan",""),
            c.get("lokasi",""), c.get("tarikhKejadian",""), c.get("status",""),
            c.get("telegramGroup",""), c.get("telegramGroupId",""), c.get("telegramUserId",""),
            c.get("namaPegawai",""), c.get("tarikhDiambilTindakan",""), c.get("tarikhSelesai",""),
            c.get("tindakanTerkini",""), c.get("rating",""), c.get("ulasanPelanggan",""),
            c.get("ratingTarikh",""), c.get("lampiranNama",""), c.get("lampiranDriveUrl",""),
        ])
    return output.getvalue()

SURVEY_QUESTIONS = [
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
]

def generate_surveys_csv(surveys):
    headers = [
        "ID Soal Selidik","Tarikh & Masa","Tahun","Jantina","Program Pengajian","Semester"
    ] + SURVEY_QUESTIONS + [
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
    ]
    output = io.StringIO()
    output.write("\ufeff")
    w = csv.writer(output, quoting=csv.QUOTE_ALL, lineterminator="\r\n")
    w.writerow(headers)
    for s in surveys:
        sc = s.get("scores", {}) or {}
        raw = s.get("rawScores", []) or []
        row = [
            s.get("id",""), s.get("timestamp",""), s.get("year",""), s.get("jantina",""),
            s.get("programPengajian",""), s.get("semester","")
        ]
        for j in range(56):
            val = raw[j] if len(raw) > j and raw[j] is not None else ""
            row.append(val)
        row.extend([
            sc.get("bilikKuliah",""),
            sc.get("immersiveCentre",""),
            sc.get("dewanKuliah",""),
            sc.get("makmalKomputer",""),
            sc.get("perpustakaan",""),
            sc.get("kafe", sc.get("eTechCentre","")),
            sc.get("kemudahanSokongan",""),
            sc.get("bengkelAmali", sc.get("bengkelDapur","")),
            sc.get("wifi",""),
            sc.get("purataKeseluruhan",""),
            s.get("kemudahanPenambahbaikan",""),
            s.get("cadangan","")
        ])
        w.writerow(row)
    return output.getvalue()

def clean_old_backups(folder):
    prefixes = [
        "SiAP_Sandaran_Aduan_",
        "SiAP_Sandaran_Kepuasan_Pelajar_",
        "SiAP_Sandaran_Penuh_",
    ]
    # Padam semua fail JSON lama yang mungkin ada sebelum ini
    for old_json in glob.glob(os.path.join(folder, "*.json")):
        try:
            os.remove(old_json)
            print(f"  BERSIH: Dipadam fail JSON (hanya CSV dikekalkan): {os.path.basename(old_json)}")
        except Exception as e:
            pass

    # Kekalkan hanya 2 fail terkini bagi setiap jenis CSV
    for prefix in prefixes:
        files = sorted(
            glob.glob(os.path.join(folder, f"{prefix}*.csv")),
            reverse=True
        )
        for old_file in files[RETENTION_COPIES:]:
            try:
                os.remove(old_file)
                print(f"  BERSIH: Dipadam (> 2 minggu): {os.path.basename(old_file)}")
            except Exception as e:
                print(f"  WARN: Gagal padam {os.path.basename(old_file)}: {e}")

def run_backup():
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d_%H-%M-%S")

    print(f"\n{'='*60}")
    print(f"  SiAP - SANDARAN SUPABASE (FORMAT .CSV SAHAJA)")
    print(f"  {now.strftime('%A, %d %B %Y %H:%M:%S')}")
    print(f"{'='*60}")

    print(f"\n[1/3] Mengambil data dari Supabase...")
    print(f"  URL: {SUPABASE_URL}")

    complaints, _ = fetch_table(TABLE_COMPLAINTS)
    print(f"  Aduan:            {len(complaints)} rekod")

    survey_table, surveys = find_surveys_table()
    if survey_table:
        print(f"  Kepuasan Pelajar: {len(surveys)} rekod  (jadual: {survey_table})")
    else:
        print(f"  Kepuasan Pelajar: 0 rekod  (jadual belum wujud dalam Supabase)")
        surveys = []

    tindakan, _ = fetch_table(TABLE_TINDAKAN)
    print(f"  Tindakan:         {len(tindakan)} rekod")

    logs, _ = fetch_table(TABLE_LOGS)
    print(f"  Log:              {len(logs)} rekod")

    emails, _ = fetch_table(TABLE_EMAILS)
    print(f"  Emel:             {len(emails)} rekod")

    if len(complaints) == 0 and len(surveys) == 0:
        print("\nAMARAN: Tiada data aduan atau kepuasan pelajar dijumpai!")
        sys.exit(1)

    print(f"\n[2/3] Menjana fail CSV (UTF-8 with BOM)...")
    comp_csv   = generate_complaints_csv(complaints)
    survey_csv = generate_surveys_csv(surveys)

    comp_name   = f"SiAP_Sandaran_Aduan_{date_str}.csv"
    survey_name = f"SiAP_Sandaran_Kepuasan_Pelajar_{date_str}.csv"

    print(f"\n[3/3] Menyimpan fail CSV sandaran...")
    folders = []
    if os.path.isdir(GOOGLE_DRIVE_FOLDER):
        folders.append((GOOGLE_DRIVE_FOLDER, "Google Drive (SiAP BACKUP)"))
    else:
        print(f"  WARN: Folder Google Drive tidak ditemui: {GOOGLE_DRIVE_FOLDER}")
    os.makedirs(LOCAL_FOLDER, exist_ok=True)
    folders.append((LOCAL_FOLDER, "Tempatan (backups/)"))

    success = False
    for folder, label in folders:
        print(f"\n  --> {label}")
        try:
            # 1. Tulis CSV Aduan
            with open(os.path.join(folder, comp_name), "w", encoding="utf-8-sig", newline="") as f:
                f.write(comp_csv)
            print(f"      OK: {comp_name}  ({len(complaints)} rekod aduan)")

            # 2. Tulis CSV Kepuasan Pelajar
            with open(os.path.join(folder, survey_name), "w", encoding="utf-8-sig", newline="") as f:
                f.write(survey_csv)
            print(f"      OK: {survey_name}  ({len(surveys)} rekod soal selidik)")

            # 3. Bersihkan fail lama & fail JSON
            clean_old_backups(folder)
            success = True
        except Exception as e:
            print(f"      GAGAL: {e}")

    print(f"\n{'='*60}")
    if success:
        print(f"  SANDARAN CSV BERJAYA!")
        print(f"  Fail Dihasilkan:  .CSV sahaja (UTF-8)")
        print(f"  1. Aduan:         {len(complaints)} rekod -> {comp_name}")
        print(f"  2. Kepuasan:      {len(surveys)} rekod -> {survey_name}")
        print(f"  Tarikh:           {now.strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"  Lokasi Sasaran:   PROJEK AI > SISTEM BACKUP > SiAP BACKUP")
        print(f"  Polisi:           {RETENTION_COPIES} fail CSV terkini dikekalkan")
    else:
        print(f"  SANDARAN GAGAL!")
    print(f"{'='*60}\n")
    return success

if __name__ == "__main__":
    ok = run_backup()
    sys.exit(0 if ok else 1)
