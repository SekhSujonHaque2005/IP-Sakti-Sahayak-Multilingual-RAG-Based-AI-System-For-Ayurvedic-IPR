import type { Case, RegulatoryUpdate, Citation, FormulationCategory } from '../types/contract';

export const FORMULATION_CATEGORIES_INFO: Record<FormulationCategory, {
  label: string;
  sanskritTerm: string;
  statutoryBasis: string;
  description: string;
  patentabilityNote: string;
  absNote: string;
}> = {
  classical_generic: {
    label: 'Classical / Generic Ayurvedic Medicine',
    sanskritTerm: 'शास्त्रीय योग (Shastriya Yoga)',
    statutoryBasis: 'Section 3(a), Drugs & Cosmetics Act 1940; First Schedule Texts',
    description: 'Manufactured strictly following authoritatively codified texts in the First Schedule (e.g. Charaka Samhita, Sushruta Samhita, Sharangadhara Samhita, AFI).',
    patentabilityNote: 'Barred from patenting under Section 3(p) of the Patents Act 1970 as traditional knowledge, unless novel synergistic non-obvious efficacy is proven.',
    absNote: 'Exempt from National Biodiversity Authority (NBA) prior approval for domestic Indian entities under Section 7 of Biological Diversity Act, provided no commercial IPR is filed.'
  },
  proprietary_ayurvedic: {
    label: 'Proprietary Ayurvedic Medicine',
    sanskritTerm: 'अनुभूत योग (Anubhuta Yoga)',
    statutoryBasis: 'Section 3(h), Drugs & Cosmetics Act 1940 & Rule 158B',
    description: 'Formulation containing ingredients mentioned in the authoritative books of Ayurveda, but prepared in a modern dosage form or proprietary combination not directly listed in classical treatises.',
    patentabilityNote: 'Patentable for novel formulation techniques, delivery systems, or synergistic compositions overcoming Section 3(e) & 3(p).',
    absNote: 'Requires Form I / Form III filing with NBA if Indian biological resources are accessed by foreign entities, or prior intimation to State Biodiversity Board (SBB) for Indian commercial entities.'
  },
  new_non_classical_drug: {
    label: 'New / Non-Classical Ayurvedic Drug',
    sanskritTerm: 'अभिनव औषधि (Abhinava Aushadhi)',
    statutoryBasis: 'Rule 158B(IV), Drugs & Cosmetics Rules 1945',
    description: 'Herbal formulations containing extracts or ingredients with therapeutic claims not substantiated by classical texts, requiring phase-wise safety and clinical trials.',
    patentabilityNote: 'High patent eligibility for active fraction composition, extraction process, and specific therapeutic indication claims.',
    absNote: 'Mandatory Access and Benefit Sharing (ABS) agreement with NBA/SBB prior to commercialization or patent filing.'
  },
  phytopharmaceutical: {
    label: 'Phytopharmaceutical Drug',
    sanskritTerm: 'पादप-भेषज (Padapa Bheshaja)',
    statutoryBasis: 'Gazette Notification G.S.R. 918(E), Drugs & Cosmetics (Amendment) Rules 2015',
    description: 'Purified, fractionated, standardized botanical extract (minimum 4 bioactive markers identified) with documented clinical safety and efficacy data, regulated similar to modern NCEs.',
    patentabilityNote: 'Fully eligible for product and process patents (composition of matter with characterized chromatographic fingerprint).',
    absNote: 'Strict ABS compliance under Nagoya Protocol / Biological Diversity Act with mandatory benefit sharing on ex-factory turnover.'
  },
  ayurveda_aahar_nutraceutical: {
    label: 'Ayurveda Aahar / Dietary Supplement',
    sanskritTerm: 'आयुर्वेद आहार (Ayurveda Aahar)',
    statutoryBasis: 'FSSAI (Ayurveda Aahar) Regulations, 2022',
    description: 'Food prepared in accordance with the recipes or processes in classical Ayurvedic texts, intended for general wellness and nutrition, with strictly prohibited disease treatment/cure claims.',
    patentabilityNote: 'Generally non-patentable as food recipes under Section 3(f) & 3(p), but proprietary processing or shelf-life stabilization may be patentable.',
    absNote: 'Normal commercial use exemptions apply for standard agricultural commodities; wild-sourced rare botanical ingredients require SBB intimation.'
  },
  cosmetic: {
    label: 'Ayurvedic Cosmetic (Saundarya Prasadana)',
    sanskritTerm: 'सौन्दर्य प्रसाधन (Saundarya Prasadana)',
    statutoryBasis: 'Schedule U & Rule 134A, Drugs & Cosmetics Act 1940',
    description: 'Topical preparations intended for beautification, cleansing, or skin grooming containing permitted Ayurvedic botanical actives without therapeutic medicinal claims.',
    patentabilityNote: 'Novel cosmetic delivery vehicles, micro-emulsions, or stable topical blends can be patented.',
    absNote: 'SBB notification required for commercial manufacturing using local biodiversity.'
  }
};

export const SAMPLE_CITATIONS: Citation[] = [
  {
    sourceId: 'DCA-1940-S3A',
    document: 'Drugs and Cosmetics Act, 1940',
    clauseLabel: 'Section 3(a) & First Schedule',
    snippet: '"Ayurvedic, Siddha or Unani drug includes all medicines intended for internal or external use for or in the diagnosis, treatment, mitigation or prevention of disease... manufactured exclusively in accordance with the formulae described in the authoritative books."',
    year: '1940 (Amended 2021)',
    verified: true
  },
  {
    sourceId: 'IPA-1970-S3P',
    document: 'The Patents Act, 1970',
    clauseLabel: 'Section 3(p)',
    snippet: '"An invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention."',
    year: '1970 (Amended 2005)',
    verified: true
  },
  {
    sourceId: 'BDA-2002-S6',
    document: 'Biological Diversity Act, 2002',
    clauseLabel: 'Section 6(1)',
    snippet: '"No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining the previous approval of the National Biodiversity Authority."',
    year: '2002 (Amended 2023)',
    verified: true
  },
  {
    sourceId: 'DCR-1945-R158B',
    document: 'Drugs & Cosmetics Rules, 1945',
    clauseLabel: 'Rule 158B - Requirement of Data for Licensing',
    snippet: '"Guidance on proof of effectiveness, safety studies, and published literary references required for obtaining manufacturing license for Classical vs Proprietary ASU formulations."',
    year: '1945 (Amended 2018)',
    verified: true
  },
  {
    sourceId: 'WIPO-GRATK-2024',
    document: 'WIPO Treaty on IP, Genetic Resources & Traditional Knowledge',
    clauseLabel: 'Article 3 - Mandatory Disclosure of Origin',
    snippet: '"Patent applicants are required to disclose the country of origin or source of genetic resources and associated traditional knowledge in their patent specifications."',
    year: '2024',
    verified: true
  },
  {
    sourceId: 'TRIPS-ART27',
    document: 'WTO TRIPS Agreement',
    clauseLabel: 'Article 27.3(b) - Patentable Subject Matter Exclusions',
    snippet: '"Members may exclude from patentability plants and animals other than micro-organisms, and essentially biological processes for the production of plants or animals."',
    year: '1994 (Amended 2005)',
    verified: true
  },
  {
    sourceId: 'NAGOYA-ABS',
    document: 'Nagoya Protocol on Access & Benefit-Sharing (CBD)',
    clauseLabel: 'Article 5 & Article 6 - Fair and Equitable Benefit Sharing',
    snippet: '"Benefits arising from the utilization of genetic resources and traditional knowledge shall be shared in a fair and equitable way with the party providing such resources."',
    year: '2010 (In Force 2014)',
    verified: true
  },
  {
    sourceId: 'FDA-BOTANICAL',
    document: 'US FDA Guidance for Industry',
    clauseLabel: 'Botanical Drug Development (21 CFR 312)',
    snippet: '"Botanical products prepared from raw herbs require batch-to-batch chemical fingerprint consistency, spectroscopic profiling, and clinical phase trials to achieve therapeutic drug approval."',
    year: '2016',
    verified: true
  },
  {
    sourceId: 'EU-THMPD',
    document: 'EU Directive 2004/24/EC (THMPD)',
    clauseLabel: 'Traditional Herbal Medicinal Products Registration',
    snippet: '"Simplified registration requires documentary evidence of medicinal use throughout a period of at least 30 years, including at least 15 years within the European Union."',
    year: '2004',
    verified: true
  },
  {
    sourceId: 'CDSCO-GSR918E',
    document: 'CDSCO Gazette Notification G.S.R. 918(E)',
    clauseLabel: 'Phytopharmaceutical Drug Standards',
    snippet: '"Phytopharmaceutical drug means purified and standardized fraction with defined minimum four bio-active or analytical marker compounds of an extract of a medicinal plant."',
    year: '2015',
    verified: true
  }
];

export const INITIAL_CASES: Case[] = [
  {
    id: 'case-ashwa-01',
    productName: 'Shodhita Ashwagandha Liposomal Nano-Extract',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-14',
    jurisdiction: 'IN',
    category: 'proprietary_ayurvedic',
    categoryLabel: 'Proprietary Ayurvedic Medicine',
    description: 'Liposome-encapsulated Withania somnifera root extract standardized to 8% Withanolide glycosides for elevated bioavailability and neuro-protective indications.',
    confidence: 'high',
    context: {
      productName: 'Shodhita Ashwagandha Liposomal Nano-Extract',
      whatItDoes: 'Cognitive enhancement, stress reduction, and deep cellular rejuvenation with 4x bioavailability.',
      intendedUse: 'Oral suspension for neuro-degenerative management and chronic fatigue.',
      ingredients: ['Withania somnifera (Ashwagandha)', 'Phosphatidylcholine (Sunflower Lecithin)', 'Ghee (Clarified Butter)', 'Piper longum (Pippali)'],
      formulationProcess: 'Classical Shodhana purification followed by high-pressure microfluidic liposomal encapsulation.',
      inClassicalText: false,
      intendedAsFood: false,
      cosmeticOnly: false,
      hasClinicalEvidence: true,
      isStandardisedExtract: true,
      containsScheduleE: false
    },
    regulatoryMap: {
      ipProtection: {
        summary: 'Patentable for nano-encapsulation method and enhanced bioavailability synergy.',
        points: [
          'Eligible for formulation process patent under Indian Patents Act Section 48.',
          'Must overcome Section 3(e) with synergistic bioavailability enhancement data (liposome + piperine).',
          'Must establish that bio-enhancement is not an obvious aggregation under Section 3(p).'
        ],
        citations: [SAMPLE_CITATIONS[1], SAMPLE_CITATIONS[3]]
      },
      traditionalKnowledge: {
        summary: 'Contains classical Withania somnifera referenced in Charaka Samhita Chikitsa Sthana.',
        priorArtStatus: 'Root powder use for "Balya" and "Rasayana" is heavily documented in TKDL (over 280 formulations).',
        tkdlStatus: 'Prior art barrier exists against simple powdered root claims; liposome carrier overcomes TKDL objection.',
        citations: [SAMPLE_CITATIONS[1]]
      },
      absCompliance: {
        summary: 'Mandatory NBA intimation due to use of Indian biological resource (Ashwagandha).',
        applicable: true,
        requirements: [
          'File Form I with National Biodiversity Authority (NBA) if patent filed in India or abroad.',
          'Comply with Nagoya Protocol Mutually Agreed Terms (MAT) for export.',
          'Ensure botanical raw materials are sourced from SBB-registered cultivators.'
        ],
        authority: 'National Biodiversity Authority (Chennai) / State Biodiversity Board',
        citations: [SAMPLE_CITATIONS[2], SAMPLE_CITATIONS[4]]
      }
    },
    actionPlan: [
      {
        id: 'act-1',
        title: 'Draft Provisional Patent Application for Liposomal Matrix',
        description: 'Focus claims on the specific microfluidic lipid-to-withanolide ratio that demonstrates 4x blood-brain barrier permeability.',
        category: 'IP',
        priority: 'high',
        completed: true,
        statutoryReference: 'Section 10(4), Patents Act 1970'
      },
      {
        id: 'act-2',
        title: 'File Form I with National Biodiversity Authority (NBA)',
        description: 'Obtain prior approval before the patent office issues a First Examination Report (FER).',
        category: 'ABS',
        priority: 'high',
        completed: false,
        statutoryReference: 'Section 6(1), Biological Diversity Act 2002'
      },
      {
        id: 'act-3',
        title: 'Submit Rule 158B Safety & Stability Dossier to State Ayush Licensing Authority',
        description: 'Complete accelerated 6-month shelf-life stability test and heavy metal screening (Pb, Cd, As, Hg).',
        category: 'Regulatory',
        priority: 'medium',
        completed: false,
        statutoryReference: 'Rule 158B, Drugs & Cosmetics Rules 1945'
      },
      {
        id: 'act-4',
        title: 'TKDL Defensive Prior-Art Search & Delineation',
        description: 'Extract exact TKDL accession numbers for Withania somnifera to pre-empt patent examiner prior art rejections.',
        category: 'TK',
        priority: 'medium',
        completed: false,
        statutoryReference: 'CSIR-TKDL Database Guidelines'
      }
    ],
    status: 'active'
  },
  {
    id: 'case-triphala-02',
    productName: 'Triphala Kwatha Effervescent Tablets',
    createdAt: '2026-02-18',
    updatedAt: '2026-03-01',
    jurisdiction: 'IN',
    category: 'classical_generic',
    categoryLabel: 'Classical / Generic Ayurvedic Medicine',
    description: 'Equal ratio of Haritaki, Bibhitaki, and Amalaki prepared strictly according to Sharangadhara Samhita, converted into an instant dispersible tablet.',
    confidence: 'high',
    context: {
      productName: 'Triphala Kwatha Effervescent Tablets',
      whatItDoes: 'Gentle colon cleanse, digestive tonic, and systemic antioxidant.',
      intendedUse: 'Oral effervescent drink for daily gastrointestinal regulation.',
      ingredients: ['Terminalia chebula (Haritaki)', 'Terminalia bellirica (Bibhitaki)', 'Phyllanthus emblica (Amalaki)'],
      formulationProcess: 'Classical Kwatha decoction followed by spray-drying and compression with pharmaceutical effervescent base.',
      inClassicalText: true,
      intendedAsFood: false,
      cosmeticOnly: false,
      hasClinicalEvidence: false,
      isStandardisedExtract: false,
      containsScheduleE: false
    },
    regulatoryMap: {
      ipProtection: {
        summary: 'Therapeutic claims are barred under Section 3(p). Tablet delivery mechanism may qualify for utility patent.',
        points: [
          'Section 3(p) directly bars patenting Triphala therapeutic properties.',
          'Effervescent stability excipient composition may be patentable if novel and non-obvious.'
        ],
        citations: [SAMPLE_CITATIONS[1]]
      },
      traditionalKnowledge: {
        summary: 'Classical formula verbatim in Sharangadhara Samhita (Madhyama Khanda Chapter 2).',
        priorArtStatus: 'TKDL accession codes: JA01/102, JA01/103. Prior art is universal.',
        tkdlStatus: 'Defensive publication exists worldwide.',
        citations: [SAMPLE_CITATIONS[1]]
      },
      absCompliance: {
        summary: 'Exempt from NBA approval for domestic Indian commercial entity selling as classical Ayurvedic drug.',
        applicable: false,
        requirements: [
          'State Biodiversity Board prior intimation required under Section 7 of BDA 2002.',
          'No international patent may be filed without prior Form III NBA clearance.'
        ],
        authority: 'State Biodiversity Board (SBB)',
        citations: [SAMPLE_CITATIONS[2]]
      }
    },
    actionPlan: [
      {
        id: 'act-10',
        title: 'Verify First Schedule Ayurvedic Formulary of India (AFI) Monograph',
        description: 'Ensure exact 1:1:1 proportion by dry weight and conform with Pharmacopoeial Laboratory for Indian Medicine (PLIM) specs.',
        category: 'Regulatory',
        priority: 'high',
        completed: true,
        statutoryReference: 'Ayurvedic Pharmacopoeia of India (API)'
      },
      {
        id: 'act-11',
        title: 'Apply for Classical ASU Manufacturing License (Form 25D)',
        description: 'Submit proof of GMP compliance under Schedule T to State Licensing Authority.',
        category: 'Regulatory',
        priority: 'high',
        completed: false,
        statutoryReference: 'Rule 153, Drugs & Cosmetics Rules 1945'
      }
    ],
    status: 'review'
  }
];

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    id: 'upd-1',
    title: 'Biological Diversity (Amendment) Act 2023 Enforcement Rules Notified',
    date: 'March 12, 2026',
    sourceBadge: 'Biological Diversity Act',
    summary: 'Clarifies that registered AYUSH practitioners and codified traditional medicine manufacturers are exempt from prior intimation to SBBs for local biological resource access.',
    impactCases: ['Shodhita Ashwagandha Liposomal Nano-Extract', 'Triphala Kwatha Effervescent Tablets'],
    fullTextUrl: 'https://nbaindia.org'
  },
  {
    id: 'upd-2',
    title: 'FSSAI Mandates Separate QR Code Disclaimers for Ayurveda Aahar Products',
    date: 'February 28, 2026',
    sourceBadge: 'FSSAI Regulations',
    summary: 'Requires all products licensed under Ayurveda Aahar to bear a mandatory cautionary note: "Not to be used as a substitute for varied diet or prescription medicine."',
    impactCases: [],
    fullTextUrl: 'https://fssai.gov.in'
  },
  {
    id: 'upd-3',
    title: 'WIPO Treaty on Intellectual Property & Genetic Resources Enters Signature Period',
    date: 'January 15, 2026',
    sourceBadge: 'WIPO Treaty 2024',
    summary: 'Requires mandatory patent disclosure of origin for any patent application based on genetic resources or associated traditional knowledge across 193 member states.',
    impactCases: ['Shodhita Ashwagandha Liposomal Nano-Extract'],
    fullTextUrl: 'https://wipo.int'
  },
  {
    id: 'upd-4',
    title: 'Ayush Ministry Issues Standardized Phytopharmaceutical Monograph Guidelines',
    date: 'January 04, 2026',
    sourceBadge: 'Ministry of Ayush',
    summary: 'Establishes rapid 60-day expedited safety evaluation track for botanical drugs featuring standardized HPLC finger-printed markers.',
    impactCases: [],
    fullTextUrl: 'https://ayush.gov.in'
  }
];
