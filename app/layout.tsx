import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: { default: "DinkLab — train what the tape shows", template: "%s · DinkLab" },
  description:
    "Upload your pickleball gameplay, tag it by skill, and get matched training content — drills, technique breakdowns, and strategy — so you always know what to work on next.",
};

export const viewport: Viewport = {
  themeColor: "#0a0f14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-line py-6 text-center text-xs text-chalk-faint">
          DinkLab · Training content links out to and credits its original
          publishers.
        </footer>
      </body>
    </html>
  );
}
