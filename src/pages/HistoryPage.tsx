import type { QRRecord } from "../types/qr";
import { HistoryLibrary } from "../features/history/HistoryLibrary";

interface HistoryPageProps {
  onEdit: (record: QRRecord) => void;
}

export function HistoryPage({ onEdit }: HistoryPageProps) {
  return (
    <div className="max-w-[1300px] mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">My QR Library</h1>
      <p className="text-ink-faint text-sm mt-2 max-w-lg">
        Everything you save persists in this browser via localStorage — nothing leaves
        your device.
      </p>
      <div className="mt-8">
        <HistoryLibrary onEdit={onEdit} />
      </div>
    </div>
  );
}
