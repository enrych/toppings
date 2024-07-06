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
  const { config } = useContext(ConfigContext)!;

  const routes = config.workers[appName].routes as Record<
    string,
    WorkerConfigRouteConfig
  >;
  const appRoute = routes[routeName];
  const preferences = appRoute.preferences!;

  const customPlaybackRatesValidator = (e: ChangeEvent<HTMLInputElement>) => {
    const regex = /^(\d+(\.\d+)?)(\s*,\s*\d+(\.\d+)?)*$/;
    const playbackRates = e.target.value.split(",").map((rate) => rate.trim());

    if (!regex.test(e.target.value) || playbackRates.length <= 1) {
      return false;
    }

    const rates = playbackRates.map(parseFloat);
    if (
      rates.includes(NaN) ||
      !rates.includes(1) ||
      rates.some((rate) => rate < 0.0625 || rate > 16)
    ) {
      return false;
    }

    return true;
  };

  const isValidNumeric = (
    e: ChangeEvent<HTMLInputElement>,
    min: number,
    max: number,
  ) => {
    const value = +e.target.value;
    if (isNaN(value) || value < min || value > max) {
      return false;
    }
    return true;
  };

  return (
    <div>
      {preferences.customSpeedList && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="customSpeedList"
          type="list"
          validator={customPlaybackRatesValidator}
        />
      )}
      {preferences.toggleSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="toggleSpeed"
          validator={(e: ChangeEvent<HTMLInputElement>) => {
            return isValidNumeric(e, 0.0625, 16);
          }}
        />
      )}
      {preferences.defaultSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="defaultSpeed"
          validator={(e: ChangeEvent<HTMLInputElement>) => {
            return isValidNumeric(e, 0.0625, 16);
          }}
        />
      )}
      {preferences.decreaseSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="decreaseSpeed"
          validator={(e: ChangeEvent<HTMLInputElement>) => {
            return isValidNumeric(e, 0, 1);
          }}
        />
      )}
      {preferences.increaseSpeed && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="increaseSpeed"
          validator={(e: ChangeEvent<HTMLInputElement>) => {
            return isValidNumeric(e, 0, 1);
          }}
        />
      )}
      {preferences.seekBackward && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="seekBackward"
          validator={(e: ChangeEvent<HTMLInputElement>) => {
            return isValidNumeric(e, 1, 60);
          }}
        />
      )}
      {preferences.seekForward && (
        <PreferenceInput
          appName={appName}
          routeName={routeName}
          preferenceName="seekForward"
          validator={(e: ChangeEvent<HTMLInputElement>) => {
            return isValidNumeric(e, 1, 60);
          }}
        />
      )}
    </div>
  );
};

export default Preferences;
