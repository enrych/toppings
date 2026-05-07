import {
  VIDEO_PREFERENCE_STORE,
  withStore,
} from "./indexedDb";

const STORE = VIDEO_PREFERENCE_STORE;

export type AudioModePin = {
  enabled: boolean;
  screenMode: "black" | "visualizer" | "custom";
  imageUrl?: string;
};

export type VideoPreferenceRecord = {
  videoId: string;
  audioModePin: AudioModePin;
};

export type VideoPreferenceSnapshot = {
  audioMode: {
    pinCount: number;
  };
};

async function putAudioModePinRecord(
  videoId: string,
  pin: AudioModePin,
): Promise<void> {
  await withStore(STORE, "readwrite", (store) =>
    store.put({ videoId, audioModePin: pin } satisfies VideoPreferenceRecord),
  );
}

export async function getAudioModePin(
  videoId: string,
): Promise<AudioModePin | null> {
  const record = await withStore<VideoPreferenceRecord | undefined>(
    STORE,
    "readonly",
    (store) => store.get(videoId),
  );
  return record?.audioModePin ?? null;
}

export async function setAudioModePin(
  videoId: string,
  pin: AudioModePin,
): Promise<void> {
  await putAudioModePinRecord(videoId, pin);
}

export async function removeAudioModePin(videoId: string): Promise<void> {
  await withStore(STORE, "readwrite", (store) => store.delete(videoId));
}

export async function countAudioModePins(): Promise<number> {
  return withStore(STORE, "readonly", (store) => store.count());
}

export async function loadVideoPreferenceSnapshot(): Promise<VideoPreferenceSnapshot> {
  const pinCount = await countAudioModePins();
  return { audioMode: { pinCount } };
}

export async function clearAllAudioModePins(): Promise<number> {
  const count = await countAudioModePins();
  await withStore(STORE, "readwrite", (store) => store.clear());
  return count;
}
