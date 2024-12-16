import React from "react";
import { Dispatch, SetStateAction } from "react";
import { Storage } from "../background/store";

const StoreContext = React.createContext<{
  store: Storage;
  setStore: Dispatch<SetStateAction<Storage>>;
} | null>(null);

export default StoreContext;
