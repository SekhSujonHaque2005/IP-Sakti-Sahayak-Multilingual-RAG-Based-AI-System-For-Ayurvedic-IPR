def embed_query_multilingual(query: str, embed_model) -> list:
    """
    The same multilingual embedding model used for documents in
    Section 4.3 is reused here -- no translation library, no separate
    Hindi-to-English pipeline. This directly avoids the "translation
    decay" research gap described in Part 1.4.2.
    """
    return embed_model.encode([query], normalize_embeddings=True)

GENERATION_LANGUAGE_INSTRUCTION = """
Answer in the same language as the user's question. Keep legal document
names, section numbers, and clause labels in their original form
(e.g., "Section 3(p)", "Biological Diversity Rules 2024") even when the
rest of the answer is in Hindi or another language.
"""
