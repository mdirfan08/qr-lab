import { useEffect, useMemo, useState } from "react";
import type { QRRecord } from "../../types/qr";
import { useLibrary } from "../../hooks/useLibrary";
import { buildMatrix, renderSVG } from "../../lib/qrEngine";
import { buildPayload } from "../../lib/payload";
import { downloadPNG } from "../../lib/download";
import { genId } from "../../lib/storage";
import { QRPreview } from "../qr-generator/QRPreview";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { useToast } from "../../components/ui/Toast";

interface HistoryLibraryProps {
  onEdit: (record: QRRecord) => void;
}

function LibraryCard({ record, onEdit, onDuplicate, onDelete }: {
  record: QRRecord;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [svg, setSvg] = useState("");
  const { show } = useToast();

  useEffect(() => {
    let cancelled = false;
    const payload = buildPayload(record.fields);
    buildMatrix(payload, record.design.errorCorrection).then((matrix) => {
      if (!cancelled) setSvg(renderSVG(matrix, { design: { ...record.design, size: 200 } }));
    });
    return () => {
      cancelled = true;
    };
  }, [record]);

  async function handleDownload() {
    try {
      const payload = buildPayload(record.fields);
      await downloadPNG(payload, record.design, record.name);
      show("Downloaded ✓", "success");
    } catch {
      show("Download failed.", "error");
    }
  }

  return (
    <div className="panel p-4 flex flex-col gap-3">
      <div className="flex justify-center">
        <QRPreview svg={svg} size={140} />
      </div>
      <div>
        <div className="text-sm text-ink truncate">{record.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-ink-faint uppercase tracking-wide">{record.fields.type}</span>
          <span className="text-[11px] text-ink-faint num">{new Date(record.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="text-[11px] text-ink-faint mt-1">
          Reliability <span className="num text-ink">{record.reliabilityScore}</span> · {record.design.preset}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Button size="sm" variant="secondary" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="secondary" onClick={handleDownload}>Download</Button>
        <Button size="sm" variant="ghost" onClick={onDuplicate}>Duplicate</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  );
}

export function HistoryLibrary({ onEdit }: HistoryLibraryProps) {
  const { records, save, remove } = useLibrary();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || r.fields.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [records, query, typeFilter]);

  const types = useMemo(() => Array.from(new Set(records.map((r) => r.fields.type))), [records]);

  function handleDuplicate(record: QRRecord) {
    save({ ...record, id: genId(), name: `${record.name} copy`, createdAt: Date.now() });
  }

  if (records.length === 0) {
    return (
      <div className="panel p-14 text-center">
        <p className="text-ink font-medium">No QR codes yet.</p>
        <p className="text-ink-faint text-sm mt-1.5">Create your first QR and it will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <TextField placeholder="Search by name…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg bg-base-raised border border-base-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/60"
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-faint text-sm">No results match your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <LibraryCard
              key={r.id}
              record={r}
              onEdit={() => onEdit(r)}
              onDuplicate={() => handleDuplicate(r)}
              onDelete={() => remove(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
