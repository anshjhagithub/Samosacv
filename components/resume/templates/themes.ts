/**
 * Theme config for resume templates. Keys are Tailwind class names for accent/header.
 */
export interface ResumeTheme {
  /** Section heading and link color (e.g. "text-teal-700") */
  accent: string;
  /** Link hover (e.g. "text-teal-600") */
  accentLink: string;
  /** Header bottom border (e.g. "border-teal-600") */
  headerBorder: string;
  /** Sidebar background for two-column (e.g. "bg-slate-800") */
  sidebarBg?: string;
  /** Sidebar text (e.g. "text-white") */
  sidebarText?: string;
  /** Use two-column layout with sidebar */
  twoColumn?: boolean;
  /** Smaller, denser text */
  compact?: boolean;
  /** Serif font for headings */
  serif?: boolean;
}

export const RESUME_THEMES: Record<string, ResumeTheme> = {
  minimal: {
    accent: "text-gray-700",
    accentLink: "text-gray-600",
    headerBorder: "border-gray-400",
  },
  professional: {
    accent: "text-slate-700",
    accentLink: "text-slate-600",
    headerBorder: "border-slate-600",
  },
  executive: {
    accent: "text-gray-800",
    accentLink: "text-gray-700",
    headerBorder: "border-gray-800",
    twoColumn: true,
    sidebarBg: "bg-gray-800",
    sidebarText: "text-white",
  },
  creative: {
    accent: "text-violet-700",
    accentLink: "text-violet-600",
    headerBorder: "border-violet-500",
    twoColumn: true,
    sidebarBg: "bg-violet-700",
    sidebarText: "text-white",
  },
  compact: {
    accent: "text-blue-700",
    accentLink: "text-blue-600",
    headerBorder: "border-blue-600",
    compact: true,
  },
  elegant: {
    accent: "text-amber-800",
    accentLink: "text-amber-700",
    headerBorder: "border-amber-700",
    serif: true,
  },
  tech: {
    accent: "text-emerald-700",
    accentLink: "text-emerald-600",
    headerBorder: "border-emerald-600",
  },
  academic: {
    accent: "text-neutral-800",
    accentLink: "text-neutral-600",
    headerBorder: "border-neutral-700",
    serif: true,
  },
  simple: {
    accent: "text-gray-600",
    accentLink: "text-gray-500",
    headerBorder: "border-gray-300",
  },
  bold: {
    accent: "text-gray-900",
    accentLink: "text-gray-800",
    headerBorder: "border-2 border-gray-900",
  },
  clean: {
    accent: "text-sky-600",
    accentLink: "text-sky-500",
    headerBorder: "border-sky-500",
  },
  contemporary: {
    accent: "text-rose-600",
    accentLink: "text-rose-500",
    headerBorder: "border-rose-500",
  },
  twoColumn: {
    accent: "text-indigo-700",
    accentLink: "text-indigo-600",
    headerBorder: "border-indigo-600",
    twoColumn: true,
    sidebarBg: "bg-indigo-800",
    sidebarText: "text-white",
  },
  serif: {
    accent: "text-stone-700",
    accentLink: "text-stone-600",
    headerBorder: "border-stone-600",
    serif: true,
  },
  minimalist: {
    accent: "text-zinc-600",
    accentLink: "text-zinc-500",
    headerBorder: "border-zinc-400",
    compact: true,
  },
  ivyLeague: {
    accent: "text-stone-700",
    accentLink: "text-stone-600",
    headerBorder: "border-stone-600",
    serif: true,
  },
  singleColumn: {
    accent: "text-gray-700",
    accentLink: "text-gray-600",
    headerBorder: "border-gray-500",
  },
  doubleColumn: {
    accent: "text-slate-700",
    accentLink: "text-slate-600",
    headerBorder: "border-slate-600",
    twoColumn: true,
    sidebarBg: "bg-slate-700",
    sidebarText: "text-white",
  },
  slate: {
    accent: "text-slate-600",
    accentLink: "text-slate-500",
    headerBorder: "border-slate-500",
  },
  coral: {
    accent: "text-rose-700",
    accentLink: "text-rose-600",
    headerBorder: "border-rose-500",
  },
  forest: {
    accent: "text-green-800",
    accentLink: "text-green-700",
    headerBorder: "border-green-700",
  },
  navy: {
    accent: "text-blue-900",
    accentLink: "text-blue-800",
    headerBorder: "border-blue-900",
    twoColumn: true,
    sidebarBg: "bg-blue-900",
    sidebarText: "text-white",
  },
  mint: {
    accent: "text-emerald-600",
    accentLink: "text-emerald-500",
    headerBorder: "border-emerald-500",
  },
  warm: {
    accent: "text-amber-700",
    accentLink: "text-amber-600",
    headerBorder: "border-amber-600",
  },
  cool: {
    accent: "text-cyan-700",
    accentLink: "text-cyan-600",
    headerBorder: "border-cyan-500",
  },
  crisp: {
    accent: "text-gray-700",
    accentLink: "text-gray-600",
    headerBorder: "border-gray-400",
    compact: true,
  },
  refined: {
    accent: "text-neutral-700",
    accentLink: "text-neutral-600",
    headerBorder: "border-neutral-500",
    serif: true,
  },
  standout: {
    accent: "text-fuchsia-700",
    accentLink: "text-fuchsia-600",
    headerBorder: "border-fuchsia-500",
  },
  corporate: {
    accent: "text-blue-800",
    accentLink: "text-blue-700",
    headerBorder: "border-blue-800",
  },
  startup: {
    accent: "text-violet-600",
    accentLink: "text-violet-500",
    headerBorder: "border-violet-500",
  },
  creativePro: {
    accent: "text-pink-600",
    accentLink: "text-pink-500",
    headerBorder: "border-pink-500",
    twoColumn: true,
    sidebarBg: "bg-pink-700",
    sidebarText: "text-white",
  },
  minimalPro: {
    accent: "text-slate-600",
    accentLink: "text-slate-500",
    headerBorder: "border-slate-400",
    compact: true,
  },
  euro: {
    accent: "text-gray-800",
    accentLink: "text-gray-700",
    headerBorder: "border-gray-600",
    serif: true,
  },
  americano: {
    accent: "text-red-700",
    accentLink: "text-red-600",
    headerBorder: "border-red-600",
  },
};
