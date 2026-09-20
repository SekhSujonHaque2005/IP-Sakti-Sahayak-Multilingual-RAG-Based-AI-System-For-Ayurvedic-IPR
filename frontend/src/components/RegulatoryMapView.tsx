import { useState } from 'react';
import {
  Scale,
  BookOpen,
  Leaf,
  ArrowRight
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { JurisdictionToggle } from './shared/JurisdictionToggle';
import { FORMULATION_CATEGORIES_INFO } from '../mocks/fixtures';
import type { FormulationCategory } from '../types/contract';
import { Link } from 'react-router-dom';

export default function RegulatoryMapView() {
  const [selectedKey, setSelectedKey] = useState<FormulationCategory>('classical_generic');

  const activeCategory = FORMULATION_CATEGORIES_INFO[selectedKey];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-greige/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta">
              Ayush Statutory Framework
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Interactive Regulatory Map
          </h1>
          <p className="text-xs sm:text-sm text-forest-muted">
            Explore statutory pathways across the 6 recognized formulation classes under Indian and International law.
          </p>
        </div>

        <JurisdictionToggle size="sm" />
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {Object.entries(FORMULATION_CATEGORIES_INFO).map(([key, info]) => {
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key as FormulationCategory)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[90px] ${
                isSelected
                  ? 'bg-terracotta text-white border-terracotta shadow-warm-md scale-[1.02]'
                  : 'bg-cream/50 text-forest border-greige/80 hover:bg-cream'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider font-bold ${isSelected ? 'text-cream' : 'text-forest-muted'}`}>
                Class {key === 'classical_generic' ? 'I' : key === 'proprietary_ayurvedic' ? 'II' : key === 'new_non_classical_drug' ? 'III' : key === 'phytopharmaceutical' ? 'IV' : key === 'ayurveda_aahar_nutraceutical' ? 'V' : 'VI'}
              </span>
              <span className="text-xs font-serif font-bold leading-tight mt-1 line-clamp-2">
                {info.label.replace('Ayurvedic Medicine', 'Medicine').replace('Nutraceutical', '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Deep Dive */}
      <Card variant="cream" className="p-8 md:p-10 border-greige/80 shadow-warm-md space-y-8">
        <div className="space-y-2 border-b border-greige/60 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="terracotta" size="sm">
              Selected Pathway
            </Badge>
            <span className="font-serif text-xs text-terracotta italic font-semibold">
              {activeCategory.sanskritTerm}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
            {activeCategory.label}
          </h2>
          <p className="text-xs font-mono text-forest-muted">
            Statutory Basis: {activeCategory.statutoryBasis}
          </p>
          <p className="text-sm text-forest leading-relaxed pt-2">
            {activeCategory.description}
          </p>
        </div>

        {/* 3 Pillar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1: IP & Patents */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-greige/80 space-y-3">
            <div className="flex items-center gap-2 text-terracotta">
              <Scale className="w-4 h-4" />
              <h3 className="font-serif text-base font-bold text-forest">
                Section 3(p) Patentability
              </h3>
            </div>
            <p className="text-xs text-forest-muted leading-relaxed">
              {activeCategory.patentabilityNote}
            </p>
          </div>

          {/* Col 2: Traditional Knowledge */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-greige/80 space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <BookOpen className="w-4 h-4" />
              <h3 className="font-serif text-base font-bold text-forest">
                Codified Classical Basis
              </h3>
            </div>
            <p className="text-xs text-forest-muted leading-relaxed">
              Must be documented in the First Schedule authoritative Ayurvedic books (Charaka Samhita, Sushruta Samhita, Sharangadhara, AFI) or substantiated via published clinical literature.
            </p>
          </div>

          {/* Col 3: ABS & Biodiversity */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-greige/80 space-y-3">
            <div className="flex items-center gap-2 text-sage-600">
              <Leaf className="w-4 h-4" />
              <h3 className="font-serif text-base font-bold text-forest">
                NBA & ABS Obligations
              </h3>
            </div>
            <p className="text-xs text-forest-muted leading-relaxed">
              {activeCategory.absNote}
            </p>
          </div>
        </div>

        {/* CTA to assess */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-greige/60">
          <span className="text-xs text-forest-muted">
            Have a formulation matching this category?
          </span>
          <Link to="/assess">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
              Start Intake for this Category →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
