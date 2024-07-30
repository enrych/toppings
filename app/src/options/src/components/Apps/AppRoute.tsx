import React from "react";
import { useContext } from "react";
import { produce } from "immer";
import ConfigContext from "../../store";
import Switch from "../Switch";
import Keybinding from "../Keybinding";
import Preferences from "./Preferences";
import { WebApps } from "../../../../extension.config";
import { WebAppRouteConfig } from "../../../../lib/getWebAppConfig";

const AppRoute = ({
  appName,
  routeName,
}: {
  appName: WebApps;
  routeName: string;
}) => {
  const { config, setConfig } = useContext(ConfigContext)!;

  const routeTitle = routeName.at(0)?.toUpperCase() + routeName.slice(1);
  const routes = config.webApps[appName].routes as Record<
    string,
    WebAppRouteConfig
  >;
  const appRoute = routes[routeName];

  const isEnabled = appRoute.isEnabled;
  const keybindings = Object.keys(appRoute.keybindings ?? {});
  const preferences = Object.keys(appRoute.preferences ?? {});

  const toggleAppRouteEnabled = (isEnabled: boolean) => {
    const newConfig = produce(config, (draft) => {
      (draft.webApps[appName].routes as Record<string, WebAppRouteConfig>)[
        routeName
      ].isEnabled = isEnabled;
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
