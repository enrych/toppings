import React from "react";
import ReactDOM from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import General from "./routes/General";
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
      {
        path: "",
        element: <General />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
