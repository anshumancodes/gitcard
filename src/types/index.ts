export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  languages_url: string;
  fork: boolean;
  size: number;
}

export interface LanguageMap {
  [language: string]: number; // bytes
}

export interface AggregatedLanguage {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface GitCardOptions {
  theme: "dark" | "light";
  top: number;
  hide: string[];
  title: string;
  showAvatar: boolean;
  transparent: boolean;
  borderRadius: number;
  width: number;
  compact: boolean;
}

export interface GitCardData {
  username: string;
  avatarUrl: string | null;
  repoCount: number;
  totalBytes: number;
  languages: AggregatedLanguage[];
  othersPercentage: number;
  options: GitCardOptions;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  public_repos: number;
  name: string | null;
}
