import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Building2,
  GraduationCap,
  Scale,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useApp } from '../context/AppContext';

export default function OnboardingView() {
  const navigate = useNavigate();
  const { profile, setProfile } = useApp();
  const [step, setStep] = useState(1);

  const [userType, setUserType] = useState(profile.userType);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile.goals);
  const [language, setLanguage] = useState(profile.language);
  const [guidance, setGuidance] = useState<'plain' | 'legal' | 'balanced'>(
    profile.guidancePreference
  );

  const userTypeOptions = [
    {
      id: 'Formulator / Innovator',
      title: 'Formulator / Innovator',
      desc: 'Developing novel Ayurvedic products, standardized extracts, or modern dosage delivery systems.',
      icon: FlaskConical,
    },
    {
      id: 'Ayurvedic company / startup',
      title: 'Ayurvedic Enterprise / MSME',
      desc: 'Commercial manufacturer navigating manufacturing licenses (Form 25D/25E) and export compliance.',
      icon: Building2,
    },
    {
      id: 'Researcher / Academic',
      title: 'Researcher / Academician',
      desc: 'Investigating classical recipes in Charaka/Sushruta Samhitas, pharmacology, and botanical validation.',
      icon: GraduationCap,
    },
    {
      id: 'IP consultant / facilitator',
      title: 'IP Facilitator / Patent Attorney',
      desc: 'Filing patents, checking Section 3(p) objections, and drafting NBA benefit-sharing agreements.',
      icon: Scale,
    },
    {
      id: 'Just exploring',
      title: 'Independent Explorer',
      desc: 'Learning about statutory Ayush regulations, legal definitions, and traditional knowledge rights.',
      icon: Sparkles,
    },
  ];

  const goalOptions = [
    'Protect a formulation (patents/GI/trademark)',
    'Check ABS / biodiversity compliance (NBA / SBB)',
    'Understand classical vs proprietary vs new-drug status',
    'Find prior art / TKDL defensive publication guidance',
    'Get international market-entry guidance (WIPO / FDA / EMA)',
    'Verify heavy metal & microbial regulatory thresholds',
  ];

  const languageOptions = [
    { code: 'English', label: 'English', native: 'English' },
    { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'Sanskrit', label: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
    { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
    { code: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  ];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = () => {
    setProfile({
      ...profile,
      userType,
      goals: selectedGoals.length > 0 ? selectedGoals : profile.goals,
      language,
      guidancePreference: guidance,
    });
    navigate('/home');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress Stepper Dots */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-10 bg-terracotta'
                    : s < step
                    ? 'w-6 bg-forest'
                    : 'w-4 bg-greige/70'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-forest-muted">
            Step {step} of 4
          </span>
        </div>

        {/* Main Step Card */}
        <Card variant="cream" className="p-8 md:p-10 shadow-warm-md border-greige/80">
          {/* STEP 1: User Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-terracotta">
                  Step 1 — Role & Intent
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
                  How will you be using VaidyaSetu?
                </h2>
                <p className="text-xs text-forest-muted">
                  We tailor statutory advice and default checklists to your primary workflow.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {userTypeOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = userType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setUserType(opt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                        isSelected
                          ? 'border-terracotta bg-terracotta/5 shadow-warm-sm'
                          : 'border-greige/70 bg-[#FAF7F2] hover:bg-cream/40'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-terracotta text-white'
                            : 'bg-cream text-forest border border-greige/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-forest">{opt.title}</p>
                          {isSelected && <Check className="w-4 h-4 text-terracotta" />}
                        </div>
                        <p className="text-xs text-forest-muted mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-terracotta">
                  Step 2 — Regulatory Goals
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
                  What would you like assistance with?
                </h2>
                <p className="text-xs text-forest-muted">
                  Select all legal and regulatory focus areas that apply to your work.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {goalOptions.map(goal => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <div
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-terracotta bg-terracotta/5 shadow-warm-sm text-forest font-semibold'
                          : 'border-greige/70 bg-[#FAF7F2] text-forest/80 hover:bg-cream/40'
                      }`}
                    >
                      <span className="text-xs">{goal}</span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-terracotta border-terracotta text-white'
                            : 'border-greige bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Language */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-terracotta">
                  Step 3 — Language Preference
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
                  Choose your preferred language
                </h2>
                <p className="text-xs text-forest-muted">
                  VaidyaSetu is built for multilingual Ayurvedic researchers. You can switch anytime.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {languageOptions.map(l => {
                  const isSelected = language === l.code;
                  return (
                    <div
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'border-terracotta bg-terracotta/5 shadow-warm-sm'
                          : 'border-greige/70 bg-[#FAF7F2] hover:bg-cream/40'
                      }`}
                    >
                      <p className="text-sm font-serif font-bold text-forest">{l.native}</p>
                      <p className="text-[11px] text-forest-muted mt-0.5">{l.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Guidance Style */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-terracotta">
                  Step 4 — Explanation Depth
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
                  How detailed should answers be?
                </h2>
                <p className="text-xs text-forest-muted">
                  Tune the balance between plain-language summaries and technical clause citations.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'plain',
                    title: 'Plain-Language Explanations',
                    desc: 'Clear, direct summaries avoiding legal jargon. Best for initial product ideation and founders.',
                  },
                  {
                    id: 'balanced',
                    title: 'Balanced (Recommended)',
                    desc: 'Clear actionable recommendations accompanied by primary statutory clause numbers.',
                  },
                  {
                    id: 'legal',
                    title: 'Detailed Clause-Level Legal Depth',
                    desc: 'Verbatim statutory quotes, gazette supersession paths, and patent claim language. Best for advocates & attorneys.',
                  },
                ].map(item => {
                  const isSelected = guidance === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setGuidance(item.id as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-terracotta bg-terracotta/5 shadow-warm-sm'
                          : 'border-greige/70 bg-[#FAF7F2] hover:bg-cream/40'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-forest">{item.title}</p>
                        <p className="text-xs text-forest-muted mt-0.5">{item.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-greige/60 mt-8">
            {step > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep(step - 1)}
                icon={<ArrowLeft className="w-4 h-4 mr-1" />}
              >
                Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="text-xs text-forest-muted hover:text-terracotta font-medium underline"
              >
                Skip setup for now
              </button>
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(step + 1)}
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinish}
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Finish → Go to VaidyaSetu
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
