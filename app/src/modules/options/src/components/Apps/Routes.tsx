import { useContext } from "react";
import { WorkerConfigRouteConfig, WorkerName } from "../../../../../store";
import ConfigContext from "../../store";
import AppRoute from "./AppRoute";

const Routes = ({ name }: { name: WorkerName }) => {
  const { config } = useContext(ConfigContext)!;

  const routes = config.workers[name].routes as Record<
    string,
    WorkerConfigRouteConfig
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
