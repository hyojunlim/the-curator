"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-body text-on-surface px-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-error-container rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-error text-[28px]">error</span>
        </div>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-3">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
          An unexpected error occurred. This has been logged and we&apos;re working on it.
          {error.digest && (
            <span className="block mt-2 text-xs text-on-surface-variant/50 font-mono">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary-gradient text-white px-6 py-3 rounded-xl font-headline font-bold text-sm hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          <a
            href="/"
            className="border border-outline-variant/30 text-on-surface-variant px-6 py-3 rounded-xl font-headline font-bold text-sm hover:bg-surface-container-low transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
