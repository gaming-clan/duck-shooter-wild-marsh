import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register only in production builds. Vite development stays network-first so
// HMR and local iteration are never blocked by a stale service worker.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.warn("[Wild Marsh] Service worker registration failed", error);
    });
  });
}
