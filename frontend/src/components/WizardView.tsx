import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Scale,
  Leaf,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { JurisdictionToggle } from './shared/JurisdictionToggle';
import { SystemStatusStepper } from './shared/SystemStatusStepper';
import { CitationCard } from './shared/CitationCard';
import { ConfidenceIndicator } from './shared/ConfidenceIndicator';
import { useApp } from '../context/AppContext';
import { FORMULATION_CATEGORIES_INFO, SAMPLE_CITATIONS } from '../mocks/fixtures';
import type { FormulationCategory } from '../types/contract';
import { classifyFormulation } from '../api';

export default function WizardView() {
  const navigate = useNavigate();
  const { jurisdiction } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [productName, setProductName] = useState('Shodhita Ashwagandha Rejuvenation Elixir');
  const [whatItDoes, setWhatItDoes] = useState('Improves cognitive clarity, balances Vata dosha, and enhances physical vitality.');
  const [intendedUse, setIntendedUse] = useState('Oral syrup for neuro-protection and chronic fatigue management.');
  const [ingredients, setIngredients] = useState<string[]>([
    'Withania somnifera (Ashwagandha)',
    'Centella asiatica (Mandukaparni)',
    'Piper longum (Pippali)',
    'Honey (Madhu)',
  ]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [formulationProcess, setFormulationProcess] = useState(
    'Cold aqueous-ethanol hydro-alcoholic extraction followed by standardized liposomal dispersion and traditional classical Shodhana.'
  );

  // Boolean flags
  const [inClassicalText, setInClassicalText] = useState(false);
  const [intendedAsFood, setIntendedAsFood] = useState(false);
  const [cosmeticOnly, setCosmeticOnly] = useState(false);
  const [hasClinicalEvidence, setHasClinicalEvidence] = useState(true);
  const [isStandardisedExtract, setIsStandardisedExtract] = useState(true);
  const [containsScheduleE, setContainsScheduleE] = useState(false);

  // Step 2 & 3 State
  const [selectedCategory, setSelectedCategory] = useState<FormulationCategory>('proprietary_ayurvedic');
  const [whyNotExpanded, setWhyNotExpanded] = useState(false);

  // Smart follow up answers
  const [smartAnswer1, setSmartAnswer1] = useState('Cultivated on certified organic farms');
  const [smartAnswer2, setSmartAnswer2] = useState('Planned for export to US and EU markets');

  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleStartClassification = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);

    // Call real backend classifier if online, else apply deterministic logic
    try {
      const resp = await classifyFormulation({
        in_classical_text: inClassicalText,
        intended_as_food: intendedAsFood,
        cosmetic_only: cosmeticOnly,
        has_clinical_evidence: hasClinicalEvidence,
        is_standardised_extract: isStandardisedExtract,
        contains_schedule_e_ingredients: containsScheduleE,
      });

      if (resp && resp.category) {
        const cat = resp.category.toLowerCase();
        if (cat.includes('classical')) setSelectedCategory('classical_generic');
        else if (cat.includes('food') || cat.includes('aahar')) setSelectedCategory('ayurveda_aahar_nutraceutical');
        else if (cat.includes('cosmetic')) setSelectedCategory('cosmetic');
        else if (cat.includes('phytopharmaceutical')) setSelectedCategory('phytopharmaceutical');
        else if (cat.includes('new') || cat.includes('non-classical')) setSelectedCategory('new_non_classical_drug');
        else setSelectedCategory('proprietary_ayurvedic');
      }
    } catch (err) {
      // Fallback deterministic logic
      if (cosmeticOnly) setSelectedCategory('cosmetic');
      else if (intendedAsFood) setSelectedCategory('ayurveda_aahar_nutraceutical');
      else if (inClassicalText) setSelectedCategory('classical_generic');
      else if (isStandardisedExtract && hasClinicalEvidence) setSelectedCategory('phytopharmaceutical');
      else if (hasClinicalEvidence) setSelectedCategory('new_non_classical_drug');
      else setSelectedCategory('proprietary_ayurvedic');
    }

    setTimeout(() => {
      setStep(3);
    }, 2800);
  };

  const handleConsultSahayak = () => {
    navigate('/ask');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 px-4">
      {/* Top Breadcrumb & Jurisdiction Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-greige/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta">
              Ayush Regulatory Pathway Engine
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Formulation Assessment
          </h1>
        </div>
        <JurisdictionToggle size="sm" />
      </div>

      {/* ── STEP 1: FORMULATION INTAKE ────────────────────────────────────── */}
      {step === 1 && (
        <Card variant="cream" className="p-8 md:p-10 shadow-warm-md border-greige/80">
          <form onSubmit={handleStartClassification} className="space-y-8">
            <div className="border-b border-greige/60 pb-4">
              <h2 className="font-serif text-xl font-bold text-forest">
                Stage 1 — Formulation Intake & Botanical Profile
              </h2>
              <p className="text-xs text-forest-muted mt-1">
                Provide product specifications to map statutory category, patentability under Section 3(p), and NBA requirements.
              </p>
            </div>

            {/* Field: Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                Product / Formulation Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-sm text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="e.g. Shodhita Ashwagandha Rejuvenation Elixir"
              />
            </div>

            {/* Field: What does it do */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                Therapeutic Purpose / What does it do? *
              </label>
              <input
                type="text"
                required
                value={whatItDoes}
                onChange={e => setWhatItDoes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-sm text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="e.g. Cognitive enhancement, stress relief, rasayana"
              />
            </div>

            {/* Field: Intended Use / Form */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                Dosage Form & Intended Administration *
              </label>
              <input
                type="text"
                required
                value={intendedUse}
                onChange={e => setIntendedUse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-sm text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="e.g. Oral syrup, tablet, topical taila, effervescent drink"
              />
            </div>

            {/* Field: Ingredients Tag Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                Ingredients & Botanical Actives *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={e => setIngredientInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addIngredient();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-sm text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  placeholder="Type botanical name (e.g. Withania somnifera) and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={addIngredient}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>

              {/* Chips container */}
              <div className="flex flex-wrap gap-2 pt-2">
                {ingredients.map(ing => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cream border border-greige/80 text-forest shadow-warm-sm"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(ing)}
                      className="hover:text-terracotta transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Field: Formulation Process */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                Manufacturing Process / Innovation Notes *
              </label>
              <textarea
                rows={3}
                required
                value={formulationProcess}
                onChange={e => setFormulationProcess(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-sm text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40 leading-relaxed"
                placeholder="Describe extraction, purification (Shodhana), or novel formulation technology..."
              />
            </div>

            {/* Boolean Statutory Checks */}
            <div className="pt-4 border-t border-greige/60 space-y-3">
              <p className="text-xs font-bold text-forest uppercase tracking-wider">
                Statutory Qualification Criteria
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-greige/70 bg-[#FAF7F2] cursor-pointer hover:bg-cream/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={inClassicalText}
                    onChange={e => setInClassicalText(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-xs text-forest leading-snug">
                    Verbatim formula described in First Schedule text (Charaka, Sushruta, etc.)
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-greige/70 bg-[#FAF7F2] cursor-pointer hover:bg-cream/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={isStandardisedExtract}
                    onChange={e => setIsStandardisedExtract(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-xs text-forest leading-snug">
                    Standardized extract with identified bioactive chemical markers
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-greige/70 bg-[#FAF7F2] cursor-pointer hover:bg-cream/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasClinicalEvidence}
                    onChange={e => setHasClinicalEvidence(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-xs text-forest leading-snug">
                    Supported by published clinical or pre-clinical pharmacology evidence
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-greige/70 bg-[#FAF7F2] cursor-pointer hover:bg-cream/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={intendedAsFood}
                    onChange={e => setIntendedAsFood(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-xs text-forest leading-snug">
                    Intended primarily as dietary supplement / Ayurveda Aahar (not drug)
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-greige/70 bg-[#FAF7F2] cursor-pointer hover:bg-cream/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={cosmeticOnly}
                    onChange={e => setCosmeticOnly(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-xs text-forest leading-snug">
                    Intended solely for external cosmetic beautification (Saundarya Prasadana)
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-ayush-danger/30 bg-ayush-danger/5 cursor-pointer hover:bg-ayush-danger/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={containsScheduleE}
                    onChange={e => setContainsScheduleE(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-ayush-danger focus:ring-ayush-danger"
                  />
                  <span className="text-xs text-ayush-danger leading-snug font-medium">
                    Contains Schedule E(1) poisonous botanical substances (Aconite, Vatsanabha, etc.)
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-warm-md text-base"
              icon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Classify Formulation & Generate Regulatory Map
            </Button>
          </form>
        </Card>
      )}

      {/* ── STEP 2: SYSTEM CLASSIFICATION IN PROGRESS ────────────────────── */}
      {step === 2 && (
        <Card variant="cream" className="p-8 md:p-12 text-center space-y-6 shadow-warm-md border-greige/80">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-serif text-2xl font-bold text-forest">
              Classifying Formulation
            </h2>
            <p className="text-xs text-forest-muted">
              Running legislative classification against Drugs & Cosmetics Act 1940, Rule 158B, and Biological Diversity Act.
            </p>
          </div>

          <SystemStatusStepper
            jurisdiction={jurisdiction}
            collapsible={false}
            className="max-w-xl mx-auto text-left"
          />
        </Card>
      )}

      {/* ── STEP 3: RESULT & REGULATORY MAP ─────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Hero Classification Result Card */}
          <Card variant="cream" className="p-8 md:p-10 border-terracotta/40 shadow-warm-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <Badge variant="terracotta" size="sm">
                  Official Ayush Regulatory Classification
                </Badge>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                  {FORMULATION_CATEGORIES_INFO[selectedCategory].label}
                </h2>
                <p className="font-serif text-xs text-terracotta italic font-semibold">
                  {FORMULATION_CATEGORIES_INFO[selectedCategory].sanskritTerm}
                </p>
                <p className="text-xs text-forest-muted font-mono pt-1">
                  Statutory Basis: {FORMULATION_CATEGORIES_INFO[selectedCategory].statutoryBasis}
                </p>
              </div>

              <ConfidenceIndicator score={0.94} level="high" sourceCount={4} />
            </div>

            <p className="text-sm text-forest leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-greige/70">
              {FORMULATION_CATEGORIES_INFO[selectedCategory].description}
            </p>

            {/* "Why Not Others" Accordion */}
            <div className="border-t border-greige/60 pt-4">
              <button
                type="button"
                onClick={() => setWhyNotExpanded(!whyNotExpanded)}
                className="flex items-center justify-between w-full text-xs font-semibold text-forest hover:text-terracotta transition-colors"
              >
                <span>Compare: Why not the other 5 Ayush categories?</span>
                {whyNotExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {whyNotExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 animate-in fade-in duration-200">
                  {Object.entries(FORMULATION_CATEGORIES_INFO)
                    .filter(([key]) => key !== selectedCategory)
                    .map(([key, info]) => (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-white/70 border border-greige/60 text-xs space-y-1"
                      >
                        <p className="font-semibold text-forest-muted">{info.label}</p>
                        <p className="text-[11px] text-forest-muted line-clamp-2">
                          {info.description}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>

          {/* 3 Regulatory Map Panels */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">
              Statutory Regulatory Map
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Panel 1: IP Protection */}
              <Card variant="off-white" className="p-6 space-y-4 border-greige/80">
                <div className="flex items-center gap-2 text-terracotta">
                  <Scale className="w-5 h-5" />
                  <h4 className="font-serif text-base font-bold text-forest">
                    IP Protection
                  </h4>
                </div>
                <p className="text-xs text-forest-muted leading-relaxed">
                  {FORMULATION_CATEGORIES_INFO[selectedCategory].patentabilityNote}
                </p>
                <div className="pt-2">
                  <CitationCard citation={SAMPLE_CITATIONS[1]} />
                </div>
              </Card>

              {/* Panel 2: Traditional Knowledge (TK) */}
              <Card variant="off-white" className="p-6 space-y-4 border-greige/80">
                <div className="flex items-center gap-2 text-forest">
                  <BookOpen className="w-5 h-5" />
                  <h4 className="font-serif text-base font-bold text-forest">
                    Traditional Knowledge
                  </h4>
                </div>
                <p className="text-xs text-forest-muted leading-relaxed">
                  Referenced against Charaka Samhita and Sushruta Samhita. CSIR-TKDL prior art check requires formulation differentiation.
                </p>
                <div className="pt-2">
                  <CitationCard citation={SAMPLE_CITATIONS[0]} />
                </div>
              </Card>

              {/* Panel 3: ABS Compliance */}
              <Card variant="off-white" className="p-6 space-y-4 border-greige/80">
                <div className="flex items-center gap-2 text-sage-600">
                  <Leaf className="w-5 h-5" />
                  <h4 className="font-serif text-base font-bold text-forest">
                    ABS & Biodiversity
                  </h4>
                </div>
                <p className="text-xs text-forest-muted leading-relaxed">
                  {FORMULATION_CATEGORIES_INFO[selectedCategory].absNote}
                </p>
                <div className="pt-2">
                  <CitationCard citation={SAMPLE_CITATIONS[2]} />
                </div>
              </Card>
            </div>
          </div>

          {/* Smart Questions Block */}
          <Card variant="cream" className="p-6 space-y-4 border-greige/80">
            <h4 className="font-serif text-base font-bold text-forest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>Smart Follow-Up Refinements</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest">
                  Botanical Sourcing Provenance
                </label>
                <input
                  type="text"
                  value={smartAnswer1}
                  onChange={e => setSmartAnswer1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest">
                  Target Export Regimes
                </label>
                <input
                  type="text"
                  value={smartAnswer2}
                  onChange={e => setSmartAnswer2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest"
                />
              </div>
            </div>
          </Card>

          {/* Product DNA Summary Card */}
          <Card variant="off-white" className="p-6 space-y-4 border-greige/80">
            <h4 className="font-serif text-base font-bold text-forest">
              Structured Product DNA Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-forest-muted block">Category:</span>
                <span className="font-bold text-forest">{FORMULATION_CATEGORIES_INFO[selectedCategory].label}</span>
              </div>
              <div>
                <span className="text-forest-muted block">Actives Count:</span>
                <span className="font-bold text-forest">{ingredients.length} Botanicals</span>
              </div>
              <div>
                <span className="text-forest-muted block">ABS Applicable:</span>
                <span className="font-bold text-terracotta">Yes (NBA / SBB)</span>
              </div>
              <div>
                <span className="text-forest-muted block">Jurisdiction:</span>
                <span className="font-bold text-forest">{jurisdiction === 'IN' ? 'India' : 'International'}</span>
              </div>
            </div>
          </Card>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(1)}
              icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            >
              Modify Product Intake
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleConsultSahayak}
              className="px-8 shadow-warm-md"
              icon={<FileCheck2 className="w-4 h-4 ml-1" />}
            >
              Consult Ask Sahayak on IP & Licensing →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
