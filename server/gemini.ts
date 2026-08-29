import { GoogleGenAI } from '@google/genai';
import { Complaint } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

export async function analyzeComplaintWithAI(complaint: Partial<Complaint>): Promise<{
  cadanganKategori: string;
  tahapKeutamaan: 'KECEMASAN' | 'TINGGI' | 'SEDERHANA' | 'RENDAH';
  analisisRingkas: string;
  cadanganTindakanPegawai: string[];
  anggaranMasaPenyelesaian: string;
}> {
  const ai = getAIClient();
  if (!ai) {
    return {
      cadanganKategori: complaint.kategori || 'KEMUDAHAN',
      tahapKeutamaan: 'SEDERHANA',
      analisisRingkas: 'Aduan memerlukan semakan di tapak lokasi bagi mengesahkan butiran fizikal dan teknikal.',
      cadanganTindakanPegawai: [
        'Hubungi pengadu untuk pengesahan butiran lanjut.',
        'Lakukan pemeriksaan tapak di lokasi dinyatakan.',
        'Sediakan alat diagnosis dan perbaiki isu dalam tempoh SLA 24 jam.',
      ],
      anggaranMasaPenyelesaian: '4 - 8 Jam',
    };
  }

  try {
    const prompt = `Anda adalah pembantu AI Pintar untuk SiAP (Sistem Aduan Pelanggan).
Analisis aduan berikut dan berikan cadangan tindakan untuk pegawai bertugas dalam Bahasa Melayu:
Tajuk: ${complaint.tajukAduan || ''}
Kategori: ${complaint.kategoriNama || complaint.kategori || ''}
Lokasi: ${complaint.lokasi || ''}
Butiran: ${complaint.butiranAduan || ''}

Sila berikan output dalam format JSON sah dengan struktur:
{
  "cadanganKategori": "KEMUDAHAN" | "SISTEM" | "PERKHIDMATAN" | "KEBERSIHAN" | "LAIN_LAIN",
  "tahapKeutamaan": "KECEMASAN" | "TINGGI" | "SEDERHANA" | "RENDAH",
  "analisisRingkas": "string (1-2 ayat analisis punca masalah)",
  "cadanganTindakanPegawai": ["langkah 1", "langkah 2", "langkah 3"],
  "anggaranMasaPenyelesaian": "string (cth: 2 - 4 Jam)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return {
      cadanganKategori: complaint.kategori || 'KEMUDAHAN',
      tahapKeutamaan: 'SEDERHANA',
      analisisRingkas: 'Pemeriksaan fizikal dan verifikasi diperlukan oleh pegawai bertugas.',
      cadanganTindakanPegawai: [
        'Semak keadaan peralatan di lokasi.',
        'Jadualkan kerja pembaikan segera.',
        'Kemaskini status aduan dalam sistem.',
      ],
      anggaranMasaPenyelesaian: '4 - 6 Jam',
    };
  }
}
