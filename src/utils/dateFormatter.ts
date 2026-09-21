/**
 * SiAP Date Formatting Utility
 * Standardizes all date representations to DD-MM-YYYY format across the system.
 */

/**
 * Converts any date string or Date object into DD-MM-YYYY (or DD-MM-YYYY HH:mm:ss if includeTime is true).
 *
 * Examples:
 * - "2026-09-20" -> "20-09-2026"
 * - "2026-09-20 11:38:45" (includeTime=true) -> "20-09-2026 11:38:45"
 * - "2026-09-20 11:38:45" (includeTime=false) -> "20-09-2026"
 * - "Tue Aug 25 2026 14:50:38 GMT+0800" -> "25-08-2026 14:50:38"
 */
export function formatDate(val?: string | null, includeTime: boolean = false): string {
  if (!val || val.trim() === '' || val === '-') return '-';
  const trimmed = val.trim();

  // If already starts with DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}/.test(trimmed)) {
    if (!includeTime && trimmed.includes(' ')) {
      return trimmed.split(' ')[0];
    }
    return trimmed;
  }

  // Match YYYY-MM-DD with optional time
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?/);
  if (ymdMatch) {
    const [, y, m, d, time] = ymdMatch;
    const dateStr = `${d}-${m}-${y}`;
    if (includeTime && time) {
      return `${dateStr} ${time}`;
    }
    return dateStr;
  }

  // Parse using Date constructor for ISO strings or RFC2822
  try {
    const dt = new Date(trimmed);
    if (!isNaN(dt.getTime())) {
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = dt.getFullYear();
      const dateStr = `${day}-${month}-${year}`;
      if (includeTime) {
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        const seconds = String(dt.getSeconds()).padStart(2, '0');
        return `${dateStr} ${hours}:${minutes}:${seconds}`;
      }
      return dateStr;
    }
  } catch {}

  return trimmed;
}

/**
 * Formats a date string to DD-MM-YYYY HH:mm:ss
 */
export function formatDateTime(val?: string | null): string {
  return formatDate(val, true);
}
