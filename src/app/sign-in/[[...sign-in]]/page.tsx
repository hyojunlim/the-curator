import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import AppFooter from "@/components/layout/AppFooter";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <div className="flex-1 flex items-center justify-center pb-16">
        <div className="w-full max-w-md px-4">
          <Link href="/" className="block text-center mb-8 group">
            <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tighter group-hover:opacity-80 transition-opacity">The Curator</h1>
            <p className="text-sm text-on-surface-variant mt-1">Legal Intelligence</p>
          </Link>
          <div className="flex justify-center">
            <SignIn routing="path" path="/sign-in" />
          </div>
          <p className="text-center text-xs text-on-surface-variant mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
      <AppFooter sidebarOffset={false} />
    </div>
  );
}
