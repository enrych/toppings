// IndexedDB rather than chrome.storage: per-video records need neither a quota
// budget nor key-prefix scanning, and video_preference is stored the same way.

import { withStore } from "../../../utils/indexedDb";
import { BROWSER_STORAGE_IDB_STORE } from "../../../data/core";

export interface SavedLoopSegment {
  videoId: string; // the IDB key path
  startTime: number; // seconds
  endTime: number; // seconds
  savedAt: number; // unix ms
}

export async function getSavedLoopSegment(
  videoId: string,
): Promise<SavedLoopSegment | null> {
  const result = await withStore<SavedLoopSegment | undefined>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readonly",
    (store) => store.get(videoId),
  );
  return result ?? null;
}

export async function saveLoopSegment(
  videoId: string,
  startTime: number,
  endTime: number,
): Promise<void> {
  const entry: SavedLoopSegment = {
    videoId,
    startTime,
    endTime,
    savedAt: Date.now(),
  };
  await withStore<SavedLoopSegment>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readwrite",
    (store) => store.put(entry),
  );
}

export async function deleteSavedLoopSegment(videoId: string): Promise<void> {
  await withStore<undefined>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readwrite",
    (store) => store.delete(videoId),
  );
}

export async function getAllSavedLoopSegments(): Promise<SavedLoopSegment[]> {
  return withStore<SavedLoopSegment[]>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readonly",
    (store) => store.getAll(),
  );
}

export async function clearAllSavedLoopSegments(): Promise<void> {
  await withStore<undefined>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readwrite",
    (store) => store.clear(),
  );
}
