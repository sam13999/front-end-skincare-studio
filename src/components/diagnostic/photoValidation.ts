/**
 * Photo validation aligned with skin-analysis API expectations (Zyla-style).
 * Goal: filter clearly unusable photos, accept imperfect-but-usable ones.
 */

export interface PhotoValidationConfig {
  minBrightness: number;
  maxBrightness: number;
  minSharpness: number;
  minResolution: number;       // recommended min dim (px)
  hardMinResolution: number;   // hard reject below
  minFileSizeKB: number;       // warning below
  maxFileSizeKB: number;       // hard reject above
}

export const faceConfig: PhotoValidationConfig = {
  minBrightness: 45,
  maxBrightness: 240,
  minSharpness: 6,
  minResolution: 600,
  hardMinResolution: 300,
  minFileSizeKB: 200,
  maxFileSizeKB: 10 * 1024,
};

export const profileConfig: PhotoValidationConfig = {
  ...faceConfig,
  minSharpness: 5,
};

export const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export type PhotoQuality = "none" | "insufficient" | "acceptable" | "good";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: "critical" | "warning";
}

export interface ValidationResult {
  quality: PhotoQuality;
  issues: ValidationIssue[];
  scores: {
    brightness: number;
    sharpness: number;
    resolution: number;
    fileSizeKB: number;
  };
}

const GENERIC_REJECT =
  "La photo semble difficile à analyser. Essayez une photo plus nette, avec le visage visible et une lumière correcte.";

function getImageData(img: HTMLImageElement, maxSize = 512): ImageData {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function analyzeBrightness(data: ImageData): { mean: number; stdDev: number } {
  const pixels = data.data;
  const count = pixels.length / 4;
  let sum = 0;
  const lums: number[] = new Array(count);
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    const l = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    lums[j] = l;
    sum += l;
  }
  const mean = sum / count;
  let varSum = 0;
  for (let j = 0; j < count; j++) varSum += (lums[j] - mean) ** 2;
  return { mean, stdDev: Math.sqrt(varSum / count) };
}

function analyzeSharpness(data: ImageData): number {
  const { width, height } = data;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    gray[i] =
      0.299 * data.data[idx] + 0.587 * data.data[idx + 1] + 0.114 * data.data[idx + 2];
  }
  let sum = 0,
    sumSq = 0,
    count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const lap =
        -gray[(y - 1) * width + x] -
        gray[y * width + (x - 1)] +
        4 * gray[y * width + x] -
        gray[y * width + (x + 1)] -
        gray[(y + 1) * width + x];
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.sqrt(Math.max(0, variance));
}

function detectMimeFromDataUrl(dataUrl: string): string | null {
  const m = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return m ? m[1].toLowerCase() : null;
}

export async function validatePhoto(
  dataUrl: string,
  type: "face" | "profile"
): Promise<ValidationResult> {
  const config = type === "face" ? faceConfig : profileConfig;
  const issues: ValidationIssue[] = [];

  // Format check
  const mime = detectMimeFromDataUrl(dataUrl);
  if (mime && !ALLOWED_MIME.includes(mime)) {
    issues.push({
      code: "bad_format",
      message: "Format non pris en charge. Utilisez JPG, PNG ou WEBP.",
      severity: "critical",
    });
  }

  // File size (approx from base64)
  const base64Length = dataUrl.split(",")[1]?.length || 0;
  const fileSizeKB = Math.round((base64Length * 3) / 4 / 1024);
  if (fileSizeKB === 0) {
    issues.push({ code: "empty_file", message: GENERIC_REJECT, severity: "critical" });
  } else if (fileSizeKB > config.maxFileSizeKB) {
    issues.push({
      code: "file_too_large",
      message: "La photo est trop volumineuse.",
      severity: "critical",
    });
  } else if (fileSizeKB < config.minFileSizeKB) {
    // Light warning only — don't block
    issues.push({
      code: "file_small",
      message: "La photo est légère, privilégiez une meilleure qualité si possible.",
      severity: "warning",
    });
  }

  // Load image
  let img: HTMLImageElement;
  try {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
  } catch {
    return {
      quality: "insufficient",
      issues: [{ code: "load_failed", message: GENERIC_REJECT, severity: "critical" }],
      scores: { brightness: 0, sharpness: 0, resolution: 0, fileSizeKB },
    };
  }

  const minDim = Math.min(img.naturalWidth, img.naturalHeight);
  if (minDim < config.hardMinResolution) {
    issues.push({
      code: "low_resolution",
      message: "La résolution est trop faible.",
      severity: "critical",
    });
  } else if (minDim < config.minResolution) {
    issues.push({
      code: "low_resolution_warn",
      message: "Résolution un peu faible, mais utilisable.",
      severity: "warning",
    });
  }

  const imageData = getImageData(img);
  const { mean: brightness, stdDev } = analyzeBrightness(imageData);
  const sharpness = analyzeSharpness(imageData);

  // Detect uniform / near-blank images (pure black, pure white, flat)
  if (stdDev < 8) {
    issues.push({
      code: "blank_image",
      message: GENERIC_REJECT,
      severity: "critical",
    });
  }

  if (brightness < config.minBrightness) {
    issues.push({
      code: "too_dark",
      message: "La lumière est insuffisante.",
      severity: "critical",
    });
  } else if (brightness > config.maxBrightness) {
    issues.push({
      code: "overexposed",
      message: "La photo est surexposée ou en contre-jour.",
      severity: "critical",
    });
  }

  if (sharpness < config.minSharpness * 0.5) {
    issues.push({
      code: "very_blurry",
      message: "La photo semble trop floue.",
      severity: "critical",
    });
  } else if (sharpness < config.minSharpness) {
    issues.push({
      code: "slightly_blurry",
      message: "Légèrement floue, mais utilisable.",
      severity: "warning",
    });
  }

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let quality: PhotoQuality;
  if (criticalCount > 0) quality = "insufficient";
  else if (warningCount > 0) quality = "acceptable";
  else quality = "good";

  return {
    quality,
    issues,
    scores: { brightness, sharpness, resolution: minDim, fileSizeKB },
  };
}
