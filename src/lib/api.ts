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

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const code = typeof body === "object" && body && "code" in body
      ? String((body as { code?: unknown }).code || "")
      : "";
    const messages: Record<string, string> = {
      photos_not_usable: "Nous n’avons pas réussi à analyser vos photos. Reprenez-les avec le visage net, bien éclairé et entièrement visible.",
      analysis_temporarily_unavailable: "L’analyse est temporairement indisponible. Merci de réessayer dans quelques minutes.",
    };
    const message = messages[code] || "Une erreur est survenue pendant l’analyse. Merci de réessayer.";
    throw new Error(message);
  }

  return body as T;
}

export async function createSession(payload: unknown): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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
  const response = await fetch(`${API_BASE_URL}/v1/session/${encodeURIComponent(sessionId)}/photos`, {
    method: "POST",
    body: formData,
  });
  return parseResponse(response);
}

export async function runPipeline(sessionId: string, recipientEmail: string): Promise<RunPipelineResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/session/${encodeURIComponent(sessionId)}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient_email: recipientEmail, send_email: true }),
  });
  return parseResponse<RunPipelineResponse>(response);
}
