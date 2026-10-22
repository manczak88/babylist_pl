import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Lista od Serca — prezenty z myślą o Was",
  description: "Stwórz listę prezentów i podziel się nią z bliskimi.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
