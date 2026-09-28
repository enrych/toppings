import { playbackKeys } from "@/features/playback/keys";
import { profilesKeys } from "@/features/profiles/keys";
import { segmentsKeys } from "@/features/segments/keys";
import { shortsKeys } from "@/features/shorts/keys";

export interface SearchEntry {
  // Must match the rendered label character for character: a result is
  // located in the DOM by this text, so a copy edit in the page must land
  // here too.
  label: string;
  description?: string;
  segment: string;
  sectionId?: string;
  page: string;
  section?: string;
}

export interface SearchResult {
  entry: SearchEntry;
  score: number;
  matchedIndices: number[];
}

const shortcutEntries = (group: { id: string; title: string; keys: Record<string, { label: string; description?: string }> }): SearchEntry[] =>
  Object.values(group.keys).map((key) => ({ label: key.label, description: key.description, segment: "shortcuts", sectionId: group.id, page: "Shortcuts", section: group.title }));

export const SEARCH_INDEX: SearchEntry[] = [
  { label: "Enable Toppings", description: "When off, nothing runs on YouTube.", segment: "", page: "General", section: "Extension" },
  { label: "Appearance", description: "System, dark, or light, for the popup and this page.", segment: "", page: "General", section: "Appearance" },
  { label: "Player gear menu", description: "A Toppings section in the player's settings menu.", segment: "", page: "General", section: "Profile surfaces" },
  { label: "Audio button in the player", description: "A headphones button that turns the Audio profile on and off.", segment: "", page: "General", section: "Profile surfaces" },
  { label: "Re-scan features", description: "Clears the cached feature compatibility check.", segment: "", page: "General", section: "Diagnostics" },
  { label: "Playback controls", description: "Default rate, rate shortcuts and seek shortcuts on the watch page.", segment: "watch", sectionId: "playback-rate", page: "Watch", section: "Playback rate" },
  { label: "Default playback rate", description: "Rate applied to every video on load.", segment: "watch", sectionId: "playback-rate", page: "Watch", section: "Playback rate" },
  { label: "Custom playback rates", description: "Rates offered in the player's speed panel.", segment: "watch", sectionId: "playback-rate", page: "Watch", section: "Playback rate" },
  { label: "Toggle playback rate", description: "Rate to switch to with the toggle shortcut.", segment: "watch", sectionId: "playback-rate", page: "Watch", section: "Playback rate" },
  { label: "Playback rate step", description: "Amount the rate changes on the increase and decrease shortcuts.", segment: "watch", sectionId: "playback-rate", page: "Watch", section: "Playback rate" },
  { label: "Seek backward", description: "Seconds to seek backward.", segment: "watch", sectionId: "seek", page: "Watch", section: "Seek" },
  { label: "Seek forward", description: "Seconds to seek forward.", segment: "watch", sectionId: "seek", page: "Watch", section: "Seek" },
  { label: "Segments", description: "The segments button, panel and markers, and their shortcuts.", segment: "watch", sectionId: "segments", page: "Watch", section: "Segments" },
  { label: "Auto-load on page open", description: "Restore segments when you open a video.", segment: "watch", sectionId: "segments", page: "Watch", section: "Segments" },
  { label: "Nudge step", description: "Seconds a segment edge moves on the first nudge.", segment: "watch", sectionId: "segments", page: "Watch", section: "Segments" },
  { label: "Nudge multiplier", description: "How much the step grows on repeated nudges.", segment: "watch", sectionId: "segments", page: "Watch", section: "Segments" },
  { label: "Nudge maximum", description: "Largest step a repeated nudge can reach.", segment: "watch", sectionId: "segments", page: "Watch", section: "Segments" },
  { label: "Feature availability", description: "Which features work on your YouTube.", segment: "watch", sectionId: "feature-availability", page: "Watch", section: "Feature availability" },
  { label: "Shorts features", description: "Auto-scroll, seek and rate controls on Shorts.", segment: "shorts", page: "Shorts", section: "Behavior" },
  { label: "Auto-scroll", description: "Continue to the next Short when one ends.", segment: "shorts", page: "Shorts", section: "Behavior" },
  { label: "Toggle playback rate", description: "Rate to switch to on Shorts.", segment: "shorts", page: "Shorts", section: "Playback rate" },
  { label: "Seek backward", description: "Seconds to seek backward on Shorts.", segment: "shorts", page: "Shorts", section: "Seek" },
  { label: "Seek forward", description: "Seconds to seek forward on Shorts.", segment: "shorts", page: "Shorts", section: "Seek" },
  { label: "Runtime statistics", description: "Total and average runtime at the top of playlist pages.", segment: "playlist", page: "Playlist", section: "Runtime statistics" },
  { label: "Built-in presets", description: "Audio and Focus, ready to activate.", segment: "profiles", page: "Profiles", section: "Built-in presets" },
  { label: "Audio", description: "Built-in preset: hides the video, keeps the sound.", segment: "profiles", page: "Profiles", section: "Built-in presets" },
  { label: "Focus", description: "Built-in preset: hides sidebar, comments, and end cards.", segment: "profiles", page: "Profiles", section: "Built-in presets" },
  { label: "My profiles", description: "Your own mix of page tweaks.", segment: "profiles", page: "Profiles", section: "My profiles" },
  { label: "Video screen", description: "Real video, black screen, visualizer, or your own image, in a profile.", segment: "profiles", page: "Profiles", section: "My profiles" },
  { label: "Schedules", description: "Switch a profile on by time of day or by place.", segment: "profiles", page: "Profiles", section: "Schedules" },
  { label: "Places", description: "Saved places for schedules, kept on this device.", segment: "profiles", page: "Profiles", section: "Places" },
  ...shortcutEntries(playbackKeys),
  ...shortcutEntries(segmentsKeys),
  ...shortcutEntries(shortsKeys),
  ...shortcutEntries(profilesKeys),
];

// Subsequence match: query characters must appear in order but need not be
// adjacent. Bonuses pull contiguous and word-start matches above scattered ones.
function fuzzyMatch(text: string, query: string): { score: number; indices: number[] } {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const indices: number[] = [];
  let score = 0;
  let run = 0;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;
    run = indices.length && indices[indices.length - 1] === ti - 1 ? run + 1 : 0;
    score += 1 + run * 2 + (ti === 0 || t[ti - 1] === " " ? 3 : 0);
    indices.push(ti);
    qi++;
  }
  if (qi < q.length) return { score: 0, indices: [] };
  if (t.includes(q)) score += 15;
  if (t.startsWith(q)) score += 25;
  if (t === q) score += 50;
  return { score, indices };
}

export function fuzzySearch(query: string): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const results: SearchResult[] = [];
  for (const entry of SEARCH_INDEX) {
    const label = fuzzyMatch(entry.label, q);
    const score =
      label.score * 3 +
      (entry.section ? fuzzyMatch(entry.section, q).score * 1.5 : 0) +
      fuzzyMatch(entry.page, q).score +
      (entry.description ? fuzzyMatch(entry.description, q).score * 0.5 : 0);
    if (score > 0) results.push({ entry, score, matchedIndices: label.indices });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}
