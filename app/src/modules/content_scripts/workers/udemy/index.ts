import { type UdemyContext } from "../../../background/webAppContextParsers";
import { type UdemyLearnContext } from "../../../background/webAppContextParsers/parseUdemyContext";
import { type UdemyWorkerConfig } from "./config";
import runLearnWorker from "./routes/learn";

const runUdemyWorker = async (context: UdemyContext): Promise<void> => {
  const { activeRoute } = context.contextData;
  const workerConfig = context.workerConfig as UdemyWorkerConfig;

  switch (activeRoute) {
    case "learn": {
      const isLearnWorkerEnabled = workerConfig.routes.learn.isEnabled;
      isLearnWorkerEnabled &&
        (await runLearnWorker(context as UdemyLearnContext));
      break;
    }
    default:
      break;
  }
};

export default runUdemyWorker;
