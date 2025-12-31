import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element '#root' not found. Check public/index.html.");
}

const root = ReactDOM.createRoot(container);

const AppTree =
  process.env.NODE_ENV === "production" ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  );

root.render(AppTree);

