import {
  Scale,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { JurisdictionToggle } from './shared/JurisdictionToggle';

interface SourceItem {
  name: string;
  authority: string;
  scope: string;
  provisionsMonitored: string;
  lastUpdated: string;
  status: 'In Force' | 'Amended 2023' | 'Active';
}

const NATIONAL_SOURCES: SourceItem[] = [
  {
    name: 'Drugs and Cosmetics Act, 1940 & Rules 1945',
    authority: 'Ministry of Ayush / CDSCO',
    scope: 'Statutory definition of Ayurvedic drugs, licensing pathways (Rule 158B), Schedule T GMP standards.',
    provisionsMonitored: 'Sections 3(a), 3(h), 33EEB; Rules 153–158B; Schedule E(1), Schedule T.',
    lastUpdated: 'Gazette GSR 716(E) 2023',
    status: 'In Force',
  },
  {
    name: 'The Biological Diversity Act, 2002',
    authority: 'National Biodiversity Authority (NBA)',
    scope: 'Regulation of biological resources, Access & Benefit-Sharing (ABS), Form I/III clearances before IPR grant.',
    provisionsMonitored: 'Sections 3, 4, 6(1), 7, 19, 21; ABS Regulations 2014 & Amendment Rules 2024.',
    lastUpdated: 'Act No. 10 of 2023',
    status: 'Amended 2023',
  },
  {
    name: 'The Patents Act, 1970 (as amended)',
    authority: 'Controller General of Patents, Designs & Trademarks (CGPDTM)',
    scope: 'Non-patentability of traditional knowledge under Section 3(p) and mere admixtures under Section 3(e).',
    provisionsMonitored: 'Sections 2(1)(j), 3(d), 3(e), 3(p), 10(4), 48.',
    lastUpdated: 'Patents (Amendment) Rules 2024',
    status: 'In Force',
  },
  {
    name: 'First Schedule Authoritative Texts of Ayurveda',
    authority: 'Drugs & Cosmetics Act First Schedule',
    scope: '56 Codified classical treatises establishing prior art and shastriya formulations (Charaka, Sushruta, AFI).',
    provisionsMonitored: 'Ayurvedic Formulary of India (AFI) Parts I–III; Ayurvedic Pharmacopoeia of India (API).',
    lastUpdated: 'Monograph Edition 2022',
    status: 'Active',
  },
  {
    name: 'FSSAI (Ayurveda Aahar) Regulations, 2022',
    authority: 'Food Safety and Standards Authority of India',
    scope: 'Standards for food prepared in accordance with classical recipes without therapeutic disease claims.',
    provisionsMonitored: 'Regulations 1–11; Schedules A & B permitted recipes.',
    lastUpdated: 'Notification F. No. 1-116/FSSAI',
    status: 'In Force',
  },
];

const INTERNATIONAL_SOURCES: SourceItem[] = [
  {
    name: 'WIPO Treaty on IP, Genetic Resources & Traditional Knowledge (2024)',
    authority: 'World Intellectual Property Organization (Geneva)',
    scope: 'Mandatory patent disclosure of country of origin for genetic resources and associated traditional knowledge.',
    provisionsMonitored: 'Articles 3, 4, 5, 6.',
    lastUpdated: 'Diplomatic Conference May 2024',
    status: 'Active',
  },
  {
    name: 'Nagoya Protocol on Access & Benefit-Sharing',
    authority: 'Convention on Biological Diversity (CBD)',
    scope: 'International framework for fair and equitable sharing of benefits arising from biological genetic utilization.',
    provisionsMonitored: 'Articles 5, 6, 15, 16, 17.',
    lastUpdated: 'COP-MOP Decisions 2024',
    status: 'In Force',
  },
  {
    name: 'Patent Cooperation Treaty (PCT)',
    authority: 'WIPO / International Bureau',
    scope: 'Unified procedure for filing patent applications across 157 contracting countries.',
    provisionsMonitored: 'Rule 51bis (National Requirements regarding Genetic Resources).',
    lastUpdated: 'PCT Regulations 2024',
    status: 'Active',
  },
];

export default function SourcesView() {
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-greige/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta">
              Statutory Transparency & Verification
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Sources & Statutory Coverage
          </h1>
        </div>

        <JurisdictionToggle size="sm" />
      </div>

      {/* Trust Philosophy Statement */}
      <Card variant="cream" className="p-8 md:p-10 border-greige/80 shadow-warm-sm space-y-3">
        <div className="flex items-center gap-2 text-forest">
          <ShieldCheck className="w-5 h-5 text-terracotta" />
          <h2 className="font-serif text-xl font-bold">
            Zero-Hallucination Statutory Grounding
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-forest leading-relaxed max-w-3xl">
          VaidyaSetu is fundamentally engineered to prevent artificial intelligence hallucinations. Every response, classification, and action plan generated by our engine is grounded in codified statutory provisions, gazette notifications, and authoritative First Schedule classical treatises. If a statutory basis does not exist in law, our system refuses to invent it.
        </p>
      </Card>

      {/* Section 1: National Sources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-terracotta" />
          <h2 className="font-serif text-2xl font-bold text-forest">
            National Legal & Ayurvedic Sources (India)
          </h2>
        </div>

        <div className="space-y-3">
          {NATIONAL_SOURCES.map((src, i) => (
            <Card key={i} variant="off-white" className="p-6 border-greige/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-base font-bold text-forest">
                    {src.name}
                  </h3>
                  <p className="text-xs text-terracotta font-medium">{src.authority}</p>
                </div>
                <Badge variant="forest" size="sm">
                  {src.status}
                </Badge>
              </div>

              <p className="text-xs text-forest-muted leading-relaxed">
                {src.scope}
              </p>

              <div className="pt-2 border-t border-greige/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-forest-muted">
                <span>Key Provisions: <strong className="text-forest">{src.provisionsMonitored}</strong></span>
                <span className="font-mono">Indexed: {src.lastUpdated}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 2: International Sources (Strictly Separated) */}
      <div className="space-y-4 pt-6 border-t border-greige/70">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-forest" />
          <h2 className="font-serif text-2xl font-bold text-forest">
            International Treaties & Conventions (Global)
          </h2>
        </div>
        <p className="text-xs text-forest-muted">
          Maintained strictly separate from domestic Indian law to ensure accurate international patent and export filings.
        </p>

        <div className="space-y-3">
          {INTERNATIONAL_SOURCES.map((src, i) => (
            <Card key={i} variant="off-white" className="p-6 border-greige/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-base font-bold text-forest">
                    {src.name}
                  </h3>
                  <p className="text-xs text-forest font-medium">{src.authority}</p>
                </div>
                <Badge variant="sage" size="sm">
                  {src.status}
                </Badge>
              </div>

              <p className="text-xs text-forest-muted leading-relaxed">
                {src.scope}
              </p>

              <div className="pt-2 border-t border-greige/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-forest-muted">
                <span>Key Provisions: <strong className="text-forest">{src.provisionsMonitored}</strong></span>
                <span className="font-mono">Indexed: {src.lastUpdated}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
