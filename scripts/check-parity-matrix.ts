/**
 * Fails CI when any P0 API group is marked `no` for a Tier-1 language core.
 * See specs/002-api-parity/contracts/parity-matrix.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..");
const MATRIX_PATH = join(
  REPO_ROOT,
  "specs/002-api-parity/contracts/parity-matrix.md",
);

const TIER1_CORES = [
  "node-commons",
  "javascript",
  "python",
  "go",
  "rust-core",
  "java",
  "kotlin",
] as const;

const PASS = new Set(["yes", "partial"]);

function parseMatrix(content: string): {
  headers: string[];
  rows: { group: string; tier: string; cells: Record<string, string> }[];
} {
  const lines = content.split("\n");
  const tableLines = lines.filter((l) => l.trim().startsWith("|"));
  if (tableLines.length < 2) {
    throw new Error("parity-matrix.md: no markdown table found");
  }

  const headers = tableLines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);

  const rows: { group: string; tier: string; cells: Record<string, string> }[] =
    [];

  for (const line of tableLines.slice(2)) {
    if (/^\|\s*---/.test(line)) continue;
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 3) continue;
    const [group, tier, ...rest] = cols;
    const cells: Record<string, string> = {};
    for (let i = 0; i < rest.length && i + 2 < headers.length; i++) {
      cells[headers[i + 2]] = rest[i].toLowerCase();
    }
    rows.push({ group, tier: tier.toUpperCase(), cells });
  }

  return { headers, rows };
}

const content = readFileSync(MATRIX_PATH, "utf8");
const { rows } = parseMatrix(content);

const failures: string[] = [];

for (const row of rows) {
  if (row.tier !== "P0") continue;
  for (const core of TIER1_CORES) {
    const status = row.cells[core] ?? "missing";
    if (!PASS.has(status)) {
      failures.push(`${row.group} / ${core} = ${status}`);
    }
  }
}

if (failures.length > 0) {
  console.error("P0 parity matrix check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error(`\nUpdate ${MATRIX_PATH} or implement missing API groups.`);
  process.exit(1);
}

console.log("P0 parity matrix check passed for Tier-1 cores.");
