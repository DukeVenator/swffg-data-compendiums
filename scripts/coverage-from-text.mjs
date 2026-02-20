#!/usr/bin/env node
/**
 * Parse Vitest coverage text output and write:
 * 1. coverage-badge.json (Shields.io endpoint format) for README badge
 * 2. GITHUB_STEP_SUMMARY if env GITHUB_STEP_SUMMARY is set (Actions)
 * Reads from stdin or from file path in first arg.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function getInput() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node coverage-from-text.mjs <coverage-log.txt>");
    process.exit(1);
  }
  return readFileSync(arg, "utf-8");
}

function parseCoverage(text) {
  // Vitest table: find line containing "scripts/lib" (our included coverage)
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.includes("scripts/lib") && line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim());
      // Columns: File, % Stmts, % Branch, % Funcs, % Lines
      const stmts = parts[1];
      const branch = parts[2];
      const funcs = parts[3];
      const linesPct = parts[4];
      const pct = linesPct !== undefined && linesPct !== "" ? Number(linesPct) : null;
      if (pct !== null && !Number.isNaN(pct)) return { lines: pct, stmts, branch, funcs };
    }
  }
  // Fallback: "All files" line
  for (const line of lines) {
    if (line.trimStart().startsWith("All files") && line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim());
      const linesPct = parts[4];
      const pct = linesPct !== undefined && linesPct !== "" ? Number(linesPct) : null;
      if (pct !== null && !Number.isNaN(pct)) return { lines: pct, stmts: parts[1], branch: parts[2], funcs: parts[3] };
    }
  }
  return null;
}

function badgeColor(pct) {
  if (pct >= 80) return "green";
  if (pct >= 60) return "yellow";
  if (pct >= 40) return "orange";
  return "red";
}

const input = getInput();
const cov = parseCoverage(input);
if (!cov) {
  console.error("Could not parse coverage from input");
  process.exit(1);
}

const pct = Math.round(cov.lines);
const badge = {
  schemaVersion: 1,
  label: "coverage",
  message: `${pct}%`,
  color: badgeColor(pct)
};

const badgePath = join(ROOT, "coverage-badge.json");
writeFileSync(badgePath, JSON.stringify(badge, null, 0), "utf-8");
console.log("Coverage (lines):", pct + "%");
console.log("Wrote", badgePath);

const stepSummary = process.env.GITHUB_STEP_SUMMARY;
if (stepSummary) {
  const summary = `
## Coverage

| Metric   | Value |
|----------|-------|
| **Lines** | ${cov.lines}% |
| Statements | ${cov.stmts}% |
| Branches | ${cov.branch}% |
| Functions | ${cov.funcs}% |

Badge: \`coverage-badge.json\` written for Shields.io endpoint.
`;
  writeFileSync(stepSummary, summary.trimStart(), "utf-8");
}
