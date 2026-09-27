// Minimal CSV parser for the Batch Generator — no external dependency needed for
// the simple "Name,Value" shape this feature expects.
export interface BatchRow {
  name: string;
  value: string;
}

export function parseCSV(input: string): BatchRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const looksLikeHeader = /^(name|label)\s*,/i.test(lines[0]);
  const dataLines = looksLikeHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      const commaIdx = line.indexOf(",");
      if (commaIdx === -1) return { name: line.trim(), value: line.trim() };
      const name = line.slice(0, commaIdx).trim();
      const value = line.slice(commaIdx + 1).trim();
      return { name: name || value, value };
    })
    .filter((row) => row.value.length > 0);
}
