import { join, resolve } from "node:path";
import { REPO_PATH } from "@toppings/constants";

export const ROOT = resolve(import.meta.dir, "../..");

export function repoPath<K extends keyof typeof REPO_PATH>(key: K): string {
  return join(ROOT, REPO_PATH[key]);
}
