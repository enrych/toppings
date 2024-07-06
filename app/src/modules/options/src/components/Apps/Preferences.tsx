import { ChangeEvent, useContext } from "react";
import ConfigContext from "../../store";
import { WorkerConfigRouteConfig, WorkerName } from "../../../../../store";
import PreferenceInput from "../PreferenceInput";

const Preferences = ({
  appName,
  routeName,
}: {
  appName: WorkerName;
  routeName: string;
}) => {
  const { config, setConfig } = useContext(ConfigContext)!;

  const routes = config.workers[appName].routes as Record<
    string,
    WorkerConfigRouteConfig
  >;
  const appRoute = routes[routeName];
  const preferences = appRoute.preferences!;
  console.log(preferences);
  const validator = (e: ChangeEvent) => true;

  return (
    <div>
      {preferences.customSpeedList && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="customSpeedList"
          validator={validator}
        />
      )}
      {preferences.decreaseSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="decreaseSpeed"
          validator={validator}
        />
      )}
      {preferences.defaultSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="defaultSpeed"
          validator={validator}
        />
      )}
      {preferences.increaseSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="increaseSpeed"
          validator={validator}
        />
      )}
      {preferences.seekBackward && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="seekBackward"
          validator={validator}
        />
      )}
      {preferences.seekForward && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="seekForward"
          validator={validator}
        />
      )}
      {preferences.toggleSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="toggleSpeed"
          validator={validator}
        />
      )}
    </div>
  );
};

export default Preferences;
