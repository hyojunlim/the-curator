"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/types";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import ResultsView from "@/components/results/ResultsView";
import UpgradeBanner from "@/components/ui/UpgradeBanner";
import { useSubscription } from "@/hooks/useSubscription";

type Tab = "upload" | "paste";
type Status = "idle" | "loading" | "success" | "error";

function FileUploadTab({ file, onFileChange }: { file: File | null; onFileChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary-fixed/20"
            : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px]">upload_file</span>
        </div>
        {file ? (
          <div>
            <p className="font-headline font-bold text-primary">{file.name}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              {(file.size / 1024).toFixed(1)} KB &middot; Click to change
            </p>
          </div>
        ) : (
          <div>
            <p className="font-headline font-semibold text-on-surface text-base mb-1">
              Drag and drop your contract
            </p>
            <p className="text-sm text-on-surface-variant">
              Support for PDF and DOCX formats. Max file size 10MB
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="mt-6 btn-primary-gradient text-white px-8 py-2.5 rounded-lg font-headline font-bold text-sm hover:opacity-90 transition-all shadow-md"
        >
          Select File
        </button>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">description</span> DOCX
          </span>
        </div>
      </div>

      {/* Uploading state */}
      {file && (
        <div className="mt-4 flex items-center gap-3 bg-surface-container-low rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-primary text-[20px]">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{file.name}</p>
            <p className="text-xs text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => onFileChange(null)} className="text-on-surface-variant hover:text-error transition-colors text-xs font-bold">
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
}

function TextPasteTab({ text, onTextChange }: { text: string; onTextChange: (t: string) => void }) {
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={16}
        placeholder="Paste your contract text here..."
        className="w-full bg-surface-container-low border-0 rounded-xl p-5 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-body leading-relaxed"
      />
      <div className="flex justify-between items-center mt-2 px-1">
        {text.length > 0 ? (
          <button
            type="button"
            onClick={() => onTextChange("")}
            className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            Clear
          </button>
        ) : (
          <span />
        )}
        <span className="text-xs text-on-surface-variant">{text.length.toLocaleString()} characters</span>
      </div>
    </div>
  );
}

const LOADING_STEPS = [
  { label: "Extracting text...", icon: "text_snippet" },
  { label: "Analyzing clauses...", icon: "policy" },
  { label: "Scoring risks...", icon: "assessment" },
  { label: "Generating summary...", icon: "summarize" },
];

function LoadingProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
      <p className="font-headline font-bold text-on-surface text-sm mb-5">Analysis in Progress</p>
      <div className="space-y-4">
        {LOADING_STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={i} className="flex items-center gap-3">
              {isDone ? (
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              ) : isActive ? (
                <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant/30 text-[20px]">radio_button_unchecked</span>
              )}
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[16px] ${isDone ? "text-secondary" : isActive ? "text-primary" : "text-on-surface-variant/40"}`}>
                  {step.icon}
                </span>
                <span className={`text-sm ${isDone ? "text-secondary font-medium" : isActive ? "text-on-surface font-semibold" : "text-on-surface-variant/50"}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

const FREE_LANG_CODES = ["English", "Korean"];

const LANGUAGES = [
  { code: "English", label: "English", flag: "🇺🇸" },
  { code: "Korean", label: "한국어", flag: "🇰🇷" },
  { code: "Spanish", label: "Español", flag: "🇪🇸" },
  { code: "French", label: "Français", flag: "🇫🇷" },
  { code: "Japanese", label: "日本語", flag: "🇯🇵" },
  { code: "Chinese", label: "中文", flag: "🇨🇳" },
  { code: "German", label: "Deutsch", flag: "🇩🇪" },
  { code: "Portuguese", label: "Português", flag: "🇧🇷" },
];


export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [usageLimited, setUsageLimited] = useState(false);
  const { sub, refresh: refreshSub } = useSubscription();

  function reset() {
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
    setFile(null);
    setPastedText("");
  }

  async function handleAnalyze() {
    setStatus("loading");
    setResult(null);
    setErrorMessage("");
    try {
      let response: Response;
      if (activeTab === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language);
        response = await fetch("/api/analyze", { method: "POST", body: formData });
      } else {
        if (pastedText.trim().length < 50) {
          setErrorMessage("Please paste at least 50 characters of contract text.");
          setStatus("error");
          return;
        }
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText, language }),
        });
      }
      if (!response.ok) {
        const err = await response.json();
        if (err.code === "USAGE_LIMIT") {
          setUsageLimited(true);
          refreshSub();
        }
        throw new Error(err.error ?? "Analysis failed");
      }
      const data: AnalysisResult = await response.json();
      setResult(data);
      setStatus("success");
      refreshSub();
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error occurred.");
      setStatus("error");
    }
  }

  const canAnalyze =
    status !== "loading" &&
    (activeTab === "upload" ? file !== null : pastedText.trim().length >= 50);

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      {/* Main content */}
      <div className="ml-0 lg:ml-64 flex-1 flex pt-14 lg:pt-0">
        {/* Upload panel */}
        <div className="flex-1 p-10 max-w-2xl">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-1">New Analysis</h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Upload a contract to get an AI-powered risk breakdown.
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-surface-container-high rounded-lg p-1 mb-6 w-fit">
            {(["upload", "paste"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab === "upload" ? "Upload File" : "Paste Text"}
              </button>
            ))}
          </div>

          {/* Language selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Output Language
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isPro = !FREE_LANG_CODES.includes(lang.code);
                const isLocked = isPro && sub?.plan !== "pro" && sub?.plan !== "business";
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => !isLocked && setLanguage(lang.code)}
                    disabled={isLocked}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isLocked
                        ? "border-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed bg-surface-container-high/30"
                        : language === lang.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {isLocked && (
                      <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">lock</span>
                    )}
                  </button>
                );
              })}
            </div>
            {sub?.plan === "free" && (
              <p className="text-[10px] text-on-surface-variant/60 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">lock</span>
                Upgrade to Pro to unlock all 8 languages
              </p>
            )}
          </div>

          {/* Input */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm mb-6">
            {activeTab === "upload" ? (
              <FileUploadTab file={file} onFileChange={setFile} />
            ) : (
              <TextPasteTab text={pastedText} onTextChange={setPastedText} />
            )}
          </div>

          {/* Usage info / Upgrade banner */}
          {sub && sub.plan !== "business" && sub.limit !== null && (
            <div className="mb-6">
              {usageLimited || sub.remaining === 0 ? (
                <UpgradeBanner
                  remaining={sub.remaining}
                  limit={sub.limit}
                  plan={sub.plan}
                  onUpgraded={() => { refreshSub(); setUsageLimited(false); setErrorMessage(""); setStatus("idle"); }}
                />
              ) : (
                <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg px-4 py-3 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Monthly analyses</span>
                      <span className="font-bold">{sub.usage} / {sub.limit}</span>
                    </div>
                    <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${sub.remaining <= 2 ? "bg-tertiary" : "bg-primary"}`}
                        style={{ width: `${(sub.usage / sub.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {sub?.plan === "pro" && (
            <div className="mb-6 flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2.5">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              <span className="text-xs font-bold text-primary">Pro</span>
              <span className="text-xs text-on-surface-variant">30 analyses per month</span>
            </div>
          )}
          {sub?.plan === "business" && (
            <div className="mb-6 flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2.5">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              <span className="text-xs font-bold text-primary">Business</span>
              <span className="text-xs text-on-surface-variant">Unlimited analyses</span>
            </div>
          )}

          {/* Error */}
          {status === "error" && errorMessage && (
            <div className="mb-6 bg-error-container/30 text-on-error-container text-sm rounded-lg px-5 py-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] mt-0.5">warning</span>
              {errorMessage}
            </div>
          )}

          {/* Analyze button */}
          {status !== "success" && (
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className={`w-full py-3.5 rounded-lg text-sm font-headline font-bold transition-all flex items-center justify-center gap-2 ${
                canAnalyze
                  ? "btn-primary-gradient text-white shadow-md hover:opacity-90"
                  : "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
              }`}
            >
              {status === "loading" ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing contract...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                  Analyze Contract
                </>
              )}
            </button>
          )}

          {/* Results */}
          {status === "loading" && (
            <div className="mt-8">
              <LoadingProgress />
            </div>
          )}
          {status === "success" && result && (
            <>
              <div className="mt-6 mb-4">
                <button
                  onClick={reset}
                  className="w-full py-3.5 rounded-lg text-sm font-headline font-bold transition-all flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  New Analysis
                </button>
              </div>
              <ResultsView result={result} onReset={reset} plan={sub?.plan ?? "free"} />
            </>
          )}
        </div>

        {/* Intelligence Panel — hidden on mobile */}
        <div className="hidden lg:flex w-80 shrink-0 p-8 bg-surface-container-low border-l border-outline-variant/10 flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {status === "success" ? "Analysis Complete" : "Live Intelligence"}
              </span>
            </div>

            {/* Idle state */}
            {status === "idle" && (
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="font-headline font-bold text-on-surface text-sm mb-3">Ready for Analysis</p>
                <p className="text-xs text-on-surface-variant">
                  Upload a contract to begin AI risk analysis.
                </p>
              </div>
            )}

            {/* Loading state */}
            {status === "loading" && (
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="font-headline font-bold text-on-surface text-sm mb-3">Analysis in Progress</p>
                <div className="space-y-3">
                  {[
                    { label: "Scanning Provisions...", done: true, pct: true },
                    { label: "Metadata and party identification complete", done: true },
                    { label: "Extracting indemnity clauses and liability caps...", done: false },
                    { label: "Parsing signature blocks from the document", done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`material-symbols-outlined text-[14px] mt-0.5 ${item.done ? "text-secondary" : "text-on-surface-variant/40"}`}>
                        {item.done ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <div>
                        <p className="text-xs text-on-surface-variant">{item.label}</p>
                        {item.pct && (
                          <div className="mt-1 h-1 w-24 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-1/3 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success state — result summary */}
            {status === "success" && result && (
              <div className="space-y-4">
                <div className="bg-surface-container-lowest rounded-xl p-4">
                  <p className="font-headline font-bold text-on-surface text-sm mb-2">Risk Overview</p>
                  <div className="space-y-2">
                    {(["high", "medium", "low"] as const).map((sev) => {
                      const count = result.risks.filter((r) => r.severity === sev).length;
                      const colors = { high: "text-error", medium: "text-tertiary", low: "text-secondary" };
                      const icons = { high: "error", medium: "warning", low: "info" };
                      return (
                        <div key={sev} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[14px] ${colors[sev]}`}>{icons[sev]}</span>
                            <span className="text-xs text-on-surface-variant capitalize">{sev} Risk</span>
                          </div>
                          <span className={`text-xs font-bold ${colors[sev]}`}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-4">
                  <p className="font-headline font-bold text-on-surface text-sm mb-2">Summary</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-6">
                    {result.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {status === "error" && (
              <div className="bg-error-container/20 rounded-xl p-4">
                <p className="font-headline font-bold text-on-surface text-sm mb-2">Analysis Failed</p>
                <p className="text-xs text-on-surface-variant">
                  Something went wrong. Please try again or upload a different file.
                </p>
              </div>
            )}
          </div>

          {/* Architecture Trust */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Architecture Trust
            </p>
            <div className="space-y-2">
              {[
                "Secure, isolated processing",
                "Data siloed per individual account",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[14px]">verified_user</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
