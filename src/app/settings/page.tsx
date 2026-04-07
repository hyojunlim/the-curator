"use client";

import { useState, useEffect } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import PayPalButton from "@/components/ui/PayPalButton";
import { useSubscription } from "@/hooks/useSubscription";
import { useUser } from "@clerk/nextjs";
import { useTranslation } from "@/lib/i18n";

const PLAN_KEYS = {
  free: "free",
  pro: "pro",
  business: "business",
} as const;

const SECTION_IDS = ["profile", "notifications", "security", "billing"] as const;
const SECTION_ICONS: Record<string, string> = { profile: "person", notifications: "notifications", security: "security", billing: "credit_card" };

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const { sub, loading: subLoading, refresh: refreshSub } = useSubscription();
  const [cancelling, setCancelling] = useState(false);
  const { user } = useUser();
  const [form, setForm] = useState({
    name: "",
    email: "",
    org: "",
    language: "English",
    notifications: { email: true, browser: true, weeklyReport: false },
  });

  // Populate form from Clerk user data + localStorage
  useEffect(() => {
    if (user) {
      const savedLang = typeof window !== "undefined" ? localStorage.getItem("curator-language") || "English" : "English";
      const savedOrg = typeof window !== "undefined" ? localStorage.getItem("curator-org") || "" : "";
      setForm((prev) => ({
        ...prev,
        name: user.fullName ?? "",
        email: user.emailAddresses?.[0]?.emailAddress ?? "",
        org: (user.publicMetadata?.org as string) || savedOrg,
        language: savedLang,
      }));
    }
  }, [user]);

  async function handleSave() {
    try {
      // Persist language & org to localStorage BEFORE Clerk update
      // (Clerk update triggers useEffect which reads localStorage)
      localStorage.setItem("curator-language", form.language);
      localStorage.setItem("curator-org", form.org);
      await user?.update({
        firstName: form.name.split(" ")[0] || "",
        lastName: form.name.split(" ").slice(1).join(" ") || "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-20">
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-8">{t("settings.title")}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Section Nav */}
          <div className="w-full lg:w-48 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {SECTION_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all text-left ${
                    activeSection === id
                      ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                      : "text-on-surface-variant hover:translate-x-1"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{SECTION_ICONS[id]}</span>
                  {t(`settings.${id}`)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-xl">
            {activeSection === "profile" && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="font-headline font-bold text-on-surface">{t("settings.profile")}</h2>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    {t("settings.fullName")}
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    {t("settings.emailAddress")}
                  </label>
                  <input
                    type="text"
                    value={form.email}
                    readOnly
                    className="w-full bg-surface-container-high/50 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant outline-none cursor-not-allowed"
                  />
                  <p className="text-[11px] text-on-surface-variant/60 mt-1">{t("settings.managedByClerk")}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    {t("settings.organization")}
                  </label>
                  <input
                    type="text"
                    value={form.org}
                    onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    {t("settings.reportLanguage")}
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="English">🇺🇸 English</option>
                    <option value="Korean">🇰🇷 한국어</option>
                    <option value="Spanish">🇪🇸 Español</option>
                    <option value="French">🇫🇷 Français</option>
                    <option value="Japanese">🇯🇵 日本語</option>
                    <option value="Chinese">🇨🇳 中文</option>
                    <option value="German">🇩🇪 Deutsch</option>
                    <option value="Portuguese">🇧🇷 Português</option>
                  </select>
                  <p className="text-[11px] text-on-surface-variant/60 mt-1">
                    {t("settings.reportLanguageNote")}
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  className="btn-primary-gradient text-white font-headline font-bold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {saved ? (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      {t("settings.saved")}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      {t("settings.saveChanges")}
                    </>
                  )}
                </button>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="font-headline font-bold text-on-surface">{t("settings.notifications")}</h2>
                {[
                  { key: "email" as const, label: t("settings.emailNotifications"), desc: t("settings.emailNotificationsDesc") },
                  { key: "browser" as const, label: t("settings.browserNotifications"), desc: t("settings.browserNotificationsDesc") },
                  { key: "weeklyReport" as const, label: t("settings.weeklyDigest"), desc: t("settings.weeklyDigestDesc") },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{label}</p>
                      <p className="text-xs text-on-surface-variant">{desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          notifications: { ...f.notifications, [key]: !f.notifications[key] },
                        }))
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        form.notifications[key] ? "bg-primary" : "bg-surface-container-high"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          form.notifications[key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <button onClick={handleSave} className="btn-primary-gradient text-white font-headline font-bold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                  {saved ? <><span className="material-symbols-outlined text-[16px]">check</span>{t("settings.saved")}</> : <><span className="material-symbols-outlined text-[16px]">save</span>{t("settings.saveChanges")}</>}
                </button>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                {/* Active Sessions */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-4">{t("settings.activeSessions")}</h2>
                  <div className="flex items-center gap-4 bg-surface-container-low rounded-lg p-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[20px]">computer</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{t("settings.currentSession")}</p>
                      <p className="text-xs text-on-surface-variant">{t("settings.activeNow")}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase">{t("settings.active")}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3">
                    {t("settings.sessionManagement")}
                  </p>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-2">{t("settings.twoFactorAuth")}</h2>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {t("settings.twoFactorDesc")}
                  </p>
                  <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-4">
                    <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{t("settings.enable2FA")}</p>
                      <p className="text-xs text-on-surface-variant">{t("settings.enable2FADesc")}</p>
                    </div>
                  </div>
                </div>

                {/* Data & Privacy */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-4">{t("settings.dataPrivacy")}</h2>
                  <div className="space-y-3">
                    {[
                      { icon: "encrypted", label: t("settings.tlsEncryption"), desc: t("settings.tlsDesc") },
                      { icon: "database", label: t("settings.isolatedStorage"), desc: t("settings.isolatedDesc") },
                      { icon: "auto_delete", label: t("settings.ephemeralProcessing"), desc: t("settings.ephemeralDesc") },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[18px]">{item.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-on-surface">{item.label}</p>
                          <p className="text-xs text-on-surface-variant">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-error/20">
                  <h2 className="font-headline font-bold text-error mb-2">{t("settings.dangerZone")}</h2>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {t("settings.dangerZoneDesc")}
                  </p>
                  <button
                    onClick={() => {
                      window.open("https://accounts.clerk.dev/user", "_blank");
                    }}
                    className="px-4 py-2 rounded-lg border border-error/30 text-error text-sm font-bold hover:bg-error/5 transition-colors"
                  >
                    {t("settings.deleteAccount")}
                  </button>
                  <p className="text-[11px] text-on-surface-variant mt-2">
                    {t("settings.deleteAccountNote")}
                  </p>
                </div>
              </div>
            )}

            {activeSection === "billing" && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-4">{t("settings.currentPlan")}</h2>
                  {subLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-surface-container-high rounded w-32" />
                      <div className="h-3 bg-surface-container-low rounded w-48" />
                    </div>
                  ) : sub ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sub.plan !== "free"
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {t(`settings.${PLAN_KEYS[sub.plan as keyof typeof PLAN_KEYS] ?? "free"}`)}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {sub.plan === "business" ? t("settings.unlimitedAnalyses") : sub.plan === "pro" ? t("settings.proAnalyses") : t("settings.freeAnalyses")}
                        </span>
                      </div>

                      {/* Usage bar for free & pro */}
                      {sub.plan !== "business" && sub.limit && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                            <span>{t("settings.monthlyUsage")}</span>
                            <span>{sub.usage} / {sub.limit}</span>
                          </div>
                          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                sub.remaining === 0 ? "bg-error" : sub.remaining <= 2 ? "bg-tertiary" : "bg-primary"
                              }`}
                              style={{ width: `${(sub.usage / sub.limit) * 100}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-1">
                            {t("settings.resets", { date: new Date(sub.resetsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) })}
                          </p>
                        </div>
                      )}

                      {/* Active paid plan info */}
                      {sub.plan !== "free" && (
                        <div className="bg-primary/5 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                            <span className="font-headline font-bold text-sm text-on-surface">
                              {t("settings.planActive", { plan: t(`settings.${PLAN_KEYS[sub.plan as keyof typeof PLAN_KEYS] ?? "free"}`) })}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mb-3">
                            {sub.plan === "business"
                              ? t("settings.businessPlanDesc")
                              : t("settings.proPlanDesc")}
                          </p>
                          <button
                            onClick={async () => {
                              if (!confirm(t("settings.cancelConfirm", { plan: t(`settings.${PLAN_KEYS[sub.plan as keyof typeof PLAN_KEYS] ?? "free"}`) }))) return;
                              setCancelling(true);
                              try {
                                const res = await fetch("/api/subscription/cancel", { method: "POST" });
                                if (res.ok) refreshSub();
                              } catch { /* ignore */ }
                              setCancelling(false);
                            }}
                            disabled={cancelling}
                            className="text-xs text-on-surface-variant hover:text-error transition-colors underline"
                          >
                            {cancelling ? t("settings.cancelling") : t("settings.cancelSubscription")}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Upgrade options */}
                {sub && sub.plan === "free" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pro */}
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/15">
                      <h2 className="font-headline font-bold text-on-surface mb-1">{t("settings.pro")}</h2>
                      <p className="text-lg font-headline font-extrabold text-on-surface mb-3">$29<span className="text-xs font-normal text-on-surface-variant">/mo</span></p>
                      <ul className="text-xs text-on-surface-variant space-y-2 mb-5">
                        {(t("settings.proFeatures") as unknown as string[]).map((f: string) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[14px]">check</span>{f}
                          </li>
                        ))}
                      </ul>
                      <PayPalButton plan="pro" onSuccess={refreshSub} />
                    </div>
                    {/* Business */}
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-2 border-primary">
                      <h2 className="font-headline font-bold text-primary mb-1">{t("settings.business")}</h2>
                      <p className="text-lg font-headline font-extrabold text-on-surface mb-3">$79<span className="text-xs font-normal text-on-surface-variant">/mo</span></p>
                      <ul className="text-xs text-on-surface-variant space-y-2 mb-5">
                        {(t("settings.businessFeatures") as unknown as string[]).map((f: string) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[14px]">check</span>{f}
                          </li>
                        ))}
                      </ul>
                      <PayPalButton plan="business" onSuccess={refreshSub} />
                    </div>
                  </div>
                )}

                {/* Pro user can upgrade to Business */}
                {sub && sub.plan === "pro" && (
                  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-2 border-primary">
                    <h2 className="font-headline font-bold text-on-surface mb-1">{t("settings.upgradeToBusiness")}</h2>
                    <p className="text-lg font-headline font-extrabold text-on-surface mb-3">$79<span className="text-xs font-normal text-on-surface-variant">/mo</span></p>
                    <ul className="text-xs text-on-surface-variant space-y-2 mb-5">
                      {(t("settings.businessFeatures") as unknown as string[]).map((f: string) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[14px]">check</span>{f}
                        </li>
                      ))}
                    </ul>
                    <PayPalButton plan="business" onSuccess={refreshSub} />
                  </div>
                )}

                {/* Payment History */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-2">{t("settings.paymentHistory")}</h2>
                  <p className="text-sm text-on-surface-variant">
                    {sub?.plan !== "free"
                      ? t("settings.paymentHistoryActive", { plan: t(`settings.${PLAN_KEYS[sub?.plan as keyof typeof PLAN_KEYS] ?? "free"}`) })
                      : t("settings.noPaymentHistory")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
