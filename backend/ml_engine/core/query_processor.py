LEGAL_SYNONYMS = {
    "patent": ["patentability", "Section 3(p)", "inventive step", "prior art", "novelty"],
    "biodiversity": ["ABS", "biological resource", "Nagoya Protocol", "NBA", "access and benefit sharing"],
    "ayurveda": ["ASU", "classical formulation", "proprietary medicine", "Rule 158-B", "Ayurvedic Pharmacopoeia"],
    "trademark": ["GI", "geographical indication", "brand protection", "trade mark"],
    "drug": ["Drugs and Cosmetics Act", "Schedule T", "manufacturing license", "CDSCO"],
    "food": ["FSSAI", "Ayurveda Aahara", "nutraceutical", "food safety"],
    "cosmetic": ["cosmetic provision", "cosmetic license", "beauty product"],
    "phytopharmaceutical": ["standardised extract", "plant extract", "botanical drug"],
    "TKDL": ["traditional knowledge", "prior art", "traditional knowledge digital library"],
    "WIPO": ["GRATK", "genetic resources", "traditional knowledge treaty"],
    # Hindi/Hinglish Keyword Expansions
    "आयुर्वेद": ["Ayurveda", "ASU medicine", "AYUSH regulatory"],
    "रूल्स": ["Drugs and Cosmetics Act 1940", "Rule 158B", "Schedule T GMP"],
    "रूल": ["Rule 158B", "statutory rule"],
    "नियम": ["Drugs and Cosmetics Rules", "Rule 158B", "statutory regulations"],
    "कानून": ["Drugs and Cosmetics Act 1940", "Patents Act 1970", "Biological Diversity Act"],
    "पेटेंट": ["Section 3(p) Patents Act 1970", "TKDL prior art bar"],
    "दवा": ["ASU formulation", "classical medicine", "proprietary drug"],
    "औषधि": ["Ayurvedic medicine", "classical formulation", "Rule 158B"],
    "लाइसेंस": ["ASU manufacturing license", "Rule 158B pathway", "Schedule T"],
}

INTENT_CATEGORIES = {
    "legal_lookup": "User wants to know what a specific law/rule says",
    "regulatory_pathway": "User wants to know steps to register/license a product",
    "patentability_check": "User wants to know if something can be patented",
    "comparison": "User wants to compare two legal provisions or jurisdictions",
    "classification": "User needs to classify their product type",
    "compliance": "User wants to check ABS/biodiversity compliance",
    "general_info": "General question about Ayurveda IP landscape",
}

def detect_intent(query: str) -> str:
    query_lower = query.lower()
    if any(w in query_lower for w in ["section", "rule", "article", "what does", "define", "रूल्स", "रूल", "नियम", "कानून", "धारा", "अधिनियम"]):
        return "legal_lookup"
    if any(w in query_lower for w in ["how to register", "how to file", "steps to", "process for", "procedure", "लाइसेंस", "पंजीकरण", "प्रक्रिया", "अनुमति"]):
        return "regulatory_pathway"
    if any(w in query_lower for w in ["can i patent", "patentable", "patent", "inventive", "novelty", "पेटेंट"]):
        return "patentability_check"
    if any(w in query_lower for w in ["compare", "difference", "versus", " vs ", " vs.", "between", "अंतर", "तुलना"]):
        return "comparison"
    if any(w in query_lower for w in ["classify", "type of", "category", "what kind", "classical or", "वर्गीकरण", "प्रकार"]):
        return "classification"
    if any(w in query_lower for w in ["abs", "biodiversity", "biological resource", "nagoya", "benefit sharing", "जैव विविधता", "अनुपालन"]):
        return "compliance"
    return "general_info"


def is_simple_query(query: str, intent: str) -> bool:
    """Check if a query is too short/simple to benefit from rewriting."""
    word_count = len(query.split())
    if word_count <= 4 and intent == "general_info":
        return True
    if word_count <= 2:
        return True
    if query.lower().strip().startswith(("what is", "what are", "tell me about", "explain")):
        if word_count <= 6:
            return True
    return False


def expand_query(query: str) -> str:
    """Add legal synonyms in English and Hindi to improve dense + sparse retrieval."""
    expanded_terms = []
    query_lower = query.lower()
    for keyword, synonyms in LEGAL_SYNONYMS.items():
        if keyword.lower() in query_lower:
            expanded_terms.extend(synonyms[:3])
    if expanded_terms:
        # Keep unique terms
        unique_terms = list(dict.fromkeys(expanded_terms))
        return f"{query} {' '.join(unique_terms)}"
    return query


def rewrite_for_retrieval(query: str, intent: str) -> str:
    """
    Rewrite the query to improve retrieval quality across vector indices.
    Preserves original query and appends high-value statutory terms.
    """
    expanded = expand_query(query)
    return expanded


def get_clean_web_search_query(raw_query: str) -> str:
    """
    Generates a clean, targeted query for external search engines
    so that searches for Ayurveda legal/regulatory rules don't return
    irrelevant commercial industrial supplies.
    """
    import re
    q = raw_query.strip()
    q_clean = re.sub(r'^(tell me about|what is|explain|who is|can you tell me about|मुझे|बताओ|सारे)\s+', '', q, flags=re.IGNORECASE).strip()

    # Detect if query is about Ayurveda regulations/rules
    has_ayurveda = any(k in q.lower() for k in ["ayurved", "आयुर्वेद", "herb", "herbal", "औषधि", "दवा"])
    has_rules = any(k in q.lower() for k in ["rule", "rules", "रूल्स", "रूल", "नियम", "कानून", "regulation", "act", "law"])

    if has_ayurveda and has_rules:
        return "Ayurveda regulatory rules India Drugs and Cosmetics Act 1940 Rule 158B Schedule T AYUSH"
    elif has_rules and not has_ayurveda:
        return f"{q_clean} Ayurveda pharmaceutical regulatory law India"
    elif has_ayurveda:
        return f"Ayurveda AYUSH regulation {q_clean}"

    return q_clean if len(q_clean) >= 3 else q
