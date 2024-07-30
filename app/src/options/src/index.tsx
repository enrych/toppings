import React from "react";
import ReactDOM from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import General from "./pages/General";
import Apps from "./pages/Apps";
import Advanced from "./pages/Advanced";
import ErrorPage from "./pages/error-page";
import "./index.css";
import getExtensionConfig from "../../lib/getExtensionConfig";

const router = createMemoryRouter([
  {
    path: "/",
    element: <App />,
    loader: getExtensionConfig,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <General />,
      },
      {
        path: "Apps",
        element: <Apps />,
      },
      {
        path: "advanced",
        element: <Advanced />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
