import React from "react";
import { createMemoryRouter } from "react-router-dom";
import { OPTIONS_PAGES } from "./data";
import { getStorage } from "../background/store";
import App from "./App";
import General from "./routes/General";
import Watch from "./routes/Watch";
import Shorts from "./routes/Shorts";
import Playlist from "./routes/Playlist";
import Keybindings from "./routes/Keybindings";
import Profiles from "./routes/Profiles";
import ErrorPage from "./routes/error-page";

const ROUTE_BY_SEGMENT: Record<string, React.ReactElement> = {
  "": <General />,
  watch: <Watch />,
  shorts: <Shorts />,
  playlist: <Playlist />,
  keybindings: <Keybindings />,
  profiles: <Profiles />,
};

export const optionsRouter = createMemoryRouter([
  {
    path: OPTIONS_PAGES[0].path,
    element: <App />,
    loader: getStorage,
    errorElement: <ErrorPage />,
    children: OPTIONS_PAGES.map((page) => ({
      path: page.segment,
      element: ROUTE_BY_SEGMENT[page.segment],
    })),
  },
]);
