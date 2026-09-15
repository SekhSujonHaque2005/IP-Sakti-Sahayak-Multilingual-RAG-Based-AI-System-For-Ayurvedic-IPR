import { Link } from 'react-router-dom';
import { ShieldCheck, Search, FileText, ArrowRight } from 'lucide-react';

export default function LandingView() {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-32 space-y-32">
      
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-spring fill-mode-both">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-xs font-medium tracking-[0.2em] uppercase text-white/60 mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-500 mr-2 animate-pulse"></span>
          Strict Legal AI
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white leading-[1.1]">
          Zero Hallucination. <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Absolute Compliance.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
          VaidyaSetu verifies every Ayurvedic claim against the raw text of the Drugs & Cosmetics Act and Biological Diversity Act.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          {/* Magnetic Nested CTA */}
          <Link to="/wizard" className="group relative flex items-center justify-between px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 active:scale-[0.98] transition-all duration-500 ease-spring">
            <span className="mr-6">Classify Formulation</span>
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 group-hover:scale-105 transition-transform duration-500 ease-spring">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
          <Link to="/chat" className="group relative flex items-center justify-between px-6 py-3 rounded-full bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-500 ease-spring">
            <span className="mr-6">Legal Assistant</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:scale-105 transition-transform duration-500 ease-spring">
              <Search className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 ease-spring fill-mode-both">
        {/* Bento Cell 1 (Large) */}
        <div className="md:col-span-8 p-1.5 rounded-[2.5rem] bg-white/5 ring-1 ring-white/10">
          <div className="h-full bg-black/40 rounded-[calc(2.5rem-0.375rem)] p-10 flex flex-col justify-end shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-6 ring-1 ring-brand-500/30">
              <ShieldCheck className="w-6 h-6 text-brand-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">Source-Verified Generation</h3>
            <p className="text-white/50 leading-relaxed max-w-md">Every claim is independently cross-verified against the raw legal corpus. If it isn't in the act, the AI refuses to invent it.</p>
          </div>
        </div>

        {/* Bento Cell 2 (Tall) */}
        <div className="md:col-span-4 p-1.5 rounded-[2.5rem] bg-white/5 ring-1 ring-white/10">
          <div className="h-full bg-black/40 rounded-[calc(2.5rem-0.375rem)] p-10 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 ring-1 ring-indigo-500/30">
              <Search className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2 tracking-tight">Hybrid Retrieval</h3>
              <p className="text-white/50 leading-relaxed text-sm">Dense embeddings plus BM25 sparse search for pinpoint accuracy on archaic legal terminology.</p>
            </div>
          </div>
        </div>

        {/* Bento Cell 3 (Wide) */}
        <div className="md:col-span-12 p-1.5 rounded-[2.5rem] bg-white/5 ring-1 ring-white/10">
          <div className="h-full bg-black/40 rounded-[calc(2.5rem-0.375rem)] p-10 flex flex-col md:flex-row items-start md:items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
             <div className="max-w-xl">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                  <FileText className="w-6 h-6 text-white/70" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">Supersession Graph Architecture</h3>
                <p className="text-white/50 leading-relaxed">Automatically traces old laws to their currently enforced versions, guaranteeing compliance with the latest gazette notifications.</p>
             </div>
             <div className="mt-8 md:mt-0 opacity-50 grayscale mix-blend-screen">
                {/* Abstract geometric representation of a graph */}
                <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 60 L80 20 L140 60 L180 40" stroke="white" strokeWidth="1" strokeDasharray="4 4"/>
                  <circle cx="20" cy="60" r="4" fill="white"/>
                  <circle cx="80" cy="20" r="6" fill="white"/>
                  <circle cx="140" cy="60" r="8" fill="white"/>
                  <circle cx="180" cy="40" r="4" fill="white"/>
                  <path d="M80 20 L80 100" stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
                  <circle cx="80" cy="100" r="3" fill="white" opacity="0.5"/>
                </svg>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
