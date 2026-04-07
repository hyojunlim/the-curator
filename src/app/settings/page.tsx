"use client";

import { useState, useEffect } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import PayPalButton from "@/components/ui/PayPalButton";
import { useSubscription } from "@/hooks/useSubscription";
import { useUser } from "@clerk/nextjs";

const PLAN_LABELS = {
  free: "Free",
  pro: "Pro",
  business: "Business",
} as const;

const SECTIONS = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "security", label: "Security", icon: "security" },
  { id: "billing", label: "Billing", icon: "credit_card" },
];

export default function SettingsPage() {
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
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-8">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Section Nav */}
          <div className="w-full lg:w-48 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all text-left ${
                    activeSection === s.id
                      ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                      : "text-on-surface-variant hover:translate-x-1"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-xl">
            {activeSection === "profile" && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="font-headline font-bold text-on-surface">Profile</h2>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    Full Name
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
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={form.email}
                    readOnly
                    className="w-full bg-surface-container-high/50 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant outline-none cursor-not-allowed"
                  />
                  <p className="text-[11px] text-on-surface-variant/60 mt-1">Managed by Clerk</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    Organization
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
                    Report Language
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>English</option>
                    <option>Korean</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                    <option>Chinese</option>
                    <option>German</option>
                    <option>Portuguese</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="btn-primary-gradient text-white font-headline font-bold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {saved ? (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      Saved
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="font-headline font-bold text-on-surface">Notifications</h2>
                {[
                  { key: "email" as const, label: "Email Notifications", desc: "Receive analysis reports via email" },
                  { key: "browser" as const, label: "Browser Notifications", desc: "Push notifications when analysis completes" },
                  { key: "weeklyReport" as const, label: "Weekly Digest", desc: "Summary of all analyses from the past week" },
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
                  {saved ? <><span className="material-symbols-outlined text-[16px]">check</span>Saved</> : <><span className="material-symbols-outlined text-[16px]">save</span>Save Changes</>}
                </button>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                {/* Active Sessions */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-4">Active Sessions</h2>
                  <div className="flex items-center gap-4 bg-surface-container-low rounded-lg p-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[20px]">computer</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">Current Session</p>
                      <p className="text-xs text-on-surface-variant">Active now · Managed by Clerk</p>
                    </div>
                    <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase">Active</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3">
                    Session management is handled by Clerk. You can manage all devices from your profile.
                  </p>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-2">Two-Factor Authentication</h2>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Add an extra layer of security to your account. 2FA is managed through Clerk.
                  </p>
                  <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-4">
                    <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">Enable 2FA via Clerk</p>
                      <p className="text-xs text-on-surface-variant">Click the profile icon in the sidebar to manage 2FA settings.</p>
                    </div>
                  </div>
                </div>

                {/* Data & Privacy */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-4">Data &amp; Privacy</h2>
                  <div className="space-y-3">
                    {[
                      { icon: "encrypted", label: "TLS 1.3 encryption", desc: "All data in transit is encrypted" },
                      { icon: "database", label: "Isolated data storage", desc: "Your contracts are siloed per account" },
                      { icon: "auto_delete", label: "Ephemeral processing", desc: "AI analysis is not stored by Google" },
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
                  <h2 className="font-headline font-bold text-error mb-2">Danger Zone</h2>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      window.open("https://accounts.clerk.dev/user", "_blank");
                    }}
                    className="px-4 py-2 rounded-lg border border-error/30 text-error text-sm font-bold hover:bg-error/5 transition-colors"
                  >
                    Delete Account
                  </button>
                  <p className="text-[11px] text-on-surface-variant mt-2">
                    Account deletion is managed through Clerk. You will be redirected to your account management page.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "billing" && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline font-bold text-on-surface mb-4">Current Plan</h2>
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
                          {PLAN_LABELS[sub.plan as keyof typeof PLAN_LABELS] ?? "Free"}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {sub.plan === "business" ? "Unlimited analyses" : sub.plan === "pro" ? "30 analyses/month" : "5 analyses/month"}
                        </span>
                      </div>

                      {/* Usage bar for free & pro */}
                      {sub.plan !== "business" && sub.limit && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                            <span>Monthly Usage</span>
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
                            Resets {new Date(sub.resetsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      )}

                      {/* Active paid plan info */}
                      {sub.plan !== "free" && (
                        <div className="bg-primary/5 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                            <span className="font-headline font-bold text-sm text-on-surface">
                              {PLAN_LABELS[sub.plan as keyof typeof PLAN_LABELS]} Plan Active
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mb-3">
                            {sub.plan === "business"
                              ? "Unlimited analyses, priority AI processing, all languages, unlimited history."
                              : "30 analyses/month, all 8 languages, 90-day history, PDF export & sharing."}
                          </p>
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to cancel your ${PLAN_LABELS[sub.plan as keyof typeof PLAN_LABELS]} plan? You will be downgraded to Free.`)) return;
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
                            {cancelling ? "Cancelling..." : "Cancel subscription"}
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
                      <h2 className="font-headline font-bold text-on-surface mb-1">Pro</h2>
                      <p className="text-lg font-headline font-extrabold text-on-surface mb-3">$29<span className="text-xs font-normal text-on-surface-variant">/mo</span></p>
                      <ul className="text-xs text-on-surface-variant space-y-2 mb-5">
                        {["30 analyses/month", "All 8 languages", "90-day history & search", "PDF export & sharing"].map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[14px]">check</span>{f}
                          </li>
                        ))}
                      </ul>
                      <PayPalButton plan="pro" onSuccess={refreshSub} />
                    </div>
                    {/* Business */}
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-2 border-primary">
                      <h2 className="font-headline font-bold text-primary mb-1">Business</h2>
                      <p className="text-lg font-headline font-extrabold text-on-surface mb-3">$79<span className="text-xs font-normal text-on-surface-variant">/mo</span></p>
                      <ul className="text-xs text-on-surface-variant space-y-2 mb-5">
                        {["Unlimited analyses", "Priority AI processing", "Unlimited history", "Everything in Pro"].map((f) => (
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
                    <h2 className="font-headline font-bold text-on-surface mb-1">Upgrade to Business</h2>
                    <p className="text-lg font-headline font-extrabold text-on-surface mb-3">$79<span className="text-xs font-normal text-on-surface-variant">/mo</span></p>
                    <ul className="text-xs text-on-surface-variant space-y-2 mb-5">
                      {["Unlimited analyses", "Priority AI processing", "Unlimited history", "Everything in Pro"].map((f) => (
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
                  <h2 className="font-headline font-bold text-on-surface mb-2">Payment History</h2>
                  <p className="text-sm text-on-surface-variant">
                    {sub?.plan !== "free"
                      ? `Your ${PLAN_LABELS[sub?.plan as keyof typeof PLAN_LABELS] ?? ""} plan is active. Payment details are managed through PayPal.`
                      : "No payment history yet."}
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
