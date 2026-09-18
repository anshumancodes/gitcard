import type { AggregatedLanguage, LanguageMap } from "@/types";
import { getLanguageColor } from "./colors";

// ---------------------------------------------------------------------------
// Languages reported by GitHub Linguist that are NOT source/programming code.
// These are excluded *before* byte counting so percentages reflect only
// actual code languages.
// ---------------------------------------------------------------------------
const EXCLUDED_LANGUAGES = new Set([
  // Stylesheets
  "css",
  "scss",
  "sass",
  "less",

  // Markup / template languages
  "html",
  "ejs",
  "handlebars",
  "mustache",

  // Documentation
  "markdown",
  "mdx",
  "rdoc",
  "pod",
  "restructuredtext",
  "asciidoc",
  "tex",

  // Data / config formats
  "json",
  "yaml",
  "xml",
  "toml",
  "ini",
  "properties",
  "dotenv",

  // Containerisation / build tooling
  "dockerfile",
  "docker-compose",

  // Lock files / generated artifacts
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",

  // Editor / tooling config
  "gitignore template",
  "git config",
  "editorconfig",
]);

/** Maximum number of languages shown individually in the card. */
const TOP_N = 6;

export function aggregateLanguages(
  rawMap: LanguageMap,
  hideList: string[] = []
): {
  languages: AggregatedLanguage[];
  totalBytes: number;
} {
  const hideLower = new Set(hideList.map((l) => l.toLowerCase()));

  // -------------------------------------------------------------------------
  // Step 1: exclude non-source languages AND user-requested hidden languages.
  // Filtering happens before byte counting so totals reflect only real code.
  // -------------------------------------------------------------------------
  const filtered: LanguageMap = {};
  for (const [lang, bytes] of Object.entries(rawMap)) {
    const lower = lang.toLowerCase();
    if (EXCLUDED_LANGUAGES.has(lower)) continue;
    if (hideLower.has(lower)) continue;
    filtered[lang] = bytes;
  }

  // -------------------------------------------------------------------------
  // Step 2: compute total from filtered set only.
  // -------------------------------------------------------------------------
  const totalBytes = Object.values(filtered).reduce((a, b) => a + b, 0);

  if (totalBytes === 0) {
    return { languages: [], totalBytes: 0 };
  }

  // -------------------------------------------------------------------------
  // Step 3: sort descending by bytes.
  // -------------------------------------------------------------------------
  const sorted = Object.entries(filtered).sort(([, a], [, b]) => b - a);

  // -------------------------------------------------------------------------
  // Step 4: take top N; fold the rest into "Other".
  // -------------------------------------------------------------------------
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);

  const languages: AggregatedLanguage[] = top.map(([name, bytes]) => ({
    name,
    bytes,
    percentage: (bytes / totalBytes) * 100,
    color: getLanguageColor(name),
  }));

  if (rest.length > 0) {
    const otherBytes = rest.reduce((sum, [, b]) => sum + b, 0);
    languages.push({
      name: "Other",
      bytes: otherBytes,
      percentage: (otherBytes / totalBytes) * 100,
      color: getLanguageColor("Other"),
    });
  }

  return { languages, totalBytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
