import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">A</span>
            ARTICULATED
          </Link>
          <nav className="flex gap-4">
            <Link href="/terms-and-conditions" className="text-sm text-gray-400 hover:text-white">Terms</Link>
            <Link href="/refund-policy" className="text-sm text-gray-400 hover:text-white">Refunds</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white">Contact</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-serif text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
          <p><strong>Last updated:</strong> February 2025</p>
          <p><strong>Who we are.</strong> ARTICULATED (“we”) operates the AI resume builder service. This policy describes how we collect, use, and protect your information.</p>
          <p><strong>Data we collect.</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account data: when you sign in (e.g. via Google), we receive your email and profile identifier from the provider.</li>
            <li>Resume and job content: text you paste, upload (PDF), or submit for tailoring and generation.</li>
            <li>Payment data: payment is processed by Cashfree; we do not store card or UPI details. We may store order ID and payment ID for support and compliance.</li>
            <li>Usage data: we may log usage of features (e.g. generations, limits) for product and abuse prevention.</li>
          </ul>
          <p><strong>How we use data.</strong> We use your data to provide the service (resume generation, tailoring, templates, payments), to improve the product, and to comply with law. We do not sell your personal data to third parties.</p>
          <p><strong>Data handling.</strong> Resume and job text are sent to our AI provider (Mistral) for processing. We retain data as needed to operate the service and as required by law. You can request deletion of your account and associated data by contacting us.</p>
          <p><strong>Security.</strong> We use industry-standard measures to protect data in transit and at rest. Payment processing is handled by Cashfree under their security and compliance standards.</p>
          <p><strong>Cookies and storage.</strong> We use cookies and local storage for session and preferences. You can disable cookies in your browser; some features may not work.</p>
          <p><strong>Your rights.</strong> You may request access, correction, or deletion of your personal data by emailing us. Applicable law may give you additional rights.</p>
          <p><strong>Changes.</strong> We may update this policy; we will post the revised version on this page and update the “Last updated” date.</p>
          <p>Contact: <a href="mailto:support@articulated.app" className="text-accent">support@articulated.app</a></p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-accent hover:underline">← Back to home</Link>
      </main>
    </div>
  );
}
