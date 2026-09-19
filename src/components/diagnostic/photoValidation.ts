import type { Detection, FaceDetector as MediaPipeFaceDetector } from "@mediapipe/tasks-vision";
import {
  analyzeLuma,
  analyzeSharpness,
  estimateHeadPose,
  getFaceBox,
  getFaceRoi,
  getGuideOvalForAspect,
  getImageFaceLandmarker,
  readRegionFromSource,
  validateFacePosition,
  validateFrontPose,
  validateRightPose10to29,
} from "./cameraGuidance";

export interface PhotoValidationConfig {
  minBrightness: number;
  maxBrightness: number;
  minSharpness: number;
  minResolution: number;
  maxResolution: number;
  minFileSizeKB: number;
  maxFileSizeKB: number;
  minVisibleFaceRatio: number;
}

// Aligned with the documented Zyla Skin Analyze Advanced image requirements.
export const faceConfig: PhotoValidationConfig = {
  minBrightness: 45,
  maxBrightness: 240,
  minSharpness: 4,
  minResolution: 201,
  maxResolution: 4095,
  minFileSizeKB: 100,
  maxFileSizeKB: 5 * 1024,
  minVisibleFaceRatio: 0.8,
};

export const profileConfig: PhotoValidationConfig = {
  ...faceConfig,
  minSharpness: 3.5,
};

export const ALLOWED_MIME = ["image/jpeg", "image/jpg"];
export const ACCEPTED_FILE_TYPES = "image/jpeg,.jpg,.jpeg";

export type PhotoQuality = "none" | "insufficient" | "acceptable" | "good";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: "critical" | "warning";
}

export interface ValidationScores {
  brightness: number;
  sharpness: number;
  resolution: number;
  fileSizeKB: number;
  faceCount: number;
  faceWidth: number;
  faceHeight: number;
  faceConfidence: number;
}

export interface ValidationResult {
  quality: PhotoQuality;
  issues: ValidationIssue[];
  scores: ValidationScores;
}

export interface FaceObservation {
  confidence: number;
  box?: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  keypointCount: number;
}

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const NO_FACE_MESSAGE =
  "Nous ne détectons pas de visage exploitable sur cette photo. Reprenez-la avec le visage bien visible et face à la lumière.";
const GENERIC_REJECT =
  "La photo semble difficile à analyser. Essayez une photo plus nette, avec le visage visible et une lumière correcte.";

let detectorPromise: Promise<MediaPipeFaceDetector> | null = null;

const emptyScores = (fileSizeKB = 0): ValidationScores => ({
  brightness: 0,
  sharpness: 0,
  resolution: 0,
  fileSizeKB,
  faceCount: 0,
  faceWidth: 0,
  faceHeight: 0,
  faceConfidence: 0,
});

export function createRejectedResult(issues: ValidationIssue[], fileSizeKB = 0): ValidationResult {
  return { quality: "insufficient", issues, scores: emptyScores(fileSizeKB) };
}

export function validatePhotoFile(file: File): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fileSizeKB = file.size / 1024;

  if (!file.size) {
    issues.push({ code: "empty_file", message: "Le fichier sélectionné est vide.", severity: "critical" });
  }
  if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
    issues.push({
      code: "bad_format",
      message: "Format non pris en charge. Utilisez une photo JPG ou JPEG.",
      severity: "critical",
    });
  }
  if (fileSizeKB > faceConfig.maxFileSizeKB) {
    issues.push({
      code: "file_too_large",
      message: "La photo dépasse 5 Mo. Choisissez une image moins volumineuse.",
      severity: "critical",
    });
  }

  return issues;
}

async function getFaceDetector(): Promise<MediaPipeFaceDetector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      return FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.6,
        minSuppressionThreshold: 0.3,
      });
    })().catch((error) => {
      detectorPromise = null;
      throw error;
    });
  }
  return detectorPromise;
}

function getImageData(
  img: HTMLImageElement,
  region = { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight },
  maxSize = 512,
): ImageData {
  const canvas = document.createElement("canvas");
  const imageData = readRegionFromSource(img, region, canvas, maxSize);
  if (!imageData) throw new Error("canvas_unavailable");
  return imageData;
}

function detectMimeFromDataUrl(dataUrl: string): string | null {
  const match = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return match ? match[1].toLowerCase() : null;
}

function toFaceObservations(detections: Detection[]): FaceObservation[] {
  return detections.map((detection) => ({
    confidence: detection.categories[0]?.score ?? 0,
    box: detection.boundingBox,
    keypointCount: detection.keypoints.length,
  }));
}

export function evaluateFaceObservations(
  faces: FaceObservation[],
  imageWidth: number,
  imageHeight: number,
  config: PhotoValidationConfig
): ValidationIssue[] {
  if (faces.length === 0) {
    return [{ code: "no_face", message: NO_FACE_MESSAGE, severity: "critical" }];
  }
  if (faces.length > 1) {
    return [
      {
        code: "multiple_faces",
        message: "Plusieurs visages sont visibles. Utilisez une photo où vous êtes seul(e).",
        severity: "critical",
      },
    ];
  }

  const face = faces[0];
  if (!face.box || face.keypointCount < 4) {
    return [{ code: "face_incomplete", message: NO_FACE_MESSAGE, severity: "critical" }];
  }

  const { originX, originY, width, height } = face.box;
  const visibleWidth = Math.max(0, Math.min(originX + width, imageWidth) - Math.max(originX, 0));
  const visibleHeight = Math.max(0, Math.min(originY + height, imageHeight) - Math.max(originY, 0));
  const visibleRatio = (visibleWidth * visibleHeight) / Math.max(1, width * height);

  if (visibleRatio < config.minVisibleFaceRatio) {
    return [
      {
        code: "face_cut_off",
        message: "Votre visage est partiellement hors cadre. Replacez-le entièrement dans la photo.",
        severity: "critical",
      },
    ];
  }
  return [];
}

export async function validatePhoto(
  dataUrl: string,
  type: "face" | "profile",
  suppliedFileSize?: number
): Promise<ValidationResult> {
  const config = type === "face" ? faceConfig : profileConfig;
  const issues: ValidationIssue[] = [];
  const mime = detectMimeFromDataUrl(dataUrl);
  const base64Length = dataUrl.split(",")[1]?.length ?? 0;
  const fileSizeKB = Math.round((suppliedFileSize ?? (base64Length * 3) / 4) / 1024);

  if (!mime || !ALLOWED_MIME.includes(mime)) {
    issues.push({
      code: "bad_format",
      message: "Format non pris en charge. Utilisez une photo JPG ou JPEG.",
      severity: "critical",
    });
  }
  if (!base64Length) {
    issues.push({ code: "empty_file", message: "Le fichier sélectionné est vide.", severity: "critical" });
  } else if (fileSizeKB > config.maxFileSizeKB) {
    issues.push({
      code: "file_too_large",
      message: "La photo dépasse 5 Mo. Choisissez une image moins volumineuse.",
      severity: "critical",
    });
  } else if (fileSizeKB < config.minFileSizeKB) {
    issues.push({
      code: "file_small",
      message: "La photo est très compressée. Une image de meilleure qualité est préférable.",
      severity: "warning",
    });
  }

  let img: HTMLImageElement;
  try {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
  } catch {
    return createRejectedResult(
      [{ code: "load_failed", message: "Impossible de lire cette image. Choisissez une autre photo.", severity: "critical" }],
      fileSizeKB
    );
  }

  const minDimension = Math.min(img.naturalWidth, img.naturalHeight);
  const maxDimension = Math.max(img.naturalWidth, img.naturalHeight);
  if (minDimension < config.minResolution) {
    issues.push({
      code: "low_resolution",
      message: "La résolution est trop faible. Utilisez une photo supérieure à 200 × 200 px.",
      severity: "critical",
    });
  }
  if (maxDimension > config.maxResolution) {
    issues.push({
      code: "high_resolution",
      message: "La résolution dépasse 4095 px. Choisissez une version plus légère de la photo.",
      severity: "critical",
    });
  }

  let faceObservations: FaceObservation[] = [];
  let landmarkFaceBox: ReturnType<typeof getFaceBox> = null;
  try {
    const detector = await getFaceDetector();
    faceObservations = toFaceObservations(detector.detect(img).detections);
    const detectorBox = faceObservations[0]?.box;
    if (detectorBox) {
      landmarkFaceBox = getFaceBox([
        { x: detectorBox.originX / img.naturalWidth, y: detectorBox.originY / img.naturalHeight, z: 0, visibility: 1 },
        { x: (detectorBox.originX + detectorBox.width) / img.naturalWidth, y: (detectorBox.originY + detectorBox.height) / img.naturalHeight, z: 0, visibility: 1 },
      ]);
    }
    issues.push(...evaluateFaceObservations(faceObservations, img.naturalWidth, img.naturalHeight, config));

    // Imported images use the same landmark and pose gates as live captures;
    // otherwise a file picker could bypass the 10–29° requirement.
    const landmarker = await getImageFaceLandmarker();
    const landmarkResult = landmarker.detect(img);
    if (landmarkResult.faceLandmarks.length !== 1) {
      issues.push({
        code: landmarkResult.faceLandmarks.length > 1 ? "multiple_faces" : "no_face",
        message: landmarkResult.faceLandmarks.length > 1
          ? "Plusieurs visages sont visibles. Utilisez une photo où vous êtes seul(e)."
          : NO_FACE_MESSAGE,
        severity: "critical",
      });
    } else {
      const landmarks = landmarkResult.faceLandmarks[0];
      landmarkFaceBox = getFaceBox(landmarks);
      const position = validateFacePosition(
        landmarkFaceBox,
        getGuideOvalForAspect(img.naturalWidth / img.naturalHeight),
      );
      if (!position.ok) {
        issues.push({
          code: "face_outside_guide",
          message: position.reason === "too_small"
            ? "Votre visage est trop éloigné. Rapprochez-vous pour qu’il soit clairement visible."
            : position.reason === "too_large"
              ? "Votre visage est trop proche. Éloignez-vous légèrement."
              : "Placez votre visage au centre de la photo.",
          severity: "critical",
        });
      }
      const pose = estimateHeadPose(landmarks, landmarkResult.facialTransformationMatrixes?.[0]);
      const poseOk = type === "face" ? validateFrontPose(pose) : validateRightPose10to29(pose);
      if (!poseOk) {
        const angle = pose?.yawDegrees ?? 0;
        issues.push({
          code: type === "face" ? "not_frontal" : angle < 10 ? "profile_angle_too_low" : "profile_angle_too_high",
          message: type === "face"
            ? "Regardez tout droit vers la caméra."
            : angle < 10
              ? "Tournez légèrement le visage à droite."
              : "Revenez légèrement vers la gauche.",
          severity: "critical",
        });
      }
    }
  } catch {
    issues.push({
      code: "face_validation_unavailable",
      message: "Impossible de vérifier le visage pour le moment. Vérifiez votre connexion puis réessayez.",
      severity: "critical",
    });
  }

  let brightness = 0;
  let sharpness = 0;
  try {
    // The live loop measures the face ROI. Reuse the exact same ROI and
    // downsampled canvas here so the capture cannot pass one quality test and
    // fail another because the background changed the average.
    const qualityRegion = landmarkFaceBox
      ? getFaceRoi(landmarkFaceBox, img.naturalWidth, img.naturalHeight)
      : { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
    const imageData = getImageData(img, qualityRegion);
    const brightnessResult = analyzeLuma(imageData);
    brightness = brightnessResult.mean;
    sharpness = analyzeSharpness(imageData);

    if (brightnessResult.stdDev < 8) {
      issues.push({ code: "blank_image", message: GENERIC_REJECT, severity: "critical" });
    }
    if (brightness < config.minBrightness) {
      issues.push({ code: "too_dark", message: "La lumière est insuffisante.", severity: "critical" });
    } else if (brightness > config.maxBrightness) {
      issues.push({
        code: "overexposed",
        message: "La photo est surexposée ou prise à contre-jour.",
        severity: "critical",
      });
    }
    if (sharpness < config.minSharpness * 0.5) {
      issues.push({ code: "very_blurry", message: "La photo semble trop floue.", severity: "critical" });
    } else if (sharpness < config.minSharpness) {
      issues.push({
        code: "slightly_blurry",
        message: "La photo est légèrement floue. Une image plus nette est préférable.",
        severity: "warning",
      });
    }
  } catch {
    issues.push({ code: "pixel_analysis_failed", message: GENERIC_REJECT, severity: "critical" });
  }

  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const face = faceObservations[0];

  return {
    quality: criticalCount > 0 ? "insufficient" : warningCount > 0 ? "acceptable" : "good",
    issues,
    scores: {
      brightness,
      sharpness,
      resolution: minDimension,
      fileSizeKB,
      faceCount: faceObservations.length,
      faceWidth: face?.box?.width ?? 0,
      faceHeight: face?.box?.height ?? 0,
      faceConfidence: face?.confidence ?? 0,
    },
  };
}
