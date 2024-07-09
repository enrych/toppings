import { useContext } from "react";
import ConfigContext from "../../store";
import AppWorker from "./AppWorker";

export default function AppsConfig() {
  const { config } = useContext(ConfigContext)!;
  const workers = config.workers;
  const appWorkers = Object.keys(workers) as Array<keyof typeof workers>;
  return (
    <div className="w-full">
      {appWorkers.map((appWorker, idx) => {
        return <AppWorker key={idx} name={appWorker} />;
      })}
    </div>
  );
}
