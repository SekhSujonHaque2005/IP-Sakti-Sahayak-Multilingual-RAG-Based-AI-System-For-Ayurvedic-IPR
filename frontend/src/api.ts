/**
 * API configuration and utility functions for communicating with the
 * VaidyaSetu backend at http://localhost:8000/api/v1/public/*
 */

const API_BASE = "http://localhost:8000/api/v1/public";

/**
 * Send a RAG query to the public endpoint (no auth required).
 * Returns { answer, confidence, sources, disclaimer, supersession_paths, jurisdiction }.
 */
export async function queryRAG(
  query: string,
  jurisdiction: string = "IN",
  sessionId?: string,
) {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      jurisdiction,
      session_id: sessionId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Backend error");
  }
  return res.json();
}

/**
 * Classify a formulation via the public endpoint (no auth required).
 * Returns { category, description, regulatory_pathway }.
 */
export async function classifyFormulation(answers: {
  in_classical_text: boolean;
  intended_as_food: boolean;
  cosmetic_only: boolean;
  has_clinical_evidence: boolean;
  is_standardised_extract: boolean;
  contains_schedule_e_ingredients: boolean;
}) {
  const res = await fetch(`${API_BASE}/classifier/formulation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Backend error");
  }
  return res.json();
}
