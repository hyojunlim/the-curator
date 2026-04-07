"use client";

import { useUser } from "@clerk/nextjs";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import { useTranslation } from "@/lib/i18n";

export default function TeamPage() {
  const { t } = useTranslation();
  const { user } = useUser();

  const displayName = user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? "You";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const initials = displayName.split(" ").map((n) => n?.[0] ?? "").join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface">{t("team.title")}</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {t("team.description")}
            </p>
          </div>
          <div className="bg-surface-container-low rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant">
            {t("team.memberCount", { count: 1 })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl">
          {/* Member list */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/10">
                <h2 className="font-headline font-bold text-on-surface text-sm">{t("team.members")}</h2>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {/* Current user */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-on-surface truncate">{displayName}</p>
                      <span className="text-[10px] font-bold bg-primary-fixed/30 text-primary px-2 py-0.5 rounded-full">{t("team.you")}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{email}</p>
                  </div>
                  <span className="text-xs bg-surface-container-low rounded-lg px-2 py-1 text-on-surface font-medium">
                    {t("team.admin")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed/30 text-primary">
                    {t("team.activeStatus")}
                  </span>
                </div>
              </div>
            </div>

            {/* Coming soon notice */}
            <div className="mt-4 bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">group_add</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">{t("team.comingSoonTitle")}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t("team.comingSoonDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role permissions & info */}
          <div>
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                <h2 className="font-headline font-bold text-on-surface text-sm">{t("team.invitations")}</h2>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">
                {t("team.invitationsDesc")}
              </p>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-high/30 rounded-lg">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[16px]">lock</span>
                <span className="text-xs text-on-surface-variant/60">{t("team.comingSoon")}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                {t("team.rolePermissions")}
              </p>
              {[
                { role: t("team.adminRole"), desc: t("team.adminRoleDesc") },
                { role: t("team.analystRole"), desc: t("team.analystRoleDesc") },
                { role: t("team.viewerRole"), desc: t("team.viewerRoleDesc") },
              ].map((r) => (
                <div key={r.role} className="mb-3">
                  <p className="text-xs font-bold text-on-surface">{r.role}</p>
                  <p className="text-xs text-on-surface-variant">{r.desc}</p>
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
