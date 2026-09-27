import { useState } from "react";
import { Button } from "../components/ui/Button";
import { loadLibrary, saveLibrary } from "../lib/storage";
import { useToast } from "../components/ui/Toast";

export function Settings() {
  const [confirmClear, setConfirmClear] = useState(false);
  const { show } = useToast();

  function handleExport() {
    const data = JSON.stringify(loadLibrary(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-lab-library.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    saveLibrary([]);
    setConfirmClear(false);
    show("Library cleared", "success");
  }

  return (
    <div className="max-w-[700px] mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

      <div className="panel p-6 mt-8">
        <h2 className="text-sm font-medium text-ink">Privacy</h2>
        <p className="text-sm text-ink-faint mt-2 leading-relaxed">
          QR generation, design, testing, and your saved library all happen locally in this
          browser. QR LAB has no backend — your content is never sent anywhere.
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-good">
          <span className="w-1.5 h-1.5 rounded-full bg-good" />
          Local Mode — always on
        </div>
      </div>

      <div className="panel p-6 mt-5">
        <h2 className="text-sm font-medium text-ink">Your data</h2>
        <p className="text-sm text-ink-faint mt-2 leading-relaxed">
          Export your saved library as a JSON file, or clear it from this browser.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={handleExport}>Export Library</Button>
          <Button variant={confirmClear ? "danger" : "secondary"} onClick={handleClear}>
            {confirmClear ? "Confirm Clear" : "Clear Library"}
          </Button>
        </div>
      </div>

      <div className="panel p-6 mt-5">
        <h2 className="text-sm font-medium text-ink">About</h2>
        <p className="text-sm text-ink-faint mt-2 leading-relaxed">
          QR LAB — built for GDG on Campus SRM, Technical Domain Recruitment 2026-27.
        </p>
      </div>
    </div>
  );
}
