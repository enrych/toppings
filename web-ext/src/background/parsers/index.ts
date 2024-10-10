import { type WebAppContext } from "../webAppContext";

import parseYoutubeContext from "./parseYouTubeContext";
import parseUdemyContext from "./parseUdemyContext";

export { type YouTubeContext } from "./parseYouTubeContext";
export { type UdemyContext } from "./parseUdemyContext";

export type WebAppContextParser = (webAppURL: URL) => Promise<WebAppContext>;

const webAppContextParser: Record<string, WebAppContextParser> = {
  YouTube: parseYoutubeContext,
  Udemy: parseUdemyContext,
};

export default webAppContextParser;
