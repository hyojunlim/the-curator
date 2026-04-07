import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard — The Curator",
  robots: "noindex, nofollow",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
