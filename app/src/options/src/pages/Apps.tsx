import { useContext } from "react";
import ConfigContext from "../store";
import Card from "../../../ui/Card";
import Switch from "../components/Switch";
import { Config } from "../../../background/store";
import Keybinding from "../components/Keybinding";

export default function Apps() {
  const { config, setConfig } = useContext(ConfigContext)!;
  console.log(config);

  return (
    <div className="p-6">
      <h1 className="text-gray-300 text-4xl font-bold mb-4">Apps</h1>
      <h2 className="text-gray-400 text-[12px] mb-8">
        Manage your web apps settings and preferences
      </h2>
      <hr className="mb-8 border-gray-600/30" />
      {Object.entries(config.workers).map(([workerKey, workerConfig], idx) => {
        return (
          <Card
            key={idx}
            title={workerKey.charAt(0).toUpperCase() + workerKey.slice(1)}
          >
            <Switch
              title={`Enable ${workerKey.charAt(0).toUpperCase() + workerKey.slice(1)}`}
              description={`To enable/disable the ${workerKey} worker globally.`}
              isEnabled={workerConfig.generalSettings.isEnabled}
              onToggle={() => {}}
            />
            {Object.entries(workerConfig.routes).map(
              ([routeKey, routeConfig], routeIdx) => (
                <div key={routeIdx} className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-300">
                    {routeKey}
                  </h3>
                </div>
              ),
            )}
          </Card>
        );
      })}
    </div>
  );
}
