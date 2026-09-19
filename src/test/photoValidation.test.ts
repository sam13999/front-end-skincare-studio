import { describe, expect, it } from "vitest";
import {
  evaluateFaceObservations,
  faceConfig,
  profileConfig,
  validatePhotoFile,
  type FaceObservation,
} from "@/components/diagnostic/photoValidation";
import {
  analyzeBrightness,
  analyzeSharpness,
  buildCameraGuidanceState,
  CAMERA_GUIDANCE_THRESHOLDS,
  calculateFaceFocusedCrop,
  calculateCoverCrop,
  FACE_FRAMING_THRESHOLDS,
  getFaceBox,
  getFaceRoi,
  isTolerableSharpnessDrop,
  mapFaceBoxToVisibleViewport,
  validateFacePosition,
  validateRightPose10to29,
  type HeadPose,
} from "@/components/diagnostic/cameraGuidance";

const validFace: FaceObservation = {
  confidence: 0.94,
  keypointCount: 6,
  box: { originX: 200, originY: 150, width: 600, height: 650 },
};

describe("photo face validation", () => {
  it("refuse an image when no face is detected", () => {
    const issues = evaluateFaceObservations([], 1000, 1000, faceConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("no_face");
    expect(issues[0].severity).toBe("critical");
  });

  it("refuses an image containing several faces", () => {
    const issues = evaluateFaceObservations([validFace, validFace], 1000, 1000, faceConfig);

    expect(issues[0].code).toBe("multiple_faces");
  });

  it("does not duplicate the landmark size gate in the detector guard", () => {
    const issues = evaluateFaceObservations(
      [{ ...validFace, box: { originX: 425, originY: 390, width: 150, height: 220 } }],
      1000,
      1000,
      faceConfig,
    );

    expect(issues).toEqual([]);
  });

  it("accepts one sufficiently visible face", () => {
    expect(evaluateFaceObservations([validFace], 1000, 1000, faceConfig)).toEqual([]);
  });

  it("accepts a clearly visible face around the live relative thresholds", () => {
    const issues = evaluateFaceObservations(
      [{ ...validFace, box: { originX: 375, originY: 350, width: 230, height: 300 } }],
      1000,
      1000,
      faceConfig,
    );

    expect(issues).toEqual([]);
  });

  it("accepts a slightly cropped but still exploitable face", () => {
    const issues = evaluateFaceObservations(
      [{ ...validFace, box: { originX: -20, originY: 250, width: 300, height: 500 } }],
      1000,
      1000,
      faceConfig,
    );

    expect(issues).toEqual([]);
  });

  it("rejects a face that is substantially cut off", () => {
    const issues = evaluateFaceObservations(
      [{ ...validFace, box: { originX: -180, originY: 250, width: 300, height: 500 } }],
      1000,
      1000,
      faceConfig,
    );

    expect(issues[0].code).toBe("face_cut_off");
  });

  it("accepts JPEG files and rejects unsupported image formats", () => {
    const jpeg = new File([new Uint8Array(1024)], "portrait.jpg", { type: "image/jpeg" });
    const png = new File([new Uint8Array(1024)], "room.png", { type: "image/png" });

    expect(validatePhotoFile(jpeg)).toEqual([]);
    expect(validatePhotoFile(png).some((issue) => issue.code === "bad_format")).toBe(true);
  });
});

const makeLandmarks = (noseX = 0.5, shiftX = 0, faceWidth = 0.4, faceHeight = 0.8) => {
  const landmarks = Array.from({ length: 468 }, () => ({ x: 0.5 + shiftX, y: 0.5, z: 0, visibility: 1 }));
  landmarks[10] = { x: 0.5 + shiftX, y: 0.5 - faceHeight / 2, z: 0, visibility: 1 };
  landmarks[152] = { x: 0.5 + shiftX, y: 0.5 + faceHeight / 2, z: 0, visibility: 1 };
  landmarks[234] = { x: 0.5 + shiftX - faceWidth / 2, y: 0.5, z: 0, visibility: 1 };
  landmarks[454] = { x: 0.5 + shiftX + faceWidth / 2, y: 0.5, z: 0, visibility: 1 };
  landmarks[33] = { x: 0.5 + shiftX - faceWidth / 4, y: 0.4, z: 0, visibility: 1 };
  landmarks[263] = { x: 0.5 + shiftX + faceWidth / 4, y: 0.4, z: 0, visibility: 1 };
  landmarks[1] = { x: noseX + shiftX, y: 0.5, z: 0, visibility: 1 };
  return landmarks;
};

const liveState = (
  step: "face" | "profile",
  brightness: number | null,
  noseX = 0.5,
  shiftX = 0,
  sharpness = 100,
  faceWidth = 0.4,
  faceHeight = 0.8,
) =>
  buildCameraGuidanceState({
    step,
    cameraReady: true,
    brightness,
    sharpness,
    faces: [makeLandmarks(noseX, shiftX, faceWidth, faceHeight)],
  });

const makeImageData = (width: number, height: number, fill = 0): ImageData => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4).fill(fill),
  colorSpace: "srgb",
});

describe("real-time camera guidance", () => {
  it("uses one shared framing contract for live and post-capture geometry", () => {
    expect(CAMERA_GUIDANCE_THRESHOLDS.minFaceWidth).toBe(FACE_FRAMING_THRESHOLDS.minFaceWidth);
    expect(CAMERA_GUIDANCE_THRESHOLDS.maxFaceWidth).toBe(FACE_FRAMING_THRESHOLDS.maxFaceWidth);
    expect(CAMERA_GUIDANCE_THRESHOLDS.minFaceHeight).toBe(FACE_FRAMING_THRESHOLDS.minFaceHeight);
    expect(CAMERA_GUIDANCE_THRESHOLDS.maxFaceHeight).toBe(FACE_FRAMING_THRESHOLDS.maxFaceHeight);
  });

  it("accepts a slightly closer but still fully exploitable face", () => {
    const state = liveState("face", 100, 0.5, 0, 100, 0.82, 0.9);

    expect(state.facePositionOk).toBe(true);
    expect(state.isRawValid).toBe(true);
  });

  it("rejects a genuinely distant face as too small", () => {
    const position = validateFacePosition({
      left: 0.42,
      top: 0.385,
      right: 0.58,
      bottom: 0.615,
      width: 0.16,
      height: 0.23,
      centerX: 0.5,
      centerY: 0.5,
    });

    expect(position).toEqual({ ok: false, reason: "too_small" });
  });

  it("rejects a genuinely close or cut-off face as too large", () => {
    const position = validateFacePosition({
      left: 0.04,
      top: 0.02,
      right: 0.96,
      bottom: 0.98,
      width: 0.92,
      height: 0.96,
      centerX: 0.5,
      centerY: 0.5,
    });

    expect(position).toEqual({ ok: false, reason: "too_large" });
  });

  it("rejects a face that is actually outside the visible crop", () => {
    const position = validateFacePosition({
      left: -0.3,
      top: 0.2,
      right: 1.3,
      bottom: 0.8,
      width: 1.6,
      height: 0.6,
      centerX: 0.5,
      centerY: 0.5,
    });

    expect(position).toEqual({ ok: false, reason: "cut_off" });
  });

  it("does not reject a live-valid closer face as face_too_small post-capture", () => {
    const live = liveState("face", 100, 0.5, 0, 100, 0.82, 0.9);
    const detectorGuardIssues = evaluateFaceObservations(
      [{ ...validFace, box: { originX: 420, originY: 385, width: 160, height: 230 } }],
      1000,
      1000,
      faceConfig,
    );

    expect(live.facePositionOk).toBe(true);
    expect(detectorGuardIssues.some((issue) => issue.code === "face_too_small")).toBe(false);
  });

  it("uses relaxed sharpness thresholds while preserving a real-blur floor", () => {
    expect(faceConfig.minSharpness).toBe(4);
    expect(profileConfig.minSharpness).toBe(3.5);

    const mildlySoftFace = liveState("face", 100, 0.5, 0, 3);
    const mildlySoftProfile = liveState("profile", 100, 0.5 - 15 / 350, 0, 2.75);
    const genuinelyBlurryFace = liveState("face", 100, 0.5, 0, 1.5);

    expect(mildlySoftFace.isRawValid).toBe(false);
    expect(isTolerableSharpnessDrop(mildlySoftFace, "face")).toBe(true);
    expect(isTolerableSharpnessDrop(mildlySoftProfile, "profile")).toBe(true);
    expect(isTolerableSharpnessDrop(genuinelyBlurryFace, "face")).toBe(false);
  });

  it("calculates the same centered cover crop as the camera preview", () => {
    const portraitCrop = calculateCoverCrop(1080, 1920, 390, 844);
    const tallCrop = calculateCoverCrop(400, 1200, 390, 844);

    expect(portraitCrop.sourceX).toBeGreaterThan(0);
    expect(portraitCrop.sourceY).toBe(0);
    expect(portraitCrop.sourceWidth / portraitCrop.sourceHeight).toBeCloseTo(390 / 844, 5);
    expect(tallCrop.sourceX).toBe(0);
    expect(tallCrop.sourceY).toBeGreaterThan(0);
    expect(tallCrop.sourceWidth / tallCrop.sourceHeight).toBeCloseTo(390 / 844, 5);
  });

  it("focuses the native image on the detected face without changing the preview ratio", () => {
    const crop = calculateFaceFocusedCrop(
      3024,
      4032,
      390,
      844,
      {
        left: 0.35,
        top: 0.25,
        right: 0.65,
        bottom: 0.65,
        width: 0.3,
        height: 0.4,
        centerX: 0.5,
        centerY: 0.45,
      },
    );

    expect(crop.sourceWidth / crop.sourceHeight).toBeCloseTo(390 / 844, 5);
    expect(crop.sourceHeight).toBeLessThan(4032);
    expect(crop.sourceY).toBeGreaterThan(0);
    const faceInCrop = mapFaceBoxToVisibleViewport(
      {
        left: 0.35,
        top: 0.25,
        right: 0.65,
        bottom: 0.65,
        width: 0.3,
        height: 0.4,
        centerX: 0.5,
        centerY: 0.45,
      },
      crop,
      3024,
      4032,
    );
    expect(faceInCrop.height).toBeGreaterThan(0.6);
    expect(faceInCrop.height).toBeLessThan(0.8);
  });

  it("maps a native face box into the visible cropped viewport", () => {
    const crop = calculateCoverCrop(1080, 1920, 390, 844);
    const sourceBox = getFaceBox([
      { x: 0.36, y: 0.1, z: 0, visibility: 1 },
      { x: 0.64, y: 0.9, z: 0, visibility: 1 },
    ]);
    const visibleBox = mapFaceBoxToVisibleViewport(sourceBox!, crop, 1080, 1920);

    expect(visibleBox.centerX).toBeCloseTo(0.5, 5);
    expect(visibleBox.width).toBeCloseTo(0.28 / (crop.sourceWidth / 1080), 5);
    expect(getFaceRoi(sourceBox!, 1080, 1920, crop).x).toBeGreaterThanOrEqual(crop.sourceX);
  });

  it("measures face brightness instead of accepting a bright background", () => {
    const brightBackground = makeImageData(4, 4);
    brightBackground.data.fill(240);
    const darkFace = makeImageData(4, 4);
    darkFace.data.fill(20);

    expect(analyzeBrightness(brightBackground)).toBeGreaterThan(45);
    expect(analyzeBrightness(darkFace)).toBeLessThan(45);
  });

  it("rejects a flat image and accepts a high-frequency sharp image", () => {
    const flat = makeImageData(8, 8);
    flat.data.fill(120);
    const sharp = makeImageData(8, 8);
    for (let index = 0; index < sharp.data.length; index += 4) {
      const pixel = (index / 4) % 2 ? 0 : 255;
      sharp.data[index] = pixel;
      sharp.data[index + 1] = pixel;
      sharp.data[index + 2] = pixel;
      sharp.data[index + 3] = 255;
    }

    expect(analyzeSharpness(flat)).toBe(0);
    expect(analyzeSharpness(sharp)).toBeGreaterThan(6);
  });

  it("validates a frontal face in good light", () => {
    const state = liveState("face", 100);

    expect(state.faceDetected).toBe(true);
    expect(state.facePositionOk).toBe(true);
    expect(state.poseOk).toBe(true);
    expect(state.isRawValid).toBe(true);
  });

  it("rejects a dark environment with a dedicated message", () => {
    const state = liveState("face", 20);

    expect(state.brightnessOk).toBe(false);
    expect(state.isRawValid).toBe(false);
    expect(state.guidanceMessage).toContain("plus lumineux");
  });

  it("keeps a blurry frame invalid even when the other badges pass", () => {
    const state = liveState("face", 100, 0.5, 0, 0);

    expect(state.sharpnessOk).toBe(false);
    expect(state.isRawValid).toBe(false);
    expect(state.guidanceMessage).toContain("floue");
  });

  it("uses the same symmetric 10°–29° doctrine for both profile directions", () => {
    const cases = [
      { yaw: 5, valid: false, message: "Tournez légèrement" },
      { yaw: 9, valid: false, message: "Tournez légèrement" },
      { yaw: 10, valid: true, message: "Parfait" },
      { yaw: 15, valid: true, message: "Parfait" },
      { yaw: 20, valid: true, message: "Parfait" },
      { yaw: 26, valid: true, message: "Parfait" },
      { yaw: 29, valid: true, message: "Parfait" },
      { yaw: 30, valid: false, message: "Revenez" },
      { yaw: 35, valid: false, message: "Revenez" },
    ];

    cases.forEach(({ yaw, valid, message }) => {
      [-1, 1].forEach((direction) => {
        const state = liveState("profile", 100, 0.5 + direction * yaw / 350);
        expect(Math.abs(state.poseAngle ?? 0)).toBeCloseTo(yaw);
        expect(state.poseOk).toBe(valid);
        expect(state.isRawValid).toBe(valid);
        expect(state.guidanceMessage).toContain(message);
        expect(validateRightPose10to29(state.pose)).toBe(valid);
      });
    });
  });

  it("accepts a left turn with the same magnitude as a right turn", () => {
    const state = liveState("profile", 100, 0.57);

    expect(state.poseAngle).toBeCloseTo(-24.5);
    expect(state.poseOk).toBe(true);
    expect(state.guidanceMessage).toContain("Parfait");
  });

  it("rejects a face that is not centered", () => {
    const state = liveState("face", 100, 0.5, 0.2);

    expect(state.facePositionOk).toBe(false);
    expect(state.isRawValid).toBe(false);
  });

  it("does not require the entire face box to fit inside the oval", () => {
    const position = validateFacePosition({
      left: 0.12,
      top: 0.25,
      right: 0.72,
      bottom: 0.75,
      width: 0.6,
      height: 0.5,
      centerX: 0.42,
      centerY: 0.5,
    });

    expect(position.ok).toBe(true);
  });

  it("rejects the absence of a face", () => {
    const state = buildCameraGuidanceState({ step: "face", cameraReady: true, brightness: 100, sharpness: 100, faces: [] });

    expect(state.faceDetected).toBe(false);
    expect(state.isRawValid).toBe(false);
    expect(state.guidanceMessage).toContain("visage");
  });

  it("keeps the 10° lower boundary inclusive and 30° upper boundary exclusive", () => {
    const pose = (yawDegrees: number): HeadPose => ({ yawDegrees, pitchDegrees: 0, rollDegrees: 0 });

    expect(validateRightPose10to29(pose(9))).toBe(false);
    expect(validateRightPose10to29(pose(10))).toBe(true);
    expect(validateRightPose10to29(pose(29))).toBe(true);
    expect(validateRightPose10to29(pose(30))).toBe(false);
    expect(validateRightPose10to29(pose(-9))).toBe(false);
    expect(validateRightPose10to29(pose(-10))).toBe(true);
    expect(validateRightPose10to29(pose(-29))).toBe(true);
    expect(validateRightPose10to29(pose(-30))).toBe(false);
  });
});
