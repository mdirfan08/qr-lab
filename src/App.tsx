import { useState } from "react";
import { ToastProvider } from "./components/ui/Toast";
import { NavBar, type Route } from "./components/ui/NavBar";
import { Landing } from "./pages/Landing";
import { Studio } from "./pages/Studio";
import { TestLabPage } from "./pages/TestLabPage";
import { BatchPage } from "./pages/BatchPage";
import { HistoryPage } from "./pages/HistoryPage";
import { Settings } from "./pages/Settings";
import type { QRRecord } from "./types/qr";

function AppShell() {
  const [route, setRoute] = useState<Route>("landing");
  const [studioSeed, setStudioSeed] = useState<QRRecord | null>(null);
  const [studioKey, setStudioKey] = useState(0);

  function handleNavigate(next: Route) {
    if (next === "studio" && route !== "studio") {
      // Fresh visit to the Studio via nav (not via "Edit") starts a clean draft.
      setStudioSeed(null);
    }
    setRoute(next);
  }

  function handleEdit(record: QRRecord) {
    setStudioSeed(record);
    setStudioKey((k) => k + 1);
    setRoute("studio");
  }

  return (
    <div className="min-h-screen bg-base text-ink">
      {route !== "landing" && <NavBar route={route} onNavigate={handleNavigate} />}
      <main>
        {route === "landing" && <Landing onNavigate={handleNavigate} />}
        {route === "studio" && <Studio key={studioKey} seed={studioSeed} />}
        {route === "test-lab" && <TestLabPage />}
        {route === "batch" && <BatchPage />}
        {route === "history" && <HistoryPage onEdit={handleEdit} />}
        {route === "settings" && <Settings />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
