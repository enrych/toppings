import React from "react";
import { useContext } from "react";
import { produce } from "immer";
import { WorkerConfigRouteConfig, WorkerName } from "../../../../../store";
import ConfigContext from "../../store";
import Switch from "../Switch";
import Keybinding from "../Keybinding";
import Preferences from "./Preferences";

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

  const isEnabled = appRoute.isEnabled;
  const keybindings = Object.keys(appRoute.keybindings ?? {});
  const preferences = Object.keys(appRoute.preferences ?? {});

  const toggleAppRouteEnabled = (isEnabled: boolean) => {
    const newConfig = produce(config, (draft) => {
      (
        draft.workers[appName].routes as Record<string, WorkerConfigRouteConfig>
      )[routeName].isEnabled = isEnabled;
    });
    setConfig(newConfig);
    chrome.storage.sync.set(newConfig);
  };

  return (
    <div className="pl-4 w-full py-2">
      <h3 className="pl-4 text-xl font-medium">&#8226; {routeTitle}</h3>
      <div className="pl-4 w-full py-2">
        <Switch
          title={`Enable ${routeTitle} Route`}
          isEnabled={isEnabled}
          onToggle={toggleAppRouteEnabled}
        />
        <div className="py-2">
          {keybindings.length > 0 &&
            keybindings.map((keybinding, idx) => {
              return (
                <Keybinding
                  key={idx}
                  appName={appName}
                  routeName={routeName}
                  keybinding={keybinding}
                />
              );
            })}
        </div>
        {preferences.length > 0 && (
          <Preferences appName={appName} routeName={routeName} />
        )}
      </div>
    </div>
  );
};

export default AppRoute;
