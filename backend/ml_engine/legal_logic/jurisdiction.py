def get_index_for_jurisdiction(jurisdiction: str, all_indices: dict):
    """
    all_indices = { "IN": india_index_bundle, "INTL": international_index_bundle }
    This function is the ONLY place jurisdiction selection happens.
    Every retrieval call must go through here -- never query both at once.
    """
    if jurisdiction not in all_indices:
        raise ValueError(f"Unknown jurisdiction: {jurisdiction}")
        
    return all_indices[jurisdiction]
