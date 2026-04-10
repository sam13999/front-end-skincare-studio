/**
 * Photo validation engine for skin analysis API compatibility.
 * Performs Canvas-based checks: brightness, sharpness, face coverage (simulated),
 * and returns structured quality feedback.
 */

// --- Configuration ---

export interface PhotoValidationConfig {
  minBrightness: number;       // 0-255, reject if avg brightness below
  maxBrightness: number;       // 0-255, reject if avg brightness above (overexposed/backlit)
  minSharpness: number;        // Laplacian variance threshold
  minFaceCoverage: number;     // 0-1, min fraction of image the face should occupy
  minResolution: number;       // minimum dimension (px)
  maxFileSizeKB: number;       // max file size in KB
}

export const faceConfig: PhotoValidationConfig = {
  minBrightness: 60,
  maxBrightness: 230,
  minSharpness: 12,
  minFaceCoverage: 0.15,
  minResolution: 400,
  maxFileSizeKB: 10000,
};

export const profileConfig: PhotoValidationConfig = {
  minBrightness: 55,
  maxBrightness: 230,
  minSharpness: 10,
  minFaceCoverage: 0.12,
  minResolution: 400,
  maxFileSizeKB: 10000,
};

// --- Result types ---

export type PhotoQuality = "none" | "insufficient" | "acceptable" | "good";

export interface ValidationIssue {
  code: string;
  message: string;       // user-facing, premium wording
  severity: "critical" | "warning";
}

export interface ValidationResult {
  quality: PhotoQuality;
  issues: ValidationIssue[];
  scores: {
    brightness: number;
    sharpness: number;
    faceCoverage: number;
    resolution: number;
  };
}

// --- Analysis helpers ---

function getImageData(img: HTMLImageElement, maxSize = 512): ImageData {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function analyzeBrightness(data: ImageData): number {
  const pixels = data.data;
  let sum = 0;
  const count = pixels.length / 4;
  for (let i = 0; i < pixels.length; i += 4) {
    // Perceived luminance
    sum += 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
  }
  return sum / count;
}

function analyzeSharpness(data: ImageData): number {
  // Laplacian variance — higher = sharper
  const { width, height } = data;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data.data[idx] + 0.587 * data.data[idx + 1] + 0.114 * data.data[idx + 2];
  }

  let sum = 0;
  let sumSq = 0;
  let count = 0;
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

/**
 * Simulated face coverage estimation.
 * Uses skin-tone detection in the center region as a proxy for face presence.
 * Real implementation would use a face detection API.
 */
function estimateFaceCoverage(data: ImageData): number {
  const { width, height } = data;
  const centerX = width * 0.2;
  const centerY = height * 0.1;
  const regionW = width * 0.6;
  const regionH = height * 0.7;
  
  let skinPixels = 0;
  let totalPixels = 0;

  for (let y = Math.floor(centerY); y < Math.floor(centerY + regionH); y++) {
    for (let x = Math.floor(centerX); x < Math.floor(centerX + regionW); x++) {
      const idx = (y * width + x) * 4;
      const r = data.data[idx];
      const g = data.data[idx + 1];
      const b = data.data[idx + 2];
      
      // Skin tone heuristic (works across many skin tones)
      const isSkin =
        r > 60 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 10 &&
        r - b > 15 &&
        r < 250 && g < 230;
      
      if (isSkin) skinPixels++;
      totalPixels++;
    }
  }

  return totalPixels > 0 ? skinPixels / totalPixels : 0;
}

// --- Main validation ---

export async function validatePhoto(
  dataUrl: string,
  type: "face" | "profile"
): Promise<ValidationResult> {
  const config = type === "face" ? faceConfig : profileConfig;
  const issues: ValidationIssue[] = [];

  // Load image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  // Resolution check
  const minDim = Math.min(img.naturalWidth, img.naturalHeight);
  if (minDim < config.minResolution) {
    issues.push({
      code: "low_resolution",
      message: "La résolution de la photo est trop faible",
      severity: "critical",
    });
  }

  // File size check (approximate from base64)
  const base64Length = dataUrl.split(",")[1]?.length || 0;
  const fileSizeKB = Math.round((base64Length * 3) / 4 / 1024);
  if (fileSizeKB > config.maxFileSizeKB) {
    issues.push({
      code: "file_too_large",
      message: "La photo est trop volumineuse",
      severity: "warning",
    });
  }

  // Canvas analysis
  const imageData = getImageData(img);
  const brightness = analyzeBrightness(imageData);
  const sharpness = analyzeSharpness(imageData);
  const faceCoverage = estimateFaceCoverage(imageData);

  // Brightness
  if (brightness < config.minBrightness) {
    issues.push({
      code: "too_dark",
      message: "La lumière est insuffisante",
      severity: "critical",
    });
  } else if (brightness > config.maxBrightness) {
    issues.push({
      code: "overexposed",
      message: "La photo est surexposée ou en contre-jour",
      severity: "critical",
    });
  }

  // Sharpness
  if (sharpness < config.minSharpness * 0.5) {
    issues.push({
      code: "very_blurry",
      message: "La photo semble trop floue",
      severity: "critical",
    });
  } else if (sharpness < config.minSharpness) {
    issues.push({
      code: "slightly_blurry",
      message: "La photo manque légèrement de netteté",
      severity: "warning",
    });
  }

  // Face coverage
  if (faceCoverage < config.minFaceCoverage * 0.5) {
    issues.push({
      code: "face_too_small",
      message: "Rapprochez légèrement votre visage",
      severity: "critical",
    });
  } else if (faceCoverage < config.minFaceCoverage) {
    issues.push({
      code: "face_small",
      message: "Votre visage pourrait être un peu plus proche",
      severity: "warning",
    });
  }

  // Determine quality
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let quality: PhotoQuality;
  if (criticalCount > 0) {
    quality = "insufficient";
  } else if (warningCount > 0) {
    quality = "acceptable";
  } else {
    quality = "good";
  }

  return {
    quality,
    issues,
    scores: {
      brightness,
      sharpness,
      faceCoverage,
      resolution: minDim,
    },
  };
}
