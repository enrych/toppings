import React from "react";
import { Dispatch, SetStateAction } from "react";
import { Storage } from "../../background/store";

const ConfigContext = React.createContext<{
  config: Storage;
  setConfig: Dispatch<SetStateAction<Storage>>;
} | null>(null);

export default ConfigContext;
