import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "optional",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "optional",
});

export const metadata: Metadata = {
  title: "Admin — Full Work Services",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-muted">{children}</body>
    </html>
  );
}
