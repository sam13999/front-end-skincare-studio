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
  review_revision?: string;
  review_status?: "pending_review" | "needs_correction" | "approved" | "sent";
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

export type EditPath = Array<string | number>;
export interface ReportEditing {
  fields: Array<{ path: EditPath; label: string; section: string; value: string }>;
  zooms: Array<{ signal_id: string; source_photo: string; crop_box: number[]; crop_method: string; source_width: number; source_height: number; title: string }>;
  history: Array<{ revision: number; action: string; reason: string; snapshot: string }>;
  review_revision: string;
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
    const message = body && typeof body === "object"
      ? String((body as { message?: string; detail?: { message?: string } }).detail?.message || (body as { message?: string }).message || "")
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
    cache: "no-store",
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


export async function reviewAdminReport(token: string, sessionId: string, action: "approve" | "reject", expectedRevision: string, reason?: string) {
  return adminFetch<Record<string, unknown>>(token, `/v1/admin/session/${encodeURIComponent(sessionId)}/review`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, expected_revision: expectedRevision, reason }),
  });
}

const editingPath = (sessionId: string) => `/v1/admin/session/${encodeURIComponent(sessionId)}/editing`;

export const fetchReportEditing = (token: string, sessionId: string) =>
  adminFetch<ReportEditing>(token, editingPath(sessionId));

export const saveReportText = (token: string, sessionId: string, expectedRevision: string, changes: Array<{ path: EditPath; value: string }>) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/text`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision, changes }),
  });

export const saveReportCrop = (token: string, sessionId: string, index: number, expectedRevision: string, rect: number[]) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/zoom/${index}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision, rect }),
  });

export const revertReport = (token: string, sessionId: string, revision: number, expectedRevision: string) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/revert`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision, revision }),
  });

export async function fetchOriginalZoom(token: string, sessionId: string, index: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${editingPath(sessionId)}/zoom/${index}/original`, {
    headers: { "X-Admin-Token": token, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Photo originale indisponible.");
  return response.blob();
}
