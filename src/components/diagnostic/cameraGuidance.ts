import type { FaceLandmarker, FaceLandmarkerResult, Matrix, NormalizedLandmark } from "@mediapipe/tasks-vision";

export type CameraStep = "face" | "profile";
export type GuidanceStatus = "valid" | "invalid" | "pending";

export interface FaceBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface GuideOval {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
}

export interface CoverCrop {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceAspectRatio: number;
  displayAspectRatio: number;
}

export interface HeadPose {
  /** Signed angle in degrees. Positive means the user's right. */
  yawDegrees: number;
  pitchDegrees: number;
  rollDegrees: number;
}

export interface CameraGuidanceState {
  faceDetected: boolean;
  faceCount: number;
  brightnessOk: boolean | null;
  sharpnessOk: boolean | null;
  facePositionOk: boolean;
  poseOk: boolean;
  isRawValid: boolean;
  poseAngle: number | null;
  guidanceMessage: string;
  brightness: number | null;
  sharpness: number | null;
  faceBox: FaceBox | null;
  pose: HeadPose | null;
}

export const CAMERA_GUIDANCE_THRESHOLDS = {
  // Luma is measured on the 0–255 scale from a small video frame.
  minBrightness: 45,
  maxBrightness: 240,
  minSharpness: 6,
  minSharpnessProfile: 5,
  // A readable face is enough for the guided capture. The previous 400 px
  // projection was too demanding on portrait camera streams.
  centerToleranceX: 0.18,
  centerToleranceY: 0.16,
  minFaceWidth: 0.2,
  maxFaceWidth: 0.78,
  minFaceHeight: 0.28,
  maxFaceHeight: 0.88,
  frontYawMax: 12,
  frontRollMax: 15,
  rightYawMinInclusive: 10,
  rightYawMaxExclusive: 30,
  stableFramesRequired: 4,
  analysisIntervalMs: 120,
} as const;

// The video source is the unmirrored camera image. In that coordinate system,
// a negative horizontal nose displacement corresponds to the user's right.
const USER_RIGHT_GEOMETRY_SIGN = -1;
const NOSE_INDEX = 1;
const LEFT_EYE_OUTER_INDEX = 33;
const RIGHT_EYE_OUTER_INDEX = 263;
const LEFT_CHEEK_INDEX = 234;
const RIGHT_CHEEK_INDEX = 454;
const RAD_TO_DEG = 180 / Math.PI;
const FALLBACK_YAW_SCALE = 140;

export const GUIDE_OVAL: GuideOval = {
  centerX: 0.5,
  centerY: 0.49,
  radiusX: 0.34,
  radiusY: 0.42,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
type FaceSizeThresholds = {
  minFaceWidth?: number;
  maxFaceWidth?: number;
  minFaceHeight?: number;
  maxFaceHeight?: number;
};

export function calculateCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  displayWidth: number,
  displayHeight: number,
): CoverCrop {
  if (![sourceWidth, sourceHeight, displayWidth, displayHeight].every((value) => value > 0 && Number.isFinite(value))) {
    throw new Error("invalid_cover_crop_dimensions");
  }
  const sourceAspectRatio = sourceWidth / sourceHeight;
  const displayAspectRatio = displayWidth / displayHeight;
  if (sourceAspectRatio > displayAspectRatio) {
    const sourceHeightVisible = sourceHeight;
    const sourceWidthVisible = sourceHeight * displayAspectRatio;
    return {
      sourceX: (sourceWidth - sourceWidthVisible) / 2,
      sourceY: 0,
      sourceWidth: sourceWidthVisible,
      sourceHeight: sourceHeightVisible,
      sourceAspectRatio,
      displayAspectRatio,
    };
  }
  const sourceWidthVisible = sourceWidth;
  const sourceHeightVisible = sourceWidth / displayAspectRatio;
  return {
    sourceX: 0,
    sourceY: (sourceHeight - sourceHeightVisible) / 2,
    sourceWidth: sourceWidthVisible,
    sourceHeight: sourceHeightVisible,
    sourceAspectRatio,
    displayAspectRatio,
  };
}

export function getGuideOvalForViewport(displayWidth: number, displayHeight: number): GuideOval {
  const guideWidth = Math.min(displayWidth * 0.76, 360);
  const guideHeight = guideWidth / 0.72;
  return {
    centerX: 0.5,
    centerY: 0.5,
    radiusX: guideWidth / displayWidth / 2,
    radiusY: guideHeight / displayHeight / 2,
  };
}

export function getGuideOvalForAspect(displayAspectRatio: number, guideWidthRatio = 0.78): GuideOval {
  const safeAspectRatio = Math.max(0.1, displayAspectRatio);
  const guideHeightRatio = guideWidthRatio * safeAspectRatio / 0.72;
  return {
    centerX: 0.5,
    centerY: 0.5,
    radiusX: guideWidthRatio / 2,
    radiusY: guideHeightRatio / 2,
  };
}

export function analyzeBrightness(data: ImageData): number {
  return analyzeLuma(data).mean;
}

export function analyzeLuma(data: ImageData): { mean: number; stdDev: number } {
  const pixels = data.data;
  if (!pixels.length) return { mean: 0, stdDev: 0 };

  // Sampling keeps the live loop inexpensive on mobile without changing the
  // meaning of the luma measurement.
  const stride = Math.max(4, Math.floor(pixels.length / 4000) * 4);
  let total = 0;
  const luminances: number[] = [];
  let count = 0;
  for (let index = 0; index < pixels.length; index += stride) {
    const luminance = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
    total += luminance;
    luminances.push(luminance);
    count += 1;
  }
  const mean = count ? total / count : 0;
  const variance = count
    ? luminances.reduce((sum, luminance) => sum + (luminance - mean) ** 2, 0) / count
    : 0;
  return { mean, stdDev: Math.sqrt(variance) };
}

export function analyzeSharpness(data: ImageData): number {
  const { width, height } = data;
  if (width < 3 || height < 3) return 0;
  const gray = new Float32Array(width * height);
  for (let index = 0; index < gray.length; index += 1) {
    const pixelIndex = index * 4;
    gray[index] =
      0.299 * data.data[pixelIndex]
      + 0.587 * data.data[pixelIndex + 1]
      + 0.114 * data.data[pixelIndex + 2];
  }
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const laplacian =
        -gray[(y - 1) * width + x]
        - gray[y * width + x - 1]
        + 4 * gray[y * width + x]
        - gray[y * width + x + 1]
        - gray[(y + 1) * width + x];
      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count += 1;
    }
  }
  const mean = count ? sum / count : 0;
  return Math.sqrt(Math.max(0, (count ? sumSquares / count : 0) - mean * mean));
}

export function getFaceBox(landmarks: NormalizedLandmark[]): FaceBox | null {
  if (!landmarks.length) return null;
  const xs = landmarks.map((landmark) => landmark.x);
  const ys = landmarks.map((landmark) => landmark.y);
  const left = clamp(Math.min(...xs), 0, 1);
  const right = clamp(Math.max(...xs), 0, 1);
  const top = clamp(Math.min(...ys), 0, 1);
  const bottom = clamp(Math.max(...ys), 0, 1);
  const width = right - left;
  const height = bottom - top;
  return { left, top, right, bottom, width, height, centerX: (left + right) / 2, centerY: (top + bottom) / 2 };
}

export function mapFaceBoxToVisibleViewport(faceBox: FaceBox, crop: CoverCrop, sourceWidth: number, sourceHeight: number): FaceBox {
  const cropLeft = crop.sourceX / sourceWidth;
  const cropTop = crop.sourceY / sourceHeight;
  const cropWidth = crop.sourceWidth / sourceWidth;
  const cropHeight = crop.sourceHeight / sourceHeight;
  const left = (faceBox.left - cropLeft) / cropWidth;
  const top = (faceBox.top - cropTop) / cropHeight;
  const right = (faceBox.right - cropLeft) / cropWidth;
  const bottom = (faceBox.bottom - cropTop) / cropHeight;
  return { left, top, right, bottom, width: right - left, height: bottom - top, centerX: (left + right) / 2, centerY: (top + bottom) / 2 };
}

export function getFaceRoi(
  faceBox: FaceBox,
  sourceWidth: number,
  sourceHeight: number,
  crop?: CoverCrop,
): { x: number; y: number; width: number; height: number } {
  const cropBounds = crop ?? {
    sourceX: 0,
    sourceY: 0,
    sourceWidth,
    sourceHeight,
    sourceAspectRatio: sourceWidth / sourceHeight,
    displayAspectRatio: sourceWidth / sourceHeight,
  };
  const paddingX = faceBox.width * sourceWidth * 0.05;
  const paddingY = faceBox.height * sourceHeight * 0.05;
  const left = Math.max(cropBounds.sourceX, faceBox.left * sourceWidth - paddingX);
  const top = Math.max(cropBounds.sourceY, faceBox.top * sourceHeight - paddingY);
  const right = Math.min(cropBounds.sourceX + cropBounds.sourceWidth, faceBox.right * sourceWidth + paddingX);
  const bottom = Math.min(cropBounds.sourceY + cropBounds.sourceHeight, faceBox.bottom * sourceHeight + paddingY);
  return { x: left, y: top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

export function readRegionFromSource(
  source: CanvasImageSource,
  region: { x: number; y: number; width: number; height: number },
  canvas: HTMLCanvasElement,
  maxSize = 512,
): ImageData | null {
  const scale = Math.min(1, maxSize / Math.max(region.width, region.height));
  canvas.width = Math.max(1, Math.round(region.width * scale));
  canvas.height = Math.max(1, Math.round(region.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, region.x, region.y, region.width, region.height, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function validateFacePosition(
  faceBox: FaceBox | null,
  guideOval: GuideOval = GUIDE_OVAL,
  sizeThresholds: FaceSizeThresholds = {},
): { ok: boolean; reason: "missing" | "off_center" | "too_small" | "too_large" | "ok" } {
  if (!faceBox) return { ok: false, reason: "missing" };
  const minFaceWidth = sizeThresholds.minFaceWidth ?? CAMERA_GUIDANCE_THRESHOLDS.minFaceWidth;
  const maxFaceWidth = sizeThresholds.maxFaceWidth ?? CAMERA_GUIDANCE_THRESHOLDS.maxFaceWidth;
  const minFaceHeight = sizeThresholds.minFaceHeight ?? CAMERA_GUIDANCE_THRESHOLDS.minFaceHeight;
  const maxFaceHeight = sizeThresholds.maxFaceHeight ?? CAMERA_GUIDANCE_THRESHOLDS.maxFaceHeight;
  if (
    Math.abs(faceBox.centerX - guideOval.centerX) > CAMERA_GUIDANCE_THRESHOLDS.centerToleranceX
    || Math.abs(faceBox.centerY - guideOval.centerY) > CAMERA_GUIDANCE_THRESHOLDS.centerToleranceY
  ) {
    return { ok: false, reason: "off_center" };
  }
  if (
    faceBox.width < minFaceWidth
    || faceBox.height < minFaceHeight
  ) {
    return { ok: false, reason: "too_small" };
  }
  if (
    faceBox.width > maxFaceWidth
    || faceBox.height > maxFaceHeight
  ) {
    return { ok: false, reason: "too_large" };
  }
  // The oval is a visual guide, not a hard pixel mask. Center and size are
  // sufficient to keep the face analysable without forcing a rigid selfie.
  return { ok: true, reason: "ok" };
}

function geometryYaw(landmarks: NormalizedLandmark[]): { signed: number; magnitude: number } | null {
  const nose = landmarks[NOSE_INDEX];
  const leftCheek = landmarks[LEFT_CHEEK_INDEX];
  const rightCheek = landmarks[RIGHT_CHEEK_INDEX];
  if (!nose || !leftCheek || !rightCheek) return null;
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
  if (faceWidth < 0.05) return null;
  const cheekMidpoint = (leftCheek.x + rightCheek.x) / 2;
  const displacement = (nose.x - cheekMidpoint) / faceWidth;
  const signed = clamp(displacement * FALLBACK_YAW_SCALE * USER_RIGHT_GEOMETRY_SIGN, -90, 90);
  return { signed, magnitude: Math.abs(signed) };
}

function matrixYaw(matrix: Matrix | undefined): number | null {
  if (!matrix || matrix.data.length < 11) return null;
  // MediaPipe exposes a row-major 4×4 facial transform. This extracts the
  // magnitude; the landmark geometry above determines the user's left/right.
  const value = Math.atan2(matrix.data[2], Math.hypot(matrix.data[0], matrix.data[10])) * RAD_TO_DEG;
  return Number.isFinite(value) ? clamp(Math.abs(value), 0, 90) : null;
}

export function estimateHeadPose(
  landmarks: NormalizedLandmark[],
  transformationMatrix?: Matrix,
): HeadPose | null {
  const eyesLeft = landmarks[LEFT_EYE_OUTER_INDEX];
  const eyesRight = landmarks[RIGHT_EYE_OUTER_INDEX];
  const geometry = geometryYaw(landmarks);
  if (!eyesLeft || !eyesRight || !geometry) return null;

  const eyeSpan = Math.abs(eyesRight.x - eyesLeft.x);
  const rollDegrees = Math.atan2(eyesRight.y - eyesLeft.y, eyesRight.x - eyesLeft.x) * RAD_TO_DEG;
  const matrixMagnitude = matrixYaw(transformationMatrix);
  const magnitude = matrixMagnitude ?? geometry.magnitude;
  const signed = geometry.signed < 0 ? -magnitude : geometry.signed > 0 ? magnitude : 0;
  return {
    yawDegrees: clamp(signed, -90, 90),
    pitchDegrees: 0,
    rollDegrees: Number.isFinite(rollDegrees) && eyeSpan > 0.01 ? rollDegrees : 0,
  };
}

export function validateFrontPose(pose: HeadPose | null): boolean {
  return Boolean(
    pose
    && Math.abs(pose.yawDegrees) <= CAMERA_GUIDANCE_THRESHOLDS.frontYawMax
    && Math.abs(pose.rollDegrees) <= CAMERA_GUIDANCE_THRESHOLDS.frontRollMax,
  );
}

export function validateRightPose10to29(pose: HeadPose | null): boolean {
  if (!pose) return false;
  // The lower bound is inclusive for the product rule: 10°–29° is valid,
  // while 30° is already too far. The underlying angle remains unrounded.
  return pose.yawDegrees >= CAMERA_GUIDANCE_THRESHOLDS.rightYawMinInclusive
    && pose.yawDegrees < CAMERA_GUIDANCE_THRESHOLDS.rightYawMaxExclusive
    && Math.abs(pose.rollDegrees) <= CAMERA_GUIDANCE_THRESHOLDS.frontRollMax;
}

export function buildCameraGuidanceState(input: {
  step: CameraStep;
  cameraReady: boolean;
  brightness: number | null;
  sharpness: number | null;
  faces: NormalizedLandmark[][];
  transformationMatrix?: Matrix;
  frame?: {
    sourceWidth: number;
    sourceHeight: number;
    displayWidth: number;
    displayHeight: number;
    guideRect?: { left: number; top: number; width: number; height: number };
  };
}): CameraGuidanceState {
  const { step, cameraReady, faces, transformationMatrix, frame } = input;
  const faceDetected = faces.length > 0;
  const faceCount = faces.length;
  const sourceFaceBox = faceDetected ? getFaceBox(faces[0]) : null;
  const crop = frame ? calculateCoverCrop(frame.sourceWidth, frame.sourceHeight, frame.displayWidth, frame.displayHeight) : undefined;
  const faceBox = sourceFaceBox && frame
    ? mapFaceBoxToVisibleViewport(sourceFaceBox, crop, frame.sourceWidth, frame.sourceHeight)
    : sourceFaceBox;
  const guideOval = frame?.guideRect
    ? {
      centerX: (frame.guideRect.left + frame.guideRect.width / 2) / frame.displayWidth,
      centerY: (frame.guideRect.top + frame.guideRect.height / 2) / frame.displayHeight,
      radiusX: frame.guideRect.width / frame.displayWidth / 2,
      radiusY: frame.guideRect.height / frame.displayHeight / 2,
    }
    : frame ? getGuideOvalForViewport(frame.displayWidth, frame.displayHeight) : GUIDE_OVAL;
  const position = faceCount === 1 ? validateFacePosition(faceBox, guideOval) : { ok: false, reason: "missing" as const };
  const pose = faceCount === 1 ? estimateHeadPose(faces[0], transformationMatrix) : null;
  const brightness = input.brightness ?? null;
  const sharpness = input.sharpness ?? null;
  const brightnessOk = brightness === null
    ? null
    : brightness >= CAMERA_GUIDANCE_THRESHOLDS.minBrightness && brightness <= CAMERA_GUIDANCE_THRESHOLDS.maxBrightness;
  const sharpnessThreshold = step === "face" ? CAMERA_GUIDANCE_THRESHOLDS.minSharpness : CAMERA_GUIDANCE_THRESHOLDS.minSharpnessProfile;
  const sharpnessOk = sharpness === null ? null : sharpness >= sharpnessThreshold;
  const poseOk = step === "face" ? validateFrontPose(pose) : validateRightPose10to29(pose);

  let guidanceMessage = "Préparez-vous pour la photo.";
  if (!cameraReady) guidanceMessage = "Activation de la caméra…";
  else if (faceCount === 0) guidanceMessage = "Placez votre visage dans le cadre";
  else if (faceCount > 1) guidanceMessage = "Une seule personne doit être visible";
  else if (brightnessOk === false) guidanceMessage = "Mettez-vous dans un endroit plus lumineux";
  else if (sharpnessOk === false) guidanceMessage = "L’image est trop floue, stabilisez le téléphone";
  else if (!position.ok && position.reason === "too_small") guidanceMessage = "Rapprochez-vous légèrement";
  else if (!position.ok && position.reason === "too_large") guidanceMessage = "Éloignez-vous légèrement";
  else if (!position.ok) guidanceMessage = "Placez votre visage dans le cadre";
  else if (step === "face" && !poseOk) guidanceMessage = "Regardez tout droit";
  else if (step === "profile" && !pose) guidanceMessage = "Tournez légèrement le visage à droite";
  else if (step === "profile" && (pose?.yawDegrees ?? 0) < CAMERA_GUIDANCE_THRESHOLDS.rightYawMinInclusive) guidanceMessage = "Tournez légèrement le visage à droite";
  else if (step === "profile" && (pose?.yawDegrees ?? 0) >= CAMERA_GUIDANCE_THRESHOLDS.rightYawMaxExclusive) guidanceMessage = "Revenez légèrement vers la gauche";
  else if (brightnessOk === null) guidanceMessage = "Analyse de la lumière en cours…";
  else if (step === "profile" && poseOk) guidanceMessage = "Parfait, gardez cette position";
  else if (poseOk) guidanceMessage = "C’est bon, vous pouvez prendre la photo";

  return {
    faceDetected,
    faceCount,
    brightnessOk,
    sharpnessOk,
    facePositionOk: position.ok,
    poseOk,
    isRawValid: cameraReady && faceCount === 1 && brightnessOk === true && position.ok && poseOk && sharpnessOk === true,
    poseAngle: pose?.yawDegrees ?? null,
    guidanceMessage,
    brightness,
    sharpness,
    faceBox,
    pose,
  };
}

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
let videoLandmarkerPromise: Promise<FaceLandmarker> | null = null;
let imageLandmarkerPromise: Promise<FaceLandmarker> | null = null;

async function createLandmarker(runningMode: "IMAGE" | "VIDEO"): Promise<FaceLandmarker> {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
    runningMode,
    numFaces: 2,
    minFaceDetectionConfidence: 0.6,
    minFacePresenceConfidence: 0.6,
    minTrackingConfidence: 0.6,
    outputFacialTransformationMatrixes: true,
  });
}

export function getVideoFaceLandmarker(): Promise<FaceLandmarker> {
  if (!videoLandmarkerPromise) {
    videoLandmarkerPromise = createLandmarker("VIDEO").catch((error) => {
      videoLandmarkerPromise = null;
      throw error;
    });
  }
  return videoLandmarkerPromise;
}

export function getImageFaceLandmarker(): Promise<FaceLandmarker> {
  if (!imageLandmarkerPromise) {
    imageLandmarkerPromise = createLandmarker("IMAGE").catch((error) => {
      imageLandmarkerPromise = null;
      throw error;
    });
  }
  return imageLandmarkerPromise;
}

export function getVideoGuidanceResult(
  landmarker: FaceLandmarker,
  video: HTMLVideoElement,
  timestamp: number,
): FaceLandmarkerResult {
  return landmarker.detectForVideo(video, timestamp);
}
