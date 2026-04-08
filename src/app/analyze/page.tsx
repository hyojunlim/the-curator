"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import UpgradeBanner from "@/components/ui/UpgradeBanner";
import { useSubscription } from "@/hooks/useSubscription";
import { MVP_MODE } from "@/lib/config";
import { useTranslation } from "@/lib/i18n";

type Tab = "upload" | "paste";
type Status = "idle" | "loading" | "error";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function FileUploadTab({ file, onFileChange, t }: { file: File | null; onFileChange: (f: File | null) => void; t: (key: string, vars?: Record<string, string | number>) => string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState("");

  function validateAndSet(f: File | null) {
    if (f && f.size > MAX_FILE_SIZE) {
      setSizeError(t("analyze.fileSizeError"));
      return;
    }
    setSizeError("");
    onFileChange(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
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
          accept=".pdf,.docx,.hwp"
          className="hidden"
          onChange={(e) => { validateAndSet(e.target.files?.[0] ?? null); if (inputRef.current) inputRef.current.value = ""; }}
        />
        <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px]">upload_file</span>
        </div>
        {file ? (
          <div>
            <p className="font-headline font-bold text-primary">{file.name}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              {(file.size / 1024).toFixed(1)} KB &middot; {t("analyze.clickToChange")}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-headline font-semibold text-on-surface text-base mb-1">
              {t("analyze.dragAndDrop")}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t("analyze.supportFormats")}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="mt-6 btn-primary-gradient text-white px-8 py-2.5 rounded-lg font-headline font-bold text-sm hover:opacity-90 transition-all shadow-md"
        >
          {t("analyze.selectFile")}
        </button>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">description</span> DOCX
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">article</span> HWP
          </span>
        </div>
      </div>

      {/* File size error */}
      {sizeError && (
        <div className="mt-4 flex items-center gap-2 bg-error-container/30 text-on-error-container text-sm rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          {sizeError}
        </div>
      )}

      {/* Uploading state */}
      {file && (
        <div className="mt-4 flex items-center gap-3 bg-surface-container-low rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-primary text-[20px]">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{file.name}</p>
            <p className="text-xs text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => onFileChange(null)} className="text-on-surface-variant hover:text-error transition-colors text-xs font-bold">
            {t("analyze.cancelUpload")}
          </button>
        </div>
      )}
    </div>
  );
}

function TextPasteTab({ text, onTextChange, t }: { text: string; onTextChange: (v: string) => void; t: (key: string, vars?: Record<string, string | number>) => string }) {
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={16}
        placeholder={t("analyze.pasteHere")}
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
            {t("analyze.clear")}
          </button>
        ) : (
          <span />
        )}
        <span className="text-xs text-on-surface-variant">{text.length.toLocaleString()} {t("analyze.characters")}</span>
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
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("curator-language") || "English";
    }
    return "English";
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [usageLimited, setUsageLimited] = useState(false);
  const { sub, refresh: refreshSub } = useSubscription();
  const { t } = useTranslation();
  const router = useRouter();

  function reset() {
    setStatus("idle");
    setErrorMessage("");
    setFile(null);
    setPastedText("");
  }

  async function handleAnalyze() {
    setStatus("loading");
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
          setErrorMessage(t("analyze.minCharError"));
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
        throw new Error(err.error ?? "Upload failed");
      }
      const { contractId, language: lang } = await response.json();

      // Fire-and-forget: trigger background processing
      fetch("/api/analyze/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, language: lang || language }),
      }).catch(() => {}); // fire and forget

      // Redirect to contract detail page
      router.push(`/contracts/${contractId}`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t("analyze.unknownError"));
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
          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-1">{t("analyze.title")}</h1>
          <p className="text-sm text-on-surface-variant mb-8">
            {t("analyze.description")}
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-surface-container-high rounded-lg p-1 mb-6 w-fit">
            {(["upload", "paste"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab === "upload" ? t("analyze.uploadFile") : t("analyze.pasteText")}
              </button>
            ))}
          </div>

          {/* Language selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {t("analyze.outputLanguage")}
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isPro = !FREE_LANG_CODES.includes(lang.code);
                const isLocked = !MVP_MODE && isPro && sub?.plan !== "pro" && sub?.plan !== "business";
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => { if (!isLocked) { setLanguage(lang.code); localStorage.setItem("curator-language", lang.code); } }}
                    disabled={isLocked}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
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
            {!MVP_MODE && sub?.plan === "free" && (
              <p className="text-[11px] text-on-surface-variant/60 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                {t("analyze.unlockLanguages")}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm mb-6">
            {activeTab === "upload" ? (
              <FileUploadTab file={file} onFileChange={setFile} t={t} />
            ) : (
              <TextPasteTab text={pastedText} onTextChange={setPastedText} t={t} />
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
                      <span>{t("analyze.monthlyAnalyses")}</span>
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
              <span className="text-xs font-bold text-primary">{t("analyze.proLabel")}</span>
              <span className="text-xs text-on-surface-variant">{t("analyze.proDesc")}</span>
            </div>
          )}
          {sub?.plan === "business" && (
            <div className="mb-6 flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2.5">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              <span className="text-xs font-bold text-primary">{t("analyze.businessLabel")}</span>
              <span className="text-xs text-on-surface-variant">{t("analyze.businessDesc")}</span>
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
                {t("analyze.analyzingContract")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                {t("analyze.analyzeContract")}
              </>
            )}
          </button>
        </div>

        {/* Intelligence Panel — hidden on mobile */}
        <div className="hidden lg:flex w-80 shrink-0 p-8 bg-surface-container-low border-l border-outline-variant/10 flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("analyze.liveIntelligence")}
              </span>
            </div>

            {/* Idle state */}
            {status === "idle" && (
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="font-headline font-bold text-on-surface text-sm mb-3">{t("analyze.readyForAnalysis")}</p>
                <p className="text-xs text-on-surface-variant">
                  {t("analyze.readyDesc")}
                </p>
              </div>
            )}

            {/* Loading state */}
            {status === "loading" && (
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="font-headline font-bold text-on-surface text-sm mb-3">{t("analyze.inProgress")}</p>
                <div className="space-y-3">
                  {[
                    { label: t("analyze.scanningProvisions"), done: true, pct: true },
                    { label: t("analyze.metadataComplete"), done: true },
                    { label: t("analyze.extractingIndemnity"), done: false },
                    { label: t("analyze.parsingSignature"), done: false },
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

            {/* Error state */}
            {status === "error" && (
              <div className="bg-error-container/20 rounded-xl p-4">
                <p className="font-headline font-bold text-on-surface text-sm mb-2">{t("analyze.analysisFailed")}</p>
                <p className="text-xs text-on-surface-variant">
                  {t("analyze.analysisSomethingWrong")}
                </p>
              </div>
            )}
          </div>

          {/* Architecture Trust */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              {t("analyze.architectureTrust")}
            </p>
            <div className="space-y-2">
              {[
                t("analyze.secureProcessing"),
                t("analyze.dataSiloed"),
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
