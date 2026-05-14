import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const scanRoots = ["packages/views", "apps/web/app", "apps/desktop/src/renderer/src"];

const fileExtensions = new Set([".ts", ".tsx", ".css"]);

const ignoredPathFragments = [
  ".test.",
  "__snapshots__",
  "apps/web/app/(landing)/",
  "apps/web/app/layout.tsx",
  "packages/views/auth/login-page.tsx",
  "packages/views/editor/mermaid-diagram.tsx",
  "packages/views/issues/components/labels-panel.tsx",
  "packages/views/issues/components/pickers/label-picker.tsx",
  "packages/views/labels/label-chip.tsx",
  "packages/views/runtimes/components/provider-logo.tsx",
  "packages/views/settings/components/preferences-tab.tsx",
];

const rawTailwindColorPattern =
  /\b(?:bg|text|border|ring|from|via|to|fill|stroke)-(?:red|blue|green|gray|slate|zinc|neutral|stone|orange|yellow|purple|pink|indigo|cyan|teal|emerald|rose|lime|amber|sky|violet)-\d{2,3}\b/g;
const rawCssColorPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\(/g;

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function isIgnored(repoPath) {
  return ignoredPathFragments.some((fragment) => repoPath.includes(fragment));
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === "dist" || entry === "out") {
      continue;
    }
    const filePath = path.join(dir, entry);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      yield* walk(filePath);
      continue;
    }
    if (stats.isFile() && fileExtensions.has(path.extname(filePath))) {
      yield filePath;
    }
  }
}

function stripComments(line, state) {
  let text = line;

  if (state.inBlockComment) {
    const end = text.indexOf("*/");
    if (end === -1) return "";
    text = text.slice(end + 2);
    state.inBlockComment = false;
  }

  for (;;) {
    const start = text.indexOf("/*");
    if (start === -1) break;
    const end = text.indexOf("*/", start + 2);
    if (end === -1) {
      text = text.slice(0, start);
      state.inBlockComment = true;
      break;
    }
    text = text.slice(0, start) + text.slice(end + 2);
  }

  const lineComment = text.indexOf("//");
  if (lineComment !== -1) text = text.slice(0, lineComment);

  return text;
}

const findings = [];

for (const root of scanRoots) {
  const absRoot = path.join(repoRoot, root);
  for (const filePath of walk(absRoot)) {
    const repoPath = toRepoPath(filePath);
    if (isIgnored(repoPath)) continue;

    const state = { inBlockComment: false };
    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes("tailwind-token-allow")) return;

      const scanLine = stripComments(line, state);
      const matches = [
        ...scanLine.matchAll(rawTailwindColorPattern),
        ...scanLine.matchAll(rawCssColorPattern),
      ];
      for (const match of matches) {
        findings.push({
          path: repoPath,
          line: index + 1,
          token: match[0],
        });
      }
    });
  }
}

if (findings.length > 0) {
  console.error(
    "Raw color usage found in product UI. Use semantic Tailwind tokens or a shared UI component instead.\n",
  );
  for (const finding of findings) {
    console.error(`${finding.path}:${finding.line} ${finding.token}`);
  }
  console.error(
    "\nIf this is a deliberate exception, add the file to scripts/check-tailwind-tokens.mjs or annotate the line with tailwind-token-allow.",
  );
  process.exit(1);
}

console.log("Tailwind token check passed.");
