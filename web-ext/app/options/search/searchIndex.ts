export interface SearchEntry {
  /** Exact label text as it appears in the UI — used for search and DOM lookup. */
  label: string;
  description?: string;
  path: string;
  /** ID of the nearest <section> to scroll to when no individual row is found. */
  sectionId?: string;
  page: string;
  section?: string;
}

export interface SearchResult {
  entry: SearchEntry;
  score: number;
  /** Character indices in `entry.label` that matched the query — for highlighting. */
  matchedIndices: number[];
}

// ---------------------------------------------------------------------------
// Static index — labels must exactly match the text shown in the UI.
// ---------------------------------------------------------------------------

export const SEARCH_INDEX: SearchEntry[] = [
  // -------------------------------------------------------------------------
  // General
  // -------------------------------------------------------------------------
  { label: "Enable Extension", description: "When off, no Toppings features run on YouTube.", path: "/", page: "General", section: "Extension" },
  { label: "Theme", description: "System, Dark, or Light. Affects the popup and options UI.", path: "/", page: "General", section: "Appearance" },
  { label: "Popup profile switcher", description: "Show the profile list in the extension popup.", path: "/", page: "General", section: "Profile Surfaces" },
  { label: "Player gear menu", description: "Adds a Toppings section to the video player's settings menu.", path: "/", page: "General", section: "Profile Surfaces" },
  { label: "YouTube sidebar entry", description: "Adds a Toppings entry to YouTube's left navigation sidebar.", path: "/", page: "General", section: "Profile Surfaces" },
  { label: "Re-scan Capabilities", description: "Clears the cached feature compatibility check.", path: "/", page: "General", section: "Feature Diagnostics" },
  { label: "Watch Page", description: "Enable or disable all Toppings features on the watch page.", path: "/", page: "General", section: "YouTube Pages" },
  { label: "Shorts", description: "Enable or disable Toppings on Shorts.", path: "/", page: "General", section: "YouTube Pages" },
  { label: "Playlist", description: "Enable or disable runtime statistics on playlist pages.", path: "/", page: "General", section: "YouTube Pages" },

  // -------------------------------------------------------------------------
  // Watch
  // -------------------------------------------------------------------------
  { label: "Default Playback Rate", description: "Rate applied to every video on load. 1 = Normal.", path: "/watch", sectionId: "playback-rate", page: "Watch", section: "Playback Rate" },
  { label: "Custom Playback Rates", description: "Comma-separated rates for the player speed menu.", path: "/watch", sectionId: "playback-rate", page: "Watch", section: "Playback Rate" },
  { label: "Toggle Playback Rate", description: "Rate to switch to when pressing the toggle shortcut.", path: "/watch", sectionId: "playback-rate", page: "Watch", section: "Playback Rate" },
  { label: "Increase Playback Rate Step", description: "Amount the rate goes up when pressing the increase shortcut.", path: "/watch", sectionId: "playback-rate", page: "Watch", section: "Playback Rate" },
  { label: "Decrease Playback Rate Step", description: "Amount the rate goes down when pressing the decrease shortcut.", path: "/watch", sectionId: "playback-rate", page: "Watch", section: "Playback Rate" },
  { label: "Seek Backward", description: "Seconds to seek backward.", path: "/watch", sectionId: "seek", page: "Watch", section: "Seek" },
  { label: "Seek Forward", description: "Seconds to seek forward.", path: "/watch", sectionId: "seek", page: "Watch", section: "Seek" },
  { label: "Auto-load on page open", description: "Automatically restore segments when you open a video.", path: "/watch", sectionId: "loop", page: "Watch", section: "Segments" },
  { label: "Feature Availability", description: "Which features are active on your YouTube.", path: "/watch", sectionId: "feature-availability", page: "Watch", section: "Feature Availability" },

  // -------------------------------------------------------------------------
  // Shorts
  // -------------------------------------------------------------------------
  { label: "Auto-Scroll", description: "Automatically scroll to the next reel when one ends.", path: "/shorts", page: "Shorts", section: "Behavior" },
  { label: "Toggle Playback Rate", description: "Rate to switch to when pressing the toggle shortcut.", path: "/shorts", page: "Shorts", section: "Playback Rate" },
  { label: "Seek Backward", description: "Seconds to seek backward.", path: "/shorts", page: "Shorts", section: "Seek" },
  { label: "Seek Forward", description: "Seconds to seek forward.", path: "/shorts", page: "Shorts", section: "Seek" },

  // -------------------------------------------------------------------------
  // Playlist
  // -------------------------------------------------------------------------
  { label: "Runtime Statistics", description: "Total and average runtime shown at the top of playlist pages.", path: "/playlist", page: "Playlist", section: "Runtime Statistics" },

  // -------------------------------------------------------------------------
  // Keybindings — Watch Page section
  // -------------------------------------------------------------------------
  { label: "Toggle Playback Rate", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Increase Playback Rate", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Decrease Playback Rate", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Seek Backward", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Seek Forward", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Segments: Load Last Used / Toggle", description: "Load the last-used segment config and enable it. If segments are already active, disables them.", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Segments: Fresh Slate", description: "Always start a brand-new segment config.", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Segments: Set Start of Active", description: "Pin the start marker of the active segment to the current time.", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Segments: Set End of Active", description: "Pin the end marker of the active segment to the current time.", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },
  { label: "Segments: Save to Default Slot", description: "While segments active: saves to default slot. While segments off: clears the last-used record.", path: "/keybindings", sectionId: "watch", page: "Shortcuts", section: "Watch Page" },

  // Keybindings — Shorts section
  { label: "Toggle Playback Rate", path: "/keybindings", sectionId: "shorts", page: "Shortcuts", section: "Shorts" },
  { label: "Seek Backward", path: "/keybindings", sectionId: "shorts", page: "Shortcuts", section: "Shorts" },
  { label: "Seek Forward", path: "/keybindings", sectionId: "shorts", page: "Shortcuts", section: "Shorts" },

  // Keybindings — Profiles section
  { label: "Cycle Profiles", description: "Cycle through all profiles without leaving the video.", path: "/keybindings", sectionId: "profiles", page: "Shortcuts", section: "Profiles" },

  // Keybindings — Nudge section
  { label: "Nudge Active Segment Start Backward", description: "Move the start marker of the active segment back.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },
  { label: "Nudge Active Segment Start Forward", description: "Move the start marker of the active segment forward.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },
  { label: "Nudge Active Segment End Forward", description: "Move the end marker of the active segment forward.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },
  { label: "Nudge Active Segment End Backward", description: "Move the end marker of the active segment back.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },
  { label: "Base Step (seconds)", description: "How many seconds the first press nudges the marker.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },
  { label: "Multiplier", description: "Step multiplier applied on rapid consecutive presses.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },
  { label: "Max Step (seconds)", description: "The nudge step will not exceed this value.", path: "/keybindings", sectionId: "nudge", page: "Shortcuts", section: "Segments Nudge" },

  // -------------------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------------------
  { label: "Built-in Presets", description: "Curated by Toppings — activate in one tap, no configuration needed.", path: "/profiles", page: "Profiles", section: "Built-in Presets" },
  { label: "Audio", description: "Built-in preset: hides video player, shows only audio.", path: "/profiles", page: "Profiles", section: "Built-in Presets" },
  { label: "Focus", description: "Built-in preset: hides sidebar, comments, and end cards.", path: "/profiles", page: "Profiles", section: "Built-in Presets" },
  { label: "My Profiles", description: "Create your own mix of YouTube experience settings.", path: "/profiles", page: "Profiles", section: "My Profiles" },
  { label: "Player Layout", description: "Default, Theatre, or No Video layout for the watch page.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Player Visuals", description: "What fills the video slot: real video, black screen, visualizer, or custom image.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Recommendations Sidebar", description: "Show or hide the Up Next recommendations panel.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Comments Section", description: "Show or hide the comments below the video.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "End Screen Cards", description: "Show or hide overlay cards at the end of videos.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Feed Thumbnails", description: "Show, hide, or blur thumbnail images in the home feed.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Home Feed", description: "Show or hide the entire home page feed.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Shorts Shelf", description: "Show or hide the Shorts row in the home feed.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Result Thumbnails", description: "Show, hide, or blur thumbnails in search results.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Video Metadata", description: "Show or hide view count and date below search results.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Shorts in Search", description: "Show or hide the Shorts shelf in search results.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
  { label: "Shorts Shelf (everywhere)", description: "Hide the Shorts shelf across home, search, and other pages.", path: "/profiles", page: "Profiles", section: "Profile Editor" },
];

// ---------------------------------------------------------------------------
// Fuzzy search
//
// Characters in the query must appear in order in the target text, but
// need not be contiguous. Scoring rewards:
//   - consecutive character matches
//   - matches at word boundaries
//   - substring (contiguous) matches
//   - exact matches
// ---------------------------------------------------------------------------

function fuzzyMatch(
  text: string,
  query: string,
): { score: number; indices: number[] } {
  const tl = text.toLowerCase();
  const ql = query.toLowerCase();

  let ti = 0;
  let qi = 0;
  let score = 0;
  let consecutive = 0;
  let lastMatchIdx = -1;
  const indices: number[] = [];

  while (ti < tl.length && qi < ql.length) {
    if (tl[ti] === ql[qi]) {
      indices.push(ti);
      const isConsecutive = lastMatchIdx === ti - 1;
      consecutive = isConsecutive ? consecutive + 1 : 0;
      score += 1 + consecutive * 2;
      // Word-boundary bonus
      if (ti === 0 || tl[ti - 1] === " " || tl[ti - 1] === ":") score += 3;
      lastMatchIdx = ti;
      qi++;
    }
    ti++;
  }

  if (qi < ql.length) return { score: 0, indices: [] }; // didn't consume all query chars

  // Substring bonus
  if (tl.includes(ql)) score += 15;
  // Starts-with bonus
  if (tl.startsWith(ql)) score += 25;
  // Exact match bonus
  if (tl === ql) score += 50;

  return { score, indices };
}

export function fuzzySearch(query: string): SearchResult[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const results: SearchResult[] = [];

  for (const entry of SEARCH_INDEX) {
    // Try label, description, section, and page as match targets.
    // Use the best score across all fields; indices always correspond to label.
    const labelMatch = fuzzyMatch(entry.label, q);
    const descMatch = entry.description ? fuzzyMatch(entry.description, q) : { score: 0, indices: [] };
    const sectionMatch = entry.section ? fuzzyMatch(entry.section, q) : { score: 0, indices: [] };
    const pageMatch = fuzzyMatch(entry.page, q);

    // Weight label matches most heavily.
    const totalScore =
      labelMatch.score * 3 +
      sectionMatch.score * 1.5 +
      pageMatch.score +
      descMatch.score * 0.5;

    if (totalScore > 0) {
      results.push({ entry, score: totalScore, matchedIndices: labelMatch.indices });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
