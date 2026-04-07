import { STORAGE_KEYS } from '@/constants';

export interface ErrorLogEntry {
  timestamp: number;
  context: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 100;

export function logError(
  context: string,
  error: Error | string,
  metadata?: Record<string, unknown>,
): void {
  try {
    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      context,
      message: typeof error === 'string' ? error : error.message,
      metadata,
    };

    const logs = getErrorLogs();
    logs.push(entry);

    const trimmed = logs.length > MAX_LOG_ENTRIES
      ? logs.slice(logs.length - MAX_LOG_ENTRIES)
      : logs;

    localStorage.setItem(STORAGE_KEYS.errorLogs, JSON.stringify(trimmed));
  } catch {
    // Silently fail if localStorage is unavailable or full
    // We cannot log an error about failing to log errors
  }
}

export function getErrorLogs(): ErrorLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.errorLogs);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as ErrorLogEntry[];
  } catch {
    return [];
  }
}

export function clearErrorLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.errorLogs);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}