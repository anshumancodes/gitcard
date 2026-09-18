"use client";

import { useState } from "react";

export default function TryItWidget() {
  const [username, setUsername] = useState("torvalds");
  const [previewUser, setPreviewUser] = useState("torvalds");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [cacheBust, setCacheBust] = useState(0);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleaned = username.trim().replace(/[^a-zA-Z0-9-]/g, "");
    if (!cleaned) return;
    setPreviewUser(cleaned);
    setCacheBust((n) => n + 1);
  }

  const querySuffix = theme === "light" ? "?theme=light" : "";
  const cardUrl = `/${encodeURIComponent(previewUser)}${querySuffix}${querySuffix ? `&t=${cacheBust}` : `?t=${cacheBust}`}`;
  const markdownCode = `![Languages](https://gitcard.dev/${encodeURIComponent(previewUser)}${querySuffix})`;

  function handleCopy() {
    navigator.clipboard.writeText(markdownCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-[#222] rounded-xl p-6 bg-[#0e0e0e]">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username…"
          className="flex-1 min-w-[200px] bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#c0c0c0] placeholder-[#404040] focus:outline-none focus:border-[#606060] focus:ring-1 focus:ring-[#606060] transition-colors font-mono"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black text-sm font-semibold rounded-lg transition-colors duration-200 shrink-0"
        >
          Preview
        </button>
      </form>

      <div className="flex items-center justify-between gap-3 mb-4 text-xs font-mono text-[#808080]">
        <div className="flex items-center gap-2">
          <span>Theme:</span>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`px-3 py-1 rounded-md transition-colors ${
              theme === "dark"
                ? "bg-[#222] text-white border border-[#444]"
                : "bg-transparent text-[#606060] hover:text-[#999]"
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`px-3 py-1 rounded-md transition-colors ${
              theme === "light"
                ? "bg-white text-black font-semibold"
                : "bg-transparent text-[#606060] hover:text-[#999]"
            }`}
          >
            Light
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 bg-[#161616] hover:bg-[#202020] border border-[#2a2a2a] rounded-md text-[#a0a0a0] hover:text-white transition-colors"
        >
          {copied ? "✓ Copied Markdown" : "Copy Markdown"}
        </button>
      </div>

      <div className={`flex justify-center rounded-lg p-6 border transition-colors ${theme === "light" ? "bg-[#f4f4f4] border-[#e0e0e0]" : "bg-[#0a0a0a] border-[#1a1a1a]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${previewUser}-${theme}-${cacheBust}`}
          src={cardUrl}
          alt={`${previewUser} language stats preview`}
          className="max-w-full h-auto rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}
