import { describe, expect, it } from "vitest";
import { JPEG_QUALITY_STEPS, nextSizeForByteLimit, selectMaximumPhotoSize, sizeUnderDimensionLimit } from "../components/diagnostic/cameraCapture";

describe("native photo capture quality constraints", () => {
  it("requests the highest photo size reported by the browser", () => {
    expect(selectMaximumPhotoSize({ imageWidth: { max: 4032 }, imageHeight: { max: 3024 } }))
      .toEqual({ imageWidth: 4032, imageHeight: 3024 });
    expect(selectMaximumPhotoSize(null)).toBeNull();
    expect(selectMaximumPhotoSize({ imageWidth: { max: 4000 } })).toBeNull();
  });
  it("never upscales the image and respects the provider side limit", () => {
    expect(sizeUnderDimensionLimit(2000, 1500, 4095)).toEqual({ width: 2000, height: 1500 });
    expect(sizeUnderDimensionLimit(6000, 4500, 4095)).toEqual({ width: 4095, height: 3071 });
  });
  it("tries JPEG compression before removing pixels and keeps a quality floor", () => {
    expect(JPEG_QUALITY_STEPS[0]).toBe(0.95);
    expect(JPEG_QUALITY_STEPS[JPEG_QUALITY_STEPS.length - 1]).toBeGreaterThanOrEqual(0.8);
    const next = nextSizeForByteLimit(4095, 3071, 7 * 1024 * 1024, 5 * 1024 * 1024);
    expect(next.width).toBeLessThan(4095);
    expect(next.height).toBeLessThan(3071);
    expect(next.width).toBeGreaterThan(0);
  });
});
