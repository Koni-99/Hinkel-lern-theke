import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./sonnig.css";
import "./sonnig3d";
const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// App-Dateien auf dem Gerät speichern, damit die Lern-Theke auch ohne Internet aufgeht (siehe sw-template.js)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
