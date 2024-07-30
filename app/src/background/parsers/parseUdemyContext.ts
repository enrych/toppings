import { type UdemyConfig } from "../../content_scripts/webApps/udemy/webApp.config";
import getWebAppConfig from "../../lib/getWebAppConfig";
import { type SupportedWebAppContext } from "../webAppContext";

export interface UdemyLearnContext extends SupportedWebAppContext {
  contextData: {
    webAppURL: URL;
    activeRoute: "learn";
    payload: UdemyLecture;
  };
}

export interface UdemyLecture {
  lectureID: string;
  courseName: string;
}

export type UdemyContext = UdemyLearnContext | SupportedWebAppContext;

export default async function parseUdemyContext(
  webAppURL: URL,
): Promise<UdemyContext> {
  const udemyConfig = (await getWebAppConfig("udemy")) as UdemyConfig;

  if (!udemyConfig) {
    throw new Error("Udemy configuration not found.");
  }

  const lectureRouteRegex =
    /https:\/\/www\.udemy\.com\/course\/([a-zA-Z0-9-]+)\/learn\/lecture\/(\d+)/;
  const match = lectureRouteRegex.exec(webAppURL.href);

  if (match !== null) {
    const lectureID = match[2];
    const courseName = match[1];
    const context: UdemyContext = {
      isSupported: true,
      appName: "udemy",
      webAppConfig: udemyConfig,
      contextData: {
        webAppURL,
        activeRoute: "learn",
        payload: {
          lectureID,
          courseName,
        },
      },
    };
    return context;
  }

  return {
    isSupported: true,
    appName: "udemy",
    webAppConfig: udemyConfig,
    contextData: {
      webAppURL,
    },
  };
}
