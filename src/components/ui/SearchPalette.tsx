"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTagColor } from "@/lib/tags";

interface SearchResult {
  id: string;
  title: string;
  risk_score: number;
  risk_high: boolean;
  created_at: string;
  tags: string[];
  type: string;
}

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open on Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  function navigate(id: string) {
    setOpen(false);
    router.push(`/contracts/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) navigate(results[selected].id);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-on-surface/30 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/15">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            {loading ? "refresh" : "search"}
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search contracts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-on-surface text-sm outline-none placeholder:text-on-surface-variant/50"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-outline-variant/30 text-[10px] font-mono text-on-surface-variant">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((r, i) => (
              <li key={r.id}>
                <button
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => navigate(r.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === selected ? "bg-surface-container" : "hover:bg-surface-container"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    r.risk_high ? "bg-error-container" : "bg-primary-fixed/30"
                  }`}>
                    <span className={`material-symbols-outlined text-[16px] ${r.risk_high ? "text-error" : "text-primary"}`}>
                      description
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold ${r.risk_high ? "text-error" : "text-secondary"}`}>
                        {r.risk_score}/100
                      </span>
                      <span className="text-on-surface-variant/40 text-xs">·</span>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {r.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/30">arrow_forward</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {query && !loading && results.length === 0 && (
          <div className="px-4 py-8 text-center text-on-surface-variant text-sm">
            No contracts found for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Hint */}
        {!query && (
          <div className="px-4 py-4 text-xs text-on-surface-variant/50 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-outline-variant/30 font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-outline-variant/30 font-mono">↵</kbd> open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-outline-variant/30 font-mono">esc</kbd> close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
