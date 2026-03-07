import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-stone prose-sm max-w-none space-y-4 text-stone-600">
          <p><strong>Last updated:</strong> February 2025</p>
          <p><strong>Who we are.</strong> Samosa CV (&ldquo;we&rdquo;) operates the AI resume builder service. This policy describes how we collect, use, and protect your information.</p>
          <p><strong>Data we collect.</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account data: when you sign in (e.g. via Google), we receive your email and profile identifier.</li>
            <li>Resume and job content: text you paste, upload (PDF), or submit for tailoring.</li>
            <li>Payment data: processed by Cashfree; we do not store card or UPI details.</li>
            <li>Usage data: we may log feature usage for product improvement and abuse prevention.</li>
          </ul>
          <p><strong>How we use data.</strong> We use your data to provide the service, improve the product, and comply with law. We do not sell your personal data.</p>
          <p><strong>Data handling.</strong> Resume text is sent to our AI provider for processing. We retain data as needed and as required by law. You can request deletion anytime.</p>
          <p><strong>Security.</strong> Industry-standard measures protect data in transit and at rest.</p>
          <p><strong>Cookies.</strong> We use cookies and local storage for session and preferences.</p>
          <p><strong>Your rights.</strong> Request access, correction, or deletion by emailing us.</p>
          <p><strong>Changes.</strong> We may update this policy and will post the revised version here.</p>
          <p>Contact: <a href="mailto:support@samosacv.com" className="text-amber-700 hover:underline">support@samosacv.com</a></p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-amber-700 hover:underline font-medium">← Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
