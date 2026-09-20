import React from 'react';
import { BookOpen, CheckCircle2, ExternalLink, Globe } from 'lucide-react';
import type { Citation } from '../../types/contract';

export interface CitationCardProps {
  citation: Citation;
  className?: string;
}

function formatDocumentTitle(doc: string): string {
  if (!doc) return 'Statutory Provision';
  if (doc === 'local_corpus') return 'National Statutory Corpus';
  if (doc.includes('_')) {
    return doc
      .split('_')
      .map(w => {
        const lower = w.toLowerCase();
        if (lower === 'asuh') return 'ASU';
        if (lower === 'csir') return 'CSIR';
        if (lower === 'tkdl') return 'TKDL';
        if (lower === 'ppvfr') return 'PPV&FR';
        if (lower === 'cdsco') return 'CDSCO';
        if (lower === 'nba') return 'NBA';
        if (lower === 'sbb') return 'SBB';
        if (lower === 'ipr') return 'IPR';
        if (lower === 'wipo') return 'WIPO';
        if (lower === 'trips') return 'TRIPS';
        if (lower === 'fda') return 'US FDA';
        if (lower === 'ema') return 'EU EMA';
        if (lower === 'thmpd') return 'THMPD';
        if (lower === 'faq') return 'FAQ';
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ')
      .replace(/(\d{4})/g, '($1)');
  }
  return doc;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, className = '' }) => {
  const isWeb =
    citation.source_type === 'web' ||
    Boolean(citation.sourceUrl && citation.sourceUrl.startsWith('http') && !citation.sourceUrl.includes('local_corpus'));

  // Extract hostname if web URL is available
  let domain = '';
  if (citation.sourceUrl && citation.sourceUrl.startsWith('http')) {
    try {
      domain = new URL(citation.sourceUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = citation.sourceUrl;
    }
  }

  const displayTitle = isWeb ? citation.document : formatDocumentTitle(citation.document);

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all duration-200 shadow-warm-sm overflow-hidden ${
        isWeb
          ? 'border-sky-200/90 bg-sky-50/40 hover:border-sky-400 hover:bg-sky-50/70'
          : 'border-greige/80 bg-cream/30 hover:border-sage hover:bg-cream/50'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden" title={displayTitle}>
          {isWeb ? (
            <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          ) : (
            <BookOpen className="w-3.5 h-3.5 text-terracotta shrink-0" />
          )}
          <span className={`text-xs font-semibold tracking-tight truncate ${isWeb ? 'text-sky-950' : 'text-forest'}`}>
            {displayTitle}
          </span>
        </div>
        <div className="shrink-0 ml-1 whitespace-nowrap">
          {isWeb ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 bg-sky-100/95 border border-sky-300 px-2 py-0.5 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse shrink-0" />
              <span>Live Web</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2 py-0.5 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.4]" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>


      <div className={`text-[12px] font-medium mb-1 ${isWeb ? 'text-sky-800 font-mono text-[11px]' : 'text-terracotta'}`}>
        {isWeb && domain ? domain : citation.clauseLabel}
      </div>

      {citation.snippet && (
        <p className={`text-[12px] italic leading-relaxed line-clamp-3 pl-2 border-l-2 ${
          isWeb ? 'text-slate-700 border-sky-300/60' : 'text-forest-muted border-sage/40'
        }`}>
          {citation.snippet}
        </p>
      )}

      {citation.sourceUrl && citation.sourceUrl !== 'local_corpus' && (
        <a
          href={citation.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-[11px] font-medium hover:underline mt-2 pt-1 border-t w-full ${
            isWeb
              ? 'text-sky-700 border-sky-200/60 hover:text-sky-900'
              : 'text-terracotta border-greige/40'
          }`}
        >
          <span>{isWeb ? `Visit external source (${domain || 'web'})` : 'View statutory gazette / source'}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
};

