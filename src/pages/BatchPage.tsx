import { BatchGenerator } from "../features/batch/BatchGenerator";

export function BatchPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Batch Generator</h1>
      <p className="text-ink-faint text-sm mt-2 max-w-lg">
        Generate many QR codes at once from a simple CSV list. Everything happens locally —
        nothing is uploaded.
      </p>
      <div className="mt-8">
        <BatchGenerator />
      </div>
    </div>
  );
}
