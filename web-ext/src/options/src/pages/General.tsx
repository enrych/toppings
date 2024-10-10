import React from "react";
import { useContext } from "react";
import ConfigContext from "../store";
import Card from "../../../components/Card";
import Switch from "../components/Switch";
import { produce } from "immer";

export default function General() {
  const { config, setConfig } = useContext(ConfigContext)!;

  const setExtensionIcon = (isEnabled: boolean) => {
    const prefix = `${isEnabled ? "" : "disabled_"}`;
    chrome.action.setIcon({
      path: {
        16: `/assets/icons/logo/${prefix}icon16.png`,
        32: `/assets/icons/logo/${prefix}icon32.png`,
        48: `/assets/icons/logo/${prefix}icon48.png`,
        128: `/assets/icons/logo/${prefix}icon128.png`,
      },
    });
  };

  const handleExtensionToggle = (isEnabled: boolean) => {
    const newConfig = produce(config, (draft) => {
      draft.globalSettings.isExtensionEnabled = isEnabled;
    });
    setConfig(newConfig);
    setExtensionIcon(isEnabled);
    chrome.storage.sync.set(newConfig);
  };

  return (
    <div className="p-6">
      <h1 className="text-gray-300 text-4xl font-bold mb-4">General</h1>
      <h2 className="text-gray-400 text-[12px] mb-8">
        Manage your general settings and preferences
      </h2>
      <hr className="mb-8 border-gray-600/30" />
      <Card>
        <Switch
          title="Enable Extension"
          description="To enable/disable the extension globally."
          isEnabled={config?.globalSettings.isExtensionEnabled}
          onToggle={handleExtensionToggle}
        />
      </Card>
    </div>
  );
}
