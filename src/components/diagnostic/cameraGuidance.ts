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
  facePositionOk: boolean;
  poseOk: boolean;
  isRawValid: boolean;
  poseAngle: number | null;
  guidanceMessage: string;
  brightness: number | null;
  faceBox: FaceBox | null;
  pose: HeadPose | null;
}

export const CAMERA_GUIDANCE_THRESHOLDS = {
  // Luma is measured on the 0–255 scale from a small video frame.
  minBrightness: 45,
  maxBrightness: 240,
  centerToleranceX: 0.12,
  centerToleranceY: 0.12,
  minFaceWidth: 0.28,
  maxFaceWidth: 0.68,
  minFaceHeight: 0.36,
  maxFaceHeight: 0.82,
  frontYawMax: 12,
  frontRollMax: 15,
  rightYawMinExclusive: 20,
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

export function analyzeBrightness(data: ImageData): number {
  const pixels = data.data;
  if (!pixels.length) return 0;

  // Sampling keeps the live loop inexpensive on mobile without changing the
  // meaning of the luma measurement.
  const stride = Math.max(4, Math.floor(pixels.length / 4000) * 4);
  let total = 0;
  let count = 0;
  for (let index = 0; index < pixels.length; index += stride) {
    total += 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
    count += 1;
  }
  return count ? total / count : 0;
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

export function validateFacePosition(
  faceBox: FaceBox | null,
  guideOval: GuideOval = GUIDE_OVAL,
): { ok: boolean; reason: "missing" | "off_center" | "too_small" | "too_large" | "ok" } {
  if (!faceBox) return { ok: false, reason: "missing" };
  if (
    Math.abs(faceBox.centerX - guideOval.centerX) > CAMERA_GUIDANCE_THRESHOLDS.centerToleranceX
    || Math.abs(faceBox.centerY - guideOval.centerY) > CAMERA_GUIDANCE_THRESHOLDS.centerToleranceY
  ) {
    return { ok: false, reason: "off_center" };
  }
  if (
    faceBox.width < CAMERA_GUIDANCE_THRESHOLDS.minFaceWidth
    || faceBox.height < CAMERA_GUIDANCE_THRESHOLDS.minFaceHeight
  ) {
    return { ok: false, reason: "too_small" };
  }
  if (
    faceBox.width > CAMERA_GUIDANCE_THRESHOLDS.maxFaceWidth
    || faceBox.height > CAMERA_GUIDANCE_THRESHOLDS.maxFaceHeight
  ) {
    return { ok: false, reason: "too_large" };
  }
  if (
    faceBox.left < guideOval.centerX - guideOval.radiusX
    || faceBox.right > guideOval.centerX + guideOval.radiusX
    || faceBox.top < guideOval.centerY - guideOval.radiusY
    || faceBox.bottom > guideOval.centerY + guideOval.radiusY
  ) {
    return { ok: false, reason: "off_center" };
  }
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

export function validateRightPose20to30(pose: HeadPose | null): boolean {
  if (!pose) return false;
  // Deliberately exclusive: 20° and 30° are boundary guidance states, not a
  // valid capture. The visible angle is rounded for the user but the check is
  // performed on the underlying number.
  return pose.yawDegrees > CAMERA_GUIDANCE_THRESHOLDS.rightYawMinExclusive
    && pose.yawDegrees < CAMERA_GUIDANCE_THRESHOLDS.rightYawMaxExclusive
    && Math.abs(pose.rollDegrees) <= CAMERA_GUIDANCE_THRESHOLDS.frontRollMax;
}

export function buildCameraGuidanceState(input: {
  step: CameraStep;
  cameraReady: boolean;
  brightness: number | null;
  faces: NormalizedLandmark[][];
  transformationMatrix?: Matrix;
}): CameraGuidanceState {
  const { step, cameraReady, brightness, faces, transformationMatrix } = input;
  const faceDetected = faces.length > 0;
  const faceCount = faces.length;
  const faceBox = faceDetected ? getFaceBox(faces[0]) : null;
  const position = faceCount === 1 ? validateFacePosition(faceBox) : { ok: false, reason: "missing" as const };
  const pose = faceCount === 1 ? estimateHeadPose(faces[0], transformationMatrix) : null;
  const brightnessOk = brightness === null
    ? null
    : brightness >= CAMERA_GUIDANCE_THRESHOLDS.minBrightness && brightness <= CAMERA_GUIDANCE_THRESHOLDS.maxBrightness;
  const poseOk = step === "face" ? validateFrontPose(pose) : validateRightPose20to30(pose);

  let guidanceMessage = "Préparez-vous pour la photo.";
  if (!cameraReady) guidanceMessage = "Activation de la caméra…";
  else if (faceCount === 0) guidanceMessage = "Placez votre visage dans le cadre";
  else if (faceCount > 1) guidanceMessage = "Une seule personne doit être visible";
  else if (brightnessOk === false) guidanceMessage = "Mettez-vous dans un endroit plus lumineux";
  else if (!position.ok && position.reason === "too_small") guidanceMessage = "Rapprochez-vous légèrement";
  else if (!position.ok && position.reason === "too_large") guidanceMessage = "Éloignez-vous légèrement";
  else if (!position.ok) guidanceMessage = "Placez votre visage dans le cadre";
  else if (step === "face" && !poseOk) guidanceMessage = "Regardez tout droit";
  else if (step === "profile" && !pose) guidanceMessage = "Regardez la caméra puis tournez à droite";
  else if (step === "profile" && (pose?.yawDegrees ?? 0) <= 0) guidanceMessage = "Tournez le visage à droite";
  else if (step === "profile" && (pose?.yawDegrees ?? 0) <= CAMERA_GUIDANCE_THRESHOLDS.rightYawMinExclusive) guidanceMessage = "Tournez encore un peu le visage à droite";
  else if (step === "profile" && (pose?.yawDegrees ?? 0) >= CAMERA_GUIDANCE_THRESHOLDS.rightYawMaxExclusive) guidanceMessage = "Vous avez trop tourné le visage — revenez légèrement vers la gauche";
  else if (brightnessOk === null) guidanceMessage = "Analyse de la lumière en cours…";
  else if (step === "profile" && poseOk) guidanceMessage = "Position correcte";
  else if (poseOk) guidanceMessage = "C’est bon, vous pouvez prendre la photo";

  return {
    faceDetected,
    faceCount,
    brightnessOk,
    facePositionOk: position.ok,
    poseOk,
    isRawValid: cameraReady && faceCount === 1 && brightnessOk === true && position.ok && poseOk,
    poseAngle: pose?.yawDegrees ?? null,
    guidanceMessage,
    brightness,
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
