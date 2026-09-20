import re

DOCUMENT_TITLES = {
    "patents_act_1970": "The Patents Act, 1970",
    "patents_amendment_rules_2024": "Patents (Amendment) Rules, 2024",
    "patents_amendment_rules_2020": "Patents (Amendment) Rules, 2020",
    "patents_amendment_rules_2021": "Patents (Amendment) Rules, 2021",
    "drugs_and_cosmetics_act_1940": "Drugs and Cosmetics Act, 1940",
    "drugs_and_cosmetics_rules_1945_2024": "Drugs and Cosmetics Rules, 1945 (Consolidated 2024)",
    "drugs_fifth_amendment_rules_2024": "Drugs and Cosmetics (Fifth Amendment) Rules, 2024",
    "drugs_and_magic_remedies_act_1954": "Drugs and Magic Remedies Act, 1954",
    "biological_diversity_act_2002": "Biological Diversity Act, 2002",
    "biological_diversity_amendment_act_2023": "Biological Diversity (Amendment) Act, 2023",
    "ppvfr_act_2001": "Protection of Plant Varieties & Farmers' Rights Act, 2001",
    "ppvfr_act_2001_english": "Protection of Plant Varieties & Farmers' Rights Act, 2001",
    "ayush_guidelines_2025": "Guidelines for Examination of AYUSH Related Inventions (2025)",
    "ayurveda_aahar_regulations_2022": "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
    "ayurveda_aahara_regulations_2022": "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
    "public_notice_asuh_drugs_medicines": "Public Notice: ASUH Drugs & Medicines Regulations",
    "tkdl_general_information": "Traditional Knowledge Digital Library (TKDL) Information",
    "tkdl_access_terms": "TKDL Access Terms & Guidelines",
    "tkdl_faq": "TKDL Frequently Asked Questions",
    "trade_marks_act_1999_english": "Trade Marks Act, 1999",
    "trade_marks_rules_2017": "Trade Marks Rules, 2017",
    "designs_rules_2001_english": "Designs Rules, 2001",
    "geographical_indications_act_1999_english": "Geographical Indications of Goods Act, 1999",
    "jan_vishwas_amendment_act_2023": "Jan Vishwas (Amendment of Provisions) Act, 2023",
}

DOCUMENT_TITLES_HI = {
    "patents_act_1970": "पेटेंट अधिनियम, 1970",
    "patents_amendment_rules_2024": "पेटेंट (संशोधन) नियम, 2024",
    "patents_amendment_rules_2020": "पेटेंट (संशोधन) नियम, 2020",
    "patents_amendment_rules_2021": "पेटेंट (संशोधन) नियम, 2021",
    "drugs_and_cosmetics_act_1940": "औषध एवं प्रसाधन सामग्री अधिनियम, 1940",
    "drugs_and_cosmetics_rules_1945_2024": "औषध एवं प्रसाधन सामग्री नियम, 1945 (संशोधित 2024)",
    "drugs_fifth_amendment_rules_2024": "औषध एवं प्रसाधन सामग्री (पाँचवाँ संशोधन) नियम, 2024",
    "drugs_and_magic_remedies_act_1954": "औषध एवं जादुई उपचार अधिनियम, 1954",
    "biological_diversity_act_2002": "जैविक विविधता अधिनियम, 2002",
    "biological_diversity_amendment_act_2023": "जैविक विविधता (संशोधन) अधिनियम, 2023",
    "ppvfr_act_2001": "पौध किस्म और कृषक अधिकार संरक्षण अधिनियम, 2001",
    "ppvfr_act_2001_english": "पौध किस्म और कृषक अधिकार संरक्षण अधिनियम, 2001",
    "ayush_guidelines_2025": "आयुष-संबंधी आविष्कारों के परीक्षण हेतु दिशानिर्देश (2025)",
    "ayurveda_aahar_regulations_2022": "खाद्य सुरक्षा एवं मानक (आयुर्वेद आहार) विनियम, 2022",
    "ayurveda_aahara_regulations_2022": "खाद्य सुरक्षा एवं मानक (आयुर्वेद आहार) विनियम, 2022",
    "public_notice_asuh_drugs_medicines": "सार्वजनिक सूचना: आयुष (ASU) औषध विनियामक निर्देश",
    "tkdl_general_information": "पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) सामान्य सूचना",
    "tkdl_access_terms": "पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) उपयोग शर्तें",
    "tkdl_faq": "पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) मार्गदर्शिका",
    "trade_marks_act_1999_english": "व्यापार चिह्न अधिनियम, 1999",
    "trade_marks_act_1999_hindi": "व्यापार चिह्न अधिनियम, 1999",
    "trade_marks_rules_2017": "व्यापार चिह्न नियम, 2017",
    "designs_rules_2001_english": "डिज़ाइन नियम, 2001",
    "geographical_indications_act_1999_english": "भौगोलिक उपदर्शन अधिनियम, 1999",
    "jan_vishwas_amendment_act_2023": "जन विश्वास (प्रावधानों का संशोधन) अधिनियम, 2023",
}

def format_document_title(doc_id: str, language: str = "en") -> str:
    if not doc_id:
        return "विधिक प्रावधान" if language == "hi" else "Statutory Authority"
    clean_id = doc_id.lower().replace("-", "_").replace(" ", "_").strip()
    clean_id = re.sub(r'[^a-z0-9_]', '', clean_id)
    if clean_id.startswith("the_"):
        clean_id = clean_id[4:]
    if language == "hi":
        if clean_id in DOCUMENT_TITLES_HI:
            return DOCUMENT_TITLES_HI[clean_id]
        for k, v in DOCUMENT_TITLES_HI.items():
            if k in clean_id or clean_id in k:
                return v
    if clean_id in DOCUMENT_TITLES:
        return DOCUMENT_TITLES[clean_id]
    for k, v in DOCUMENT_TITLES.items():
        if k in clean_id or clean_id in k:
            return v
    # Humanize name: e.g. "patents_amendment_rules_2024" -> "Patents Amendment Rules 2024"
    parts = [p.capitalize() for p in clean_id.split("_") if p]
    return " ".join(parts)

def clean_statutory_text(raw_text: str) -> str:
    """
    Cleans raw gazette text, OCR hex noise, and administrative publishing headers,
    extracting only substantive legal provisions and operational rules.
    """
    if not raw_text:
        return ""

    t = raw_text

    # 1. Strip OCR hex tags and internal barcodes
    t = re.sub(r'<0x[0-9a-fA-F]+>', '', t)
    t = re.sub(r'xxx\w+xxx', '', t)
    t = re.sub(r'CG-[A-Z0-9\-_]+', '', t)
    t = re.sub(r'X-G-[A-Z0-9\-_]+', '', t)
    t = re.sub(r'\d{6,}-\d{6,}', '', t)

    # 2. Look for where substantive legal text begins to bypass gazette header boilerplate
    operative_markers = [
        r'(?:सा[\.\s]*का[\.\s]*[निज]+[\.\s]*\d+[^\n\.\;]*[\.—\-])',
        r'(?:G\.?\s*S\.?\s*R\.?\s*\d+[^\n\.\;]*[\.—\-])',
        r'(?:संक्षिप्त\s*नाम)',
        r'(?:Short\s+title)',
        r'(?:शक्तियों\s*का\s*प्रयोग\s*करते\s*हुए)',
        r'(?:In\s+exercise\s+of\s+the\s+powers)',
        r'(?:यतः\s*,)',
        r'(?:Whereas\s*,)',
        r'(?:Guidelines\s+for)',
        r'(?:Public\s+Notice)',
        r'(?:General\s+Information)',
        r'(?:Section\s+\d+)',
        r'(?:धारा\s+\d+)',
        r'(?:नियम\s+\d+)',
        r'(?:Rule\s+\d+)',
    ]
    for marker in operative_markers:
        m = re.search(marker, t, flags=re.IGNORECASE)
        if m:
            t = t[m.start():]
            break

    # 3. Strip administrative gazette publication headers if any remain
    gazette_headers = [
        r'रजिस्ट्री\s*स[\.ं]?\s*डी[\.\s]*एल[\.\s]*[-–]?\s*\d+/\d+[^\n\.\;]*',
        r'REGD\.\s*No\.\s*D\.\s*L\.\s*[-–]?\s*\d+/\d+[^\n\.\;]*',
        r'PUBLISHED\s*BY\s*AUTHORITY[^\n\.\;]*',
        r'प्रा[धिज]+कार\s*स[\.ं]?\s*प्रका[शिजि]+त[^\n\.\;]*',
        r'PART\s*II[^\n\.\;]*Sub-section\s*\([^\)]+\)[^\n\.\;]*',
        r'भाग\s*II[^\n\.\;]*उप-खण्ड\s*\([^\)]+\)[^\n\.\;]*',
        r'EXTRAORDINARY',
        r'असाधारण',
        r'No\.\s*\d+\]\s*NEW\s*DELHI[^\n\.\;]*',
        r'स[\.ं]?\s*\d+\]\s*नई\s*द[दिल्]+ी[^\n\.\;]*',
    ]
    for pattern in gazette_headers:
        t = re.sub(pattern, ' ', t, flags=re.IGNORECASE)

    # 4. Strip notification codes and raw markdown hashes & URLs
    t = re.sub(r'सा[\.\s]*का[\.\s]*[निज]+[\.\s]*\d+\([^\)]+\)[^\n\.\;]*[—\-]\s*', '', t)
    t = re.sub(r'G\.?\s*S\.?\s*R\.?\s*\d+\([^\)]+\)[^\n\.\;]*[—\-]\s*', '', t)
    t = re.sub(r'#{1,6}\s*', ' ', t)
    t = re.sub(r'https?://\S+', ' ', t)

    # 5. Clean punctuation and whitespace
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def strip_markdown_decorations(text: str) -> str:
    """
    Strips raw markdown hashes (#) and asterisks (*) from text
    while preserving clean paragraphs, section titles, and bullet points.
    """
    if not text:
        return ""
    # Strip markdown headers at line start (e.g. ### Title -> Title)
    t = re.sub(r'(?m)^#{1,6}\s*', '', text)
    # Strip bold/italics (e.g. **text** -> text, *text* -> text)
    t = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', t)
    # Clean any stray remaining # or *
    t = re.sub(r'[#*]', '', t)
    # Clean double spaces
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

