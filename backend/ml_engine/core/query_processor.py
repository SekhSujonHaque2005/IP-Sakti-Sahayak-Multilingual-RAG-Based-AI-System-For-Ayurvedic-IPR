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
    if any(w in query_lower for w in ["section", "rule", "article", "what does", "define"]):
        return "legal_lookup"
    if any(w in query_lower for w in ["how to register", "how to file", "steps to", "process for", "procedure"]):
        return "regulatory_pathway"
    if any(w in query_lower for w in ["can i patent", "patentable", "patent", "inventive", "novelty"]):
        return "patentability_check"
    if any(w in query_lower for w in ["compare", "difference", "versus", " vs ", " vs.", "between"]):
        return "comparison"
    if any(w in query_lower for w in ["classify", "type of", "category", "what kind", "classical or"]):
        return "classification"
    if any(w in query_lower for w in ["abs", "biodiversity", "biological resource", "nagoya", "benefit sharing"]):
        return "compliance"
    return "general_info"


def is_simple_query(query: str, intent: str) -> bool:
    """Check if a query is too short/simple to benefit from rewriting."""
    word_count = len(query.split())
    if word_count <= 4 and intent == "general_info":
        return True
    if word_count <= 2:
        return True
    # "what is X" pattern — don't add prefixes, the query is already clear
    if query.lower().strip().startswith(("what is", "what are", "tell me about", "explain")):
        if word_count <= 6:
            return True
    return False


def expand_query(query: str) -> str:
    """Add legal synonyms to improve retrieval, but only for specific terms."""
    expanded_terms = []
    query_lower = query.lower()
    for keyword, synonyms in LEGAL_SYNONYMS.items():
        if keyword.lower() in query_lower:
            expanded_terms.extend(synonyms[:2])
    if expanded_terms:
        return f"{query} {' '.join(expanded_terms)}"
    return query


def rewrite_for_retrieval(query: str, intent: str) -> str:
    """
    Rewrite the query to improve retrieval quality.
    FIXED: Don't mangle simple/short queries — only add prefixes
    for specific, complex queries.
    """
    # Don't rewrite simple queries — they work fine as-is
    if is_simple_query(query, intent):
        return query

    intent_prefixes = {
        "legal_lookup": "legal provision text of",
        "regulatory_pathway": "regulatory steps process for",
        "patentability_check": "patentability requirements under Indian law for",
        "comparison": "comparison between",
        "classification": "Ayurveda product classification criteria for",
        "compliance": "ABS compliance requirements for",
        "general_info": "",
    }
    prefix = intent_prefixes.get(intent, "")
    expanded = expand_query(query)
    if prefix:
        return f"{prefix} {expanded}"
    return expanded


def extract_legal_entities(query: str) -> dict:
    import re
    entities = {
        "sections": re.findall(r'(?:Section|Rule|Article|Schedule)\s+[\d\w\-\.()]+', query, re.IGNORECASE),
        "acts": re.findall(r'(?:[\w\s]+Act[\s,]\s*\d{4})', query, re.IGNORECASE),
        "jurisdictions": [],
    }
    query_lower = query.lower()
    if any(w in query_lower for w in ["india", "indian", "domestic", "national"]):
        entities["jurisdictions"].append("IN")
    if any(w in query_lower for w in ["international", "global", "wipo", "treaty", "foreign"]):
        entities["jurisdictions"].append("INTL")
    return entities
