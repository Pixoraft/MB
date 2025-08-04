import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePWA } from "./lib/pwa-utils";
import { initializeSampleData } from "./lib/init-data";

// Initialize PWA features
initializePWA();

// Initialize sample data for offline use
initializeSampleData();

createRoot(document.getElementById("root")!).render(<App />);
