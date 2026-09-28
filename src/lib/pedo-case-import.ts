/**
 * Parses clinician-supplied pediatric dental case files (JSON or CSV) into the
 * shape stored in the case library and used to ground the AI treatment plan.
 */

export type ImportedCase = {
  title: string;
  presentation: string;
  management: string;
  evidence: string;
  toothStates: string[];
  surfaceFindings: string[];
  toothGroup: string;
  minSurfaces: number;
  toothNumbers: string[];
};

const GROUPS = ["primary", "permanent", "any"];

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  return [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const found = Object.keys(row).find((name) => name.toLowerCase().replace(/[\s_-]/g, "") === key);
    if (found !== undefined && row[found] !== undefined && row[found] !== "") return row[found];
  }
  return undefined;
}

function normalize(row: Record<string, unknown>): ImportedCase | null {
  const title = text(pick(row, ["title", "casetitle", "name", "diagnosis"]));
  if (!title) return null;
  const group = text(pick(row, ["toothgroup", "group", "dentition"])).toLowerCase();
  const minSurfaces = Number(pick(row, ["minsurfaces", "minsurfacecount", "surfacecount"]) ?? 0);

  return {
    title,
    presentation: text(pick(row, ["presentation", "findings", "history", "complaint"])),
    management: text(pick(row, ["management", "treatment", "treatmentplan", "plan"])),
    evidence: text(pick(row, ["evidence", "source", "reference", "guideline"])),
    toothStates: list(pick(row, ["toothstates", "toothstate", "states", "condition", "conditions"])),
    surfaceFindings: list(pick(row, ["surfacefindings", "surfaces", "surfacefinding"])),
    toothGroup: GROUPS.includes(group) ? group : "any",
    minSurfaces: Number.isFinite(minSurfaces) && minSurfaces > 0 ? Math.floor(minSurfaces) : 0,
    toothNumbers: list(pick(row, ["toothnumbers", "teeth", "tooth", "fdi"])),
  };
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

/** Accepts a JSON array/object or a CSV table and returns the cases it contains. */
export function parseCaseFile(raw: string): { cases: ImportedCase[]; skipped: number } {
  const trimmed = raw.trim();
  if (!trimmed) return { cases: [], skipped: 0 };

  let rows: Record<string, unknown>[] = [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const array = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { cases?: unknown }).cases)
        ? ((parsed as { cases: unknown[] }).cases)
        : [parsed];
    rows = array.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  } else {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const header = splitCsvLine(lines[0] ?? "");
    rows = lines.slice(1).map((line) => {
      const cells = splitCsvLine(line);
      const row: Record<string, unknown> = {};
      header.forEach((name, index) => {
        row[name] = cells[index] ?? "";
      });
      return row;
    });
  }

  const cases: ImportedCase[] = [];
  let skipped = 0;
  for (const row of rows) {
    const value = normalize(row);
    if (value) cases.push(value);
    else skipped += 1;
  }
  return { cases, skipped };
}

export const CASE_TEMPLATE_JSON = `[
  {
    "title": "Occlusal caries in primary molar 54",
    "presentation": "6-year-old, cavitated occlusal lesion, vital pulp, no swelling",
    "management": "Selective caries removal, composite restoration, fluoride varnish 3-monthly",
    "evidence": "Clinic protocol 2025 / FiCTION trial",
    "toothStates": "Caries",
    "surfaceFindings": "Caries",
    "toothGroup": "primary",
    "minSurfaces": 1,
    "toothNumbers": "54, 64, 74, 84"
  }
]`;
