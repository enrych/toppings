import { YouTubePlaylistContext } from "../../../../../background/parsers//parseYouTubeContext";
import loadElement from "../../../../../lib/loadElement";
import addMetadataToppings from "./addMetadataToppings";
import "./index.css";

const runPlaylist = async (context: YouTubePlaylistContext): Promise<void> => {
  const { playlistID } = context.contextData.payload;
  const metadataActionBar = await loadElement(
    ".metadata-action-bar",
    10000,
    500,
  );
  if (metadataActionBar !== null) {
    await addMetadataToppings(playlistID);
  }
};

export default runPlaylist;
