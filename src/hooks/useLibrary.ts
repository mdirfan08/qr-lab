import { useCallback, useEffect, useState } from "react";
import type { QRRecord } from "../types/qr";
import { loadLibrary, upsertRecord, deleteRecord } from "../lib/storage";

export function useLibrary() {
  const [records, setRecords] = useState<QRRecord[]>([]);

  useEffect(() => {
    setRecords(loadLibrary());
  }, []);

  const save = useCallback((record: QRRecord) => {
    setRecords(upsertRecord(record));
  }, []);

  const remove = useCallback((id: string) => {
    setRecords(deleteRecord(id));
  }, []);

  return { records, save, remove };
}
