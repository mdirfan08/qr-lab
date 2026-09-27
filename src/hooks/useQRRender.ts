// Recomputes the QR matrix + SVG whenever payload or design changes, debounced so
// rapid slider drags don't thrash re-encoding.
import { useEffect, useMemo, useState } from "react";
import type { QRDesign } from "../types/qr";
import { buildMatrix, renderSVG, type QRMatrix } from "../lib/qrEngine";
import { analyzeReliability } from "../lib/reliability";
import { useDebounce } from "./useDebounce";

export function useQRRender(payload: string, design: QRDesign) {
  const debouncedPayload = useDebounce(payload, 120);
  const debouncedDesign = useDebounce(design, 60);
  const [matrix, setMatrix] = useState<QRMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildMatrix(debouncedPayload || " ", debouncedDesign.errorCorrection)
      .then((m) => {
        if (!cancelled) {
          setMatrix(m);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not generate this QR code.");
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedPayload, debouncedDesign.errorCorrection]);

  const svg = useMemo(() => {
    if (!matrix) return "";
    return renderSVG(matrix, { design: debouncedDesign });
  }, [matrix, debouncedDesign]);

  const reliability = useMemo(() => {
    if (!matrix) return null;
    return analyzeReliability(matrix, debouncedDesign);
  }, [matrix, debouncedDesign]);

  return { matrix, svg, reliability, error };
}
