#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skrip untuk memuat naik data 87 responden dengan 56 soalan terperinci ke Supabase
"""

import urllib.request, urllib.error, json, re

SUPABASE_URL = "https://dliiscfkrzxdjtgphyoq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWlzY2Zrcnp4ZGp0Z3BoeW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzg4NTgwMiwiZXhwIjoyMTAzNDYxODAyfQ.UE-yGkUitm6jx5bHVYmuOyqoOTTEUumQN-VvWf5OTAw"

def load_data():
    with open("src/data/studentSatisfactionData.ts", "r", encoding="utf-8") as f:
        content = f.read()

    marker = "export const STUDENT_SURVEY_RAW_DATA = ["
    idx = content.find(marker)
    if idx == -1:
        print("Marker tidak ditemui!")
        return []
    start = content.find("[", idx)
    end = content.find("\n];", start)
    json_str = content[start:end+1]
    return json.loads(json_str)

def main():
    raw_data = load_data()
    print(f"Memproses {len(raw_data)} responden...")

    records = []
    for i, item in enumerate(raw_data):
        scores = item.get("SCORES", [])
        
        def s(idx):
            return scores[idx] if len(scores) > idx and scores[idx] is not None else None

        def avg(indices):
            vals = [scores[x] for x in indices if len(scores) > x and scores[x] is not None]
            return round(sum(vals) / len(vals), 2) if vals else None

        avg_bk1 = avg(range(0, 6))
        avg_bk2 = avg(range(6, 12))
        avg_bk = round((avg_bk1 + avg_bk2) / 2, 2) if avg_bk1 and avg_bk2 else (avg_bk1 or avg_bk2)
        avg_immersive = avg(range(12, 18))
        avg_dewan = avg(range(18, 24))
        avg_makmal = avg(range(24, 30))
        avg_perpustakaan = avg(range(30, 37))
        avg_etech = avg(range(37, 43))
        avg_sokongan = avg(range(43, 51))
        avg_bengkel = avg(range(51, 56)) if len(scores) >= 56 else None
        
        wifi_indices = [5, 11, 17, 23, 29, 36]
        avg_wifi = avg(wifi_indices)

        all_valid = [x for x in scores if x is not None]
        avg_keseluruhan = round(sum(all_valid) / len(all_valid), 2) if all_valid else None

        rec = {
            "id": f"SURVEY-2025-{i+1:03d}",
            "timestamp": item.get("Timestamp", ""),
            "year": 2025,
            "jantina": item.get("JANTINA", "LELAKI"),
            "programPengajian": item.get("PROGRAM PENGAJIAN", ""),
            "semester": str(item.get("SEMESTER", "1")),

            # 56 soalan
            "s01_bk1_kerusi": s(0), "s02_bk1_meja": s(1), "s03_bk1_abm": s(2), "s04_bk1_bersih": s(3), "s05_bk1_selamat": s(4), "s06_bk1_wifi": s(5),
            "s07_bk2_kerusi": s(6), "s08_bk2_meja": s(7), "s09_bk2_abm": s(8), "s10_bk2_bersih": s(9), "s11_bk2_selamat": s(10), "s12_bk2_wifi": s(11),
            "s13_immersive_kerusi": s(12), "s14_immersive_meja": s(13), "s15_immersive_abm": s(14), "s16_immersive_bersih": s(15), "s17_immersive_selamat": s(16), "s18_immersive_wifi": s(17),
            "s19_dewan_kerusi": s(18), "s20_dewan_meja": s(19), "s21_dewan_abm": s(20), "s22_dewan_bersih": s(21), "s23_dewan_selamat": s(22), "s24_dewan_wifi": s(23),
            "s25_makmal_komputer_fungsi": s(24), "s26_makmal_komputer_cukup": s(25), "s27_makmal_kerusi": s(26), "s28_makmal_bersih": s(27), "s29_makmal_selamat": s(28), "s30_makmal_wifi": s(29),
            "s31_perpustakaan_rujukan": s(30), "s32_perpustakaan_koleksi": s(31), "s33_perpustakaan_operasi": s(32), "s34_perpustakaan_pinjaman": s(33), "s35_perpustakaan_bersih": s(34), "s36_perpustakaan_selamat": s(35), "s37_perpustakaan_wifi": s(36),
            "s38_etech_layanan": s(37), "s39_etech_harga": s(38), "s40_etech_menu": s(39), "s41_etech_meja_kerusi": s(40), "s42_etech_bersih": s(41), "s43_etech_makanan_sedap": s(42),
            "s44_sokongan_rehat_cukup": s(43), "s45_sokongan_rehat_selesa": s(44), "s46_sokongan_tandas_cukup": s(45), "s47_sokongan_tandas_bersih": s(46), "s48_sokongan_surau_cukup": s(47), "s49_sokongan_surau_selesa": s(48), "s50_sokongan_surau_asas": s(49), "s51_sokongan_parkir": s(50),
            "s52_bengkel_peralatan_cukup": s(51), "s53_bengkel_peralatan_fungsi": s(52), "s54_bengkel_bersih": s(53), "s55_bengkel_selamat": s(54), "s56_bengkel_peraturan_sop": s(55),

            # Purata Kategori
            "purata_bilik_kuliah": avg_bk,
            "purata_immersive_centre": avg_immersive,
            "purata_dewan_kuliah": avg_dewan,
            "purata_makmal_komputer": avg_makmal,
            "purata_perpustakaan": avg_perpustakaan,
            "purata_etech_kafe": avg_etech,
            "purata_kemudahan_sokongan": avg_sokongan,
            "purata_bengkel_amali": avg_bengkel,
            "purata_wifi": avg_wifi,
            "purata_keseluruhan": avg_keseluruhan,

            "kemudahanPenambahbaikan": item.get("KEMUDAHAN", ""),
            "cadangan": item.get("CADANGAN", ""),
            "scores": {
                "bilikKuliah": avg_bk,
                "immersiveCentre": avg_immersive,
                "dewanKuliah": avg_dewan,
                "makmalKomputer": avg_makmal,
                "perpustakaan": avg_perpustakaan,
                "kafe": avg_etech,
                "kemudahanSokongan": avg_sokongan,
                "bengkelAmali": avg_bengkel,
                "wifi": avg_wifi,
                "purataKeseluruhan": avg_keseluruhan
            },
            "rawScores": scores
        }
        records.append(rec)

    # Muat naik ke Supabase
    url = f"{SUPABASE_URL}/rest/v1/siap_student_satisfaction"
    req = urllib.request.Request(
        url,
        data=json.dumps(records).encode("utf-8"),
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"🎉 BERJAYA! {len(records)} rekod responden (lengkap 56 lajur soalan) telah dimuat naik ke Supabase!")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"❌ Ralat HTTP {e.code}: {body}")
    except Exception as e:
        print(f"❌ Ralat: {e}")

if __name__ == "__main__":
    main()
