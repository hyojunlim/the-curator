import Link from "next/link";
import LandingNav from "@/components/layout/LandingNav";

export default function HomePage() {
  return (
    <div className="bg-surface min-h-screen font-body text-on-surface transition-colors duration-200">

      {/* ── Navigation ── */}
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-widest uppercase text-primary mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            AI-Powered Legal Intelligence · Now in Beta
          </div>

          <h1 className="text-6xl md:text-[88px] font-headline font-extrabold tracking-tighter leading-[0.88] mb-8">
            <span className="text-on-surface">Contract Risk,</span>
            <br />
            <span className="gradient-text">Made Visible.</span>
          </h1>

          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-12 font-body">
            Upload any contract. Our AI reads every clause, flags every risk,
            and explains every implication — in plain language, in seconds.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-24">
            <Link
              href="/analyze"
              className="btn-hero inline-flex items-center gap-2 text-white px-8 py-4 rounded-xl font-headline font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Analyze a Contract Free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-outline-variant/40 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-8 py-4 rounded-xl font-headline font-bold text-base transition-all"
            >
              View Dashboard
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/20 pt-12">
            {[
              { n: "< 30s", label: "Average Analysis Time" },
              { n: "8", label: "Supported Languages" },
              { n: "PDF & DOCX", label: "File Formats" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-headline font-extrabold text-on-surface mb-1">{s.n}</p>
                <p className="text-xs text-on-surface-variant/60 font-body uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-14 border-y border-outline-variant/15">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-on-surface/25 mb-8">
            Powered by advanced AI technology
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {["Gemini AI", "Next.js", "TypeScript", "Secure Cloud"].map((name) => (
              <span key={name} className="text-on-surface/20 font-headline font-bold text-lg tracking-tight hover:text-on-surface/40 transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-40 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Features</span>
            <h2 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-6">
              Everything your legal team needs.
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              From first draft to final signature, The Curator handles the complexity so your team can focus on strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Large feature card */}
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-10 group hover:border-outline-variant/30 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary">psychology</span>
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Deep Risk Analysis</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-8">
                Our AI processes hundreds of legal data points simultaneously — understanding intent, not just keywords.
                Indemnity clauses, liability caps, IP assignment, non-competes — all surfaced and explained in seconds.
              </p>
              <div className="flex gap-1.5 items-end h-20 p-4 bg-surface-container rounded-xl">
                {[40, 70, 55, 90, 45, 80, 60, 75, 50, 88, 35, 65].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all ${
                      i === 3 || i === 7 || i === 11
                        ? "bg-error/60"
                        : i === 1 || i === 5 || i === 9
                        ? "bg-tertiary-fixed-dim/80"
                        : "bg-primary/20"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Language card */}
            <div className="bg-primary-container/20 border border-primary/15 rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary">translate</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">8 Languages</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  Receive your full risk analysis in English, Korean, Spanish, French, Japanese, Chinese, German, or Portuguese.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["🇺🇸 EN", "🇰🇷 KO", "🇪🇸 ES", "🇫🇷 FR", "🇯🇵 JA", "🇨🇳 ZH"].map((l) => (
                  <span key={l} className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono border border-primary/15">{l}</span>
                ))}
              </div>
            </div>

            {/* Bottom 3 */}
            {[
              { icon: "upload_file", title: "PDF & DOCX Upload", desc: "Drag and drop any contract format. Secure, server-side extraction with no persistent data storage." },
              { icon: "verified_user", title: "Secure Processing", desc: "Your documents are processed securely and never shared. Each analysis is isolated per account." },
              { icon: "history", title: "Full Contract History", desc: "Every analysis saved, searchable, and star-able. Your entire legal archive in one secure place." },
            ].map((f) => (
              <div key={f.title} className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
                <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{f.icon}</span>
                </div>
                <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{f.title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-40 px-8 border-t border-outline-variant/15">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Process</span>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
              Three steps to clarity.
            </h2>
            <p className="text-on-surface-variant text-lg">From raw document to risk insights — in under a minute.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: "cloud_upload", title: "Upload", desc: "Drop in any PDF or DOCX. Our extractor parses every page, table, and clause automatically — no setup needed." },
              { n: "02", icon: "psychology", title: "Analyze", desc: "Gemini AI performs a deep structural audit, scoring each clause by risk level and explaining the implications in plain language." },
              { n: "03", icon: "task_alt", title: "Act", desc: "Review your risk report, export it as a PDF, share with your team, and sign your contract with total confidence." },
            ].map((step) => (
              <div key={step.n} className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-6xl font-headline font-black text-on-surface/8 leading-none">{step.n}</span>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">{step.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-3">{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-40 px-8 border-t border-outline-variant/15">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Pricing</span>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-on-surface-variant text-lg">Start for free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "Free", sub: "Forever free", features: ["5 analyses per month", "English & Korean", "Risk scoring & severity", "7-day contract history"], cta: "Get Started", href: "/sign-up", featured: false },
              { name: "Pro", price: "$29", sub: "per month", features: ["30 analyses per month", "All 8 output languages", "90-day history & search", "PDF export & sharing"], cta: "Start Free Trial", href: "/sign-up", featured: true },
              { name: "Business", price: "$79", sub: "per month", features: ["Unlimited analyses", "Priority AI processing", "Unlimited history", "Everything in Pro"], cta: "Get Business", href: "/sign-up", featured: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.featured
                    ? "bg-surface-container-lowest border-2 border-primary shadow-2xl shadow-primary/10 relative"
                    : "bg-surface-container-lowest border border-outline-variant/15"
                }`}
              >
                <div className="mb-8">
                  {plan.featured && (
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Most Popular</span>
                  )}
                  <p className={`text-sm font-bold mb-3 ${plan.featured ? "text-primary" : "text-on-surface-variant"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-headline font-extrabold text-on-surface">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && plan.price !== "Free" && (
                      <span className="text-sm text-on-surface-variant">/mo</span>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-on-surface-variant">{plan.sub}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] flex-shrink-0 text-secondary">check</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all font-headline ${
                    plan.featured
                      ? "btn-primary-gradient text-white hover:opacity-90 shadow-md"
                      : "bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-40 px-8 border-t border-outline-variant/15">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-6 leading-[0.95]">
            Ready to protect your{" "}
            <span className="gradient-text">business?</span>
          </h2>
          <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
            Use The Curator to read contracts smarter,
            faster, and with total confidence.
          </p>
          <Link
            href="/analyze"
            className="btn-hero inline-flex items-center gap-3 text-white px-10 py-5 rounded-xl font-headline font-bold text-lg shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            Start Your First Analysis — Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/15 py-16 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <span className="text-lg font-headline font-black text-on-surface mb-4 block">The Curator</span>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                AI-powered contract intelligence for modern legal teams.
              </p>
            </div>
            {[
              { title: "Product", links: [["Features", "#features"], ["Pricing", "#pricing"], ["How It Works", "#how-it-works"], ["Dashboard", "/dashboard"]] },
              { title: "Company", links: [["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Contact", "#"]] },
              { title: "Legal", links: [["Privacy Policy", "/legal/privacy"], ["Terms of Service", "/legal/terms"], ["Security", "/legal/security"], ["API Docs", "/legal/api"]] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-on-surface-variant text-sm hover:text-on-surface transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-outline-variant/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant/40 text-xs">© {new Date().getFullYear()} The Curator. All rights reserved.</p>
            <p className="text-on-surface-variant/40 text-xs">Built with AI · Powered by Gemini</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
