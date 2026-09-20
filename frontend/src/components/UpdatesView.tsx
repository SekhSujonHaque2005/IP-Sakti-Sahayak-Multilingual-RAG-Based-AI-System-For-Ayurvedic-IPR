import { Link } from 'react-router-dom';
import {
  Calendar,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { REGULATORY_UPDATES } from '../mocks/fixtures';

export default function UpdatesView() {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-greige/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta">
              Statutory Gazette Monitoring
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Regulatory & Legal Updates
          </h1>
          <p className="text-xs sm:text-sm text-forest-muted">
            Continuous tracking of Ayush gazette notifications, FSSAI amendments, and NBA biodiversity rulings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-forest-muted">
            Monitored Sources: <strong className="text-forest">NBA, Ayush, FSSAI, WIPO</strong>
          </span>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-6">
        {REGULATORY_UPDATES.map(upd => {

          return (
            <Card
              key={upd.id}
              variant="cream"
              className="p-6 md:p-8 space-y-4 border-greige/80 shadow-warm-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="terracotta" size="sm">
                    {upd.sourceBadge}
                  </Badge>
                  <span className="text-xs text-forest-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-muted" />
                    {upd.date}
                  </span>
                </div>

                {upd.fullTextUrl && (
                  <a
                    href={upd.fullTextUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-terracotta hover:underline flex items-center gap-1"
                  >
                    <span>View Gazette Notification</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h2 className="font-serif text-xl font-bold text-forest">
                {upd.title}
              </h2>

              <p className="text-xs sm:text-sm text-forest-muted leading-relaxed">
                {upd.summary}
              </p>

              {/* AI Analysis & Action */}
              <div className="pt-4 border-t border-greige/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-forest-muted text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Codified in verified legislative supersession knowledge base.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/assess"
                    className="font-medium text-forest hover:text-terracotta transition-colors"
                  >
                    Assess Formulation Impact →
                  </Link>
                  <Link
                    to="/ask"
                    className="font-semibold text-terracotta hover:underline"
                  >
                    Query Sahayak on This Gazette →
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
