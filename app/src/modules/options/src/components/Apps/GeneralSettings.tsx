import { useContext } from "react";
import Switch from "../Switch";
import ConfigContext from "../../store";
import { Config, WorkerName } from "../../../../../store";

const GeneralSettings = ({ name }: { name: WorkerName }) => {
  const { config, setConfig } = useContext(ConfigContext)!;
  const title = name.at(0)?.toUpperCase() + name.slice(1);
  const appWorker = config.workers[name];
  const generalSettings = appWorker.generalSettings;
  const switchToggleHandler = (isEnabled: boolean) {
    setConfig((prevConfig: Config) => {
      prevConfig.workers[name].generalSettings.isEnabled = isEnabled;
    })
  }
  return (
    <div className="w-full">
      <Switch
        title={`Enable Worker for ${title}`}
        isEnabled={generalSettings.isEnabled}
        onToggle={switchToggleHandler}
      />
    </div>
  );
};

export default GeneralSettings;
