import React from "react";
import { useContext } from "react";
import ConfigContext from "../../store";
import WebAppsSettings from "./WebAppsSettings";

export default function AppsConfig() {
  const { config } = useContext(ConfigContext)!;
  const webApps = config.webApps;
  const webAppsName = Object.keys(webApps) as Array<keyof typeof webApps>;
  return (
    <div className="w-full">
      {webAppsName.map((webAppName, idx) => {
        return <WebAppsSettings key={idx} name={webAppName} />;
      })}
    </div>
  );
}
