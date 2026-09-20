/**
 * API configuration and utility functions for communicating with the
 * VaidyaSetu backend at http://localhost:8000/api/v1/*
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const API_BASE = `${BASE_URL}/public`;
const AUTH_BASE = `${BASE_URL}/auth`;

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  is_active?: boolean;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

/**
 * Get stored auth token for requests
 */
export function getStoredToken(): string | null {
  return localStorage.getItem("vaidya_token");
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    throw new Error("Unable to connect to the backend server (http://localhost:8000). Please verify the backend is running.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Incorrect email or password");
  }
  const data: AuthResponse = await res.json();
  if (data.access_token) {
    localStorage.setItem("vaidya_token", data.access_token);
  }
  return data;
}

/**
 * Register new user with email, password, and optional full name
 */
export async function signupUser(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  } catch (err: any) {
    throw new Error("Unable to connect to the backend server (http://localhost:8000). Please verify the backend is running.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to create account");
  }
  const data: AuthResponse = await res.json();
  if (data.access_token) {
    localStorage.setItem("vaidya_token", data.access_token);
  }
  return data;
}

/**
 * Authenticate with Google ID Token via Google Identity Services
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_token: idToken }),
    });
  } catch (err: any) {
    throw new Error("Unable to connect to the backend server (http://localhost:8000). Please verify the backend is running.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Google authentication failed");
  }
  const data: AuthResponse = await res.json();
  if (data.access_token) {
    localStorage.setItem("vaidya_token", data.access_token);
  }
  return data;
}

/**
 * Fetch current authenticated user's profile
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${AUTH_BASE}/me`, {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Session expired or invalid");
  }
  return res.json();
}

/**
 * Logout current user and clear stored tokens
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    // Ignore network errors on logout
  }
  localStorage.removeItem("vaidya_token");
}

/**
 * Send password recovery email
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${AUTH_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to request password reset");
  }
  return res.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${AUTH_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to reset password");
  }
  return res.json();
}

/**
 * Send a RAG query to the public endpoint (no auth required).
 * Returns { answer, confidence, sources, disclaimer, supersession_paths, jurisdiction, language }.
 */
export async function queryRAG(
  query: string,
  jurisdiction: string = "IN",
  language: string = "en",
  sessionId?: string,
) {
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      query,
      jurisdiction,
      language,
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
    credentials: "include",
    body: JSON.stringify(answers),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Backend error");
  }
  return res.json();
}
