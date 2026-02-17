import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">A</span>
            ARTICULATED
          </Link>
          <nav className="flex gap-4">
            <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white">Privacy</Link>
            <Link href="/refund-policy" className="text-sm text-gray-400 hover:text-white">Refunds</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white">Contact</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-serif text-white mb-6">Terms and Conditions</h1>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
          <p><strong>Last updated:</strong> February 2025</p>
          <p><strong>Service.</strong> ARTICULATED (“we”) provides an AI-powered resume builder: extraction from PDF or text, tailoring to job descriptions, templates, and export. Use of the site and paid features is subject to these terms.</p>
          <p><strong>Eligibility.</strong> You must be at least 18 years old and able to enter binding contracts to use paid features.</p>
          <p><strong>Payment terms.</strong> Payments are processed via Cashfree. By paying, you agree to our pricing and refund policy. All amounts are in INR unless stated otherwise.</p>
          <p><strong>Acceptable use.</strong> You may not use the service for illegal purposes, to submit misleading content, or to abuse or overload our systems.</p>
          <p><strong>Intellectual property.</strong> You retain rights to the content you provide. We retain rights to our platform, design, and AI outputs as permitted by law.</p>
          <p><strong>Disclaimer.</strong> The service is provided “as is.” We do not guarantee employment outcomes or ATS results.</p>
          <p><strong>Limitation of liability.</strong> To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the service.</p>
          <p><strong>Changes.</strong> We may update these terms; continued use after changes constitutes acceptance.</p>
          <p>Contact: <a href="mailto:support@articulated.app" className="text-accent">support@articulated.app</a></p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-accent hover:underline">← Back to home</Link>
      </main>
    </div>
  );
}
