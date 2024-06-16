import { type WebAppContext } from "../background/webAppContext";
import {
  type YouTubeContext,
  type UdemyContext,
} from "../background/webAppContextParsers";

const youtubeEnabled: boolean = true;

async function runApp(webAppContext: WebAppContext): Promise<undefined> {
  const { appName } = webAppContext;

  switch (appName) {
    case "youtube": {
      const youtubeContext = webAppContext as YouTubeContext;
      const { default: onYouTubeLoaded } = await import(
        /* webpackIgnore: true */ chrome.runtime.getURL("workers/youtube.js")
      );
      void onYouTubeLoaded(youtubeContext);
      break;
    }
    case "udemy": {
      const udemyContext = webAppContext as UdemyContext;
      const { default: onUdemyLoaded } = await import(
        /* webpackIgnore: true */ chrome.runtime.getURL("workers/udemy.js")
      );
      void onUdemyLoaded(udemyContext);
      break;
    }
  }
}

chrome.runtime.onMessage.addListener(
  (webAppContext: WebAppContext): undefined => {
    void runApp(webAppContext);
  },
);
