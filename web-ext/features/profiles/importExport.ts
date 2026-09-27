import { primitiveById } from "@/youtube/primitives";
import type { Profile, ProfilePrimitiveConfig } from "./profiles";

const SCHEMA = "https://toppings.enry.ch/profile-schema/v1.json";
const MAX_NAME_LENGTH = 40;

export function exportProfile(profile: Profile): void {
  const json = JSON.stringify({ $schema: SCHEMA, name: profile.name, primitives: profile.primitives, exportedAt: new Date().toISOString() }, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `toppings-profile-${slugify(profile.name)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export type ImportResult = { ok: true; name: string; primitives: ProfilePrimitiveConfig } | { ok: false; message: string };

export async function importProfileFromFile(file: File): Promise<ImportResult> {
  if (!file.name.endsWith(".json") && file.type !== "application/json") return { ok: false, message: "File must be a .json file." };
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, message: "Could not read the file." };
  }
  try {
    return parseProfileJson(JSON.parse(text));
  } catch {
    return { ok: false, message: "File is not valid JSON." };
  }
}

// Accepts a full export or a bare { name, primitives } object, so a
// hand-written config imports without the $schema wrapper. Unknown primitive
// ids are skipped rather than rejected: a file from a newer version must still
// import on an older one, minus what it does not know.
export function parseProfileJson(data: unknown): ImportResult {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return { ok: false, message: "Expected a JSON object at the top level." };
  const { name, primitives } = data as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) return { ok: false, message: 'Missing or empty "name" field.' };
  if (name.trim().length > MAX_NAME_LENGTH) return { ok: false, message: `Profile name must be ${MAX_NAME_LENGTH} characters or fewer.` };
  if (typeof primitives !== "object" || primitives === null || Array.isArray(primitives)) return { ok: false, message: '"primitives" must be an object.' };

  const config: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const [id, value] of Object.entries(primitives)) {
    const primitive = primitiveById(id);
    if (!primitive) continue;
    const parsed = primitive.parse(value);
    if (parsed === undefined) errors.push(`"${id}" has an invalid value`);
    else config[id] = parsed;
  }
  if (errors.length) return { ok: false, message: `Invalid primitive values:\n${errors.slice(0, 5).join("\n")}` };

  return { ok: true, name: name.trim(), primitives: config as ProfilePrimitiveConfig };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, MAX_NAME_LENGTH);
}
