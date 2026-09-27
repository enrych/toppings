import { definePrimitive, type Primitive } from "@/kernel/primitives";

export type Visibility = { visible: boolean };
export type ThumbnailMode = "show" | "hide" | "blur";
export type Thumbnails = { mode: ThumbnailMode };
export type PlayerLayout = "default" | "no-video";
export type Layout = { value: PlayerLayout };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const visibility = {
  parse: (value: unknown): Visibility | undefined =>
    isRecord(value) && typeof value.visible === "boolean" ? { visible: value.visible } : undefined,
  apply: (el: HTMLElement, { visible }: Visibility) => {
    el.style.display = visible ? "" : "none";
  },
  reset: (el: HTMLElement) => {
    el.style.display = "";
  },
};

const thumbnails = {
  parse: (value: unknown): Thumbnails | undefined =>
    isRecord(value) && (value.mode === "show" || value.mode === "hide" || value.mode === "blur") ? { mode: value.mode } : undefined,
  apply: (el: HTMLElement, { mode }: Thumbnails) => {
    el.style.filter = mode === "blur" ? "blur(12px)" : "";
    el.style.visibility = mode === "hide" ? "hidden" : "";
  },
  reset: (el: HTMLElement) => {
    el.style.filter = "";
    el.style.visibility = "";
  },
};

export const watchLayout = definePrimitive<Layout>({
  id: "watch.layout",
  label: "Player layout",
  routes: ["watch"],
  // The container is found by what it holds because theater mode moves the
  // player between containers. It is collapsed rather than the <video>
  // hidden: a display:none video can count as not playing, while a
  // zero-height container keeps playback and audio untouched.
  strategies: ["#full-bleed-container:has(#movie_player)", "#player-container-outer:has(#movie_player)", "#player-container:has(#movie_player)"],
  parse: (value) => (isRecord(value) && (value.value === "default" || value.value === "no-video") ? { value: value.value } : undefined),
  apply(el, { value }) {
    const collapsed = value === "no-video";
    el.style.height = collapsed ? "0" : "";
    el.style.minHeight = collapsed ? "0" : "";
    el.style.overflow = collapsed ? "hidden" : "";
  },
  reset(el) {
    el.style.height = "";
    el.style.minHeight = "";
    el.style.overflow = "";
  },
});

export const watchSidebar = definePrimitive<Visibility>({
  id: "watch.sidebar",
  label: "Recommendations sidebar",
  routes: ["watch"],
  strategies: ["#secondary", "ytd-watch-next-secondary-results-renderer", "#related", "ytd-watch-flexy #secondary-inner"],
  ...visibility,
});

export const watchComments = definePrimitive<Visibility>({
  id: "watch.comments",
  label: "Comments",
  routes: ["watch"],
  strategies: ["ytd-comments#comments", "#comments", "ytd-item-section-renderer #contents ytd-comments", "ytd-watch-flexy #comments"],
  ...visibility,
});

export const watchEndCards = definePrimitive<Visibility>({
  id: "watch.endCards",
  label: "End cards",
  routes: ["watch"],
  // The container, not the cards: YouTube adds cards mid-video.
  strategies: [".ytp-ce-element", ".ytp-endscreen-element", ".html5-endscreen", ".ytp-player-content .ytp-ce-element"],
  all: true,
  ...visibility,
});

export const homeThumbnails = definePrimitive<Thumbnails>({
  id: "home.thumbnails",
  label: "Home thumbnails",
  routes: ["home"],
  strategies: [
    "ytd-rich-grid-renderer ytd-rich-item-renderer ytd-thumbnail img",
    "ytd-rich-grid-renderer ytd-rich-item-renderer yt-thumbnail-view-model img",
    "ytd-rich-grid-renderer ytd-rich-item-renderer img#img",
  ],
  all: true,
  ...thumbnails,
});

export const homeFeed = definePrimitive<Visibility>({
  id: "home.feed",
  label: "Home feed",
  routes: ["home"],
  strategies: ["ytd-rich-grid-renderer", "ytd-browse[page-subtype='home'] ytd-rich-grid-renderer", "#contents.ytd-rich-grid-renderer"],
  ...visibility,
});

export const homeShorts = definePrimitive<Visibility>({
  id: "home.shorts",
  label: "Home Shorts shelf",
  routes: ["home"],
  strategies: [
    "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
    "ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model)",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-reel-shelf-renderer",
  ],
  all: true,
  ...visibility,
});

export const searchThumbnails = definePrimitive<Thumbnails>({
  id: "search.thumbnails",
  label: "Search thumbnails",
  routes: ["search"],
  strategies: ["ytd-search ytd-video-renderer ytd-thumbnail img", "ytd-search ytd-video-renderer yt-thumbnail-view-model img", "ytd-search yt-lockup-view-model yt-thumbnail-view-model img"],
  all: true,
  ...thumbnails,
});

export const searchMetadata = definePrimitive<Visibility>({
  id: "search.metadata",
  label: "Search result metadata",
  routes: ["search"],
  strategies: ["ytd-search ytd-video-renderer #metadata-line", "ytd-search ytd-video-renderer .ytd-video-meta-block", "#contents.ytd-section-list-renderer ytd-video-renderer #metadata-line"],
  all: true,
  ...visibility,
});

export const searchShorts = definePrimitive<Visibility>({
  id: "search.shorts",
  label: "Shorts in search",
  routes: ["search"],
  strategies: ["ytd-search grid-shelf-view-model:has(ytm-shorts-lockup-view-model)", "ytd-search ytd-reel-shelf-renderer", "ytd-search ytd-shelf-renderer:has(ytd-reel-item-renderer)"],
  all: true,
  ...visibility,
});

export const shortsShelf = definePrimitive<Visibility>({
  id: "shorts.shelf",
  label: "Shorts shelf everywhere",
  routes: ["home", "search", "other"],
  strategies: [
    "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
    "ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model)",
    "grid-shelf-view-model:has(ytm-shorts-lockup-view-model)",
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-shelf-renderer:has(ytd-reel-item-renderer)",
  ],
  all: true,
  ...visibility,
});

export const PRIMITIVES: readonly Primitive[] = [
  watchLayout,
  watchSidebar,
  watchComments,
  watchEndCards,
  homeThumbnails,
  homeFeed,
  homeShorts,
  searchThumbnails,
  searchMetadata,
  searchShorts,
  shortsShelf,
] as Primitive[];

export const primitiveById = (id: string): Primitive | undefined => PRIMITIVES.find((p) => p.id === id);
