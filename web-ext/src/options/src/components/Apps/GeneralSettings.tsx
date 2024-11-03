import React from "react";
import { useContext } from "react";
import { produce } from "immer";
import Switch from "../Switch";
import ConfigContext from "../../store";
import { WebApps } from "../../../../extension.config";
import { WebAppGeneralSettings } from "../../../../lib/getWebAppConfig";

const GeneralSettings = ({ name }: { name: WebApps }) => {
  const { config, setConfig } = useContext(ConfigContext)!;
  const title = name.at(0)?.toUpperCase() + name.slice(1);
  const webApp = config.webApps[name];
  const generalSettings = webApp.generalSettings as WebAppGeneralSettings;

  const toggleWebAppEnabled = (isEnabled: boolean) => {
    const newConfig = produce(config, (draft) => {
      draft.webApps[name].generalSettings.isEnabled = isEnabled;
    });
    setConfig(newConfig);
    chrome.storage.sync.set(newConfig);
  };

  return (
    <div className="tw-w-full">
      <h3 className="tw-pl-4 tw-text-xl tw-font-bold">General Settings</h3>
      <div className="tw-pl-4">
        <Switch
          title={`Enable ${title}`}
          isEnabled={generalSettings.isEnabled}
          onToggle={toggleWebAppEnabled}
        />
      </div>
    </div>
  );
};

export default GeneralSettings;
