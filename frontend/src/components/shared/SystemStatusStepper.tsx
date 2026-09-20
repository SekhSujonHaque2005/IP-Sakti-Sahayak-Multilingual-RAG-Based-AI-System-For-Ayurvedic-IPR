import { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Scale,
  Globe
} from 'lucide-react';

export interface StepInfo {
  title: string;
  description: string;
  delayMs: number;
}

export interface SystemStatusStepperProps {
  jurisdiction?: 'IN' | 'INTL';
  isComplete?: boolean;
  onFinished?: () => void;
  className?: string;
  collapsible?: boolean;
  initialCollapsed?: boolean;
}

const DEFAULT_STEPS: StepInfo[] = [
  {
    title: 'Context & Medical Boundary Detection',
    description: 'Verifying classical Ayurvedic boundaries and safety constraints',
    delayMs: 300,
  },
  {
    title: 'Statutory Jurisdiction Routing',
    description: 'Routing to domestic AYUSH / NBA framework or International WIPO treaties',
    delayMs: 900,
  },
  {
    title: 'Codified Legal Corpus Retrieval',
    description: 'Querying First Schedule treatises, D&C Act 1940, and BDA 2002 vector index',
    delayMs: 1600,
  },
  {
    title: 'Live Web & Gazette Grounding (Tavily)',
    description: 'Searching live CDSCO notifications, gazette updates & verified web sources',
    delayMs: 2500,
  },
  {
    title: 'Legislative Supersession Graph',
    description: 'Traversing statutory amendment nodes to verify active legal currency',
    delayMs: 3500,
  },
  {
    title: 'Citation Evidence Validation',
    description: 'Cross-verifying claims against primary legal clauses & live web references',
    delayMs: 4400,
  },
];

export const SystemStatusStepper: React.FC<SystemStatusStepperProps> = ({
  jurisdiction = 'IN',
  isComplete = false,
  onFinished,
  className = '',
  collapsible = true,
  initialCollapsed = false,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    if (isComplete) {
      if (onFinished) onFinished();
      return;
    }
    const startTime = Date.now();
    const timer = setInterval(() => {
      const diffSec = (Date.now() - startTime) / 1000;
      setElapsed(diffSec);
    }, 100);
    return () => clearInterval(timer);
  }, [isComplete, onFinished]);

  const getStepIcon = (index: number, state: 'done' | 'active' | 'pending') => {
    if (state === 'done') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.4]" />;
    }
    const icons = [Brain, Scale, Database, Globe, GitBranch, ShieldCheck];
    const IconComp = icons[index % icons.length];
    return <IconComp className={`w-3.5 h-3.5 ${state === 'active' ? 'text-terracotta animate-pulse' : 'text-forest-muted'}`} />;
  };

  return (
    <div className={`rounded-2xl border border-greige/80 bg-[#EDE4D3]/30 overflow-hidden shadow-warm-sm transition-all duration-300 ${className}`}>
      {/* Header bar */}
      <button
        type="button"
        onClick={() => collapsible && setCollapsed(!collapsed)}
        className="w-full px-4 py-3 flex items-center justify-between bg-cream/50 hover:bg-cream/70 transition-colors border-b border-greige/50 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-forest/10 text-forest">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            {!isComplete && (
              <span className="absolute inset-0 rounded-full bg-sage/30 animate-ping opacity-60" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-forest tracking-tight flex items-center gap-1.5">
              AI Statutory Reasoning Pipeline
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-forest/10 text-forest font-mono">
                <Clock className="w-2.5 h-2.5 mr-1" />
                {elapsed.toFixed(1)}s
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-forest-muted text-xs">
          <span className={`text-[11px] font-medium hidden sm:inline ${isComplete ? 'text-emerald-700 font-semibold' : ''}`}>
            {isComplete
              ? 'Reasoning verified'
              : elapsed > 4.5
              ? `Synthesizing & grounding live sources (${jurisdiction})...`
              : `Active analysis (${jurisdiction})...`}
          </span>
          {collapsible && (collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
        </div>
      </button>

      {/* Stepper Details */}
      {!collapsed && (
        <div className="p-4 space-y-3 bg-[#FAF7F2]/80">
          {DEFAULT_STEPS.map((step, idx) => {
            const stepSeconds = step.delayMs / 1000;
            const isLastStep = idx === DEFAULT_STEPS.length - 1;
            // The last step stays active until isComplete is true
            const isFinished = isComplete || (!isLastStep && elapsed > stepSeconds + 1.2);
            const isActive = !isFinished && elapsed >= stepSeconds;

            const state = isFinished ? 'done' : isActive ? 'active' : 'pending';

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-terracotta/5 border border-terracotta/20 translate-x-1'
                    : isFinished
                    ? 'opacity-100 bg-emerald-50/25'
                    : 'opacity-40'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 transition-all duration-300 ${
                    isFinished
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-300/80 ring-1 ring-emerald-500/20 shadow-2xs'
                      : isActive
                      ? 'bg-terracotta/15 text-terracotta ring-2 ring-terracotta/30'
                      : 'bg-greige/40 text-forest-muted'
                  }`}
                >
                  {getStepIcon(idx, state)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${isActive ? 'text-terracotta' : isFinished ? 'text-forest' : 'text-forest-muted'}`}>
                      {step.title}
                    </p>
                    {isActive && (
                      <span className="text-[10px] text-terracotta font-medium animate-pulse">
                        Evaluating...
                      </span>
                    )}
                    {isFinished && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-forest-muted leading-tight mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

