"use client";

import { useState } from "react";

export default function TryItWidget() {
  const [username, setUsername] = useState("torvalds");
  const [previewUser, setPreviewUser] = useState("torvalds");
  const [cacheBust, setCacheBust] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleaned = username.trim().replace(/[^a-zA-Z0-9-]/g, "");
    if (!cleaned) return;
    setPreviewUser(cleaned);
    setCacheBust((n) => n + 1);
  }

  return (
    <div className="border border-[#222] rounded-xl p-6 bg-[#0e0e0e]">
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username…"
          className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#c0c0c0] placeholder-[#404040] focus:outline-none focus:border-[#606060] focus:ring-1 focus:ring-[#606060] transition-colors font-mono"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black text-sm font-semibold rounded-lg transition-colors duration-200 shrink-0"
        >
          Preview
        </button>
      </form>
      <div className="flex justify-center bg-[#0a0a0a] rounded-lg p-4 border border-[#1a1a1a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${previewUser}-${cacheBust}`}
          src={`/${encodeURIComponent(previewUser)}?t=${cacheBust}`}
          alt={`${previewUser} language stats preview`}
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    </div>
  );
}
