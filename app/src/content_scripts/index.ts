import { type SupportedWebAppContext } from "../background/webAppContext";
import { type YouTubeContext, type UdemyContext } from "../background/parsers";

async function runApp(
  webAppContext: SupportedWebAppContext,
): Promise<undefined> {
  const {
    appName,
    webAppConfig: {
      generalSettings: { isEnabled: isWebAppEnabled },
    },
  } = webAppContext;
  if (isWebAppEnabled) {
    switch (appName) {
      case "youtube": {
        const youtubeContext = webAppContext as YouTubeContext;
        const { default: onYouTubeLoaded } = await import(
          /* webpackIgnore: true */ chrome.runtime.getURL("webApps/youtube.js")
        );
        void onYouTubeLoaded(youtubeContext);
        break;
      }
      case "udemy": {
        const udemyContext = webAppContext as UdemyContext;
        const { default: runUdemy } = await import(
          /* webpackIgnore: true */ chrome.runtime.getURL("webApps/udemy.js")
        );
        void runUdemy(udemyContext);
        break;
      }
    }
  }
}

chrome.runtime.onMessage.addListener((webAppContext: string): undefined => {
  const parsedWebAppContext = JSON.parse(webAppContext);
  void runApp(parsedWebAppContext);
});
