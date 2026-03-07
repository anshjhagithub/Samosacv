"use client";

import Link from "next/link";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-amber-900/5 bg-gradient-to-b from-white/90 to-amber-50/30 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <SamosaLogoFull />
            </Link>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
              AI-powered resume builder. Crispy templates, sharp content, career-ready results.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-3">Platform</p>
            <ul className="space-y-2">
              {[
                { label: "Resume Builder", href: "/onboarding" },
                { label: "Templates", href: "/templates" },
                { label: "Pricing", href: "/pricing" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-500 hover:text-stone-800 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-3">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-3">Company</p>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Press Kit"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-400 text-xs">&copy; {new Date().getFullYear()} Samosa CV. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-stone-400">
            <Link href="/privacy-policy" className="hover:text-stone-600 transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-stone-600 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-stone-600 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
