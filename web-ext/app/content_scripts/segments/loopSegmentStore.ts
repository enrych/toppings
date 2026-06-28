/**
 * Per-video loop segment persistence backed by IndexedDB.
 *
 * Records are stored in the `loop_segment` object store, keyed by `videoId`.
 * This is the right storage tier for structured per-entity data — no quota
 * worries, no key-prefix scanning, and it sits naturally alongside
 * `video_preference` which follows the same pattern.
 *
 * Save  — user presses the save shortcut while loop is active.
 * Clear — user presses the save shortcut while loop is inactive.
 */

import { withStore } from "../../../utils/indexedDb";
import { BROWSER_STORAGE_IDB_STORE } from "../../../data/core";

export interface SavedLoopSegment {
  /** IDB key path — matches the videoId query param. */
  videoId: string;
  /** Loop start in seconds from the beginning of the video. */
  startTime: number;
  /** Loop end in seconds from the beginning of the video. */
  endTime: number;
  /** Unix timestamp (ms) when the segment was last saved. */
  savedAt: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Retrieve the saved loop segment for a video, or null if none exists. */
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

/** Persist the current loop segment positions for a video. */
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

/** Remove the saved loop segment for a video. */
export async function deleteSavedLoopSegment(videoId: string): Promise<void> {
  await withStore<undefined>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readwrite",
    (store) => store.delete(videoId),
  );
}

/** Return all saved loop segments (e.g. for a management UI). */
export async function getAllSavedLoopSegments(): Promise<SavedLoopSegment[]> {
  return withStore<SavedLoopSegment[]>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readonly",
    (store) => store.getAll(),
  );
}

/** Remove every saved loop segment. */
export async function clearAllSavedLoopSegments(): Promise<void> {
  await withStore<undefined>(
    BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
    "readwrite",
    (store) => store.clear(),
  );
}
