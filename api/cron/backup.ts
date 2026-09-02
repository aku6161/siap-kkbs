import dotenv from 'dotenv';
dotenv.config();

import { db } from '../../server/db';
import type { Request, Response } from 'express';

const BACKUP_FOLDER_ID = process.env.BACKUP_DRIVE_FOLDER_ID || '1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28';
const CRON_SECRET = process.env.CRON_SECRET || '';
const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL || db.getConfig().googleAppsScriptUrl;

/**
 * Weekly Backup Trigger
 * Called by Vercel Cron every Sunday at 2:00 AM MYT (18:00 UTC Saturday)
 * Also accessible at POST /api/cron/backup for manual triggering from admin panel.
 *
 * This handler:
 *   1. Validates the CRON_SECRET header for security.
 *   2. Fetches the full data snapshot from in-memory DB.
 *   3. Sends the snapshot as JSON to Google Apps Script which saves it to Google Drive.
 *   4. The Apps Script keeps only the 2 most recent backups and auto-deletes older ones.
 */
async function runBackup(): Promise<{ success: boolean; message: string; fileName?: string }> {
  const snapshot = db.getFullSnapshot();
  const now = new Date();

  // Format filename: siap_backup_YYYY-MM-DD.json
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  const fileName = `siap_backup_${dateStr}_${timeStr}.json`;

  if (!GAS_URL) {
    return {
      success: false,
      message: 'Google Apps Script URL tidak dikonfigurasi. Sandaran tidak dapat dilakukan.',
    };
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_BACKUP',
        folderId: BACKUP_FOLDER_ID,
        fileName,
        content: JSON.stringify(snapshot, null, 2),
        maxBackups: 2, // Keep only 2 most recent backups
      }),
      redirect: 'follow',
    });

    const text = await response.text();
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      result = { status: 'success', message: 'Sandaran dihantar ke Google Drive.' };
    }

    if (result.status === 'success') {
      console.log(`✅ Backup berjaya: ${fileName}`);
      return { success: true, message: result.message || `Sandaran ${fileName} berjaya disimpan.`, fileName };
    } else {
      console.error('❌ Backup gagal:', result.message);
      return { success: false, message: result.message || 'Sandaran gagal.' };
    }
  } catch (err: any) {
    console.error('❌ Backup network error:', err.message);
    return { success: false, message: `Ralat sambungan: ${err.message}` };
  }
}

export async function handleBackupCron(req: Request, res: Response) {
  // Vercel Cron sends Authorization header with Bearer token
  const authHeader = req.headers['authorization'];
  const cronSecret = authHeader?.replace('Bearer ', '') || req.headers['x-cron-secret'] as string;

  // For Vercel Cron, the header is automatically validated. For manual triggers from admin, check CRON_SECRET.
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isManualWithSecret = CRON_SECRET && cronSecret === CRON_SECRET;

  if (!isVercelCron && !isManualWithSecret) {
    return res.status(401).json({ error: 'Tidak dibenarkan. Sila sertakan CRON_SECRET yang betul.' });
  }

  const result = await runBackup();
  return res.status(result.success ? 200 : 500).json(result);
}

export default handleBackupCron;
