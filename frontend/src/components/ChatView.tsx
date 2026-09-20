import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  User,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  GitBranch,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  Scale,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  Clock,
  MessageSquare,
  ShieldCheck,
  Globe,
  Languages,
  Mic,
  MicOff
} from 'lucide-react';
import { Button } from './ui/Button';
import { SystemStatusStepper } from './shared/SystemStatusStepper';
import { CitationCard } from './shared/CitationCard';
import { ConfidenceIndicator } from './shared/ConfidenceIndicator';
import { JurisdictionToggle } from './shared/JurisdictionToggle';
import { useApp } from '../context/AppContext';
import { queryRAG } from '../api';
import type { Citation, SupersessionPath } from '../types/contract';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  supersession_paths?: SupersessionPath[];
  confidence?: { score: number; level: 'high' | 'medium' | 'low' };
  isAbstain?: boolean;
  missingGaps?: string[];
  feedbackGiven?: 'up' | 'down' | null;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  category: string;
  jurisdiction: 'IN' | 'INTL';
  updatedAt: string;
  timeGroup: 'Today' | 'Yesterday' | 'Previous 7 Days';
  messages: ChatMessage[];
}

// Language code → display info
const LANGUAGE_OPTIONS: { code: string; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

// Map profile language to API code
function profileLanguageToCode(profileLang: string): string {
  const map: Record<string, string> = {
    'English': 'en',
    'Hindi': 'hi',
    'Sanskrit': 'sa',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Bengali': 'bn',
  };
  return map[profileLang] || 'en';
}

// BCP-47 speech recognition locales
const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  sa: 'hi-IN', // Sanskrit speech recognition maps phonetically to Devanagari
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};

const SUGGESTED_TILES_IN = [
  {
    category: 'Section 3(p) Patentability',
    icon: <Scale className="w-4 h-4 text-terracotta" />,
    title: 'Ashwagandha Liposome Patentability',
    query: 'Can I patent an Ashwagandha formulation with nano-liposomes under Section 3(p)?',
    desc: 'Verify TKDL prior art overlap and synergistic bio-enhancement requirements under Indian law.',
  },
  {
    category: 'ASU Licensing & Rule 158B',
    icon: <FileCheck2 className="w-4 h-4 text-forest" />,
    title: 'Rule 158B Evidence Checklist',
    query: 'What are the Rule 158B licensing requirements for classical ASU medicines vs proprietary?',
    desc: 'Literature citations, Schedule T GMP, and pilot clinical study protocols.',
  },
  {
    category: 'Biological Diversity Act (ABS)',
    icon: <BookOpen className="w-4 h-4 text-terracotta" />,
    title: 'NBA Approval & Form I Rules',
    query: 'Does an Indian company need prior NBA approval before exporting Triphala formulation?',
    desc: 'Section 3 commercial intimation vs Section 6 IPR mandates.',
  },
  {
    category: 'Drug Classification Rules',
    icon: <HelpCircle className="w-4 h-4 text-forest" />,
    title: 'Phytopharmaceutical vs ASU Drug',
    query: 'What is the difference between Phytopharmaceutical and Proprietary Ayurvedic drug?',
    desc: 'CDSCO Schedule Y vs AYUSH Rule 158B regulatory pathways.',
  },
];

const SUGGESTED_TILES_INTL = [
  {
    category: 'WIPO & TRIPS Art. 27',
    icon: <Globe className="w-4 h-4 text-terracotta" />,
    title: 'Traditional Knowledge Patent Bar',
    query: 'How does WIPO and TRIPS Article 27 treat patents based on Ayurvedic genetic resources?',
    desc: 'Mandatory disclosure of origin, prior art search, and defensive TKDL protection.',
  },
  {
    category: 'CBD Nagoya Protocol (ABS)',
    icon: <ShieldCheck className="w-4 h-4 text-forest" />,
    title: 'International Access & Benefit-Sharing',
    query: 'What are the Nagoya Protocol ABS requirements for exporting herbal formulations to the EU/US?',
    desc: 'Prior Informed Consent (PIC), Mutually Agreed Terms (MAT), and fair benefit sharing.',
  },
  {
    category: 'US FDA Botanical Guidance',
    icon: <FileCheck2 className="w-4 h-4 text-terracotta" />,
    title: 'FDA Botanical IND vs Dietary Supplement',
    query: 'What are the US FDA requirements for botanical drug approval under 21 CFR 312?',
    desc: 'Batch-to-batch chemical fingerprint consistency, NDIN notification, and Phase 1-3 trials.',
  },
  {
    category: 'EU EMA THMPD Directive',
    icon: <BookOpen className="w-4 h-4 text-forest" />,
    title: 'EU Directive 2004/24/EC Compliance',
    query: 'What evidence is needed for EU Traditional Herbal Medicinal Product (THMPD) registration?',
    desc: '30-year traditional medicinal use documentation (including 15 years in the EU).',
  },
];


export default function ChatView() {
  const { jurisdiction, setJurisdiction, language: globalLanguage, setLanguage: setGlobalLanguage, profile } = useApp();

  const activeLanguage = globalLanguage || profile?.language || 'English';
  // Derive language code from active profile/global language
  const [langCode, setLangCode] = useState(() => profileLanguageToCode(activeLanguage));

  // Keep langCode synchronized whenever globalLanguage or profile.language updates
  useEffect(() => {
    const code = profileLanguageToCode(globalLanguage || profile?.language || 'English');
    setLangCode(code);
  }, [globalLanguage, profile?.language]);

  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Start with empty sessions — no mock data
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle voice speech recognition
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setFeedbackToast('Voice speech recognition requires Chrome or Edge browser.');
      setTimeout(() => setFeedbackToast(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_MAP[langCode] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setFeedbackToast('Microphone access blocked. Please enable microphone permission in your browser.');
          setTimeout(() => setFeedbackToast(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const activeSession =
    sessions.find(s => s.id === activeSessionId) || null;

  // Auto-create first session on mount
  useEffect(() => {
    if (sessions.length === 0) {
      handleCreateNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled scroll to bottom of internal chat pane
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isProcessing]);

  // Create brand new chat session
  const handleCreateNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Regulatory Inquiry',
      category: jurisdiction === 'IN' ? 'India ASU' : 'International',
      jurisdiction,
      updatedAt: 'Just now',
      timeGroup: 'Today',
      messages: [],
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Delete chat session
  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length > 0 && activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveSessionId(null);
      }
      return filtered;
    });
  };

  // Send message — ALL responses come from the real backend
  const handleSend = async (queryText?: string) => {
    const text = queryText || inputValue;
    if (!text.trim() || isProcessing || !activeSession) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session title if it's the first query
    const isFirstUserQuery = activeSession.messages.filter(m => m.role === 'user').length === 0;
    const derivedTitle = isFirstUserQuery
      ? text.length > 34 ? text.slice(0, 32) + '...' : text
      : activeSession.title;

    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              title: derivedTitle,
              updatedAt: 'Just now',
              messages: [...s.messages, userMessage],
            }
          : s
      )
    );

    setInputValue('');
    setIsProcessing(true);

    try {
      // Call real backend with jurisdiction + language
      const result = await queryRAG(text, jurisdiction, langCode);

      // Build citations from real backend sources
      let citations: Citation[] = [];
      if (result.sources && Array.isArray(result.sources)) {
        citations = result.sources.map((s: any, idx: number) => ({
          sourceId: `src-${idx}`,
          document: s.title || 'Statutory Gazette / Document',
          clauseLabel: s.source_type === 'web' ? 'Live Web Source' : (s.clause || 'Statutory Provision'),
          snippet: s.snippet || '',
          sourceUrl: s.url || '',
          verified: true,
          source_type: s.source_type || (s.url?.startsWith('http') && !s.url.includes('local_corpus') ? 'web' : 'corpus'),
        }));
      }

      const confidenceScore = result.confidence || 0;
      const confidenceLevel: 'high' | 'medium' | 'low' = confidenceScore > 0.8 ? 'high' : confidenceScore > 0.5 ? 'medium' : 'low';

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: result.answer || 'I could not generate a response. Please try rephrasing your question.',
        citations,
        supersession_paths: result.supersession_paths || [],
        confidence: {
          score: confidenceScore,
          level: confidenceLevel,
        },
        isAbstain: result.abstain || false,
        missingGaps: result.missingGaps || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions(prev =>
        prev.map(s =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        )
      );
    } catch (err) {
      // Network/Backend error — show error message, no mock fallback
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Backend Unavailable**: Could not reach the VaidyaSetu server. Please ensure the backend is running at \`http://localhost:8000\` and try again.\n\nError: ${err instanceof Error ? err.message : 'Unknown error'}`,
        confidence: { score: 0, level: 'low' },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions(prev =>
        prev.map(s =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const stripDecorations = (text: string) => {
    return text
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/[#*]/g, '');
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(stripDecorations(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    if (!activeSession) return;
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === msgId ? { ...m, feedbackGiven: type } : m
              ),
            }
          : s
      )
    );
    setFeedbackToast('Feedback logged for statutory corpus alignment.');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Filtered session history by search input
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const timeGroups: ('Today' | 'Yesterday' | 'Previous 7 Days')[] = [
    'Today',
    'Yesterday',
    'Previous 7 Days',
  ];

  // Get current language display name
  const currentLangOption = LANGUAGE_OPTIONS.find(l => l.code === langCode) || LANGUAGE_OPTIONS[0];

  return (
    <div className="flex-1 flex h-full w-full max-w-[1700px] mx-auto overflow-hidden relative">
      {/* ── MOBILE BACKDROP FOR SIDEBAR ── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-forest-black/30 backdrop-blur-xs z-20 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── CHATBOT HISTORY SIDEBAR ─────────────────────── */}
      <aside
        className={`${
          sidebarOpen
            ? 'w-72 sm:w-80 translate-x-0'
            : '-translate-x-full md:w-0 md:translate-x-0'
        } fixed md:relative inset-y-0 left-0 z-30 md:z-auto shrink-0 h-full flex flex-col border-r border-greige/70 bg-[#F4EFE6]/95 md:bg-[#FAF7F2]/90 backdrop-blur-2xl transition-all duration-300 ease-in-out overflow-hidden shadow-warm-lg md:shadow-none`}
      >
        {/* Sidebar Header & New Chat Action */}
        <div className="p-3.5 border-b border-greige/50 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-serif text-sm font-bold text-forest tracking-tight">
                Inquiry History
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-forest-muted hover:text-forest hover:bg-cream/60 transition-colors"
              title="Close Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNewChat}
            className="w-full justify-center shadow-warm-xs text-xs font-semibold py-2"
            icon={<Plus className="w-4 h-4" />}
          >
            <span>New Inquiry</span>
            <span className="ml-auto text-[10px] opacity-70 bg-black/15 px-1.5 py-0.5 rounded">
              ⌘N
            </span>
          </Button>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-forest-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search previous sessions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/80 border border-greige/70 text-forest placeholder:text-forest-muted/60 focus:outline-none focus:ring-1 focus:ring-terracotta/50"
            />
          </div>
        </div>

        {/* Grouped Historical Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-forest-muted">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No conversations yet</p>
              <p className="mt-1">Start a new inquiry above</p>
            </div>
          ) : (
            timeGroups.map(group => {
              const groupSessions = filteredSessions.filter(s => s.timeGroup === group);
              if (groupSessions.length === 0) return null;

              return (
                <div key={group} className="space-y-1">
                  <div className="px-2 py-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-forest-muted">
                    <Clock className="w-3 h-3 text-terracotta" />
                    <span>{group}</span>
                  </div>

                  {groupSessions.map(sess => {
                    const isActive = sess.id === activeSessionId;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => {
                          setActiveSessionId(sess.id);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={`group relative flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition-all duration-200 ${
                          isActive
                            ? 'bg-white/95 text-forest shadow-xs font-medium border-l-3 border-l-terracotta'
                            : 'text-forest/80 hover:bg-white/60 hover:text-forest'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-medium truncate">
                            {sess.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-forest-muted">
                            <span className="text-terracotta font-semibold">
                              {sess.category}
                            </span>
                            <span>•</span>
                            <span>{sess.updatedAt}</span>
                          </div>
                        </div>

                        {/* Delete Session Button on Hover */}
                        <button
                          type="button"
                          onClick={e => handleDeleteSession(e, sess.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-forest-muted hover:text-ayush-danger hover:bg-ayush-danger/10 transition-all shrink-0"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Corpus Status */}
        <div className="p-3 border-t border-greige/50 bg-white/50 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-forest">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold block">Statutory Corpus Active</span>
              <span className="text-[10px] text-forest-muted">12 ASU Treatises & Acts Indexed</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONVERSATIONAL WORKSPACE ───────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Workspace Top Bar */}
        <div className="flex items-center justify-between gap-3 px-3 sm:px-6 py-2 border-b border-greige/50 shrink-0 bg-white/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white border border-greige/60 text-forest shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
              title={sidebarOpen ? "Close Sidebar" : "Open History Sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-forest" />
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-forest" />
                  <span className="text-xs font-semibold text-forest hidden sm:inline">History</span>
                </>
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-forest truncate">
                  {activeSession?.title || 'Sahayak Assistant'}
                </h2>
               
              </div>
              <p className="text-[10px] text-forest-muted truncate hidden md:block">
                Codified RAG connected to Drugs & Cosmetics Act 1940, Patents Act §3(p) & NBA 2002
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white/70 hover:bg-white/90 rounded-full border border-greige/60 transition-all shadow-xs"
                title="Select response language"
              >
                <Languages className="w-3.5 h-3.5 text-terracotta" />
                <span className="font-medium text-forest hidden sm:inline">{currentLangOption.native}</span>
              </button>
              {showLangPicker && (
                <div
                  className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#FAF7F2]/95 backdrop-blur-2xl border border-white/90 shadow-[0_12px_36px_rgba(40,61,52,0.12)] p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setShowLangPicker(false)}
                >
                  {LANGUAGE_OPTIONS.map(opt => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLangCode(opt.code);
                        setGlobalLanguage(opt.label);
                        setShowLangPicker(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between gap-2 transition-colors ${
                        langCode === opt.code ? 'bg-terracotta/10 text-terracotta font-semibold' : 'text-forest hover:bg-white/60'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-forest-muted">{opt.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Jurisdiction Toggle */}
            <JurisdictionToggle size="sm" />

            <button
              type="button"
              onClick={handleCreateNewChat}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1 text-xs bg-terracotta text-white rounded-full font-medium shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeSession) {
                  const transcript = activeSession.messages
                    .map(m => `${m.role.toUpperCase()}: ${stripDecorations(m.content)}`)
                    .join('\n\n');
                  navigator.clipboard.writeText(transcript);
                  setFeedbackToast('Complete session transcript copied to clipboard.');
                  setTimeout(() => setFeedbackToast(null), 3000);
                }
              }}
              title="Copy Transcript"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-forest hover:bg-white/60 rounded-full border border-greige/60 transition-all shadow-xs"
            >
              <Copy className="w-3 h-3 text-forest/70" />
              <span className="hidden sm:inline text-[11px]">Copy Chat</span>
            </button>

          </div>
        </div>

        {/* Scrollable Chat Feed */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-8 py-6 space-y-6 no-scrollbar"
        >
          {/* Welcome Prompts Grid (When no messages exist in session) */}
          {activeSession && activeSession.messages.length === 0 && (
            <div className="max-w-3xl mx-auto my-4 space-y-6 animate-in fade-in duration-300">
              {/* Centered Editorial Emblem Header */}
              <div className="text-center space-y-2.5 py-2">
                <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 mx-auto flex items-center justify-center p-2 shadow-warm-sm">
                  <img src="/logo-dravya.png" alt="Sahayak Emblem" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-forest">
                  What statutory inquiry can Sahayak verify today?
                </h3>
                
                {/* Active Regime Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-greige/70 shadow-xs text-xs text-forest">
                  <span className="text-forest-muted">Selected Regime:</span>
                  <span className="font-bold text-terracotta">
                    {jurisdiction === 'IN'
                      ? '🇮🇳 India (AYUSH, D&C Act 1940 & Patents Act §3(p))'
                      : '🌐 International (WIPO, TRIPS Art. 27 & Nagoya Protocol)'}
                  </span>
                </div>

                {/* Language indicator */}
                {langCode !== 'en' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 shadow-xs text-xs text-violet-800 ml-2">
                    <Languages className="w-3 h-3" />
                    <span className="font-semibold">Responding in {currentLangOption.label} ({currentLangOption.native})</span>
                  </div>
                )}

                <p className="text-xs text-forest-muted max-w-lg mx-auto">
                  Select a pre-verified statutory template below or ask any legal question to query the verified codified treatise corpus.
                </p>
              </div>

              {/* 4 Interactive Suggestion Tiles tailored to active jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(jurisdiction === 'IN' ? SUGGESTED_TILES_IN : SUGGESTED_TILES_INTL).map((tile, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(tile.query)}
                    className="text-left p-4 rounded-2xl shader-card hover:bg-white/95 transition-all duration-200 group flex flex-col justify-between space-y-2.5 shadow-xs hover:shadow-warm-md hover:-translate-y-0.5 border border-white/90"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta px-2 py-0.5 rounded-full bg-terracotta/10">
                        {tile.category}
                      </span>
                      <div className="p-1 rounded-lg bg-cream/70 text-forest group-hover:bg-terracotta group-hover:text-white transition-colors">
                        {tile.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-forest group-hover:text-terracotta transition-colors">
                        {tile.title}
                      </h4>
                      <p className="text-[11px] text-forest-muted leading-relaxed mt-1">
                        {tile.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No active session state */}
          {!activeSession && (
            <div className="max-w-3xl mx-auto my-8 text-center space-y-4">
              <MessageSquare className="w-12 h-12 mx-auto text-forest-muted/30" />
              <p className="text-sm text-forest-muted">No active session. Create a new inquiry to get started.</p>
              <Button variant="primary" size="sm" onClick={handleCreateNewChat} icon={<Plus className="w-4 h-4" />}>
                New Inquiry
              </Button>
            </div>
          )}

          {/* Messages Thread */}
          {activeSession?.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-white/90 flex items-center justify-center p-1.5 shrink-0 shadow-xs mt-0.5">
                  <img src="/logo-dravya.png" alt="Sahayak" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Bubble Container */}
              <div className={`max-w-[88%] sm:max-w-[82%] space-y-2.5 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`p-4 sm:p-5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#924E2B] to-[#A05632] text-white rounded-tr-xs ml-auto shadow-warm-sm'
                      : msg.isAbstain
                      ? 'bg-amber-50/90 border border-amber-300/80 text-forest rounded-tl-xs'
                      : 'shader-card rounded-tl-xs text-forest'
                  }`}
                >
                  {msg.isAbstain && (
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Statutory Evidence Insufficient / Caution Required</span>
                    </div>
                  )}

                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-white font-medium">{stripDecorations(msg.content)}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-forest leading-relaxed break-words space-y-2 whitespace-pre-line">
                      {stripDecorations(msg.content)}
                    </div>
                  )}

                  {/* Missing Gaps for Abstain State */}
                  {msg.isAbstain && msg.missingGaps && (
                    <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-1">
                      <span className="text-xs font-semibold text-amber-950">
                        Required filings to substantiate query:
                      </span>
                      <ul className="list-disc pl-4 text-xs text-amber-900 space-y-0.5">
                        {msg.missingGaps.map((gap, i) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Citations & Evidence Panel for Assistant */}
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="space-y-2 pt-1 pl-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-forest-muted uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-terracotta" />
                          Statutory Evidence & Citations
                        </span>
                        {msg.citations.some(c => c.source_type === 'web' || (c.sourceUrl && c.sourceUrl.startsWith('http') && !c.sourceUrl.includes('local_corpus'))) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 bg-sky-100/90 border border-sky-300 px-2 py-0.5 rounded-full shadow-2xs">
                            <Globe className="w-2.5 h-2.5 text-sky-600 animate-pulse" />
                            Live Web Grounded
                          </span>
                        )}
                      </div>
                      {msg.confidence && (
                        <ConfidenceIndicator
                          score={msg.confidence.score}
                          level={msg.confidence.level}
                          sourceCount={msg.citations.length}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, i) => (
                        <CitationCard key={i} citation={c} />
                      ))}
                    </div>

                    {/* Supersession Paths */}
                    {msg.supersession_paths && msg.supersession_paths.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-white/60 border border-greige/70 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-forest text-[11px]">
                          <GitBranch className="w-3 h-3 text-terracotta" />
                          <span>Statutory Supersession Traversed:</span>
                        </div>
                        {msg.supersession_paths.map((p, idx) => (
                          <p key={idx} className="text-[11px] text-forest-muted">
                            {p.original} → <span className="font-semibold text-forest">{p.current}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Feedback & Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-forest-muted">
                        <span>Helpful citation?</span>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1 rounded hover:text-terracotta transition-colors ${
                            msg.feedbackGiven === 'up' ? 'text-terracotta font-bold' : ''
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1 rounded hover:text-ayush-danger transition-colors ${
                            msg.feedbackGiven === 'down' ? 'text-ayush-danger font-bold' : ''
                          }`}
                          title="Unhelpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 ml-2 text-forest-muted hover:text-forest transition-colors"
                          title="Copy Determination"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="text-[10px]">
                            {copiedId === msg.id ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>

                      <Link
                        to="/assess"
                        className="text-[11px] font-semibold text-terracotta hover:underline flex items-center gap-1"
                      >
                        <span>Assess full formulation →</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Real-time Reasoning Stepper */}
          {isProcessing && (
            <div className="flex gap-3 max-w-3xl mx-auto">
              <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-white/90 flex items-center justify-center p-1.5 shrink-0 shadow-xs animate-pulse">
                <img src="/logo-dravya.png" alt="Sahayak" className="w-full h-full object-contain" />
              </div>
              <div className="w-full max-w-lg">
                <SystemStatusStepper jurisdiction={jurisdiction} />
              </div>
            </div>
          )}
        </div>

        {/* Feedback Microcopy Toast */}
        {feedbackToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 p-2.5 px-4 rounded-xl bg-forest-black text-white text-xs text-center font-medium shadow-warm-lg animate-in fade-in duration-200">
            {feedbackToast}
          </div>
        )}

        {/* ── FLOATING GLASS COMMAND BAR ─────────────────── */}
        <div className="p-3 sm:p-4 shrink-0 max-w-3xl w-full mx-auto">
          {/* Quick Jurisdiction Selector Chip Above Input */}
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] text-forest-muted">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">Active Jurisdiction:</span>
              <button
                type="button"
                onClick={() => setJurisdiction(jurisdiction === 'IN' ? 'INTL' : 'IN')}
                className="inline-flex items-center gap-1 font-semibold text-terracotta hover:underline cursor-pointer"
                title="Click to toggle between Indian and International legal frameworks"
              >
                {jurisdiction === 'IN' ? (
                  <>
                    <span>🇮🇳 India (AYUSH / D&C Act / NBA)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-terracotta/10 text-terracotta font-medium ml-1">
                      Switch to International ⇄
                    </span>
                  </>
                ) : (
                  <>
                    <span>🌐 International (WIPO / TRIPS / Nagoya)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-terracotta/10 text-terracotta font-medium ml-1">
                      Switch to India ⇄
                    </span>
                  </>
                )}
              </button>


              {langCode !== 'en' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-medium shadow-2xs">
                  <Languages className="w-2.5 h-2.5 text-violet-600" />
                  <span>{currentLangOption.native}</span>
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-[10px] text-forest-muted/70">
              {jurisdiction === 'IN' ? '1,636 codified clauses' : '4,708 treaty clauses'}
            </span>
          </div>

          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="mb-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-800 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="font-semibold text-red-900">
                  🎙️ Listening in {currentLangOption.label} ({currentLangOption.native})...
                </span>
                <span className="text-[11px] text-red-700/80 hidden sm:inline">
                  Speak clearly into your microphone
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Done Speaking
              </button>
            </div>
          )}

          <div className="glass-nav-container rounded-2xl md:rounded-full p-2 pl-4 sm:pl-5 flex items-center gap-2 shadow-[0_12px_36px_rgba(40,61,52,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening
                  ? `Listening now... speak your question in ${currentLangOption.native}`
                  : (jurisdiction === 'IN'
                      ? 'Ask statutory questions on ASU classification, Section 3(p), Rule 158B, NBA approval...'
                      : 'Ask about WIPO traditional knowledge bar, TRIPS Art. 27, Nagoya Protocol ABS, US FDA NDIN...')
              }
              className="flex-1 bg-transparent text-xs sm:text-sm text-forest placeholder:text-forest-muted/60 focus:outline-none"
            />

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-full transition-all shrink-0 flex items-center justify-center relative cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.6)] ring-2 ring-red-400 ring-offset-2 animate-pulse scale-105'
                  : 'bg-white/80 hover:bg-white text-forest hover:text-terracotta border border-greige/70 shadow-xs hover:shadow-sm'
              }`}
              title={isListening ? 'Click to stop recording' : `Click to speak in ${currentLangOption.native}`}
              aria-label="Voice Input"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-forest hover:text-terracotta transition-colors" />
              )}
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isProcessing}
              className="rounded-full px-3.5 sm:px-4 py-1.5 shadow-xs shrink-0 text-xs font-semibold"
              icon={<Send className="w-3.5 h-3.5 ml-0.5" />}
            >
              <span className="hidden sm:inline">Ask Sahayak</span>
            </Button>
          </div>

          <p className="text-[10px] text-center text-forest-muted mt-2 font-medium tracking-tight">
            {jurisdiction === 'IN'
              ? 'Sahayak grounds every Indian determination in Drugs & Cosmetics Act 1940, First Schedule treatises, and NBA 2002. Zero-hallucination protocol.'
              : 'Sahayak grounds international determinations in WIPO treaties, Nagoya Protocol ABS guidelines, and FDA Botanical Guidance. Zero-hallucination protocol.'}
          </p>
        </div>
      </main>
    </div>
  );
}
