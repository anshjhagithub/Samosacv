import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ContactPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">Contact</h1>
        <p className="text-stone-600 mb-6">Samosa CV is an AI-powered resume builder designed to help job seekers create clear, professional resumes in minutes.

If you have questions, feedback, or need help using the platform, feel free to reach out. We’re always happy to help.</p>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Business & Partnerships</h2>
            <p className="text-stone-600 mb-2">For partnerships, collaborations, or media inquiries:</p>
            <p className="text-stone-600">Email: <a href="mailto:anshjha8463@gmail.com" className="text-amber-700 hover:underline">anshjha8463@gmail.com</a></p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Legal Information</h2>
            <p className="text-stone-600">Samosa CV is operated by:</p>
            <p className="text-stone-600">Ansh Jha</p>
            <p className="text-stone-600">India</p>
          </div>
        </div>
        <Link href="/" className="text-sm text-amber-700 hover:underline font-medium">← Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
