import { createContext } from "react";
import { Config } from "../../background/store";

const ConfigContext = createContext<Config | null>(null);
export default ConfigContext;
