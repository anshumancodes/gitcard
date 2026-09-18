import type { GitCardData } from "@/types";
import { getLanguageColor } from "./colors";

interface Theme {
  bg: string;
  border: string;
  labelColor: string;
  percentColor: string;
  trackColor: string;
  dividerColor: string;
}

const THEMES: Record<string, Theme> = {
  dark: {
    bg: "#0d1117",
    border: "#30363d",
    labelColor: "#e6edf3",
    percentColor: "#8b949e",
    trackColor: "#161b22",
    dividerColor: "#0d1117",
  },
  light: {
    bg: "#ffffff",
    border: "#d0d7de",
    labelColor: "#1f2328",
    percentColor: "#656d76",
    trackColor: "#eaecef",
    dividerColor: "#ffffff",
  },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

// ---------------------------------------------------------------------------
// Approximate per-character width ratios for Inter / Segoe UI.
// Slightly generous on narrow chars to avoid under-estimating overall width.
// ---------------------------------------------------------------------------
const CHAR_W: Record<string, number> = {
  " ": 0.28, ".": 0.32, ",": 0.32, ":": 0.32, ";": 0.32,
  "!": 0.32, "|": 0.26, "-": 0.38, "_": 0.58, "+": 0.62,
  "#": 0.68, "%": 0.68,
  f: 0.40, i: 0.30, j: 0.30, l: 0.30, r: 0.42, t: 0.44,
  I: 0.32, J: 0.44, L: 0.57,
  m: 0.82, w: 0.80, M: 0.86, W: 0.86,
  "0": 0.62, "1": 0.44, "2": 0.60, "3": 0.60, "4": 0.62,
  "5": 0.60, "6": 0.62, "7": 0.57, "8": 0.62, "9": 0.62,
};
const DEFAULT_CW = 0.62;

/** Estimate the rendered pixel width of `text` at `fontSize` px. */
function measureText(text: string, fontSize: number, bold = false): number {
  const raw = [...text].reduce((s, ch) => s + (CHAR_W[ch] ?? DEFAULT_CW), 0);
  return raw * fontSize * (bold ? 1.06 : 1.0);
}

/**
 * Return `text` truncated (with ellipsis) to fit within `maxPx` pixels.
 * The percentage string is never passed here — only the language name.
 */
function fitText(text: string, maxPx: number, fontSize: number, bold = false): string {
  if (measureText(text, fontSize, bold) <= maxPx) return text;
  const ellW = measureText("…", fontSize, bold);
  let out = "";
  let acc = ellW;
  for (const ch of text) {
    const w = (CHAR_W[ch] ?? DEFAULT_CW) * fontSize * (bold ? 1.06 : 1.0);
    if (acc + w > maxPx) break;
    out += ch;
    acc += w;
  }
  return out + "…";
}

export function generateErrorSVG(
  message: string,
  theme: "dark" | "light" = "dark",
): string {
  const t = THEMES[theme] ?? THEMES.dark;
  const width = 640;
  const height = 96;

  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}"
    role="img"
    aria-label="Gitcard Error">

  <title>Gitcard Error</title>

  <rect
    width="${width}"
    height="${height}"
    rx="12"
    fill="${t.bg}"
    stroke="${t.border}"
    stroke-width="1"
  />

  <text
    x="${width / 2}"
    y="44"
    font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', Roboto, sans-serif"
    font-size="13"
    fill="${t.labelColor}"
    text-anchor="middle"
    font-weight="600"
  >⚠ ${escapeXml(message)}</text>

  <text
    x="${width / 2}"
    y="66"
    font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', Roboto, sans-serif"
    font-size="11"
    fill="${t.percentColor}"
    text-anchor="middle"
  >gitcard</text>

</svg>`;
}

interface DisplaySegment {
  name: string;
  percentage: number;
  color: string;
  width: number;
  startX: number;
}

export function generateSVG(data: GitCardData): string {
  const { languages, options } = data;

  const {
    theme: themeName = "dark",
    transparent = false,
    borderRadius = 12,
    width = 520,
    compact = false,
  } = options;

  const t = THEMES[themeName] ?? THEMES.dark;
  const isDark = themeName !== "light";

  // ------------------------------------------------------------
  // Card geometry
  // ------------------------------------------------------------

  const cardWidth = Math.max(320, Math.min(width, 1000));

  const paddingX = 24;
  const barWidth = cardWidth - paddingX * 2;

  const barHeight = compact ? 10 : 12;

  // Labels above bar
  const labelY = compact ? 33 : 38;

  // Bar below labels
  const barY = compact ? 48 : 56;

  const barRadius = Math.round(barHeight / 2);


  const cardHeight = compact ? 78 : 96;

  // ------------------------------------------------------------
  // Background
  // ------------------------------------------------------------

  const bgFill = transparent ? "transparent" : t.bg;

  const borderStroke = transparent ? "none" : t.border;

  const dividerColor = transparent ? "rgba(0,0,0,0.25)" : t.bg;

  // ------------------------------------------------------------
  // Use ALL languages
  // ------------------------------------------------------------

  const rawSegments = languages.map((language) => ({
    name: language.name,
    percentage: language.percentage,
    color: language.color || getLanguageColor(language.name),
  }));

  // ------------------------------------------------------------
  // Normalize percentages
  // ------------------------------------------------------------

  const totalRawPct = rawSegments.reduce(
    (sum, segment) => sum + segment.percentage,
    0,
  );

  const segments: DisplaySegment[] = [];

  let accumulatedX = paddingX;

  for (const raw of rawSegments) {
    const normalizedPct =
      totalRawPct > 0 ? (raw.percentage / totalRawPct) * 100 : 0;

    const segmentWidth = (normalizedPct / 100) * barWidth;

    segments.push({
      name: raw.name,
      percentage: normalizedPct,
      color: raw.color,
      width: segmentWidth,
      startX: accumulatedX,
    });

    accumulatedX += segmentWidth;
  }

  // ------------------------------------------------------------
  // Generate bar segments
  // ------------------------------------------------------------

  let barSegmentsContent = "";

  let dividersContent = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment.width <= 0) {
      continue;
    }

    barSegmentsContent += `
      <rect
        x="${segment.startX.toFixed(2)}"
        y="${barY}"
        width="${segment.width.toFixed(2)}"
        height="${barHeight}"
        fill="${segment.color}"
      >
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.4s"
          fill="freeze"
        />
      </rect>
    `;

    // Divider between segments
    if (i < segments.length - 1) {
      const dividerX = segment.startX + segment.width;

      dividersContent += `
        <line
          x1="${dividerX.toFixed(2)}"
          y1="${barY}"
          x2="${dividerX.toFixed(2)}"
          y2="${barY + barHeight}"
          stroke="${dividerColor}"
          stroke-width="2.5"
        />
      `;
    }
  }

  // ------------------------------------------------------------
  // Generate legend  (proportional / content-aware layout)
  // ------------------------------------------------------------

  // Layout constants
  const FS      = 11.5;   // font-size (px)
  const DOT_R   = 3.5;    // dot radius
  const DOT_W   = DOT_R * 2;  // 7 px visual diameter
  const DOT_GAP = 6;      // gap: dot right-edge → text start
  const PCT_DX  = 4;      // dx tspan gap: name end → pct start
  const LBL_GAP = 14;     // gap between adjacent labels

  // Measure each label's natural and fixed widths
  interface LabelMeasure {
    pctStr:      string;
    nameNatural: number;  // natural px width of bold name
    pctW:        number;  // px width of pct string
    fixedW:      number;  // DOT_W + DOT_GAP + PCT_DX + pctW (non-name parts)
    nameSlot:    number;  // allocated px budget for the name (filled below)
  }

  const lm: LabelMeasure[] = segments.map((seg) => {
    const pctStr     = `${seg.percentage.toFixed(1)}%`;
    const nameNatural = measureText(seg.name, FS, true);
    const pctW        = measureText(pctStr,   FS, false);
    const fixedW      = DOT_W + DOT_GAP + PCT_DX + pctW;
    return { pctStr, nameNatural, pctW, fixedW, nameSlot: nameNatural };
  });

  // Total fixed area (dots, gaps, pct strings) + inter-label gaps
  const totalFixed =
    lm.reduce((s, l) => s + l.fixedW, 0) +
    LBL_GAP * Math.max(lm.length - 1, 0);

  const totalNaturalNames = lm.reduce((s, l) => s + l.nameNatural, 0);
  const availForNames     = barWidth - totalFixed;

  if (availForNames < totalNaturalNames && availForNames > 0) {
    // Proportionally shrink each name slot — preserves relative widths
    lm.forEach((l) => {
      l.nameSlot = (l.nameNatural / totalNaturalNames) * availForNames;
    });
  }
  // (else: all names fit naturally; nameSlot already equals nameNatural)

  let labelsContent = "";
  let labelX = paddingX;

  for (let i = 0; i < segments.length; i++) {
    const seg  = segments[i];
    const m    = lm[i];
    const name = fitText(seg.name, m.nameSlot, FS, true);

    const dotCX  = (labelX + DOT_R).toFixed(2);
    const dotCY  = (labelY - DOT_R).toFixed(2);
    const textX  = (labelX + DOT_W + DOT_GAP).toFixed(2);

    labelsContent += `
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="${(0.05 * i).toFixed(2)}s" fill="freeze"/>
      <circle cx="${dotCX}" cy="${dotCY}" r="${DOT_R}" fill="${seg.color}"/>
      <text
        x="${textX}"
        y="${labelY}"
        font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', Roboto, sans-serif"
        font-size="${FS}"
        fill="${t.labelColor}"
      ><tspan font-weight="600">${escapeXml(name)}</tspan><tspan font-weight="400" fill="${t.percentColor}" dx="${PCT_DX}">${m.pctStr}</tspan></text>
    </g>
  `;

    // Advance cursor by the full allocated slot (not just the rendered name
    // width) so that truncated labels still leave room for the next label.
    labelX += DOT_W + DOT_GAP + m.nameSlot + PCT_DX + m.pctW + LBL_GAP;
  }

  // ------------------------------------------------------------
  // SVG
  // ------------------------------------------------------------
  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${cardWidth}"
  height="${cardHeight}"
  viewBox="0 0 ${cardWidth} ${cardHeight}"
  role="img"
  aria-label="Gitcard Language Stats"
>
  <title>Gitcard Language Stats</title>

  <desc>
    GitHub language breakdown
  </desc>

  <defs>
    <clipPath id="barClip">
      <rect
        x="${paddingX}"
        y="${barY}"
        width="${barWidth}"
        height="${barHeight}"
        rx="${barRadius}"
      />
    </clipPath>
  </defs>

  <!-- Card -->
  <rect
    width="${cardWidth}"
    height="${cardHeight}"
    rx="${borderRadius}"
    fill="${bgFill}"
    stroke="${borderStroke}"
    stroke-width="1"
  />

  <!-- Language Labels -->
  ${labelsContent}

  <!-- Language Bar -->
  <g clip-path="url(#barClip)">

    <rect
      x="${paddingX}"
      y="${barY}"
      width="${barWidth}"
      height="${barHeight}"
      fill="${t.trackColor}"
    />

    ${barSegmentsContent}

    ${dividersContent}

  </g>

</svg>`;
}
