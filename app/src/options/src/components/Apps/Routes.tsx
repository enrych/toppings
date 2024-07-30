import React from "react";
import { useContext } from "react";
import ConfigContext from "../../store";
import AppRoute from "./AppRoute";
import { WebApps } from "../../../../extension.config";
import { WebAppRouteConfig } from "../../../../lib/getWebAppConfig";

const Routes = ({ name }: { name: WebApps }) => {
  const { config } = useContext(ConfigContext)!;

  const routes = config.webApps[name].routes as Record<
    string,
    WebAppRouteConfig
  >;
  const appRoutes = Object.keys(routes);

  return (
    <div className="w-full">
      <h3 className="pl-4 text-xl font-bold">Routes</h3>
      {appRoutes.map((appRoute, idx) => {
        return <AppRoute key={idx} appName={name} routeName={appRoute} />;
      })}
    </div>
  );
};

export default Routes;
