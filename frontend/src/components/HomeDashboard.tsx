import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Scale,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';
import { REGULATORY_UPDATES } from '../mocks/fixtures';

export default function HomeDashboard() {
  const { profile, demoMode } = useApp();

  return (
    <div className="space-y-12 md:space-y-16 pt-4 pb-12 max-w-6xl mx-auto px-4">
      {/* ── WELCOME HERO ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-greige/60 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Ayurvedic Regulatory Command Center
            </span>
            {demoMode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta/15 text-terracotta">
                Demo Workspace
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-forest">
            Welcome back,{' '}
            <span className="font-serif italic font-normal text-terracotta">
              {profile.name}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-forest-muted max-w-2xl">
            Active Profile: <span className="font-medium text-forest">{profile.userType}</span> • Language: <span className="font-medium text-forest">{profile.language}</span> • Guidance: <span className="font-medium text-forest capitalize">{profile.guidancePreference}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/assess">
            <Button size="md" variant="primary" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* ── DUAL PRIMARY ENTRY TILES (WITH SHADER GLOW) ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

            <Link to="/ask" className="group block">
          <div className="h-full p-8 rounded-3xl shader-card transition-all duration-300 group-hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between space-y-6">
            {/* Glowing Corner Shader Bloom */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-forest/20 via-forest/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#EDE4D3]/60 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/25 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-all duration-300 shadow-warm-sm group-hover:scale-105">
                <MessageSquare className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest group-hover:text-forest transition-colors">
                Ask Sahayak
              </h2>
              <p className="text-xs sm:text-sm text-forest-muted leading-relaxed">
                Query our conversational AI engine connected to codified gazettes, First Schedule treatises, and the legislative supersession graph with clause-level verification.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-greige/50 flex items-center justify-between text-xs font-semibold text-forest">
              <span>Open Conversational Legal Assistant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>
        {/* Tile 1: Assess a Product */}
        <Link to="/assess" className="group block">
          <div className="h-full p-8 rounded-3xl shader-card transition-all duration-300 group-hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between space-y-6">
            {/* Glowing Corner Shader Bloom */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-terracotta/20 via-terracotta/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#EDE4D3]/60 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-terracotta/10 border border-terracotta/25 flex items-center justify-center text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-300 shadow-warm-sm group-hover:scale-105">
                <ClipboardList className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest group-hover:text-terracotta transition-colors">
                Assess a Product
              </h2>
              <p className="text-xs sm:text-sm text-forest-muted leading-relaxed">
                Submit botanical components, classical references, and manufacturing method to determine 1 of 6 Ayush regulatory classifications, Section 3(p) patent eligibility, and ABS requirements.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-greige/50 flex items-center justify-between text-xs font-semibold text-terracotta">
              <span>Start 3-Stage Intake & Classification</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Tile 2: Ask Sahayak */}
        
      </div>

      {/* ── STATUTORY LEGAL INTELLIGENCE PILLARS (4 CORE DOMAINS) ────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Statutory Intelligence & Regulatory Scope
            </h3>
            <p className="text-xs text-forest-muted">
              Codified national statutes, AYUSH licensing rules, and international IP treaties verified by VaidyaSetu.
            </p>
          </div>
          <Link
            to="/regulatory-map"
            className="text-xs font-semibold text-terracotta hover:underline flex items-center gap-1"
          >
            <span>Explore Regulatory Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/ask" className="group block h-full">
            <div className="h-full p-5 rounded-2xl shader-card border border-white/90 hover:border-terracotta/40 transition-all duration-300 group-hover:-translate-y-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center group-hover:bg-terracotta group-hover:text-white transition-colors">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-forest group-hover:text-terracotta transition-colors">
                  Section 3(p) & TKDL IP
                </h4>
                <p className="text-[11px] text-forest-muted leading-relaxed">
                  Patents Act 1970 traditional knowledge bar and synergistic bio-enhancement patentability tests.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-terracotta flex items-center gap-1 pt-2 border-t border-greige/40">
                Query in Sahayak →
              </span>
            </div>
          </Link>

          <Link to="/assess" className="group block h-full">
            <div className="h-full p-5 rounded-2xl shader-card border border-white/90 hover:border-forest/40 transition-all duration-300 group-hover:-translate-y-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-forest group-hover:text-forest transition-colors">
                  Rule 158B ASU Intake
                </h4>
                <p className="text-[11px] text-forest-muted leading-relaxed">
                  Automatic classification into Classical, Proprietary, Phytopharmaceutical, or Ayurveda Aahar.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-forest flex items-center gap-1 pt-2 border-t border-greige/40">
                Run Formulation Wizard →
              </span>
            </div>
          </Link>

          <Link to="/ask" className="group block h-full">
            <div className="h-full p-5 rounded-2xl shader-card border border-white/90 hover:border-terracotta/40 transition-all duration-300 group-hover:-translate-y-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center group-hover:bg-terracotta group-hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-forest group-hover:text-terracotta transition-colors">
                  Biodiversity Act (ABS)
                </h4>
                <p className="text-[11px] text-forest-muted leading-relaxed">
                  National Biodiversity Authority Form I/III approval and Section 3/6 commercial access mandates.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-terracotta flex items-center gap-1 pt-2 border-t border-greige/40">
                Check ABS Rules →
              </span>
            </div>
          </Link>

          <Link to="/regulatory-map" className="group block h-full">
            <div className="h-full p-5 rounded-2xl shader-card border border-white/90 hover:border-forest/40 transition-all duration-300 group-hover:-translate-y-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-forest group-hover:text-forest transition-colors">
                  International Regimes
                </h4>
                <p className="text-[11px] text-forest-muted leading-relaxed">
                  WIPO 2024 GRATK Treaty, TRIPS Article 27, and CBD Nagoya Protocol for cross-border export.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-forest flex items-center gap-1 pt-2 border-t border-greige/40">
                View Global Pathways →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── LIVE REGULATORY PULSE TICKER (WITH SHADER DEPTH) ─────────────── */}
      <div className="rounded-3xl p-6 shader-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terracotta"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-forest">
              Live Statutory Gazette & Regulatory Pulse
            </span>
          </div>
          <Link
            to="/updates"
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            All Updates →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {REGULATORY_UPDATES.slice(0, 2).map(upd => (
            <Link
              key={upd.id}
              to="/updates"
              className="p-4 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 hover:border-terracotta/30 transition-all shadow-xs hover:shadow-warm-sm block group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta px-2 py-0.5 rounded-full bg-terracotta/10">
                  {upd.sourceBadge}
                </span>
                <span className="text-[10px] text-forest-muted">{upd.date}</span>
              </div>
              <p className="text-xs font-semibold text-forest group-hover:text-terracotta transition-colors line-clamp-1">
                {upd.title}
              </p>
              <p className="text-[11px] text-forest-muted line-clamp-2 mt-1 leading-relaxed">
                {upd.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
