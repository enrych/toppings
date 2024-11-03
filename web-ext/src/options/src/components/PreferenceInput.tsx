import React from "react";
import { ChangeEvent, useContext, useState, useEffect, useRef } from "react";
import { produce } from "immer";
import Tooltip from "../../../components/Tooltip";
import ConfigContext from "../store";
import camelCaseToTitleCase from "../lib/camelCaseToTitleCase";
import { WebApps } from "../../../extension.config";
import { WebAppRouteConfig } from "../../../lib/getWebAppConfig";

export default function PreferenceInput({
  appName,
  routeName,
  preferenceName,
  type = "plain",
  validator,
  description,
}: {
  appName: WebApps;
  routeName: string;
  preferenceName: string;
  type?: "plain" | "list";
  validator: (e: ChangeEvent<HTMLInputElement>) => boolean;
  description?: string;
}) {
  const { config, setConfig } = useContext(ConfigContext)!;
  const routes = config.webApps[appName].routes as Record<
    string,
    WebAppRouteConfig
  >;
  const appRoute = routes[routeName];
  const [preference, setPreference] = useState<string>(
    type === "plain" && !isNaN(Number(appRoute.preferences![preferenceName]))
      ? Number(appRoute.preferences![preferenceName])
      : appRoute.preferences![preferenceName],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const preferenceTitle = camelCaseToTitleCase(preferenceName);

  const preferenceChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPreference(e.target.value);
    setIsValid(null);
    setIsLoading(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const isValid = validator(e);
      let newPreference: any = Number(e.target.value).toFixed(2);
      if (type === "list") {
        newPreference = e.target.value
          .split(",")
          .map((substring) => Number(substring.trim()).toFixed(2));
      }
      setIsLoading(false);
      setIsValid(isValid);

      if (isValid) {
        const newConfig = produce(config, (draft) => {
          (draft.webApps[appName].routes as Record<string, WebAppRouteConfig>)[
            routeName
          ].preferences![preferenceName] = newPreference;
        });
        setConfig(newConfig);
        chrome.storage.sync.set(newConfig);

        // Hide the validation SVG if valid
        setTimeout(() => {
          setIsValid(null);
        }, 1500);
      }
    }, 750);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="tw-font-sans tw-w-full tw-flex tw-flex-col tw-px-4 tw-py-1">
      <div className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-flex tw-items-center tw-space-x-3">
          <label className="tw-text-lg tw-font-medium tw-text-gray-100">
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
        <div className="tw-relative">
          <input
            type="text"
            className="p-2 bg-black text-white text-center rounded border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your preferences"
            value={preference}
            onChange={preferenceChangeHandler}
          />
          {isLoading && (
            <svg
              className="absolute top-[8px] -right-6 animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="tw-opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="tw-opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l-1.707-1.707A7.968 7.968 0 014 12H0c0 3.312 1.344 6.312 3.515 8.485l2.485-2.485z"
              />
            </svg>
          )}
          {isValid === true && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-1/2 -translate-y-1/2 -right-6 h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {isValid === false && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-1/2 -translate-y-1/2 -right-6 h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
