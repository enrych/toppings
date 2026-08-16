import type { Profile, ProfilePrimitiveConfig } from "../../data/profiles";

export function exportProfile(profile: Profile): void {
  const exportData = {
    $schema:
      "https://toppings.greenstitch.studio/profile-schema/v1.json",
    name: profile.name,
    primitives: profile.primitives,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `toppings-profile-${slugify(profile.name)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  ok: true;
  name: string;
  primitives: ProfilePrimitiveConfig;
}

export interface ImportError {
  ok: false;
  message: string;
}

export async function importProfileFromFile(
  file: File,
): Promise<ImportResult | ImportError> {
  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    return { ok: false, message: "File must be a .json file." };
  }

  let raw: string;
  try {
    raw = await file.text();
  } catch {
    return { ok: false, message: "Could not read the file." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: "File is not valid JSON." };
  }

  return validateProfileJson(parsed);
}

// Accepts both a full export and a bare { name, primitives } object, so a
// hand-written config is importable without the $schema wrapper.
function validateProfileJson(data: unknown): ImportResult | ImportError {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, message: "Expected a JSON object at the top level." };
  }

  const obj = data as Record<string, unknown>;

  const name =
    typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim()
      : null;
  if (!name) {
    return {
      ok: false,
      message: 'Missing or empty "name" field.',
    };
  }
  if (name.length > 40) {
    return { ok: false, message: "Profile name must be 40 characters or fewer." };
  }

  if (
    typeof obj.primitives !== "object" ||
    obj.primitives === null ||
    Array.isArray(obj.primitives)
  ) {
    return {
      ok: false,
      message: '"primitives" must be an object.',
    };
  }

  const primitives = obj.primitives as Record<string, unknown>;
  const validated: ProfilePrimitiveConfig = {};
  const errors: string[] = [];

  for (const [key, value] of Object.entries(primitives)) {
    const error = validatePrimitiveEntry(key, value, validated);
    if (error) errors.push(error);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      message: `Invalid primitive values:\n${errors.slice(0, 5).join("\n")}`,
    };
  }

  return { ok: true, name, primitives: validated };
}

const VALID_PLAYER_LAYOUTS = new Set(["default", "theatre", "no-video"]);
const VALID_PLAYER_VISUALS = new Set(["video", "black", "visualizer", "custom"]);
const VALID_THUMBNAIL_MODES = new Set(["show", "hide", "blur"]);

function validatePrimitiveEntry(
  key: string,
  value: unknown,
  out: ProfilePrimitiveConfig,
): string | null {
  if (typeof value !== "object" || value === null) {
    return `"${key}": value must be an object`;
  }
  const v = value as Record<string, unknown>;

  switch (key) {
    case "watch.layout":
      if (!VALID_PLAYER_LAYOUTS.has(v.value as string)) {
        return `"${key}.value" must be one of: ${[...VALID_PLAYER_LAYOUTS].join(", ")}`;
      }
      out["watch.layout"] = { value: v.value as "default" | "theatre" | "no-video" };
      return null;

    case "watch.visuals":
      if (!VALID_PLAYER_VISUALS.has(v.value as string)) {
        return `"${key}.value" must be one of: ${[...VALID_PLAYER_VISUALS].join(", ")}`;
      }
      out["watch.visuals"] = { value: v.value as "video" | "black" | "visualizer" | "custom" };
      return null;

    case "watch.sidebar":
    case "watch.comments":
    case "watch.endCards":
    case "home.feed":
    case "home.shorts":
    case "search.metadata":
    case "search.shorts":
    case "shorts.shelf":
      if (typeof v.visible !== "boolean") {
        return `"${key}.visible" must be a boolean`;
      }
      (out as Record<string, unknown>)[key] = { visible: v.visible };
      return null;

    case "home.thumbnails":
    case "search.thumbnails":
      if (!VALID_THUMBNAIL_MODES.has(v.mode as string)) {
        return `"${key}.mode" must be one of: ${[...VALID_THUMBNAIL_MODES].join(", ")}`;
      }
      (out as Record<string, unknown>)[key] = { mode: v.mode as "show" | "hide" | "blur" };
      return null;

    default:
      // Skipped rather than rejected: a file written by a newer version must
      // still import on an older one, minus the keys it does not know.
      return null;
  }
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
