import { API_BASE_URL } from "./api";

export interface PaymentInfo {
  payment_status: "paid" | "unpaid" | "refunded" | "unknown";
  payment_amount?: number | string | null;
  payment_currency?: string | null;
  payment_provider?: string | null;
  payment_id?: string | null;
  paid_at?: string | null;
}

export interface AdminSessionSummary {
  session_id: string;
  display_name: string;
  first_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  status: "completed" | "in_progress" | "failed" | "partial";
  raw_status?: string | null;
  current_stage?: string | null;
  last_successful_stage?: string | null;
  failed_stage?: string | null;
  payment: PaymentInfo;
  email_status?: Record<string, unknown>;
  html_available: boolean;
  pdf_available: boolean;
}

export interface AdminSessionsResponse {
  items: AdminSessionSummary[];
  total: number;
  stats: {
    sessions_today: number;
    sessions_complete: number;
    sessions_failed: number;
    sessions_paid: number;
    revenue_total: number;
    currency: string;
  };
}

export interface PromptRun {
  timestamp?: string | number | null;
  status?: string;
  raw_output?: string | null;
  parsed_output?: unknown;
  qa_report?: unknown;
  debug_info?: unknown;
  artifact_name?: string;
  repaired?: boolean;
}

export interface AdminDetailResponse {
  summary: AdminSessionSummary;
  user: {
    questionnaire: Record<string, unknown>;
    photos: Array<{ kind: string; url: string }>;
  };
  analysis: Record<string, unknown>;
  prompts: Record<string, PromptRun[]>;
  qa: {
    stages: Record<string, { status: "OK" | "Warnings" | "Blocage"; issues: Array<{ code?: string; severity?: string; message?: string; stage?: string; metadata?: Record<string, unknown> }> }>;
    issues: Array<{ code?: string; severity?: string; message?: string; detail?: string; stage?: string; metadata?: Record<string, unknown> }>;
    totals: { ok: number; warnings: number; blocking: number };
    raw?: unknown;
  };
  artifacts: Array<{ name: string; path: string; size: number; modified_at: string; media_type: string }>;
  history: Array<Record<string, unknown>>;
  rerun_history: Array<Record<string, unknown>>;
  raw_session: Record<string, unknown>;
}

async function adminFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "X-Admin-Token": token,
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body
      ? String((body as { message?: unknown }).message || "")
      : "";
    throw new Error(message || (response.status === 401 ? "Token admin invalide." : "Erreur admin."));
  }
  return body as T;
}

export async function adminAuthCheck(token: string): Promise<void> {
  await adminFetch<{ authenticated: boolean }>(token, "/v1/admin/auth/check");
}

export async function fetchAdminSessions(token: string, params: { search?: string; status?: string; payment?: string } = {}): Promise<AdminSessionsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.payment) query.set("payment", params.payment);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return adminFetch<AdminSessionsResponse>(token, `/v1/admin/sessions${suffix}`);
}

export async function fetchAdminSession(token: string, sessionId: string): Promise<AdminDetailResponse> {
  return adminFetch<AdminDetailResponse>(token, `/v1/admin/session/${encodeURIComponent(sessionId)}`);
}

export async function fetchAdminArtifact(token: string, sessionId: string, kind: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/v1/admin/session/${encodeURIComponent(sessionId)}/artifact/${kind.split("/").map(encodeURIComponent).join("/")}`, {
    headers: {
      "X-Admin-Token": token,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Artefact introuvable.");
  return response.blob();
}

export async function rerunAdminSession(token: string, sessionId: string, reason?: string): Promise<Record<string, unknown>> {
  return adminFetch<Record<string, unknown>>(token, `/v1/admin/session/${encodeURIComponent(sessionId)}/rerun`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage: "full_pipeline", reason: reason || null }),
  });
}

export async function resendAdminEmail(token: string, sessionId: string): Promise<Record<string, unknown>> {
  return adminFetch<Record<string, unknown>>(token, `/v1/admin/session/${encodeURIComponent(sessionId)}/resend-email`, {
    method: "POST",
  });
}
