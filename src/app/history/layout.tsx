import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Review History — The Curator",
  robots: "noindex, nofollow",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
