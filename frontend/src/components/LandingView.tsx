import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Scale,
  BookOpen,
  Globe2,
  CheckCircle2,
  Compass,
  Leaf
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useApp } from '../context/AppContext';

export default function LandingView() {
  const { setDemoMode } = useApp();

  return (
    <div className="flex flex-col items-center space-y-24 md:space-y-32 py-10 md:py-16">
      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto text-center space-y-8 px-4">

        {/* Brand Display Signature Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-forest leading-[1.08]">
          Traditional wisdom.{' '}
          <span className="font-serif italic font-normal text-terracotta block sm:inline">
            Regulatory precision.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-forest-muted max-w-3xl mx-auto font-normal leading-relaxed">
          The verifiable statutory AI platform helping Ayurvedic formulators, researchers, and enterprises navigate patentability, classical text citations, and Access-and-Benefit-Sharing (ABS) compliance with zero hallucination.
        </p>

        {/* Dual Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/assess">
            <Button
              size="lg"
              variant="primary"
              className="px-8 shadow-warm-md text-base"
              icon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Assess a Formulation
            </Button>
          </Link>

          <Link
            to="/home"
            onClick={() => setDemoMode(true)}
          >
            <Button
              size="lg"
              variant="outline"
              className="px-8 text-base bg-white/40"
              icon={<Compass className="w-4 h-4 mr-1 text-terracotta" />}
            >
              Explore Demo Experience
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-forest-muted">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Statutory Citations Verified
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            India & International Kept Distinct
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            CSIR-TKDL Prior Art Safeguards
          </span>
        </div>
      </section>

      {/* ── OUR PHILOSOPHY (Echoing Typography.jpeg) ────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="p-8 md:p-14 rounded-3xl bg-[#EDE4D3]/40 border border-greige/80 shadow-warm-sm text-center space-y-10">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-forest-muted">
              — OUR PHILOSOPHY —
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-forest">
              Ayurvedic wisdom.{' '}
              <span className="font-serif italic font-normal text-terracotta">
                Clinical precision.
              </span>
            </h2>
            <p className="text-forest-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Designed around authentic statutory requirements and botanical heritage — fewer ambiguities, verified clause-level citations, and complete legal defensibility for Indian medicine.
            </p>
          </div>

          {/* 4 Circular Cards Matching Typography.jpeg Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-greige flex items-center justify-center shadow-warm-md group hover:scale-105 transition-all">
                <BookOpen className="w-8 h-8 text-terracotta" strokeWidth={1.5} />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta/40" />
              <h3 className="font-serif text-base font-bold text-forest">
                Codified Classical Basis
              </h3>
              <p className="text-xs text-forest-muted leading-relaxed">
                Referenced strictly to First Schedule texts (Charaka, Sushruta, AFI monographs).
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-greige flex items-center justify-center shadow-warm-md group hover:scale-105 transition-all">
                <Scale className="w-8 h-8 text-terracotta" strokeWidth={1.5} />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta/40" />
              <h3 className="font-serif text-base font-bold text-forest">
                Section 3(p) IP Defense
              </h3>
              <p className="text-xs text-forest-muted leading-relaxed">
                Clear distinction between non-patentable traditional knowledge and patentable synergy.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-greige flex items-center justify-center shadow-warm-md group hover:scale-105 transition-all">
                <Leaf className="w-8 h-8 text-terracotta" strokeWidth={1.5} />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta/40" />
              <h3 className="font-serif text-base font-bold text-forest">
                Biodiversity & ABS
              </h3>
              <p className="text-xs text-forest-muted leading-relaxed">
                Proactive compliance for Biological Diversity Act 2002 and Nagoya Protocol filings.
              </p>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-greige flex items-center justify-center shadow-warm-md group hover:scale-105 transition-all">
                <Globe2 className="w-8 h-8 text-terracotta" strokeWidth={1.5} />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta/40" />
              <h3 className="font-serif text-base font-bold text-forest">
                Global Treaty Mapping
              </h3>
              <p className="text-xs text-forest-muted leading-relaxed">
                Multi-jurisdiction analysis for PCT, Madrid Protocol, and international export routes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP PRODUCT FLOW ────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-forest-muted">
            — THE WORKFLOW —
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Three steps from formulation to verified compliance
          </h2>
          <p className="text-forest-muted text-sm max-w-xl mx-auto">
            A structured path designed to eliminate regulatory uncertainty and legal rejection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 Card */}
          <Card variant="cream" className="relative p-8 space-y-4">
            <div className="w-10 h-10 rounded-full bg-terracotta text-white font-serif font-bold text-lg flex items-center justify-center shadow-warm-sm">
              1
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">
              Describe Your Formulation
            </h3>
            <p className="text-xs text-forest-muted leading-relaxed">
              Enter your botanical components, classical vs proprietary processes, intended claims, and Schedule E poisonous substance checks.
            </p>
            <div className="text-[11px] font-semibold text-terracotta pt-2">
              Intake & Validation →
            </div>
          </Card>

          {/* Step 2 Card */}
          <Card variant="cream" className="relative p-8 space-y-4">
            <div className="w-10 h-10 rounded-full bg-forest text-white font-serif font-bold text-lg flex items-center justify-center shadow-warm-sm">
              2
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">
              AI Classification & Mapping
            </h3>
            <p className="text-xs text-forest-muted leading-relaxed">
              Our statutory engine classifies into 1 of 6 official Ayush categories and evaluates patentability, TKDL prior art, and ABS obligations.
            </p>
            <div className="text-[11px] font-semibold text-forest pt-2">
              Supersession Graph & RAG →
            </div>
          </Card>

          {/* Step 3 Card */}
          <Card variant="cream" className="relative p-8 space-y-4">
            <div className="w-10 h-10 rounded-full bg-sage-600 text-white font-serif font-bold text-lg flex items-center justify-center shadow-warm-sm">
              3
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">
              Action Plan & Expert Brief
            </h3>
            <p className="text-xs text-forest-muted leading-relaxed">
              Receive a step-by-step checklist of statutory filings (Form 25D, Form I, Rule 158B) and exportable summary briefs for patent examiners.
            </p>
            <div className="text-[11px] font-semibold text-sage-600 pt-2">
              Actionable Case File →
            </div>
          </Card>
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4">
        <div className="p-10 md:p-14 rounded-3xl bg-forest text-[#FAF7F2] shadow-warm-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF7F2]">
              Ready to evaluate your formulation?
            </h2>
            <p className="text-cream/80 text-sm max-w-lg leading-relaxed">
              Start an interactive product assessment or consult with Ask Sahayak to review statutory gazettes and patent rules.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/assess">
              <Button size="lg" variant="primary" className="px-8 shadow-warm-sm">
                Start Assessment
              </Button>
            </Link>
            <Link to="/ask">
              <Button size="lg" variant="outline" className="px-8 border-cream/40 text-cream hover:bg-white/10">
                Ask Sahayak
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
