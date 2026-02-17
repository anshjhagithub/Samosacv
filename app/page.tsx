"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PrecisionGraphic } from "@/components/home/PrecisionGraphic";
import { WavyGraphic } from "@/components/home/WavyGraphic";
import { ROLE_IDS, rolePresets } from "@/lib/rolePresets";
import { TEMPLATE_IDS } from "@/types/resume";
import { TEMPLATE_LABELS } from "@/components/resume/ResumePreview";
import { AuthButton } from "@/components/auth/AuthButton";
import { useUserLimits } from "@/lib/hooks/useUserLimits";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const TESTIMONIALS = [
  {
    quote:
      "Articulated didn't just help me write a resume; they helped me rediscover my professional worth. I landed three offers from FAANG companies within a month.",
    name: "Marcus Chen",
    role: "Software Engineer at Google",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face",
  },
  {
    quote:
      "The AI suggestions were spot-on. I went from generic bullet points to impact-driven copy that got me interviews at three startups.",
    name: "Sarah Mitchell",
    role: "Product Manager at Stripe",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face",
  },
  {
    quote:
      "Best resume tool I've used. Clean templates, fast edits, and the summary improvement feature actually sounds like me.",
    name: "James Okonkwo",
    role: "Data Analyst at Meta",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face",
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Choose your role", desc: "Pick your discipline so our AI tailors content to your industry." },
  { step: "2", title: "Add your experience", desc: "Upload a PDF, paste your profile, or start from a job description." },
  { step: "3", title: "Edit & refine", desc: "Use our builder to tweak sections and improve bullets with one click." },
  { step: "4", title: "Download", desc: "Export your resume and apply with confidence." },
];

const FEATURES = [
  { title: "ATS-friendly", desc: "Structured for applicant tracking systems" },
  { title: "35+ templates", desc: "Classic, modern, minimal, and more" },
  { title: "AI summary", desc: "One-click improvement for your bio" },
  { title: "Real-time preview", desc: "See changes as you type" },
  { title: "PDF & paste", desc: "Import from existing resume or LinkedIn" },
  { title: "Job-description fit", desc: "Tailor resume to any job posting" },
  { title: "No sign-up to start", desc: "Build and download without an account" },
  { title: "Export anytime", desc: "Download as PNG or PDF-ready" },
];

const STATS = [
  { value: "35+", label: "Templates" },
  { value: "50K+", label: "Resumes created" },
  { value: "4.9★", label: "User rating" },
  { value: "12x", label: "Callback rate*" },
  { value: "99.8%", label: "ATS pass rate*" },
];

const FAQ = [
  { q: "Do I need an account?", a: "No. You can start building and download your resume without signing up." },
  { q: "Can I use my existing resume?", a: "Yes. Upload a PDF or paste your LinkedIn or resume text and we'll extract and improve it." },
  { q: "How do I match a job description?", a: "Use the job description flow: paste the job posting and we'll generate a tailored template and content." },
  { q: "Can I change the template later?", a: "Yes. The builder lets you switch between 35+ templates at any time." },
];

export default function Home() {
  const { limits, loading: limitsLoading, isAuthenticated } = useUserLimits();

  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(30, 25, 50, 0.6) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <header className="relative border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg leading-none">
              +
            </span>
            ARTICULATED
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#process" className="text-sm text-gray-400 hover:text-white transition-colors">
              Process
            </Link>
            <Link href="#templates" className="text-sm text-gray-400 hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated && !limitsLoading && limits && (
              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
                <span>Free: <strong className="text-white">{limits.free_generations_remaining}</strong></span>
                <span>Premium: <strong className={limits.premium_unlocked ? "text-accent" : "text-gray-500"}>{limits.premium_unlocked ? "On" : "Locked"}</strong></span>
                <span>Wallet: <strong className="text-white">₹{limits.wallet_balance_rupees}</strong></span>
              </div>
            )}
            <AuthButton />
            <Link
              href="/onboarding"
              className="text-sm rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent/90 transition-all shadow-glow"
            >
              Start Building
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero – tighter */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-14 text-center">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto">
            <motion.h1
              variants={item}
              className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-[1.12]"
            >
              Build a job-winning resume in 60 seconds.
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-4 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Our AI curates your professional narrative. Experience high-precision engineering for the next era of your career.
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:shadow-glow-lg hover:bg-accent/90 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Building
              </Link>
              <Link
                href="/builder"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-medium text-white hover:bg-white/5 transition-all duration-300"
              >
                View Sample
              </Link>
            </motion.div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-gray-500">Trusted by 50,000+ professionals</p>
            <div className="mt-4 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-accent" : "bg-white/20"}`} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-serif text-white mb-6 text-center">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW_IT_WORKS.map((h, i) => (
                <motion.div
                  key={h.step}
                  className="rounded-xl border border-white/10 bg-[#16121f]/60 p-4 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="inline-flex w-8 h-8 rounded-lg bg-accent/20 text-accent font-bold text-sm items-center justify-center mb-2">
                    {h.step}
                  </span>
                  <h3 className="text-white font-semibold text-sm">{h.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{h.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-white/5 py-8 sm:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Select your discipline */}
        <section id="process" className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white">Select your discipline.</h2>
                <p className="mt-2 text-gray-400 text-sm max-w-xl">
                  Choose your focus area to activate industry-specific AI models trained on successful placements at top-tier firms.
                </p>
              </div>
              <Link href="/onboarding" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 shrink-0">
                View All Roles <span className="text-lg leading-none">+</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLE_IDS.map((id, i) => {
                const role = rolePresets[id];
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href="/onboarding"
                      className="block rounded-2xl border-2 border-white/15 bg-[#16121f] shadow-lg shadow-black/20 p-5 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-accent transition-colors">
                            {role.label}
                          </h3>
                          <p className="mt-1.5 text-gray-400 text-sm line-clamp-2">
                            {role.skills.length ? role.skills.slice(0, 3).join(", ") : "Customize your profile and skills."}
                          </p>
                        </div>
                        <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-accent transition-colors shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Templates preview */}
        <section id="templates" className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">35+ professional templates</h2>
            <p className="text-gray-400 text-sm mb-6">
              Classic, modern, minimal, executive, and more. Choose one in every workflow; switch anytime in the builder.
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_IDS.map((id) => (
                <span
                  key={id}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#16121f]/80 text-gray-400 text-xs"
                >
                  {TEMPLATE_LABELS[id]}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80"
              >
                Try templates in the builder
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-serif text-white mb-6">Why Articulated</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="rounded-xl border border-white/10 bg-[#16121f]/50 p-4"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <h3 className="text-white font-medium text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Precision Engineering */}
        <section className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <motion.div className="order-2 lg:order-1" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <PrecisionGraphic />
              </motion.div>
              <motion.div className="order-1 lg:order-2" initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <p className="text-accent text-xs font-medium uppercase tracking-widest mb-2">Precision Engineering</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white leading-tight">Crafted for the elite candidate.</h2>
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                  Our AI parses your experience and the job description to produce a resume that passes ATS filters and speaks directly to hiring managers.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    { title: "Semantic Optimization", desc: "Keywords aligned with job requirements and industry language." },
                    { title: "Vantage Formatting", desc: "Clean structure that highlights your strongest wins first." },
                  ].map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      <div>
                        <span className="text-white font-medium text-sm">{f.title}</span>
                        <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI-Optimized Performance */}
        <section className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <p className="text-accent text-xs font-medium uppercase tracking-widest mb-2">AI-Optimized Performance</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white leading-tight">Iterative perfection in seconds.</h2>
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                  Refine any section with one click. Our models suggest stronger bullets and role-specific language.
                </p>
                <div className="mt-6 flex gap-3 flex-wrap">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 min-w-[80px]">
                    <p className="text-xl font-semibold text-white">Under 60s</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Build time</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 min-w-[80px]">
                    <p className="text-xl font-semibold text-white">12x</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Callback rate</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 min-w-[80px]">
                    <p className="text-xl font-semibold text-white">99.8%</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">ATS pass rate</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <WavyGraphic />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <span className="absolute inset-0 flex items-center justify-center text-[14rem] font-serif text-white/[0.03] pointer-events-none select-none leading-none" aria-hidden>7</span>
            <h2 className="relative text-center text-xl sm:text-2xl font-serif text-white mb-8">Loved by professionals</h2>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="rounded-2xl border border-white/10 bg-[#16121f]/80 backdrop-blur p-5 sm:p-6 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <blockquote className="text-sm sm:text-base font-serif text-white/90 italic leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0 ring-2 ring-accent/30">
                      <Image src={t.image} alt="" width={48} height={48} className="object-cover w-full h-full" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-serif text-white mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {FAQ.map((f, i) => (
                <motion.div
                  key={f.q}
                  className="rounded-xl border border-white/10 bg-[#16121f]/60 p-4"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <h3 className="text-white font-medium text-sm">{f.q}</h3>
                  <p className="text-gray-500 text-xs mt-1.5">{f.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Waitlist */}
        <section id="pricing" className="border-t border-white/5 py-10 sm:py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-xl sm:text-3xl font-serif text-white">Your next era begins here.</h2>
            <p className="mt-3 text-gray-400 text-sm">
              Join the waitlist for our upcoming Pro Narrative service and gain early access to new AI models.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your work email"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none transition-colors text-sm"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-3 font-semibold text-white text-sm hover:bg-accent/90 transition-colors shadow-glow shrink-0"
              >
                Join Waitlist
              </button>
            </form>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-500">Limited spots available</p>
          </div>
        </section>
      </main>

      {/* Footer – tighter */}
      <footer className="relative border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white font-semibold mb-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-lg leading-none">+</span>
                ARTICULATED
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                AI-powered resume builder for the next era of your career.
              </p>
              <div className="flex gap-2 mt-3">
                {[1, 2].map((i) => (
                  <span key={i} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                    <span className="text-xs">◦</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Platform</p>
              <ul className="space-y-1.5">
                {["Resume Builder", "Cover Letters", "AI Analysis", "Pricing"].map((label) => (
                  <li key={label}>
                    <Link href={label === "Pricing" ? "/pricing" : "/onboarding"} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Company</p>
              <ul className="space-y-1.5">
                {["Process", "Ethics", "Journal", "Careers"].map((label) => (
                  <li key={label}>
                    <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Legal</p>
              <ul className="space-y-1.5">
                <li><Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="text-sm text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/refund-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Refund Policy</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <p className="mt-8 pt-6 border-t border-white/5 text-center text-gray-600 text-xs">
            © {new Date().getFullYear()} ARTICULATED NARRATIVE SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
