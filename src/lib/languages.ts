import type { AggregatedLanguage, LanguageMap } from "@/types";
import { getLanguageColor } from "./colors";

export function aggregateLanguages(
  rawMap: LanguageMap,
  hideList: string[] = []
): {
  languages: AggregatedLanguage[];
  totalBytes: number;
} {
  const hideLower = new Set(hideList.map((l) => l.toLowerCase()));

  const filtered: LanguageMap = {};
  for (const [lang, bytes] of Object.entries(rawMap)) {
    if (!hideLower.has(lang.toLowerCase())) {
      filtered[lang] = bytes;
    }
  }

  const totalBytes = Object.values(filtered).reduce((a, b) => a + b, 0);

  if (totalBytes === 0) {
    return { languages: [], totalBytes: 0 };
  }

  const sorted = Object.entries(filtered).sort(([, a], [, b]) => b - a);

  const languages: AggregatedLanguage[] = sorted.map(([name, bytes]) => ({
    name,
    bytes,
    percentage: (bytes / totalBytes) * 100,
    color: getLanguageColor(name),
  }));

  return { languages, totalBytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
