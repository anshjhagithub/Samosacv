import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Refund Policy</h1>
        <div className="prose prose-stone prose-sm max-w-none space-y-4 text-stone-600">
          <p><strong>Last updated:</strong> February 2025</p>
          <p><strong>Nature of service.</strong> Samosa CV offers AI resume generation, tailoring, and export. Once payment is successful, you receive access to premium features as described on the pricing page.</p>
          <p><strong>Refund conditions.</strong> If you were charged but did not receive the promised access due to a technical error, we will rectify or refund within 7–10 business days. Refunds are not provided for change of mind after successful use. Duplicate charges will be refunded upon verification.</p>
          <p><strong>How to request.</strong> Email support@samosacv.com with your order ID and reason. We respond within 5 business days.</p>
          <p>Contact: <a href="mailto:support@samosacv.com" className="text-amber-700 hover:underline">support@samosacv.com</a></p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-amber-700 hover:underline font-medium">← Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
