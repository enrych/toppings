import React from "react";
import { Dispatch, SetStateAction } from "react";
import { Config } from "../../../store";

const ConfigContext = React.createContext<{
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
} | null>(null);

export default ConfigContext;
