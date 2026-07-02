import { NextRequest, NextResponse } from "next/server";
import { fetchUser, fetchAllRepos, fetchAllLanguages } from "@/lib/github";
import { aggregateLanguages } from "@/lib/languages";
import { generateSVG, generateErrorSVG } from "@/lib/svg";
import type { GitCardData, GitCardOptions } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function svgResponse(svg: string, maxAge = 86400): NextResponse {
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=43200`,
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
      Vary: "Accept-Encoding",
    },
  });
}

function errorSVG(
  message: string,
  theme: "dark" | "light" = "dark"
): NextResponse {
  return svgResponse(generateErrorSVG(message, theme), 60);
}

function parseOptions(searchParams: URLSearchParams): GitCardOptions {
  const theme =
    searchParams.get("theme") === "light" ? "light" : "dark";

  const topRaw = parseInt(searchParams.get("top") ?? "8", 10);
  const top = isNaN(topRaw) || topRaw < 1 ? 8 : Math.min(topRaw, 20);

  const hideRaw = searchParams.get("hide") ?? "";
  const hide = hideRaw
    ? hideRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const title = searchParams.get("title") ?? "";

  const showAvatar = searchParams.get("avatar") !== "false";

  const transparent = searchParams.get("bg") === "transparent";

  const brRaw = parseInt(searchParams.get("radius") ?? "12", 10);
  const borderRadius = isNaN(brRaw) ? 12 : Math.min(Math.max(brRaw, 0), 30);

  const widthRaw = parseInt(searchParams.get("width") ?? "450", 10);
  const width = isNaN(widthRaw) ? 450 : Math.min(Math.max(widthRaw, 320), 800);

  const compact = searchParams.get("compact") === "true";

  return { theme, top, hide, title, showAvatar, transparent, borderRadius, width, compact };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = req.nextUrl;
  const options = parseOptions(searchParams);
  const { theme } = options;

  if (!username || username.length > 39 || !/^[a-zA-Z0-9-]+$/.test(username)) {
    return errorSVG("Invalid GitHub username.", theme);
  }

  try {
    // 1. Fetch user
    const user = await fetchUser(username);
    if (!user) {
      return errorSVG(`User "@${username}" not found on GitHub.`, theme);
    }

    // 2. Fetch all public repos
    const repos = await fetchAllRepos(username);
    if (repos.length === 0) {
      return errorSVG(`@${username} has no public repositories.`, theme);
    }

    // 3. Fetch language data concurrently
    const rawLanguages = await fetchAllLanguages(repos);

    // 4. Aggregate + filter
    const { languages, totalBytes } = aggregateLanguages(
      rawLanguages,
      options.hide
    );

    if (languages.length === 0) {
      return errorSVG(`No language data found for @${username}.`, theme);
    }

    // 5. Build card data
    const avatarUrl = options.showAvatar ? user.avatar_url : null;

    const cardData: GitCardData = {
      username: user.login,
      avatarUrl,
      repoCount: user.public_repos,
      totalBytes,
      languages,
      othersPercentage: 0, // computed inside generateSVG
      options,
    };

    const svg = generateSVG(cardData);
    return svgResponse(svg);
  } catch (err) {
    console.error("[Gitcard] Error:", err);
    const msg =
      err instanceof Error
        ? err.message.includes("rate limit")
          ? "GitHub API rate limit exceeded. Try again later."
          : "GitHub API request failed. Try again later."
        : "An unexpected error occurred.";
    return errorSVG(msg, theme);
  }
}
