import React from "react";
import ReactDOM from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import {
  OPTIONS_MEMORY_ROUTER_ROOT_PATH,
  OPTIONS_ROUTE_CHILD_PATH,
} from "toppings-constants";
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

const router = createMemoryRouter([
  {
    path: OPTIONS_MEMORY_ROUTER_ROOT_PATH,
    element: <App />,
    loader: getStorage,
    errorElement: <ErrorPage />,
    children: [
      { path: OPTIONS_ROUTE_CHILD_PATH.EMPTY, element: <General /> },
      { path: OPTIONS_ROUTE_CHILD_PATH.WATCH, element: <Watch /> },
      { path: OPTIONS_ROUTE_CHILD_PATH.AUDIO_MODE, element: <AudioMode /> },
      { path: OPTIONS_ROUTE_CHILD_PATH.SHORTS, element: <Shorts /> },
      { path: OPTIONS_ROUTE_CHILD_PATH.PLAYLIST, element: <Playlist /> },
      { path: OPTIONS_ROUTE_CHILD_PATH.KEYBINDINGS, element: <Keybindings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
