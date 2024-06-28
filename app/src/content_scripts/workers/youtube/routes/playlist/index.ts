import { YouTubePlaylistContext } from "../../../../../background/webAppContextParsers/parseYouTubeContext";
import loadElement from "../../../../utils/loadElement";
import addMetadataToppings from "./addMetadataToppings";
import "./index.css";

const runPlaylistWorker = async (
  context: YouTubePlaylistContext,
): Promise<void> => {
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

export default runPlaylistWorker;
