"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";

const navItems = [
  {
    label: "Templates",
    href: "/templates",
    dropdown: [
      { label: "View all templates", href: "/templates" },
      { label: "Start with a template", href: "/onboarding" },
    ],
  },
  {
    label: "Features",
    href: "/#tools",
    dropdown: [
      { label: "Every tool you need", href: "/#tools" },
      { label: "How it works", href: "/#process" },
      { label: "Pick your discipline", href: "/#disciplines" },
      { label: "Templates", href: "/#templates-section" },
    ],
  },
  {
    label: "Resources",
    href: "/#faq",
    dropdown: [
      { label: "FAQ", href: "/#faq" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
];

export function SiteHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-20 border-b border-amber-900/5 bg-gradient-to-b from-amber-50/95 to-white/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0">
          <SamosaLogoFull />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-white/80 transition-colors"
              >
                {item.label}
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {openDropdown === item.label && item.dropdown && (
                <div className="absolute top-full left-0 mt-0.5 w-56 rounded-xl border border-stone-200 bg-white shadow-lg py-2 z-30">
                  {item.dropdown.map((d) => (
                    <Link
                      key={d.label}
                      href={d.href}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                    >
                      {d.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/pricing"
            className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-white/80 transition-colors"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <AuthButton />
          <Link
            href="/create"
            className="text-sm rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
