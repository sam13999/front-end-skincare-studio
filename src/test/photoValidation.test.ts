import { describe, expect, it } from "vitest";
import {
  evaluateFaceObservations,
  faceConfig,
  validatePhotoFile,
  type FaceObservation,
} from "@/components/diagnostic/photoValidation";

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

  it("refuses a face that is too small for skin analysis", () => {
    const issues = evaluateFaceObservations(
      [{ ...validFace, box: { originX: 350, originY: 350, width: 240, height: 280 } }],
      1000,
      1000,
      faceConfig
    );

    expect(issues[0].code).toBe("face_too_small");
  });

  it("accepts one sufficiently visible face", () => {
    expect(evaluateFaceObservations([validFace], 1000, 1000, faceConfig)).toEqual([]);
  });

  it("accepts JPEG files and rejects unsupported image formats", () => {
    const jpeg = new File([new Uint8Array(1024)], "portrait.jpg", { type: "image/jpeg" });
    const png = new File([new Uint8Array(1024)], "room.png", { type: "image/png" });

    expect(validatePhotoFile(jpeg)).toEqual([]);
    expect(validatePhotoFile(png).some((issue) => issue.code === "bad_format")).toBe(true);
  });
});
