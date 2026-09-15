import { useState } from 'react';
import { ArrowRight, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { classifyFormulation } from '../api';

export default function WizardView() {
  const [formData, setFormData] = useState({
    in_classical_text: false,
    intended_as_food: false,
    cosmetic_only: false,
    has_clinical_evidence: false,
    is_standardised_extract: false,
    contains_schedule_e_ingredients: false,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const questions = [
    { key: 'in_classical_text', label: 'Is this formulation described in a classical Ayurvedic text (Charaka Samhita, etc.)?' },
    { key: 'intended_as_food', label: 'Is the product intended primarily as a food supplement (not a drug)?' },
    { key: 'cosmetic_only', label: 'Is the product intended solely for cosmetic use?' },
    { key: 'has_clinical_evidence', label: 'Does the formulation have modern clinical trial evidence?' },
    { key: 'is_standardised_extract', label: 'Is it a standardised botanical extract (not a whole-plant preparation)?' },
    { key: 'contains_schedule_e_ingredients', label: 'Does it contain any Schedule E(1) poisonous substances (Aconite, Arsenic, etc.)?' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await classifyFormulation(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to classify. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const isWarning = result && (
    result.category?.includes('Schedule E') ||
    result.category?.includes('Patent') ||
    result.category?.toLowerCase().includes('restricted')
  );

  return (
    <div className="max-w-2xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-spring fill-mode-both">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">Formulation Classifier</h2>
        <p className="text-lg text-white/50 font-light max-w-lg mx-auto">Answer the questions below to determine the regulatory pathway.</p>
      </div>

      <div className="p-1.5 rounded-[2.5rem] bg-white/5 ring-1 ring-white/10">
        <form onSubmit={handleSubmit} className="bg-[#050505] rounded-[calc(2.5rem-0.375rem)] p-8 md:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
          {questions.map((q) => (
            <label key={q.key} className="flex items-start space-x-4 p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 border border-white/20 rounded-md checked:bg-brand-500 checked:border-brand-500 transition-all"
                  checked={(formData as any)[q.key]}
                  onChange={e => setFormData({ ...formData, [q.key]: e.target.checked })}
                />
                <CheckCircle2 className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-sm text-white/80 leading-relaxed">{q.label}</span>
            </label>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="group w-full relative flex items-center justify-between px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 transition-all duration-500 ease-spring mt-8"
          >
            <span>{loading ? 'Analyzing Regulatory Pathway...' : 'Classify Formulation'}</span>
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 group-hover:scale-105 transition-transform duration-500 ease-spring">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </div>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className={`p-1.5 rounded-[2.5rem] bg-white/5 ring-1 ${isWarning ? 'ring-amber-500/30' : 'ring-brand-500/30'} animate-in fade-in slide-in-from-bottom-8 duration-700`}>
          <div className="bg-black/60 backdrop-blur-xl rounded-[calc(2.5rem-0.375rem)] p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-start space-x-6">
              <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ring-1 ${isWarning ? 'bg-amber-500/10 ring-amber-500/30' : 'bg-brand-500/10 ring-brand-500/30'}`}>
                {isWarning ? (
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-brand-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-medium tracking-tight mb-3 ${isWarning ? 'text-amber-400' : 'text-brand-400'}`}>
                  {result.category}
                </h3>
                <p className="text-white/70 leading-relaxed font-light">
                  {result.description}
                </p>
                <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-white/40 mb-2">Required Regulatory Pathway</p>
                  <p className="text-white/90 leading-relaxed font-medium">{result.regulatory_pathway}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
