import React from "react";
import ReactDOM from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
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
    path: "/",
    element: <App />,
    loader: getStorage,
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <General /> },
      { path: "watch", element: <Watch /> },
      { path: "audio-mode", element: <AudioMode /> },
      { path: "shorts", element: <Shorts /> },
      { path: "playlist", element: <Playlist /> },
      { path: "keybindings", element: <Keybindings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
