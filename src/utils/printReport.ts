import { Complaint, TindakanItem } from '../types';
import { STATUS_CONFIG } from '../data/categories';

export function printComplaintReport(complaint: Complaint, tindakanList: TindakanItem[] = []): void {
  if (!complaint) return;
  const printWin = window.open('', '_blank');
  if (!printWin) {
    window.print();
    return;
  }

  const currentStatusConfig = STATUS_CONFIG[complaint.status];

  const tindakanRows = tindakanList.length > 0
    ? tindakanList.map((t) => `
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 10.5px; font-family: monospace; white-space: nowrap;">${t.tarikhMasa || '-'}</td>
          <td style="padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 10.5px;"><span class="badge status-${t.status}">${t.status}</span></td>
          <td style="padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 10.5px; color: #334155; line-height: 1.35;">${t.catatanTindakan || '-'}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="3" style="padding: 10px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #e2e8f0;">Tiada catatan tindakan tambahan direkodkan.</td></tr>`;

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Rasmi Aduan ${complaint.noRujukan}</title>
      <meta charset="utf-8" />
      <style>
        @page { size: A4 portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 0;
          background: #fff;
          font-size: 11px;
          line-height: 1.35;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .header h1 {
          margin: 0;
          font-size: 17px;
          color: #1e3a8a;
          letter-spacing: -0.3px;
        }
        .header p {
          margin: 2px 0 0 0;
          font-size: 10.5px;
          color: #64748b;
          font-weight: 600;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 8px 0 4px 0;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 2px;
        }
        .grid-2col {
          display: flex;
          flex-wrap: wrap;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .grid-item {
          width: 50%;
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10.5px;
        }
        .grid-item:nth-child(odd) {
          border-right: 1px solid #e2e8f0;
        }
        .grid-lbl {
          width: 115px;
          background: #f8fafc;
          padding: 4px 8px;
          font-weight: 600;
          color: #475569;
          flex-shrink: 0;
          border-right: 1px solid #e2e8f0;
        }
        .grid-val {
          padding: 4px 8px;
          flex: 1;
          color: #0f172a;
        }
        .badge {
          display: inline-block;
          padding: 1px 7px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-SELESAI { background: #dcfce7; color: #15803d; }
        .status-TIDAK_DAPAT_DISELESAIKAN { background: #ffe4e6; color: #be123c; }
        .status-DALAM_TINDAKAN { background: #ffedd5; color: #c2410c; }
        .status-DALAM_SEMAKAN { background: #dbeafe; color: #1d4ed8; }
        .status-MENUNGGU { background: #fef9c3; color: #a16207; }
        .box-butiran {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 10.5px;
          line-height: 1.4;
          white-space: pre-wrap;
          color: #1e293b;
          margin-bottom: 6px;
        }
        table.history-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
        }
        table.history-table th {
          background: #f1f5f9;
          padding: 4px 8px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        table.history-table td {
          border: 1px solid #e2e8f0;
        }
        .footer {
          margin-top: 12px;
          border-top: 1px solid #cbd5e1;
          padding-top: 5px;
          text-align: center;
          font-size: 9.5px;
          color: #64748b;
          font-weight: 500;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SiAP – SISTEM ADUAN PELANGGAN</h1>
        <p>LAPORAN PENUH MAKLUMAT & SEJARAH TINDAKAN ADUAN</p>
      </div>

      <div class="section-title">1. MAKLUMAT UTAMA ADUAN</div>
      <div class="grid-2col">
        <div class="grid-item"><div class="grid-lbl">No. Rujukan:</div><div class="grid-val" style="font-family: monospace; font-weight: bold; color: #2563eb;">${complaint.noRujukan}</div></div>
        <div class="grid-item"><div class="grid-lbl">Status Semasa:</div><div class="grid-val"><span class="badge status-${complaint.status}">${currentStatusConfig?.label || complaint.status}</span></div></div>
        <div class="grid-item"><div class="grid-lbl">Kategori Aduan:</div><div class="grid-val">${complaint.kategoriNama}</div></div>
        <div class="grid-item"><div class="grid-lbl">Lokasi Kejadian:</div><div class="grid-val">${complaint.lokasi}</div></div>
        <div class="grid-item"><div class="grid-lbl">Nama Pengadu:</div><div class="grid-val">${complaint.namaPengadu} (${complaint.telefon})</div></div>
        <div class="grid-item"><div class="grid-lbl">Emel Pengadu:</div><div class="grid-val">${complaint.emel}</div></div>
        <div class="grid-item"><div class="grid-lbl">Tarikh Aduan:</div><div class="grid-val">${complaint.tarikhMasa}</div></div>
        <div class="grid-item"><div class="grid-lbl">Tarikh Kejadian:</div><div class="grid-val">${complaint.tarikhKejadian || '-'}</div></div>
      </div>

      <div class="section-title">2. TAJUK & BUTIRAN ADUAN PENGADU</div>
      <div class="box-butiran">
        <div style="font-weight: bold; margin-bottom: 2px; color: #0f172a;">Tajuk: ${complaint.tajukAduan}</div>
        <div>${complaint.butiranAduan}</div>
      </div>

      <div class="section-title">3. SEJARAH TINDAKAN & CATATAN PEGAWAI</div>
      <table class="history-table">
        <thead>
          <tr>
            <th style="width: 25%;">Tarikh & Masa</th>
            <th style="width: 20%;">Status</th>
            <th style="width: 55%;">Catatan Tindakan</th>
          </tr>
        </thead>
        <tbody>
          ${tindakanRows}
        </tbody>
      </table>

      ${complaint.rating ? `
        <div class="section-title" style="margin-top: 8px;">4. PENILAIAN MAKLUM BALAS PELANGGAN</div>
        <div class="grid-2col">
          <div class="grid-item"><div class="grid-lbl">Tahap Kepuasan:</div><div class="grid-val"><strong>${complaint.rating} / 5 Bintang</strong></div></div>
          <div class="grid-item"><div class="grid-lbl">Tarikh Penilaian:</div><div class="grid-val">${complaint.ratingTarikh || '-'}</div></div>
          <div class="grid-item" style="width: 100%; border-right: none;"><div class="grid-lbl">Ulasan Pelanggan:</div><div class="grid-val">${complaint.ulasanPelanggan || 'Tiada ulasan tambahan.'}</div></div>
        </div>
      ` : ''}

      <div class="footer">
        Laporan dijana secara automatik oleh SiAP (Sistem Aduan Pelanggan). Tandatangan tidak diperlukan.
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `);
  printWin.document.close();
}
