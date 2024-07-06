import { ChangeEvent, ChangeEventHandler, useContext, useState } from "react";
import { produce } from "immer";
import { WorkerConfigRouteConfig, WorkerName } from "../../../../store";
import Tooltip from "../../../../ui/Tooltip";
import ConfigContext from "../store";
import camelCaseToTitleCase from "../lib/camelCaseToTitleCase";

export default function PreferenceInput({
  appName,
  routeName,
  preferenceName,
  validator,
  description,
}: {
  appName: WorkerName;
  routeName: string;
  preferenceName: string;
  validator: (e: ChangeEvent) => boolean;
  description?: string;
}) {
  const { config, setConfig } = useContext(ConfigContext)!;
  const routes = config.workers[appName].routes as Record<
    string,
    WorkerConfigRouteConfig
  >;
  const appRoute = routes[routeName];
  const [preference, setPreference] = useState<string>(
    appRoute.preferences![preferenceName],
  );

  const preferenceTitle = camelCaseToTitleCase(preferenceName);

  const preferenceChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPreference(e.target.value);
    const isValid = validator(e);
    if (isValid) {
      const newConfig = produce(config, (draft) => {
        (
          draft.workers[appName].routes as Record<
            string,
            WorkerConfigRouteConfig
          >
        )[routeName].preferences![preference] = e.target.value;
      });
      setConfig(newConfig);
      chrome.storage.sync.set(newConfig);
    }
  };

  return (
    <div className="font-sans w-full flex justify-between items-center px-4 py-1">
      <div className="flex items-center space-x-3">
        <label className="text-lg font-medium text-gray-100">
          {preferenceTitle}
        </label>
        {description && (
          <Tooltip text={description}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 18.5A6.5 6.5 0 1118.5 12A6.508 6.508 0 0112 18.5z"
              />
            </svg>
          </Tooltip>
        )}
      </div>
      <input
        type="text"
        className="p-2 bg-black text-white text-center rounded border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your preferences"
        value={preference}
        onChange={preferenceChangeHandler}
      />
    </div>
  );
}
