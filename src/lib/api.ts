const DEFAULT_API_BASE_URL = "https://skincoach-backend-production.up.railway.app";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export type ClientReportKind = "html" | "pdf";

export function clientReportUrl(sessionId: string, kind: ClientReportKind): string {
  return `${API_BASE_URL}/v1/session/${encodeURIComponent(sessionId)}/client/${kind}`;
}

export interface CreateSessionResponse {
  session_id: string;
  status: string;
  session_path: string;
}

export interface RunPipelineResponse {
  status: string;
  session_id: string;
  workdir?: string | null;
  pdf_path?: string | null;
  docx_path?: string | null;
  email_status?: { requested?: boolean | null; sent?: boolean | null; reason?: string | null };
}

const REQUEST_TIMEOUT_MS = 30_000;
const PIPELINE_TIMEOUT_MS = 180_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le délai de réponse est dépassé. Vérifiez votre connexion puis réessayez.");
    }
    if (error instanceof TypeError) {
      throw new Error("Le service est momentanément inaccessible. Vérifiez votre connexion puis réessayez.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const bodyObject = typeof body === "object" && body ? body as Record<string, unknown> : null;
    const detail = bodyObject?.detail;
    const code = bodyObject && "code" in bodyObject
      ? String(bodyObject.code || "")
      : detail && typeof detail === "object" && "code" in detail
        ? String((detail as { code?: unknown }).code || "")
        : "";
    const messages: Record<string, string> = {
      photos_not_usable: "Nous n’avons pas réussi à analyser vos photos. Reprenez-les avec le visage net, bien éclairé et entièrement visible.",
      analysis_temporarily_unavailable: "L’analyse est temporairement indisponible. Merci de réessayer dans quelques minutes.",
    };
    const message = messages[code]
      || (response.status === 404
        ? "Cette session n’est plus disponible. Recommencez l’analyse."
        : response.status === 422
          ? "Certaines informations sont invalides. Vérifiez vos réponses puis réessayez."
          : response.status >= 500
            ? "Le service est temporairement indisponible. Merci de réessayer dans quelques minutes."
            : "Une erreur est survenue pendant l’analyse. Merci de réessayer.");
    throw new Error(message);
  }

  return body as T;
}

export async function createSession(payload: unknown): Promise<CreateSessionResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, REQUEST_TIMEOUT_MS);
  return parseResponse<CreateSessionResponse>(response);
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, encoded] = dataUrl.split(",");
  if (!header || !encoded) throw new Error("Photo invalide.");
  const mime = header.match(/^data:([^;]+);base64$/)?.[1] || "image/jpeg";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], filename, { type: mime });
}

export async function uploadPhotos(
  sessionId: string,
  photos: { face?: string | null; profil?: string | null }
): Promise<unknown> {
  const formData = new FormData();
  if (photos.face) formData.append("face", dataUrlToFile(photos.face, "face.jpg"));
  if (photos.profil) formData.append("profil", dataUrlToFile(photos.profil, "profil.jpg"));
  if (!photos.face && !photos.profil) throw new Error("Une photo exploitable est nécessaire.");
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/session/${encodeURIComponent(sessionId)}/photos`, {
    method: "POST",
    body: formData,
  }, REQUEST_TIMEOUT_MS);
  return parseResponse(response);
}

export async function runPipeline(sessionId: string, recipientEmail: string): Promise<RunPipelineResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/session/${encodeURIComponent(sessionId)}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient_email: recipientEmail, send_email: false }),
  }, PIPELINE_TIMEOUT_MS);
  return parseResponse<RunPipelineResponse>(response);
}

export type Offer = "analyse" | "suivi";

export const OFFERS: Record<Offer, { label: string; price: number }> = {
  analyse: { label: "Analyse SkinView", price: 39 },
  suivi: { label: "SkinView Suivi", price: 59 },
};

export interface PromoCheckResponse {
  valid: boolean;
  code: string;
  percent: number;
  base_amount: number;
  final_amount: number;
}

export interface CheckoutResponse {
  status: "redirect" | "paid";
  session_id: string;
  checkout_url?: string;
}

export interface PaymentStatusResponse {
  session_id: string;
  payment_status: string;
  analysis_status?: string | null;
  offer?: string | null;
  amount?: number | null;
}

async function paymentFetch<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, init, REQUEST_TIMEOUT_MS);
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: { message?: string } | string } | null;
    const detail = body?.detail;
    const message = typeof detail === "object" && detail?.message
      ? detail.message
      : response.status >= 500
        ? "Le paiement est momentanément indisponible. Réessayez dans quelques minutes."
        : "Une erreur est survenue. Merci de réessayer.";
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function checkPromo(code: string, offer: Offer): Promise<PromoCheckResponse> {
  return paymentFetch<PromoCheckResponse>("/v1/promo/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, offer }),
  });
}

export function startCheckout(sessionId: string, offer: Offer, promoCode?: string | null): Promise<CheckoutResponse> {
  return paymentFetch<CheckoutResponse>(`/v1/session/${encodeURIComponent(sessionId)}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, promo_code: promoCode || null }),
  });
}

export interface PhotoCheckResponse {
  ok: boolean;
  checked_at?: string;
  problems: Array<{ photo: "face" | "side"; message: string }>;
}

export async function checkPhotos(sessionId: string): Promise<PhotoCheckResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/session/${encodeURIComponent(sessionId)}/photos/check`, {
    method: "POST",
  }, PIPELINE_TIMEOUT_MS);
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: { message?: string } } | null;
    throw new Error(body?.detail?.message || "La vérification des photos a échoué. Réessayez dans quelques minutes.");
  }
  return response.json() as Promise<PhotoCheckResponse>;
}

export function confirmPayment(sessionId: string, checkoutSessionId: string): Promise<PaymentStatusResponse> {
  return paymentFetch<PaymentStatusResponse>("/v1/payment/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, checkout_session_id: checkoutSessionId }),
  });
}

export function getPaymentStatus(sessionId: string): Promise<PaymentStatusResponse> {
  return paymentFetch<PaymentStatusResponse>(`/v1/session/${encodeURIComponent(sessionId)}/payment-status`, {
    method: "GET",
  });
}

/** Mémorise le paiement en cours pour pouvoir le reprendre après une annulation. */
export const PENDING_CHECKOUT_KEY = "skinview_pending_checkout";

export interface PendingCheckout {
  sessionId: string;
  offer: Offer;
  promoCode?: string | null;
  email?: string;
}

export function savePendingCheckout(value: PendingCheckout): void {
  try { localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(value)); } catch { /* stockage indisponible */ }
}

export function readPendingCheckout(): PendingCheckout | null {
  try {
    const value = JSON.parse(localStorage.getItem(PENDING_CHECKOUT_KEY) || "null");
    return value && typeof value.sessionId === "string" ? value as PendingCheckout : null;
  } catch {
    return null;
  }
}

export function formatEuros(amount: number): string {
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 })}\u00a0€`;
}

export async function downloadClientReport(sessionId: string): Promise<Blob> {
  const response = await fetchWithTimeout(clientReportUrl(sessionId, "pdf"), {
    method: "GET",
    headers: { Accept: "application/pdf" },
  }, REQUEST_TIMEOUT_MS);
  if (!response.ok) await parseResponse(response);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
    throw new Error("Le rapport PDF n’est pas disponible pour le moment. Réessayez dans quelques instants.");
  }
  return response.blob();
}

