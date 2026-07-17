"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Library" },
  { href: "/train", label: "Train" },
  { href: "/pros", label: "Pros" },
  { href: "/courts", label: "Courts" },
  { href: "/progress", label: "Progress" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-court-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-optic transition-transform duration-300 group-hover:rotate-12">
            {/* pickleball: holes */}
            <span className="grid grid-cols-3 gap-[3px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-[3px] w-[3px] rounded-full bg-court-950/70" />
              ))}
            </span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Dink<span className="text-optic">Lab</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LINKS.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 sm:px-4 ${
                  active
                    ? "bg-optic text-court-950"
                    : "text-chalk-dim hover:bg-court-800 hover:text-chalk"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
