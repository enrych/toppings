import { useContext } from "react";
import { produce } from "immer";
import { WorkerConfigRouteConfig, WorkerName } from "../../../../../store";
import ConfigContext from "../../store";
import Switch from "../Switch";

const AppRoute = ({
  appName,
  routeName,
}: {
  appName: WorkerName;
  routeName: string;
}) => {
  const { config, setConfig } = useContext(ConfigContext)!;
  const routeTitle = routeName.at(0)?.toUpperCase() + routeName.slice(1);
  const routes = config.workers[appName].routes as Record<
    string,
    WorkerConfigRouteConfig
  >;
  const appRoute = routes[routeName];
  console.log(routeName, appRoute);

  const toggleAppRouteEnabled = (isEnabled: boolean) => {
    const newConfig = produce(config, (draft) => {
      draft.workers[appName].routes[routeName].isEnabled = isEnabled;
    });
    setConfig(newConfig);
    chrome.storage.sync.set(newConfig);
  };

  return (
    <div className="pl-4 w-full">
      <h3 className="pl-4 text-xl">{routeTitle}</h3>
      <div className="pl-4 w-full">
        <Switch
          title={`Enable ${routeTitle} Route`}
          isEnabled={appRoute.isEnabled}
          onToggle={toggleAppRouteEnabled}
        />
      </div>
    </div>
  );
};

export default AppRoute;
