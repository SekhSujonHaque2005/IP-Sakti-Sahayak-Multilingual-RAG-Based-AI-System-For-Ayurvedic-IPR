import { useState, useRef, useEffect } from 'react';
import {
  Send, User, Bot, Loader2, ShieldCheck, Globe2, MapPin,
  AlertTriangle, Brain, Sparkles, ChevronDown, ChevronRight,
  CheckCircle2, Clock, Database, Search, Cpu, Activity, GitBranch
} from 'lucide-react';
import { queryRAG } from '../api';

type SupersessionPath = {
  original: string;
  current: string;
  path: string[];
};

type ReasoningStep = {
  title: string;
  description: string;
  icon?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  confidence?: number;
  sources?: { title: string; snippet: string; url: string; source_type: string }[];
  disclaimer?: string;
  supersession_paths?: SupersessionPath[];
  reasoning_steps?: ReasoningStep[];
  latency_ms?: number;
};

function getStepIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('guardrail') || t.includes('privacy') || t.includes('safety')) return ShieldCheck;
  if (t.includes('intent') || t.includes('query')) return Search;
  if (t.includes('knowledge') || t.includes('retrieval') || t.includes('database') || t.includes('vector')) return Database;
  if (t.includes('supersession') || t.includes('currency') || t.includes('amendment')) return GitBranch;
  if (t.includes('synthesis') || t.includes('claim')) return Cpu;
  if (t.includes('verification') || t.includes('fact')) return CheckCircle2;
  if (t.includes('confidence')) return Activity;
  return Sparkles;
}

// ── Live Thinking Component (While Loading) ──────────────────────────
function LiveThinkingBox({ jurisdiction }: { jurisdiction: 'IN' | 'INTL' }) {
  const [elapsed, setElapsed] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 0.2);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: 'Input Guardrails & Privacy', desc: 'Validating medical boundaries and scrubbing sensitive PII', delay: 0 },
    { title: 'Intent & Jurisdiction Analysis', desc: `Classifying legal intent for ${jurisdiction === 'IN' ? 'Indian National Law (AYUSH / Patents / NBA)' : 'International Treaties (WIPO / Nagoya / TRIPS)'}`, delay: 1.2 },
    { title: 'Knowledge Base & Vector Search', desc: `Querying ${jurisdiction} Vector DB (FAISS dense + BM25 sparse index) and live web search`, delay: 2.8 },
    { title: 'Legislative Supersession Check', desc: 'Traversing statutory supersession graph to verify in-force amendments', delay: 4.8 },
    { title: 'Citation-Grounded Synthesis', desc: 'Generating structured factual claims strictly grounded in retrieved provisions', delay: 7.0 },
    { title: 'Parallel Claim Verification', desc: 'Fact-checking each extracted claim against cited statutory passages', delay: 9.5 },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-brand-500/20 overflow-hidden shadow-lg transition-all duration-300">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-brand-500/[0.05] hover:bg-brand-500/[0.08] transition-colors border-b border-white/5"
      >
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/20 text-brand-400">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            <span className="absolute inset-0 rounded-full bg-brand-400/20 animate-ping opacity-50" />
          </div>
          <span className="text-xs font-medium text-brand-300 tracking-wide flex items-center gap-1.5">
            Thinking & Reasoning Mode
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-brand-500/20 text-brand-300 font-mono">
              <Clock className="w-2.5 h-2.5 mr-1" />
              {elapsed.toFixed(1)}s
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-white/40 text-xs">
          <span className="text-[11px] font-mono">live reasoning</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Live Steps */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-black/30 backdrop-blur-sm">
          {steps.map((s, idx) => {
            const isCompleted = elapsed > s.delay + 1.2;
            const isCurrent = elapsed >= s.delay && !isCompleted;
            const isPending = elapsed < s.delay;

            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 transition-opacity duration-500 ${
                  isPending ? 'opacity-30' : isCurrent ? 'opacity-100' : 'opacity-70'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-white/90">{s.title}</span>
                    {isCurrent && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed font-light mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Completed Reasoning Dropdown Component ───────────────────────────
function CompletedReasoningDropdown({
  steps,
  latencyMs,
  jurisdiction,
}: {
  steps: ReasoningStep[];
  latencyMs?: number;
  jurisdiction: 'IN' | 'INTL';
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all duration-300">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left group"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Brain className="w-3 h-3" />
          </div>
          <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
            Reasoning Process ({steps.length} steps verified)
          </span>
          {latencyMs && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
              {(latencyMs / 1000).toFixed(1)}s
            </span>
          )}
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 hidden sm:inline">
            {jurisdiction === 'IN' ? 'Indian Law DB' : 'INTL Treaties DB'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-white/40 text-xs">
          <span className="text-[11px] hidden sm:inline">{isOpen ? 'Hide reasoning' : 'View DB reasoning'}</span>
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </button>

      {/* Dropdown Body */}
      {isOpen && (
        <div className="p-5 space-y-4 bg-black/40 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative border-l-2 border-brand-500/20 ml-2.5 pl-5 space-y-5">
            {steps.map((step, idx) => {
              const Icon = getStepIcon(step.title);
              return (
                <div key={idx} className="relative group">
                  {/* Step Bullet */}
                  <div className="absolute -left-[27px] top-0.5 w-5 h-5 rounded-full bg-[#050505] border border-brand-500/50 flex items-center justify-center text-[10px] font-mono text-brand-300 group-hover:border-brand-400 group-hover:scale-110 transition-all">
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <h4 className="text-xs font-semibold text-white/90 tracking-tight">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed font-light mt-1 pl-5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ChatView ────────────────────────────────────────────────────
export default function ChatView() {
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'IN' | 'INTL'>('IN');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! 🙏 I am **VaidyaSetu** — your AI assistant for Ayurveda IP & Regulatory guidance.\n\nAsk me about patents, biodiversity law, drug classifications, trademarks, and more. Use the jurisdiction toggle above to switch between Indian and International law.\n\nEvery claim I make is verified against official statutory legal texts with transparent step-by-step reasoning.',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '', loading: true };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      const data = await queryRAG(currentQuery, jurisdiction);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? {
              ...m,
              loading: false,
              content: data.answer || 'No answer was returned.',
              confidence: data.confidence,
              sources: data.sources,
              disclaimer: data.disclaimer,
              supersession_paths: data.supersession_paths,
              reasoning_steps: data.reasoning_steps,
              latency_ms: data.latency_ms,
            }
          : m
      ));
    } catch (error: any) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, loading: false, content: `Error: ${error.message}. Is the backend running on localhost:8000?` }
          : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (c: number) => {
    if (c >= 0.7) return 'text-emerald-400';
    if (c >= 0.4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (c: number) => {
    if (c >= 0.7) return 'High';
    if (c >= 0.4) return 'Medium';
    if (c > 0) return 'Low';
    return 'N/A';
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col p-1.5 rounded-[2.5rem] bg-white/5 ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-spring">
      <div className="flex-1 flex flex-col bg-[#050505] rounded-[calc(2.5rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-medium text-white tracking-tight flex items-center gap-2">
              <span>VaidyaSetu Legal Assistant</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono uppercase tracking-wider">
                <Brain className="w-3 h-3" /> Thinking Mode
              </span>
            </h2>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-[0.1em]">
              Hybrid Retrieval · Citation Verification · {jurisdiction === 'IN' ? 'Indian Law' : 'International Law'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Jurisdiction Toggle */}
            <div className="flex items-center bg-white/5 rounded-full p-1 ring-1 ring-white/10">
              <button
                onClick={() => setJurisdiction('IN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  jurisdiction === 'IN'
                    ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/40'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <MapPin className="w-3 h-3" /> India
              </button>
              <button
                onClick={() => setJurisdiction('INTL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  jurisdiction === 'INTL'
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Globe2 className="w-3 h-3" /> International
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center ring-1 ring-brand-500/30">
              <ShieldCheck className="text-brand-400 w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 ease-spring`}>
              <div className={`flex items-end max-w-[85%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ring-1 ${msg.role === 'user' ? 'bg-white/10 ring-white/20' : 'bg-brand-500/10 ring-brand-500/30'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white/70" strokeWidth={1.5} /> : <Bot className="w-5 h-5 text-brand-400" strokeWidth={1.5} />}
                </div>

                <div className={`p-1.5 rounded-[2rem] ${msg.role === 'user' ? 'bg-white/10 ring-1 ring-white/20 rounded-br-none' : 'bg-white/5 ring-1 ring-white/10 rounded-bl-none'}`}>
                  <div className={`p-6 rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${msg.role === 'user' ? 'bg-white/5 text-white' : 'bg-black/40 text-white/90'}`}>
                    
                    {/* Live Thinking Mode Dropdown while Loading */}
                    {msg.loading && (
                      <LiveThinkingBox jurisdiction={jurisdiction} />
                    )}

                    {/* Completed Reasoning Dropdown */}
                    {!msg.loading && msg.reasoning_steps && msg.reasoning_steps.length > 0 && (
                      <CompletedReasoningDropdown
                        steps={msg.reasoning_steps}
                        latencyMs={msg.latency_ms}
                        jurisdiction={jurisdiction}
                      />
                    )}

                    {/* Main Synthesized Answer */}
                    {!msg.loading && (
                      <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap font-light leading-relaxed">
                        {msg.content}
                      </div>
                    )}

                    {/* Supersession Alerts */}
                    {msg.supersession_paths && msg.supersession_paths.length > 0 && !msg.loading && (
                      <div className="mt-4 space-y-2">
                        {msg.supersession_paths.map((sp, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 text-xs text-amber-300/80">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                            <span>
                              <strong>{sp.original}</strong> has been superseded by <strong>{sp.current}</strong>
                              {sp.path.length > 2 && <span className="text-white/40"> (via {sp.path.slice(1, -1).join(' → ')})</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Confidence Badge */}
                    {msg.confidence !== undefined && !msg.loading && (
                      <div className="mt-4 flex items-center space-x-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Confidence</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(msg.confidence)}`}>
                          {(msg.confidence * 100).toFixed(0)}% — {getConfidenceLabel(msg.confidence)}
                        </span>
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && !msg.loading && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-2" /> Verified Sources
                        </p>
                        <ul className="space-y-2">
                          {msg.sources.map((src, idx) => (
                            <li key={idx} className="text-xs text-white/60 truncate flex items-center">
                              <span className={`w-1.5 h-1.5 rounded-full mr-3 shrink-0 ${src.source_type === 'corpus' ? 'bg-brand-500' : src.source_type === 'trusted' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                              <span className="truncate">{src.title}</span>
                              <span className="ml-2 text-white/30 text-[10px] shrink-0">({src.source_type})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Legal Disclaimer */}
                    {msg.disclaimer && !msg.loading && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] text-white/30 leading-relaxed">{msg.disclaimer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              className="w-full pl-6 pr-16 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all font-light"
              placeholder={jurisdiction === 'IN' ? 'Ask about Indian Ayurveda regulations, Patents, Biodiversity Act...' : 'Ask about WIPO, TRIPS, CBD, Nagoya Protocol, international treaties...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:hover:bg-brand-500 text-black rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
