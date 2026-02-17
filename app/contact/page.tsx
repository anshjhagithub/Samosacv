import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">A</span>
            ARTICULATED
          </Link>
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-white">Pricing</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-serif text-white mb-4">Contact</h1>
        <p className="text-gray-400 mb-6">ARTICULATED – AI resume builder. Email: support@articulated.app</p>
        <Link href="/" className="text-sm text-accent hover:underline">Back to home</Link>
      </main>
    </div>
  );
}
