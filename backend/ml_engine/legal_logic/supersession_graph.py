import json

SUPERSESSION_MAP = {
    # Title format
    "Biological Diversity Rules 2004": {
        "superseded_by": "Biological Diversity Rules 2024",
    },
    "Biological Diversity Rules 2024": {
        "implements": "Biological Diversity (Amendment) Act 2023",
        "supplemented_by": "ABS Regulations 2025",
    },
    "Biological Diversity Act 2002": {
        "superseded_by": "Biological Diversity (Amendment) Act 2023",
    },
    "ABS Guidelines 2014": {
        "superseded_by": "ABS Regulations 2025",
    },
    "Patents Rules 2003": {
        "superseded_by": "Patents (Amendment) Rules 2024",
    },
    "Drugs and Cosmetics Act 1940": {
        "superseded_by": "Drugs and Cosmetics (Amendment) Act 2008",
    },
    
    # Snake_case format (matching chunk document IDs)
    "biological_diversity_rules_2004": {
        "superseded_by": "biological_diversity_rules_2024",
    },
    "biological_diversity_act_2002": {
        "superseded_by": "biological_diversity_amendment_act_2023",
    },
    "abs_guidelines_2014": {
        "superseded_by": "abs_regulations_2025",
    },
    "patents_rules_2003": {
        "superseded_by": "patents_amendment_rules_2024",
    },
}

def _normalize_key(name: str) -> str:
    return name.lower().replace("_", " ").replace("-", " ").strip()

def resolve_current_document(document_name: str) -> dict:
    """
    Given a document name found by retrieval, walk the supersession
    map forward until we reach the current, in-force version.
    Returns the current document name and the traversal path taken
    (useful for showing the user *why* we redirected them).
    """
    path = [document_name]
    current = document_name
    visited = set()

    while current in SUPERSESSION_MAP and "superseded_by" in SUPERSESSION_MAP[current]:
        if current in visited:
            break
        visited.add(current)
        current = SUPERSESSION_MAP[current]["superseded_by"]
        path.append(current)

    return {"current_document": current, "traversal_path": path}

if __name__ == "__main__":
    print("Testing Supersession Graph resolution...")
    result = resolve_current_document("Biological Diversity Rules 2004")
    print("Query: Biological Diversity Rules 2004")
    print(f"Result: {json.dumps(result, indent=2)}")
