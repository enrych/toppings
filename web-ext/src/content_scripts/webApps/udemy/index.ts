import { type UdemyContext } from "../../../background/parsers";
import { type UdemyLearnContext } from "../../../background/parsers/parseUdemyContext";
import runLearn from "./routes/learn";
import { UdemyConfig } from "./webApp.config";

const runUdemy = async (context: UdemyContext): Promise<void> => {
  const { activeRoute } = context.contextData;
  const webAppConfig = context.webAppConfig as UdemyConfig;

  switch (activeRoute) {
    case "learn": {
      const isLearnEnabled = webAppConfig.routes.learn.isEnabled;
      isLearnEnabled && (await runLearn(context as UdemyLearnContext));
      break;
    }
    default:
      break;
  }
};

export default runUdemy;
