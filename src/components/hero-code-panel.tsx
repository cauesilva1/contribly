const LINES = [
  { n: 1, parts: [{ c: "kw", t: "const" }, { c: "plain", t: " " }, { c: "fn", t: "match" }, { c: "plain", t: " = " }, { c: "kw", t: "await" }, { c: "plain", t: " " }, { c: "fn", t: "openMatch" }, { c: "plain", t: "({" }] },
  { n: 2, parts: [{ c: "plain", t: "  languages: " }, { c: "str", t: '["TypeScript", "Go"]' }, { c: "plain", t: "," }] },
  { n: 3, parts: [{ c: "plain", t: "  tags: " }, { c: "str", t: '["docs", "good-first-issue"]' }, { c: "plain", t: "," }] },
  { n: 4, parts: [{ c: "plain", t: "  intent: " }, { c: "str", t: '"contribute"' }] },
  { n: 5, parts: [{ c: "plain", t: "})" }] },
  { n: 6, parts: [{ c: "plain", t: "" }] },
  { n: 7, parts: [{ c: "cm", t: "// ranked by overlap + issues + history" }] },
  { n: 8, parts: [{ c: "kw", t: "return" }, { c: "plain", t: " match.projects" }] },
];

export function HeroCodePanel() {
  return (
    <div
      className="hero-code-panel relative w-full max-w-lg justify-self-end overflow-hidden rounded-2xl border border-[#d0d7de]/80 bg-[#0d1117] shadow-[0_28px_60px_rgba(13,17,23,0.18)]"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] tracking-wide text-white/45">
          match.ts
        </span>
      </div>

      <pre className="overflow-x-auto px-4 py-5 font-mono text-[12px] leading-6 sm:text-[13px]">
        <code>
          {LINES.map((line) => (
            <div key={line.n} className="flex gap-4">
              <span className="w-4 shrink-0 select-none text-right text-white/25">
                {line.n}
              </span>
              <span className="min-w-0 whitespace-pre">
                {line.parts.map((part, i) => (
                  <span
                    key={`${line.n}-${i}`}
                    className={
                      part.c === "kw"
                        ? "text-[#ff7b72]"
                        : part.c === "fn"
                          ? "text-[#d2a8ff]"
                          : part.c === "str"
                            ? "text-[#a5d6ff]"
                            : part.c === "cm"
                              ? "text-white/35"
                              : "text-[#e6edf3]"
                    }
                  >
                    {part.t}
                  </span>
                ))}
                {line.n === 8 ? <span className="hero-code-cursor" /> : null}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
