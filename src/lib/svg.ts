import type { GitCardData, GitCardOptions } from "@/types";
import { formatBytes } from "./languages";



interface Theme {
  bg: string;
  border: string;
  titleColor: string;
  usernameColor: string;
  labelColor: string;
  percentColor: string;
  trackColor: string;
  badgeBg: string;
  badgeText: string;
  statLabel: string;
  statValue: string;
}

const THEMES: Record<string, Theme> = {
  dark: {
    bg: "#0a0a0a",
    border: "#2a2a2a",
    titleColor: "#e8e8e8",
    usernameColor: "#ffffff",
    labelColor: "#c0c0c0",
    percentColor: "#707070",
    trackColor: "#1e1e1e",
    badgeBg: "#141414",
    badgeText: "#707070",
    statLabel: "#606060",
    statValue: "#c0c0c0",
  },
  light: {
    bg: "#f9f9f9",
    border: "#d4d4d4",
    titleColor: "#111111",
    usernameColor: "#111111",
    labelColor: "#333333",
    percentColor: "#888888",
    trackColor: "#e4e4e4",
    badgeBg: "#f0f0f0",
    badgeText: "#888888",
    statLabel: "#888888",
    statValue: "#333333",
  },
};

function monoBarColor(index: number, total: number, isDark: boolean): string {
  const ratio = total <= 1 ? 0 : index / (total - 1);
  if (isDark) {
    const v = Math.round(220 - ratio * 130); // 220 → 90
    return `rgb(${v},${v},${v})`;
  } else {
    // Start dark (index 0) → light (last)
    const v = Math.round(40 + ratio * 140); // 40 → 180
    return `rgb(${v},${v},${v})`;
  }
}



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


function renderRow(
  name: string,
  percentage: number,
  barColor: string,
  theme: Theme,
  y: number,
  width: number,
  isOthers = false
): string {
  const barMaxWidth = width - 160; // space for label (90) + percentage (70)
  const barWidth = Math.max(2, (percentage / 100) * barMaxWidth);
  const pct = percentage.toFixed(1) + "%";
  const label = truncate(isOthers ? "Others" : name, 14);

  // Dot indicator
  const dotX = 16;
  const dotY = y + 7;

  // Label
  const labelX = 32;
  const labelY = y + 12;

  // Bar track
  const trackX = 130;
  const trackY = y + 3;
  const trackH = 8;
  const trackW = barMaxWidth;

  // Percentage
  const pctX = width - 12;
  const pctY = y + 12;

  return `
  <circle cx="${dotX}" cy="${dotY}" r="5" fill="${barColor}" />
  <text x="${labelX}" y="${labelY}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11.5" fill="${theme.labelColor}" font-weight="${isOthers ? "400" : "500"}">${escapeXml(label)}</text>
  
  <!-- Track -->
  <rect x="${trackX}" y="${trackY}" width="${trackW}" height="${trackH}" rx="4" fill="${theme.trackColor}" />
  <!-- Fill -->
  <rect x="${trackX}" y="${trackY}" width="${barWidth.toFixed(1)}" height="${trackH}" rx="4" fill="${barColor}" opacity="0.92">
    <animate attributeName="width" from="0" to="${barWidth.toFixed(1)}" dur="0.8s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.25,0.1,0.25,1" />
  </rect>
  
  <!-- Percentage -->
  <text x="${pctX}" y="${pctY}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${theme.percentColor}" text-anchor="end" font-weight="600">${escapeXml(pct)}</text>`;
}



export function generateErrorSVG(
  message: string,
  theme: "dark" | "light" = "dark"
): string {
  const t = THEMES[theme] ?? THEMES.dark;
  const width = 450;
  const height = 120;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gitcard Error">
  <title>Gitcard Error</title>
  <rect width="${width}" height="${height}" rx="10" fill="${t.bg}" stroke="${t.border}" stroke-width="1" />
  <text x="${width / 2}" y="45" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${t.usernameColor}" text-anchor="middle" font-weight="700">⚠ Gitcard</text>
  <text x="${width / 2}" y="72" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="${t.labelColor}" text-anchor="middle">${escapeXml(message)}</text>
  <text x="${width / 2}" y="96" font-family="'Segoe UI', system-ui, sans-serif" font-size="10" fill="${t.percentColor}" text-anchor="middle">gitcard.dev</text>
</svg>`;
}


export function generateSVG(data: GitCardData): string {
  const { username, avatarUrl, repoCount, totalBytes, languages, options } =
    data;
  const { theme: themeName, top, title, transparent, borderRadius, width, compact } =
    options;

  const t = THEMES[themeName] ?? THEMES.dark;
  const isDark = themeName !== "light";
  const topN = Math.min(top, languages.length);

  // Slice displayed vs "others"
  const displayed = languages.slice(0, topN);
  const rest = languages.slice(topN);
  const othersPercent = rest.reduce((s, l) => s + l.percentage, 0);
  const showOthers = othersPercent > 0.1 && rest.length > 0;

  // Layout constants
  const PADDING = 20;
  const HEADER_HEIGHT = compact ? 56 : 80;
  const STATS_HEIGHT = compact ? 0 : 28;
  const ROW_HEIGHT = compact ? 22 : 28;
  const DIVIDER_H = 1;
  const FOOTER_H = 18;

  const rowCount = displayed.length + (showOthers ? 1 : 0);
  const svgHeight =
    PADDING +
    HEADER_HEIGHT +
    STATS_HEIGHT +
    DIVIDER_H +
    PADDING / 2 +
    rowCount * ROW_HEIGHT +
    PADDING / 2 +
    FOOTER_H +
    PADDING;

  const bgFill = transparent ? "transparent" : t.bg;
  const borderStroke = transparent ? "none" : t.border;

  // Avatar section
  const avatarSize = compact ? 28 : 40;
  const avatarX = PADDING;
  const avatarY = PADDING;
  const hasAvatar = Boolean(avatarUrl);

  // Title text x position
  const textX = hasAvatar ? avatarX + avatarSize + 12 : PADDING;

  // Build rows (monochrome shades per index)
  let rowsContent = "";
  let rowY =
    PADDING + HEADER_HEIGHT + STATS_HEIGHT + DIVIDER_H + PADDING / 2;

  for (let i = 0; i < displayed.length; i++) {
    const lang = displayed[i];
    const barColor = monoBarColor(i, displayed.length, isDark);
    rowsContent += renderRow(
      lang.name,
      lang.percentage,
      barColor,
      t,
      rowY,
      width - PADDING * 2,
      false
    );
    rowY += ROW_HEIGHT;
  }

  if (showOthers) {
    const othersColor = isDark ? "#404040" : "#aaaaaa";
    rowsContent += renderRow(
      "Others",
      othersPercent,
      othersColor,
      t,
      rowY,
      width - PADDING * 2,
      true
    );
  }

  // Stats bar
  const statsContent = compact
    ? ""
    : `
  <text x="${PADDING}" y="${PADDING + HEADER_HEIGHT + 18}" font-family="'Segoe UI', system-ui, sans-serif" font-size="10" fill="${t.statLabel}">
    <tspan>${repoCount} repos</tspan>
    <tspan dx="12">${formatBytes(totalBytes)} analyzed</tspan>
    <tspan dx="12">${languages.length} languages</tspan>
  </text>`;

  // Color legend (monochrome gradient strip)
  const stripWidth = width - PADDING * 2;
  const stripSegments = displayed
    .map((lang, i) => {
      const startX =
        displayed.slice(0, i).reduce((acc, l) => acc + (l.percentage / 100) * stripWidth, 0);
      const segW = (lang.percentage / 100) * stripWidth;
      const segColor = monoBarColor(i, displayed.length, isDark);
      return `<rect x="${(PADDING + startX).toFixed(1)}" y="${svgHeight - PADDING - FOOTER_H - 8}" width="${segW.toFixed(1)}" height="6" fill="${segColor}" ${i === 0 ? `rx="3"` : i === displayed.length - 1 ? `rx="3"` : ""} />`;
    })
    .join("\n  ");

  // Avatar image (base64 or href)
  const avatarContent = hasAvatar
    ? `
  <clipPath id="avatarClip">
    <circle cx="${avatarX + avatarSize / 2}" cy="${avatarY + avatarSize / 2}" r="${avatarSize / 2}" />
  </clipPath>
  <image href="${avatarUrl}" x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatarClip)" />
  <circle cx="${avatarX + avatarSize / 2}" cy="${avatarY + avatarSize / 2}" r="${avatarSize / 2}" fill="none" stroke="${t.border}" stroke-width="1.5" />`
    : "";

  const usernameY = compact
    ? avatarY + avatarSize / 2 - 4
    : avatarY + (hasAvatar ? 14 : 18);
  const subtitleY = compact
    ? avatarY + avatarSize / 2 + 12
    : avatarY + (hasAvatar ? 30 : 36);

  const displayTitle = escapeXml(title || "Languages");
  const displayUsername = escapeXml(truncate(`@${username}`, 24));

  // Auto font-size for long usernames
  const usernameFontSize = username.length > 18 ? 14 : username.length > 14 ? 16 : 18;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${svgHeight}" viewBox="0 0 ${width} ${svgHeight}" role="img" aria-label="Gitcard for ${escapeXml(username)}">
  <title>Gitcard – ${escapeXml(username)}</title>
  <desc>Top programming languages used by GitHub user ${escapeXml(username)}</desc>

  <!-- Background -->
  <rect width="${width}" height="${svgHeight}" rx="${borderRadius}" fill="${bgFill}" stroke="${borderStroke}" stroke-width="1" />

  ${avatarContent}

  <!-- Username -->
  <text x="${textX}" y="${usernameY}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="${usernameFontSize}" fill="${t.usernameColor}" font-weight="700">${displayUsername}</text>

  <!-- Title -->
  <text x="${textX}" y="${subtitleY}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${t.titleColor}" font-weight="500" opacity="0.75">${displayTitle}</text>

  ${statsContent}

  <!-- Divider -->
  <line x1="${PADDING}" y1="${PADDING + HEADER_HEIGHT + STATS_HEIGHT}" x2="${width - PADDING}" y2="${PADDING + HEADER_HEIGHT + STATS_HEIGHT}" stroke="${t.border}" stroke-width="1" />

  <!-- Language rows -->
  <g transform="translate(${PADDING}, 0)">
    ${rowsContent}
  </g>

  <!-- Color strip -->
  ${stripSegments}

  <!-- Footer -->
  <text x="${width / 2}" y="${svgHeight - PADDING / 2 + 2}" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" fill="${t.percentColor}" text-anchor="middle" opacity="0.6">gitcard • powered by GitHub API</text>
</svg>`;
}
