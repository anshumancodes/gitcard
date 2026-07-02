import type { Metadata } from "next";
import TryItWidget from "@/components/TryItWidget";

export const metadata: Metadata = {
  title: "Gitcard – GitHub Language Stats Widget",
  description:
    "Embed beautiful, dynamic GitHub language stats directly in your README. Powered by the GitHub API.",
};

const EXAMPLE_USERS = ["torvalds", "gaearon", "sindresorhus", "yyx990803"];

const PARAMS = [
  { param: "?theme=light", desc: "Light mode", example: "/torvalds?theme=light" },
  { param: "?top=5",       desc: "Show top N languages", example: "/torvalds?top=5" },
  { param: "?hide=c,make", desc: "Exclude languages", example: "/torvalds?hide=c,makefile" },
  { param: "?title=Stack", desc: "Override card title", example: "/torvalds?title=My+Stack" },
  { param: "?compact=true",desc: "Compact layout", example: "/torvalds?compact=true" },
  { param: "?width=600",   desc: "Custom width (320–800)", example: "/torvalds?width=600" },
  { param: "?bg=transparent", desc: "Transparent background", example: "/torvalds?bg=transparent" },
  { param: "?avatar=false",desc: "Hide avatar", example: "/torvalds?avatar=false" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">

    
      <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-white opacity-[0.025] blur-[120px] rounded-full" />
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-[#141414] border border-[#2a2a2a] text-[#909090] mb-8 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Open Source · Zero Config · GitHub Ready
        </span>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-5 text-white">
          Gitcard
        </h1>

        <p className="text-base md:text-lg text-[#606060] max-w-xl mb-12 leading-relaxed">
          One image tag in your README. Beautiful, animated language statistics —
          fetched live from the GitHub API.
        </p>

        {/* code block */}
        <div className="w-full max-w-lg bg-[#0e0e0e] border border-[#222] rounded-xl p-5 text-left mb-10 shadow-2xl">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
            <span className="ml-2 text-[11px] text-[#404040] font-mono">README.md</span>
          </div>
          <pre className="text-sm text-[#c0c0c0] overflow-x-auto font-mono leading-relaxed">
            <code>{`![Languages](https://gitcard.yourdomain.com/anshumancdx)`}</code>
          </pre>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/torvalds"
            target="_blank"
            className="px-6 py-2.5 rounded-lg bg-white hover:bg-[#e8e8e8] text-black text-sm font-bold transition-colors duration-150"
          >
            Live Demo →
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg bg-transparent hover:bg-[#141414] border border-[#2a2a2a] text-[#909090] text-sm font-semibold transition-colors duration-150"
          >
            GitHub
          </a>
        </div>
      </section>

      
      <div className="w-full border-t border-[#181818]" />

      
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] uppercase tracking-widest text-[#404040] text-center mb-3 font-mono">
          Live — not screenshots
        </p>
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Previews
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {EXAMPLE_USERS.map((u) => (
            <a
              key={u}
              href={`/${u}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-all duration-300"
            >
              <div className="px-4 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between">
                <span className="text-[11px] text-[#404040] font-mono">/{u}</span>
                <span className="text-[11px] text-[#606060] opacity-0 group-hover:opacity-100 transition-opacity">
                  open ↗
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/${u}`}
                alt={`${u} language stats`}
                className="w-full"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </section>

     
      <div className="w-full border-t border-[#181818]" />

    
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] uppercase tracking-widest text-[#404040] text-center mb-3 font-mono">
          URL parameters
        </p>
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Customization
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PARAMS.map((item) => (
            <div
              key={item.param}
              className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2e2e2e] transition-colors"
            >
              <code className="text-white text-sm font-mono">{item.param}</code>
              <p className="text-[#606060] text-xs mt-1.5 mb-3">{item.desc}</p>
              <a
                href={item.example}
                target="_blank"
                className="text-[11px] text-[#505050] hover:text-[#909090] font-mono transition-colors"
              >
                {item.example} ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full border-t border-[#181818]" />

    
      <section className="max-w-2xl mx-auto px-6 py-20">
        <p className="text-[11px] uppercase tracking-widest text-[#404040] text-center mb-3 font-mono">
          Interactive
        </p>
        <h2 className="text-3xl font-bold text-center mb-3 text-white">
          Try It Yourself
        </h2>
        <p className="text-[#505050] text-sm text-center mb-10">
          Enter any GitHub username to generate their card live.
        </p>
        <TryItWidget />
      </section>

    
      <footer className="border-t border-[#181818] py-10 text-center">
        <p className="text-[#303030] text-xs font-mono tracking-wide">
          GITCARD · NEXT.JS 15 · TYPESCRIPT · GITHUB API
        </p>
        <p className="text-[#252525] text-xs mt-1">Not affiliated with GitHub, Inc.</p>
      </footer>
    </main>
  );
}