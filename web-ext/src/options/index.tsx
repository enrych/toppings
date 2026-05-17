import React from "react";
import ReactDOM from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { OPTIONS_PAGES } from "@toppings/constants";
import App from "./App";
import General from "./routes/General";
import Watch from "./routes/Watch";
import AudioMode from "./routes/AudioMode";
import Shorts from "./routes/Shorts";
import Playlist from "./routes/Playlist";
import Keybindings from "./routes/Keybindings";
import ErrorPage from "./routes/error-page";
import "./index.css";
import { getStorage } from "../background/store";

const ROUTE_ELEMENT_BY_SEGMENT: Record<string, React.ReactElement> = {
  "": <General />,
  watch: <Watch />,
  "audio-mode": <AudioMode />,
  shorts: <Shorts />,
  playlist: <Playlist />,
  keybindings: <Keybindings />,
};

const router = createMemoryRouter([
  {
    path: OPTIONS_PAGES[0].path,
    element: <App />,
    loader: getStorage,
    errorElement: <ErrorPage />,
    children: OPTIONS_PAGES.map((page) => ({
      path: page.segment,
      element: ROUTE_ELEMENT_BY_SEGMENT[page.segment],
    })),
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
