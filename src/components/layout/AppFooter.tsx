export default function AppFooter({ sidebarOffset = true }: { sidebarOffset?: boolean }) {
  return (
    <div
      className={`fixed bottom-0 right-0 bg-surface border-t border-outline-variant/10 px-4 lg:px-8 py-3 flex items-center justify-between text-xs text-on-surface-variant z-30 ${
        sidebarOffset ? "left-0 lg:left-64" : "left-0"
      }`}
    >
      <div className="flex gap-2 lg:gap-4 flex-wrap">
        <a href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</a>
        <a href="/legal/terms" className="hover:text-primary transition-colors">Terms</a>
        <a href="/legal/security" className="hover:text-primary transition-colors hidden sm:inline">Security</a>
        <a href="/legal/api" className="hover:text-primary transition-colors hidden sm:inline">API Docs</a>
      </div>
      <span className="hidden sm:inline">&copy; {new Date().getFullYear()} The Curator</span>
    </div>
  );
}
