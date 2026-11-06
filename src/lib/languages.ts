import type { AggregatedLanguage, LanguageMap } from "@/types";
import { getLanguageColor } from "./colors";

// ---------------------------------------------------------------------------
// Keep the card focused on widely used programming languages. GitHub's
// language endpoint also reports shell, markup, stylesheets, and data formats,
// so an allowlist is more reliable than trying to enumerate every exclusion.
// ---------------------------------------------------------------------------
const PROGRAMMING_LANGUAGES = new Set([
  "assembly", "c", "c#", "c++", "clojure", "coffeescript", "common lisp",
  "crystal", "dart", "elixir", "elm", "erlang", "f#", "fortran", "go",
  "groovy", "haskell", "java", "javascript", "julia", "kotlin", "lua",
  "matlab", "ocaml", "objective-c", "perl", "php", "python", "r",
  "ruby", "rust", "scala", "scheme", "sql", "swift", "typescript",
  "visual basic .net", "wasm", "zig",
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
    if (!PROGRAMMING_LANGUAGES.has(lower)) continue;
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
