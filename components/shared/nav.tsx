"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/complete", label: "Investors" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#061815]/40 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/5">
            <img
              src="/logo1.png"
              alt="AssetFlow AI"
              className="h-7 w-7 object-contain"
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-white tracking-tight">
              AssetFlow
            </span>
            <span className="text-[15px] font-semibold text-primary tracking-tight">
              AI
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-0.5 rounded-full border border-white/5 bg-white/5 p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
              >
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-primary/15 border border-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span
                  className={`relative z-10 ${active ? "text-primary" : "text-slate-400 hover:text-white transition-colors"}`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
