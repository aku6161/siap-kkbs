/**
 * SiAP Date & Time Formatting Utility
 * Standardizes all date and time representations to Malaysia Time (Asia/Kuala_Lumpur, UTC+8) in DD-MM-YYYY format.
 */

export function formatDate(val?: string | null, includeTime: boolean = false): string {
  if (!val || val.trim() === '' || val === '-') return '-';
  const trimmed = val.trim();

  // 1. Try parsing with Date (handles ISO strings with UTC 'Z' or offsets, RFC2822, etc.)
  try {
    const dt = new Date(trimmed);
    if (!isNaN(dt.getTime())) {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false } : {}),
      });
      const parts = formatter.formatToParts(dt);
      const map: Record<string, string> = {};
      for (const p of parts) {
        map[p.type] = p.value;
      }
      const dateStr = `${map.day}-${map.month}-${map.year}`;
      if (includeTime && map.hour) {
        return `${dateStr} ${map.hour}:${map.minute}:${map.second}`;
      }
      return dateStr;
    }
  } catch {}

  // 2. Fallback: If already starts with DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}/.test(trimmed)) {
    if (!includeTime && trimmed.includes(' ')) {
      return trimmed.split(' ')[0];
    }
    return trimmed;
  }

  // 3. Fallback: Match YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?/);
  if (ymdMatch) {
    const [, y, m, d, time] = ymdMatch;
    const dateStr = `${d}-${m}-${y}`;
    if (includeTime && time) {
      return `${dateStr} ${time}`;
    }
    return dateStr;
  }

  return trimmed;
}

/**
 * Formats a date string to DD-MM-YYYY HH:mm:ss in Malaysia Time (UTC+8)
 */
export function formatDateTime(val?: string | null): string {
  return formatDate(val, true);
}
