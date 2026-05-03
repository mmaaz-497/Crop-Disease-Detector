'use client';

import type { ScanRecord } from '@/types/diagnosis';

const SCANS_KEY = 'zaraat_scans';
const MAX_SCANS = 10;

export function getScans(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(SCANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScan(scan: ScanRecord): void {
  try {
    const existing = getScans();
    const updated = [scan, ...existing].slice(0, MAX_SCANS);
    localStorage.setItem(SCANS_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function getScanById(id: string): ScanRecord | null {
  return getScans().find((s) => s.id === id) ?? null;
}

export function deleteScan(id: string): void {
  try {
    const updated = getScans().filter((s) => s.id !== id);
    localStorage.setItem(SCANS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
