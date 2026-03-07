"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FAQJsonLd } from "@/components/seo/FAQJsonLd";
import { FloatingResume } from "@/components/home/FloatingResume";
import { LogoTicker } from "@/components/home/LogoTicker";
import { ROLE_IDS, rolePresets } from "@/lib/rolePresets";
import type { RoleId } from "@/lib/rolePresets";

const TemplateShowcase = dynamic(() => import("@/components/home/TemplateShowcase").then(m => ({ default: m.TemplateShowcase })), {
  ssr: false,
  loading: () => <div className="h-96 rounded-2xl bg-stone-100 animate-pulse" />,
});
const BeforeAfter = dynamic(() => import("@/components/home/BeforeAfter").then(m => ({ default: m.BeforeAfter })), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-stone-100 animate-pulse" />,
});
const FAQAccordion = dynamic(() => import("@/components/home/FAQAccordion").then(m => ({ default: m.FAQAccordion })), {
  ssr: false,
  loading: () => <div className="h-48 rounded-2xl bg-stone-100 animate-pulse" />,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };

const STEPS = [
  { step: "1", title: "Pick your role", desc: "AI tailors every word to your field.", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { step: "2", title: "Add experience", desc: "Upload, paste, or start fresh.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { step: "3", title: "AI refines", desc: "Quantified, keyword-optimized bullets.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { step: "4", title: "Download", desc: "ATS-ready PDF in seconds.", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
];

const FEATURES = [
  { title: "AI writes for you", desc: "One-click impact-driven bullets.", tag: "AI", color: "amber" },
  { title: "ATS optimization", desc: "Keyword matching, format checks, readability.", tag: "ATS", color: "emerald" },
  { title: "Job description match", desc: "Paste a posting, get a tailored resume.", tag: "Tailor", color: "sky" },
  { title: "Instant improvements", desc: "Vague \u2192 quantified in one click.", tag: "AI", color: "amber" },
  { title: "Role-specific models", desc: "Trained on top placements in your field.", tag: "AI", color: "violet" },
  { title: "35+ pro templates", desc: "ATS-tested, recruiter-approved designs.", tag: "Design", color: "rose" },
];

const TESTIMONIALS = [
  { quote: "Landed three FAANG offers within a month. Samosa CV helped me rediscover my professional worth.", name: "Marcus Chen", role: "Engineer, Google", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face" },
  { quote: "The AI suggestions were spot-on. Got me interviews at three startups.", name: "Sarah Mitchell", role: "PM, Stripe", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face" },
  { quote: "Clean templates, fast edits. The summary improvement actually sounds like me.", name: "James Okonkwo", role: "Analyst, Meta", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face" },
  { quote: "Used it for my career switch. The AI knew exactly how to position transferable skills.", name: "Elena Rodriguez", role: "BA, Microsoft", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face" },
  { quote: "Quality rivals a professional writer. Modern templates and context-aware AI.", name: "David Kim", role: "EM, Netflix", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face" },
  { quote: "Best investment for my career. Spent \u20B95 and got 4 interview calls in a week.", name: "Priya Sharma", role: "Data Analyst, Flipkart", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face" },
  { quote: "I was skeptical at \u20B95 but the AI-generated resume was better than my \u20B92000 one.", name: "Rahul Verma", role: "SDE, Amazon", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=face" },
  { quote: "Two fields. That\u2019s all it took. Got my resume in under a minute.", name: "Ananya Patel", role: "PM, Razorpay", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=face" },
];

const FREE_FEATURES = [
  { label: "ATS Score Analysis", desc: "Real-time scoring against 27K+ resumes" },
  { label: "Skill Gap Detection", desc: "See exactly which skills you\u2019re missing" },
  { label: "Bullet Suggestions", desc: "Real bullets from top professionals" },
  { label: "82 Role Presets", desc: "Industry-optimized starting content" },
  { label: "35+ Templates", desc: "Preview and switch anytime" },
  { label: "Role Intelligence", desc: "Skills, verbs, benchmarks per role" },
];

const PAID_CORE = [
  "AI-generated resume with quantified bullets",
  "Clean PDF download",
  "35+ template access",
  "Unlimited edits in builder",
];

const PAID_ADDONS = [
  { label: "ATS Keyword Booster", price: 5 },
  { label: "AI Summary Rewrite", price: 1 },
  { label: "Cover Letter", price: 5 },
  { label: "Mock Interview Pack", price: 6 },
];

const COMPARISON = [
  { feature: "Price", us: "\u20B95 once", others: "\u20B9500+/mo" },
  { feature: "Fields to start", us: "Just 2", others: "20+" },
  { feature: "Free ATS scoring", us: true, others: "Paid" },
  { feature: "Free skill suggestions", us: true, others: "No" },
  { feature: "AI bullet points", us: true, others: "Limited" },
  { feature: "35+ templates", us: true, others: "5-10" },
  { feature: "82 role presets", us: true, others: "No" },
  { feature: "Job description match", us: true, others: "No" },
  { feature: "Role-specific AI", us: true, others: "No" },
  { feature: "Subscription needed", us: "No", others: "Yes" },
];

const FAQ_ITEMS = [
  { q: "Do I need an account?", a: "Yes, sign-up is required to create and track your resumes. Sign in with Google \u2014 it takes 2 seconds." },
  { q: "What do I get for free?", a: "ATS scoring, skill gap analysis, bullet suggestions, 82 role presets, 35+ template previews, and role intelligence \u2014 all completely free, no sign-up needed." },
  { q: "Why is it only \u20B95?", a: "We use efficient AI models and have no subscription overhead. You pay only when you generate an AI-powered resume. No recurring fees, no hidden charges." },
  { q: "Can I use my existing resume?", a: "Yes. Upload PDF or paste LinkedIn text. Our AI extracts and rewrites with impact-driven language." },
  { q: "How does job matching work?", a: "Paste any job posting. AI analyzes requirements, matches your experience, and generates tailored content with ATS keywords." },
  { q: "Can I switch templates?", a: "Anytime. Switch between 35+ templates in the builder. Your content stays \u2014 only design changes." },
  { q: "Is my data safe?", a: "Enterprise-grade encryption. Never shared. Delete everything anytime." },
];

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });
  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  return (
    <motion.div className={className} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

function ProcessStep({ step, title, desc, icon, index, total }: { step: string; title: string; desc: string; icon: string; index: number; total: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }} className="relative">
      <TiltCard className="rounded-2xl border border-stone-200/90 bg-white p-5 text-center shadow-sm hover:shadow-lg hover:border-amber-200 transition-all group perspective-1000">
        <motion.div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/60 border border-amber-200/60 flex items-center justify-center text-amber-700 mx-auto mb-3 group-hover:from-amber-200 group-hover:to-amber-300/60 transition-colors" whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
        </motion.div>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-[10px] font-bold mb-2">{step}</span>
        <h3 className="text-stone-900 font-semibold text-sm">{title}</h3>
        <p className="text-stone-500 text-xs mt-1 leading-relaxed">{desc}</p>
      </TiltCard>
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-2 w-4 text-amber-300 z-10">
          <motion.svg viewBox="0 0 16 16" fill="currentColor" initial={{ opacity: 0, x: -4 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 + 0.3 }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" />
          </motion.svg>
        </div>
      )}
    </motion.div>
  );
}

const FEATURE_ICONS: Record<string, string> = {
  "AI writes for you": "M13 10V3L4 14h7v7l9-11h-7z",
  "ATS optimization": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "Job description match": "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  "Instant improvements": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  "Role-specific models": "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  "35+ pro templates": "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
};

const AI_REWRITES = [
  { before: "Worked on multiple projects", after: "Led 3 cross-functional projects to on-time delivery, reducing cycle time by 28%", delay: 0 },
  { before: "Improved team performance", after: "Increased team velocity 42% by implementing sprint retrospectives and pair programming", delay: 0.2 },
  { before: "Helped with customer issues", after: "Resolved 200+ customer escalations with 97% satisfaction rate, reducing churn by 15%", delay: 0.4 },
  { before: "Made the website faster", after: "Optimized page load from 4.2s to 1.1s, boosting conversion rate 23% across 12M monthly users", delay: 0.6 },
];

function AIWritingDemo() {
  return (
    <TiltCard className="relative w-full rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-lg cursor-default perspective-1000">
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-3 border-b border-amber-200/50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[10px] text-amber-700 uppercase tracking-widest font-bold">AI Rewriting &mdash; Live</span>
      </div>
      <div className="p-5 space-y-3">
        {AI_REWRITES.map((item, i) => (
          <motion.div key={i} className="rounded-lg border border-stone-100 bg-stone-50/50 p-3" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + item.delay }}>
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-red-400 text-xs mt-0.5">&times;</span>
              <p className="text-xs text-stone-400 line-through leading-relaxed">{item.before}</p>
            </div>
            <motion.div className="flex items-start gap-2 mt-1.5" initial={{ opacity: 0, y: 4 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + item.delay }}>
              <span className="shrink-0 text-emerald-500 text-xs mt-0.5">&check;</span>
              <p className="text-xs text-stone-800 font-medium leading-relaxed">{item.after}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}

const ATS_CHECKS = [
  { label: "Keyword match", score: 96, color: "emerald" },
  { label: "Format structure", score: 100, color: "emerald" },
  { label: "Action verbs", score: 92, color: "emerald" },
  { label: "Quantification", score: 88, color: "amber" },
  { label: "Readability", score: 95, color: "emerald" },
  { label: "Experience fit", score: 90, color: "emerald" },
];

function ATSScoreDemo() {
  return (
    <TiltCard className="relative w-full rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-lg cursor-default perspective-1000">
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-3 border-b border-emerald-200/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold">ATS Analysis</span>
        </div>
        <motion.div className="flex items-baseline gap-1" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1, type: "spring", stiffness: 200 }}>
          <span className="text-2xl font-black text-emerald-600">96</span>
          <span className="text-xs text-emerald-500 font-semibold">/100</span>
        </motion.div>
      </div>
      <div className="p-5 space-y-3">
        {ATS_CHECKS.map((check, i) => (
          <motion.div key={check.label} className="flex items-center gap-3" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}>
            <span className="text-xs text-stone-600 w-28 shrink-0">{check.label}</span>
            <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
              <motion.div className={`h-full rounded-full ${check.color === "emerald" ? "bg-emerald-400" : "bg-amber-400"}`} initial={{ width: 0 }} whileInView={{ width: `${check.score}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }} />
            </div>
            <span className={`text-xs font-bold w-8 text-right ${check.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>{check.score}</span>
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}

export default function Home() {
  const [roleFilter, setRoleFilter] = useState<RoleId | "all">("all");
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const roleIds = roleFilter === "all" ? ROLE_IDS : [roleFilter];

  return (
    <div className="min-h-screen">
      <FAQJsonLd />
      <SiteHeader />

      <main className="relative">
        {/* ═══ HERO ═══ */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/30 via-amber-100/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-100/20 via-amber-50/10 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">
              <motion.div variants={stagger} initial="hidden" animate="show">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-800 font-semibold">&#x20B9;5 per resume &middot; No subscription</span>
                </motion.div>
                <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-stone-900 tracking-tight leading-[1.15]">
                  AI resume in 60 seconds. <span className="text-amber-700">Just &#x20B9;5.</span>
                </motion.h1>
                <motion.p variants={fadeUp} className="mt-4 text-stone-600 max-w-md text-base sm:text-lg leading-relaxed">
                  Enter your name and target role. AI handles the rest. Free ATS scoring, skill analysis, and 82 role presets included.
                </motion.p>
                <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href="/create" className="touch-target relative inline-flex items-center justify-center rounded-xl bg-amber-600 px-7 py-3.5 min-h-[48px] text-sm font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5 btn-shine overflow-hidden">
                    Create my resume &mdash; &#x20B9;5
                  </Link>
                  <a href="#free-features" className="touch-target inline-flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-50/80 px-7 py-3.5 min-h-[48px] text-sm font-medium text-emerald-800 hover:bg-emerald-100 transition-all">
                    What&apos;s free?
                  </a>
                </motion.div>
                <motion.div variants={fadeUp} className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {TESTIMONIALS.slice(0, 6).map((t, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                        <Image src={t.image} alt="" width={36} height={36} sizes="36px" className="w-full h-full object-cover" priority={i === 0} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                    <p className="text-xs text-stone-500">4.9/5 &middot; 50K+ users</p>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div className="hidden lg:block" style={{ y: heroParallax }}>
                <FloatingResume />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ LOGO TICKER ═══ */}
        <section className="border-y border-amber-900/5 py-1">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2 mt-3">Built by professionals at</p>
          <LogoTicker />
        </section>

        {/* ═══ 3 USPs ═══ */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <motion.p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Why Samosa CV</motion.p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">Three reasons you won&apos;t find a better deal</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* USP 1: Price */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="relative group">
                <TiltCard className="h-full perspective-1000">
                  <div className="h-full rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-6 sm:p-8 shadow-lg hover:shadow-xl hover:border-amber-300 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-5 shadow-md shadow-amber-500/30">
                      <span className="text-2xl font-black text-white">&#x20B9;</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">&#x20B9;5. No subscription.</h3>
                    <p className="text-stone-600 text-sm leading-relaxed mb-4">Others charge &#x20B9;500+/month for AI resumes. We charge &#x20B9;5. Once. No recurring fees. No hidden charges. No trial that expires.</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-amber-200/50">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-amber-700">&#x20B9;5</span>
                        <span className="text-stone-500 text-sm line-through">&#x20B9;500</span>
                      </div>
                      <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">99% cheaper</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* USP 2: Minimal input */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="relative group">
                <TiltCard className="h-full perspective-1000">
                  <div className="h-full rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50/30 p-6 sm:p-8 shadow-lg hover:shadow-xl hover:border-sky-300 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center mb-5 shadow-md shadow-sky-500/30">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">2 fields. That&apos;s it.</h3>
                    <p className="text-stone-600 text-sm leading-relaxed mb-4">Other builders need 20+ fields. We need your name and target role. AI fills in experience bullets, skills, summary, and projects from 27K+ real resumes.</p>
                    <div className="pt-4 border-t border-sky-200/50 space-y-2">
                      <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2">
                        <span className="text-xs text-sky-600 font-medium w-12">Name</span>
                        <span className="text-xs text-stone-800">Priya Sharma</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2">
                        <span className="text-xs text-sky-600 font-medium w-12">Role</span>
                        <span className="text-xs text-stone-800">Data Analyst</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sky-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        <span className="text-xs font-semibold">Full resume generated</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* USP 3: Free features */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="relative group">
                <TiltCard className="h-full perspective-1000">
                  <div className="h-full rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-6 sm:p-8 shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-5 shadow-md shadow-emerald-500/30">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Loaded with free tools</h3>
                    <p className="text-stone-600 text-sm leading-relaxed mb-4">Most features are completely free. ATS scoring, skill analysis, bullet suggestions, role intelligence &mdash; no payment, no sign-up.</p>
                    <div className="pt-4 border-t border-emerald-200/50 grid grid-cols-2 gap-1.5">
                      {FREE_FEATURES.slice(0, 4).map((f) => (
                        <div key={f.label} className="flex items-center gap-1.5 text-xs">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                          <span className="text-stone-700 font-medium">{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="process" className="py-14 sm:py-18 bg-white/40 border-y border-amber-900/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <motion.p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Simple Process</motion.p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Blank page &rarr; interview in 4 steps</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((h, i) => <ProcessStep key={h.step} {...h} index={i} total={STEPS.length} />)}
            </div>
            <motion.div className="mt-8 text-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
              <Link href="/create" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold text-sm transition-colors">Start now &mdash; just 2 fields &rarr;</Link>
            </motion.div>
          </div>
        </section>

        {/* ═══ AI WRITING ═══ */}
        <section className="py-14 sm:py-18">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs text-amber-800 font-semibold mb-4">AI Engine</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">Better bullets, one click.</h2>
                <p className="mt-3 text-stone-600 leading-relaxed text-sm">AI trained on thousands of successful resumes rewrites vague descriptions into quantified achievements.</p>
                <ul className="mt-5 space-y-2.5">
                  {["Role-specific models", "Auto-quantification", "Sounds like you, not a robot"].map((b, bi) => (
                    <motion.li key={bi} className="flex gap-3 items-center" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + bi * 0.1 }}>
                      <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span className="text-sm text-stone-600">{b}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                <AIWritingDemo />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ ATS ═══ */}
        <section className="py-14 sm:py-18 bg-white/40 border-y border-amber-900/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div className="order-2 lg:order-1" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                <ATSScoreDemo />
              </motion.div>
              <motion.div className="order-1 lg:order-2" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs text-emerald-800 font-semibold mb-4">Free ATS Scoring</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">Pass every ATS. For free.</h2>
                <p className="mt-3 text-stone-600 leading-relaxed text-sm">Real-time ATS scoring powered by 27K+ real resumes. No sign-up needed. Others charge for this &mdash; we don&apos;t.</p>
                <ul className="mt-5 space-y-2.5">
                  {["Free keyword matching and scoring", "Free skill gap analysis", "Free role-specific benchmarks"].map((b, bi) => (
                    <motion.li key={bi} className="flex gap-3 items-center" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + bi * 0.1 }}>
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span className="text-sm text-stone-600">{b}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ FREE vs PAID ═══ */}
        <section id="free-features" className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">Everything you need. Shockingly affordable.</h2>
              <p className="mt-2 text-stone-500 text-sm max-w-lg mx-auto">6 tools completely free. AI resume for the price of a chai. No subscription. Ever.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Free column */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 p-6">
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">Free forever</span>
                </div>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-emerald-700">&#x20B9;0</span>
                  <span className="text-sm text-stone-400">/ forever</span>
                </div>
                <div className="space-y-2.5">
                  {FREE_FEATURES.map((f, i) => (
                    <motion.div key={f.label} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex items-start gap-2.5">
                      <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{f.label}</p>
                        <p className="text-xs text-stone-500">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Per resume — ₹5 */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="relative rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-6 shadow-lg shadow-amber-200/30">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">Most popular</span>
                </div>
                <div className="flex items-center gap-3 mb-1 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">Per resume</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl font-black text-amber-700">&#x20B9;5</span>
                  <span className="text-sm text-stone-400">/ resume</span>
                </div>
                <p className="text-xs text-stone-500 mb-5">AI generation + PDF download included. One price, no surprises.</p>
                <div className="space-y-2">
                  {PAID_CORE.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-stone-800">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-amber-200/60">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-2">Optional add-ons</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PAID_ADDONS.map((a) => (
                      <div key={a.label} className="flex items-center justify-between rounded-lg bg-amber-50/80 border border-amber-100 px-2 py-1.5">
                        <span className="text-[11px] text-stone-700">{a.label}</span>
                        <span className="text-[11px] font-bold text-amber-700">+&#x20B9;{a.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/create" className="mt-5 w-full relative inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5 btn-shine overflow-hidden">
                  Get started &mdash; &#x20B9;5
                </Link>
              </motion.div>

              {/* Bundle — ₹49 */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }} className="relative rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-violet-50/30 p-6">
                <div className="absolute -top-3 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">Best value</span>
                </div>
                <div className="flex items-center gap-3 mb-1 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold uppercase tracking-wider">Pro bundle</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl font-black text-violet-700">&#x20B9;49</span>
                  <span className="text-sm text-stone-400 line-through">&#x20B9;110</span>
                </div>
                <p className="text-xs text-stone-500 mb-5">11 AI resumes + ATS optimizer on every generation. Save 55%.</p>
                <div className="space-y-2">
                  {[
                    "11 AI resume generations",
                    "ATS Keyword Booster on each",
                    "PDF downloads included",
                    "All 35+ templates",
                    "Unlimited builder edits",
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-stone-800">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-violet-200/60">
                  <div className="rounded-lg bg-violet-100/80 border border-violet-200 p-3 text-center">
                    <p className="text-xs text-violet-800 font-semibold">&#x20B9;4.45/resume vs &#x20B9;10/resume individually</p>
                    <p className="text-[10px] text-violet-600 mt-0.5">You save &#x20B9;61 with the bundle</p>
                  </div>
                </div>
                <Link href="/pricing" className="mt-5 w-full relative inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 hover:bg-violet-700 transition-all hover:-translate-y-0.5 overflow-hidden">
                  Get Pro bundle &mdash; &#x20B9;49
                </Link>
              </motion.div>
            </div>

            <motion.p className="mt-8 text-center text-stone-500 text-sm font-medium" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              No hidden fees. No subscription. No trial that expires. Cancel or stop anytime.
            </motion.p>
          </div>
        </section>

        {/* ═══ BEFORE / AFTER ═══ */}
        <section className="py-14 sm:py-18 bg-white/40 border-y border-amber-900/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">See the AI difference</h2>
              <p className="mt-1 text-stone-500 text-sm">Generic &rarr; quantified. Vague &rarr; compelling.</p>
            </div>
            <BeforeAfter />
          </div>
        </section>

        {/* ═══ TEMPLATES ═══ */}
        <section className="py-14 sm:py-18">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">35+ pro templates</h2>
                <p className="mt-1 text-stone-500 text-sm">ATS-tested. Recruiter-approved. Free to preview.</p>
              </div>
              <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 shrink-0">See all &rarr;</Link>
            </div>
            <TemplateShowcase />
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="py-14 sm:py-18 bg-white/40 border-y border-amber-900/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Way beyond a resume builder</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((item, i) => {
                const iconPath = FEATURE_ICONS[item.title] || "M13 10V3L4 14h7v7l9-11h-7z";
                const colorClasses = item.color === "emerald" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : item.color === "sky" ? "bg-sky-100 text-sky-700 border-sky-200" : item.color === "violet" ? "bg-violet-100 text-violet-700 border-violet-200" : item.color === "rose" ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-amber-100 text-amber-700 border-amber-200";
                return (
                  <TiltCard key={item.title} className="perspective-1000">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-sm hover:shadow-md hover:border-amber-100 transition-all cursor-default h-full">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${colorClasses}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} /></svg>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${item.color === "emerald" ? "text-emerald-700" : item.color === "sky" ? "text-sky-700" : item.color === "violet" ? "text-violet-700" : item.color === "rose" ? "text-rose-600" : "text-amber-700"}`}>{item.tag}</span>
                      <h3 className="text-stone-900 font-semibold mt-1">{item.title}</h3>
                      <p className="text-stone-500 text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="py-14 sm:py-18 bg-white/40 border-y border-amber-900/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Loved by 50,000+ professionals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TESTIMONIALS.slice(0, 6).map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-100 transition-all">
                  <div className="flex gap-0.5 text-amber-500 text-xs mb-2">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                  <p className="text-stone-700 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 pt-3 border-t border-stone-100">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-stone-200 shrink-0">
                      <Image src={t.image} alt="" width={36} height={36} loading="lazy" className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="text-stone-900 font-semibold text-xs">{t.name}</p>
                      <p className="text-stone-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ COMPARISON ═══ */}
        <section className="py-14 sm:py-18">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Samosa CV vs. the rest</h2>
              <p className="mt-1 text-stone-500 text-sm">Why 50K+ users switched to us.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-card">
              <div className="grid grid-cols-3 gap-0 bg-stone-50 p-4 border-b border-stone-200">
                <span className="text-sm text-stone-500 font-medium">Feature</span>
                <span className="text-sm text-amber-800 font-bold text-center">Samosa CV</span>
                <span className="text-sm text-stone-400 font-medium text-center">Others</span>
              </div>
              {COMPARISON.map((row, i) => (
                <motion.div key={row.feature} className="grid grid-cols-3 gap-0 px-4 py-3 border-b border-stone-100 last:border-0 hover:bg-amber-50/30 transition-colors" initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                  <span className="text-sm text-stone-700">{row.feature}</span>
                  <span className="text-center">
                    {row.us === true ? (
                      <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 items-center justify-center"><svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></span>
                    ) : (
                      <span className="text-sm font-bold text-amber-700">{row.us}</span>
                    )}
                  </span>
                  <span className="text-center">
                    {row.others === "No" ? (
                      <span className="inline-flex w-6 h-6 rounded-full bg-red-50 items-center justify-center"><svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span>
                    ) : (
                      <span className="text-sm text-stone-400">{row.others}</span>
                    )}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DISCIPLINES ═══ */}
        <section id="disciplines" className="py-14 sm:py-18 bg-white/50 border-y border-amber-900/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">82 role-specific resume presets</h2>
            <p className="text-stone-500 text-sm mb-5">Pick your field. Start with industry-optimized content. <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold ml-1">FREE</span></p>
            <div className="flex flex-wrap gap-2 mb-5">
              <button type="button" onClick={() => setRoleFilter("all")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === "all" ? "bg-amber-600 text-white shadow" : "border border-stone-200 bg-white/90 text-stone-600 hover:border-amber-200"}`}>All</button>
              {ROLE_IDS.slice(0, 8).map((id) => (
                <button key={id} type="button" onClick={() => setRoleFilter(id)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === id ? "bg-amber-600 text-white shadow" : "border border-stone-200 bg-white/90 text-stone-600 hover:border-amber-200"}`}>
                  {rolePresets[id].label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence mode="sync">
                {roleIds.slice(0, 9).map((id, i) => {
                  const role = rolePresets[id];
                  return (
                    <motion.div key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }} layout>
                      <Link href="/onboarding" className="block rounded-xl border border-stone-200/90 bg-white p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all shadow-sm hover:shadow-md group">
                        <div className="flex justify-between items-center">
                          <h3 className="text-stone-900 font-semibold text-sm group-hover:text-amber-800">{role.label}</h3>
                          <span className="text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </span>
                        </div>
                        <p className="text-stone-500 text-xs mt-1 line-clamp-1">{role.skills.slice(0, 3).join(", ")}</p>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" className="py-14 sm:py-18">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">FAQ</h2>
            </div>
            <FAQAccordion items={FAQ_ITEMS} />
            <p className="mt-6 text-center text-sm text-stone-500">More questions? <Link href="/contact" className="text-amber-700 hover:text-amber-800 font-medium">Get in touch</Link></p>
          </div>
        </section>

        {/* ═══ SOCIAL PROOF BANNER ═══ */}
        <section className="py-10 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { num: "50K+", label: "Resumes created" },
                { num: "&#x20B9;5", label: "Per resume" },
                { num: "82", label: "Role presets (free)" },
                { num: "6", label: "Free tools included" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <p className="text-3xl sm:text-4xl font-bold" dangerouslySetInnerHTML={{ __html: s.num }} />
                  <p className="text-white/80 text-xs mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20 sm:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" aria-hidden />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative text-center">
            <motion.h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              &#x20B9;5. One resume. Real results.
            </motion.h2>
            <motion.p className="mt-3 text-stone-600 text-base max-w-lg mx-auto" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Free ATS scoring, skill analysis, bullet suggestions, and 82 role presets. Pay &#x20B9;5 only when you&apos;re ready for AI generation.
            </motion.p>
            <motion.div className="mt-4 flex -space-x-2 justify-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
              {TESTIMONIALS.slice(0, 6).map((t, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                  <Image src={t.image} alt="" width={36} height={36} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-800">50K+</span>
              </div>
            </motion.div>
            <motion.div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Link href="/create" className="relative inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5 btn-shine overflow-hidden">
                Create my resume &mdash; &#x20B9;5
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center rounded-xl border-2 border-stone-300 bg-white/80 px-8 py-4 text-base font-medium text-stone-700 hover:bg-stone-50 transition-all">
                See pricing
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
