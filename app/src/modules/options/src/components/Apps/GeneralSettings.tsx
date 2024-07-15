import React from "react";
import { useContext } from "react";
import { produce } from "immer";
import { WorkerConfigGeneralSettings, WorkerName } from "../../../../../store";
import Switch from "../Switch";
import ConfigContext from "../../store";

const GeneralSettings = ({ name }: { name: WorkerName }) => {
  const { config, setConfig } = useContext(ConfigContext)!;
  const title = name.at(0)?.toUpperCase() + name.slice(1);
  const appWorker = config.workers[name];
  const generalSettings =
    appWorker.generalSettings as WorkerConfigGeneralSettings;

  const toggleWorkerEnabled = (isEnabled: boolean) => {
    const newConfig = produce(config, (draft) => {
      draft.workers[name].generalSettings.isEnabled = isEnabled;
    });
    setConfig(newConfig);
    chrome.storage.sync.set(newConfig);
  };

  return (
    <div className="w-full">
      <h3 className="pl-4 text-xl font-bold">General Settings</h3>
      <div className="pl-4">
        <Switch
          title={`Enable Worker for ${title}`}
          isEnabled={generalSettings.isEnabled}
          onToggle={toggleWorkerEnabled}
        />
      </div>
    </div>
  );
};

export default GeneralSettings;
