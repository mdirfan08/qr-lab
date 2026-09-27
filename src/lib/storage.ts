// Local persistence for QR LAB. Everything lives in the browser's localStorage —
// nothing is ever sent to a server. See the "Local Mode" indicator in the UI.
import type { QRRecord } from "../types/qr";

const KEY = "qrlab.library.v1";

export function loadLibrary(): QRRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLibrary(records: QRRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // Storage full or unavailable — fail silently, the in-memory session still works.
  }
}

export function upsertRecord(record: QRRecord): QRRecord[] {
  const lib = loadLibrary();
  const idx = lib.findIndex((r) => r.id === record.id);
  if (idx >= 0) lib[idx] = record;
  else lib.unshift(record);
  saveLibrary(lib);
  return lib;
}

export function deleteRecord(id: string): QRRecord[] {
  const lib = loadLibrary().filter((r) => r.id !== id);
  saveLibrary(lib);
  return lib;
}

export function genId(): string {
  return `qr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
