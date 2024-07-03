import { type SupportedWebAppContext } from "../background/webAppContext";
import {
  type YouTubeContext,
  type UdemyContext,
} from "../background/webAppContextParsers";

async function runApp(
  webAppContext: SupportedWebAppContext,
): Promise<undefined> {
  const {
    appName,
    workerConfig: {
      generalSettings: { isEnabled: isWorkerEnabled },
    },
  } = webAppContext;
  if (isWorkerEnabled) {
    switch (appName) {
      case "youtube": {
        const youtubeContext = webAppContext as YouTubeContext;
        const { default: runYouTubeWorker } = await import(
          /* webpackIgnore: true */ chrome.runtime.getURL("workers/youtube.js")
        );
        void runYouTubeWorker(youtubeContext);
        break;
      }
      case "udemy": {
        const udemyContext = webAppContext as UdemyContext;
        const { default: runUdemyWorker } = await import(
          /* webpackIgnore: true */ chrome.runtime.getURL("workers/udemy.js")
        );
        void runUdemyWorker(udemyContext);
        break;
      }
    }
  }
}

chrome.runtime.onMessage.addListener(
  (webAppContext: SupportedWebAppContext): undefined => {
    void runApp(webAppContext);
  },
);
