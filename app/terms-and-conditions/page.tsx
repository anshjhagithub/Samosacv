import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Terms and Conditions</h1>
        <div className="prose prose-stone prose-sm max-w-none space-y-4 text-stone-600">
          <p><strong>Last updated:</strong> February 2025</p>
          <p><strong>Service.</strong> Samosa CV (&ldquo;we&rdquo;) provides an AI-powered resume builder: extraction from PDF or text, tailoring to job descriptions, templates, and export. Use of the site and paid features is subject to these terms.</p>
          <p><strong>Eligibility.</strong> You must be at least 18 years old and able to enter binding contracts to use paid features.</p>
          <p><strong>Payment terms.</strong> Payments are processed via Cashfree. By paying, you agree to our pricing and refund policy. All amounts are in INR unless stated otherwise.</p>
          <p><strong>Acceptable use.</strong> You may not use the service for illegal purposes, to submit misleading content, or to abuse or overload our systems.</p>
          <p><strong>Intellectual property.</strong> You retain rights to the content you provide. We retain rights to our platform, design, and AI outputs as permitted by law.</p>
          <p><strong>Disclaimer.</strong> The service is provided &ldquo;as is.&rdquo; We do not guarantee employment outcomes or ATS results.</p>
          <p><strong>Limitation of liability.</strong> To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the service.</p>
          <p><strong>Changes.</strong> We may update these terms; continued use after changes constitutes acceptance.</p>
          <p>Contact: <a href="mailto:support@samosacv.in" className="text-amber-700 hover:underline">support@samosacv.in</a></p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-amber-700 hover:underline font-medium">← Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
