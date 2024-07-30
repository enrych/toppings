import React from "react";
import { Dispatch, SetStateAction } from "react";
import { ExtensionConfig } from "../../extension.config";

const ConfigContext = React.createContext<{
  config: ExtensionConfig;
  setConfig: Dispatch<SetStateAction<ExtensionConfig>>;
} | null>(null);

export default ConfigContext;
