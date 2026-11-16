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
  qa_report?: { status?: string; issues?: Array<{ severity?: string; code?: string; message?: string; path?: string; metadata?: Record<string, unknown> }> };
  input_payload?: unknown;
  debug_info?: { submitted_input?: unknown; submitted_repair_input?: unknown } & Record<string, unknown>;
  artifact_name?: string;
  repaired?: boolean;
}

export interface AdminDetailResponse {
  summary: AdminSessionSummary;
  user: {
    questionnaire: Record<string, unknown>;
    photos: Array<{ kind: string; url: string }>;
  };
  analysis: Record<string, unknown> & {
    zyla_raw?: unknown;
    zyla_normalized?: unknown;
    zyla_maps?: Array<{ photo: string; name: string }>;
  };
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
export interface ZylaDetection {
  id: string;
  source_photo: string;
  title: string;
  zone: string;
  confidence: number | null;
  rect: [number, number, number, number];
  source_width: number;
  source_height: number;
}

export interface ReportEditing {
  detections?: ZylaDetection[];
  fields: Array<{ path: EditPath; label: string; section: string; value: string }>;
  zooms: Array<{ signal_id: string; source_photo: string; crop_box: number[]; crop_method: string; source_width: number; source_height: number; title: string; caption?: string; image_alt?: string }>;
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
    const validation = Array.isArray(body?.detail)
      ? body.detail.map((item: { msg?: string }) => item.msg?.replace(/^Value error, /, "")).filter(Boolean).join(" ")
      : "";
    throw new Error(message || validation || (response.status === 401 ? "Token admin invalide." : "Erreur admin."));
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
  return adminFetch<AdminDetailResponse>(token, `/v1/admin/session/${encodeURIComponent(sessionId)}`, { cache: "no-store" });
}

export async function fetchAdminArtifact(token: string, sessionId: string, kind: string, revision?: string): Promise<Blob> {
  const query = revision ? `?${new URLSearchParams({ revision })}` : "";
  const response = await fetch(`${API_BASE_URL}/v1/admin/session/${encodeURIComponent(sessionId)}/artifact/${kind.split("/").map(encodeURIComponent).join("/")}${query}`, {
    cache: "no-store",
    headers: {
      "X-Admin-Token": token,
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 409) throw new Error("Le rapport a changé. Actualisez la session.");
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
  adminFetch<ReportEditing>(token, editingPath(sessionId), { cache: "no-store" });

export const saveReportText = (token: string, sessionId: string, expectedRevision: string, changes: Array<{ path: EditPath; value: string }>) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/text`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision, changes }),
  });

export const saveReportCrop = (token: string, sessionId: string, index: number, expectedRevision: string, rect: number[], detectionId?: string) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/zoom/${index}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision, rect, detection_id: detectionId }),
  });

export const deleteReportZoom = (token: string, sessionId: string, index: number, expectedRevision: string) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/zoom/${index}`, {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision }),
  });

export const revertReport = (token: string, sessionId: string, revision: number, expectedRevision: string) =>
  adminFetch<{ review_revision: string }>(token, `${editingPath(sessionId)}/revert`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: expectedRevision, revision }),
  });

export async function fetchOriginalZoom(token: string, sessionId: string, index: number, detectionId?: string, revision?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (detectionId) params.set("detection_id", detectionId);
  if (revision) params.set("revision", revision);
  const query = params.size ? `?${params}` : "";
  const response = await fetch(`${API_BASE_URL}${editingPath(sessionId)}/zoom/${index}/original${query}`, {
    cache: "no-store",
    headers: { "X-Admin-Token": token, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail?.message || "Photo originale indisponible.");
  }
  return response.blob();
}

export async function fetchZylaMap(token: string, sessionId: string, photo: string, name: string): Promise<Blob> {
  const path = [sessionId, photo, name].map(encodeURIComponent);
  const response = await fetch(`${API_BASE_URL}/v1/admin/session/${path[0]}/zyla-map/${path[1]}/${path[2]}`, {
    cache: "no-store",
    headers: { "X-Admin-Token": token, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Carte Zyla indisponible ou illisible.");
  return response.blob();
}

export const routineMoments = ["matin", "soir", "hebdomadaire"] as const;
export type RoutineMoment = typeof routineMoments[number];
export interface FrequencyPlan {
  initial_per_week: number | null;
  maximum_per_week: number | null;
  days: number[];
  excluded_days: number[];
  alternate_with: string[];
  pair_with: string[];
  progression: string;
}
export interface RoutineFrequency {
  id_produit: string;
  name: string;
  initial_per_week: number | null;
  maximum_per_week: number | null;
  moments: RoutineMoment[];
  coordinates_with: string[];
}
export interface RoutineWarning { code: string; message: string; id_produit?: string; product_ids?: string[] }
export interface RoutineCandidate {
  id: string;
  route_id: string;
  frequencies: RoutineFrequency[];
  warnings: RoutineWarning[];
  texts_to_review: string[];
  stale: boolean;
}
export interface RoutineView {
  review_revision: string;
  active_version: number | null;
  source: "initial" | "prompt_4";
  adjusted_products: string[];
  route_id: string;
  initial_route_id: string;
  initial_frequencies: RoutineFrequency[];
  frequencies: RoutineFrequency[];
  products: Array<{ id_produit: string; name: string; moments: Partial<Record<RoutineMoment, Partial<FrequencyPlan>>> }>;
  warnings: RoutineWarning[];
  texts_to_review: string[];
  routes: Array<{
    route_id: string;
    nom: string;
    logique_technique: string;
    difference_majeure: string;
    available: boolean;
    missing_required_levers: string[];
    nombre_produits_cible: number | null;
    treatments: number;
    intensities?: string[];
    precautions: string[];
  }>;
  candidate: RoutineCandidate | null;
  editable: boolean;
}

const routinePath = (sessionId: string) => `${editingPath(sessionId)}/routine`;
export const fetchRoutine = (token: string, sessionId: string) =>
  adminFetch<RoutineView>(token, routinePath(sessionId), { cache: "no-store" });

function routinePost<T>(token: string, sessionId: string, action: string, revision: string, data: object) {
  return adminFetch<T>(token, `${routinePath(sessionId)}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_revision: revision, ...data }),
  });
}

export const saveFrequencies = (token: string, sessionId: string, revision: string,
  changes: Array<{ id_produit: string; moments: Partial<Record<RoutineMoment, FrequencyPlan>> }>) =>
  routinePost<{ review_revision: string }>(token, sessionId, "frequencies", revision, { changes });
export const rerunPrompt4 = (token: string, sessionId: string, revision: string, routeId: string | null) =>
  routinePost<RoutineCandidate>(token, sessionId, "prompt4", revision, { route_id: routeId });
export const decideRoutineCandidate = (token: string, sessionId: string, revision: string, candidateId: string, accept: boolean) =>
  routinePost<{ review_revision: string }>(token, sessionId, "prompt4/decision", revision, { candidate_id: candidateId, accept });

export async function fetchRoutineCandidatePdf(token: string, sessionId: string, candidateId: string) {
  const response = await fetch(`${API_BASE_URL}${routinePath(sessionId)}/prompt4/${encodeURIComponent(candidateId)}/pdf`, {
    cache: "no-store", headers: { "X-Admin-Token": token, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Aperçu de la proposition indisponible.");
  return response.blob();
}
