import Link from "next/link";

export default function RefundPolicyPage() {
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
            <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white">Privacy</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white">Contact</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-serif text-white mb-6">Refund Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
          <p><strong>Last updated:</strong> February 2025</p>
          <p><strong>Nature of service.</strong> ARTICULATED offers AI resume generation, tailoring, and export. Once a payment is successful, you receive access to premium features as described on the pricing page.</p>
          <p><strong>Refund conditions.</strong> If you were charged but did not receive the promised access due to a technical error on our side, we will rectify or refund within 7–10 business days. Refunds are not provided for change of mind after successful use. Duplicate charges will be refunded upon verification.</p>
          <p><strong>How to request.</strong> Email support@articulated.app with your order ID and reason. We will respond within 5 business days. Approved refunds are processed via Cashfree and may take 5–10 business days.</p>
          <p>Contact: <a href="mailto:support@articulated.app" className="text-accent">support@articulated.app</a></p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-accent hover:underline">Back to home</Link>
      </main>
    </div>
  );
}
