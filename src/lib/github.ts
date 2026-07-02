import type { GitHubRepo, GitHubUser, LanguageMap } from "@/types";

const BASE_URL = "https://api.github.com";

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Gitcard/1.0",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchUser(username: string): Promise<GitHubUser | null> {
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    headers: getHeaders(),
    next: { revalidate: 86400 }, // 24 hours
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  return res.json();
}

export async function fetchAllRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&type=public`,
      {
        headers: getHeaders(),
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data: GitHubRepo[] = await res.json();
    repos.push(...data);

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

export async function fetchRepoLanguages(
  languagesUrl: string
): Promise<LanguageMap> {
  const res = await fetch(languagesUrl, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });

  if (!res.ok) return {};
  return res.json();
}

export async function fetchAllLanguages(
  repos: GitHubRepo[]
): Promise<LanguageMap> {

  const nonForkRepos = repos.filter((r) => !r.fork);

  const results = await Promise.allSettled(
    nonForkRepos.map((repo) => fetchRepoLanguages(repo.languages_url))
  );

  const aggregated: LanguageMap = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const [lang, bytes] of Object.entries(result.value)) {
        aggregated[lang] = (aggregated[lang] ?? 0) + bytes;
      }
    }
  }

  return aggregated;
}
