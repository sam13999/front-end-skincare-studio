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
    body: JSON.stringify({ recipient_email: recipientEmail, send_email: true }),
  }, PIPELINE_TIMEOUT_MS);
  return parseResponse<RunPipelineResponse>(response);
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
