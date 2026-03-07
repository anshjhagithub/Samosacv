import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ContactPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">Contact</h1>
        <p className="text-stone-600 mb-6">Samosa CV — India&apos;s tastiest AI resume builder.<br />Email: <a href="mailto:support@samosacv.com" className="text-amber-700 hover:underline">support@samosacv.com</a></p>
        <Link href="/" className="text-sm text-amber-700 hover:underline font-medium">← Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
