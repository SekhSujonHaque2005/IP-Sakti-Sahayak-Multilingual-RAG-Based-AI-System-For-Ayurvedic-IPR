import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF7F2] border-t border-greige/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-greige/70">
          {/* Col 1: Wordmark & Statement */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream border border-greige/80 flex items-center justify-center p-1.5 shadow-warm-sm">
                <img
                  src="/logo-dravya.png"
                  alt="VaidyaSetu Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-forest">
                Vaidya<span className="text-terracotta italic font-normal">Setu</span>
              </span>
            </div>

            <p className="font-serif text-lg text-forest italic leading-snug">
              "Traditional wisdom. <span className="text-terracotta font-normal">Regulatory precision.</span>"
            </p>

            <p className="text-sm text-forest-muted max-w-md leading-relaxed">
              VaidyaSetu bridges authentic classical Ayurvedic knowledge with codified national and international statutory frameworks. Built for Ayurvedic researchers, innovators, manufacturers, and patent attorneys.
            </p>

          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-forest">
              Core Modules
            </p>
            <ul className="space-y-2 text-xs text-forest-muted">
              <li>
                <Link to="/assess" className="hover:text-terracotta transition-colors">
                  Product Assessment & Classification
                </Link>
              </li>
              <li>
                <Link to="/ask" className="hover:text-terracotta transition-colors">
                  Ask Sahayak (Conversational Legal AI)
                </Link>
              </li>
              <li>
                <Link to="/regulatory-map" className="hover:text-terracotta transition-colors">
                  Interactive Regulatory Map
                </Link>
              </li>
              <li>
                <Link to="/updates" className="hover:text-terracotta transition-colors">
                  Gazette Updates & Amendments
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Statutory */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-forest">
              Statutory Coverage
            </p>
            <ul className="space-y-2 text-xs text-forest-muted">
              <li>
                <Link to="/sources" className="hover:text-terracotta transition-colors">
                  Drugs & Cosmetics Act 1940 (ASU Rules)
                </Link>
              </li>
              <li>
                <Link to="/sources" className="hover:text-terracotta transition-colors">
                  Biological Diversity Act 2002 & ABS Rules
                </Link>
              </li>
              <li>
                <Link to="/sources" className="hover:text-terracotta transition-colors">
                  Indian Patents Act 1970 (Section 3p & 3e)
                </Link>
              </li>
              <li>
                <Link to="/sources" className="hover:text-terracotta transition-colors">
                  CSIR Traditional Knowledge Digital Library (TKDL)
                </Link>
              </li>
              <li>
                <Link to="/sources" className="hover:text-terracotta transition-colors">
                  Nagoya Protocol & WIPO GRATK Treaty 2024
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-muted">
          <p>
            © 2026 VaidyaSetu. Developed for Ministry of Ayush & AIIA. Zero-hallucination statutory verification.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-cream px-3 py-1 rounded-full border border-greige/60">
              Statutory Intelligence Tool • Not Formal Legal Representation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
