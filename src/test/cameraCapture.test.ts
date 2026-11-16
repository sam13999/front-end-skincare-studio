import { afterEach, describe, expect, it, vi } from "vitest";
import { captureFailureReason, encodeJpegWithinLimit, hasJpegSignature, JPEG_QUALITY_STEPS, nextSizeForByteLimit, selectMaximumPhotoSize, sizeUnderDimensionLimit } from "../components/diagnostic/cameraCapture";

describe("native photo capture quality constraints", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reduces JPEG quality before removing any pixels", async () => {
    const drawImage = vi.fn();
    const fullResolutionCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage, imageSmoothingEnabled: false, imageSmoothingQuality: "low" }),
      toBlob(callback: (blob: Blob) => void, _type: string, quality: number) {
        callback(new Blob([new Uint8Array(quality > 0.93 ? 6 * 1024 * 1024 : 4 * 1024 * 1024)], { type: "image/jpeg" }));
      },
    };
    vi.stubGlobal("document", { createElement: () => fullResolutionCanvas });
    const result = await encodeJpegWithinLimit({} as CanvasImageSource, { x: 0, y: 0, width: 2000, height: 1500 });
    expect(result.outputWidth).toBe(2000);
    expect(result.outputHeight).toBe(1500);
    expect(result.jpegQuality).toBe(0.93);
    expect(result.resizedForByteLimit).toBe(false);
    expect(drawImage).toHaveBeenCalledTimes(1);
  });

  it("rejects an encoder that silently returns a non-JPEG blob", async () => {
    vi.stubGlobal("document", { createElement: () => ({
      getContext: () => ({ drawImage() {} }),
      toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["png"], { type: "image/png" })),
    }) });
    await expect(encodeJpegWithinLimit({} as CanvasImageSource, { x: 0, y: 0, width: 1000, height: 1000 }))
      .rejects.toThrow("capture_jpeg_encoder_unavailable");
  });

  it("reduces pixels only after every full-size quality fails", async () => {
    const attempts: Array<{ width: number; quality: number }> = [];
    const canvas = {
      width: 0, height: 0,
      getContext: () => ({ drawImage() {} }),
      toBlob(callback: (blob: Blob) => void, _type: string, quality: number) {
        attempts.push({ width: this.width, quality });
        const bytes = this.width === 2000 ? 5_100_000 : 1_000_000;
        callback(new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }));
      },
    };
    vi.stubGlobal("document", { createElement: () => canvas });
    const result = await encodeJpegWithinLimit({} as CanvasImageSource, { x: 0, y: 0, width: 2000, height: 1500 });
    expect(attempts.slice(0, JPEG_QUALITY_STEPS.length).map((attempt) => attempt.quality)).toEqual([...JPEG_QUALITY_STEPS]);
    expect(result.outputWidth).toBeLessThan(2000);
    expect(result.resizedForByteLimit).toBe(true);
  });

  it("records a bounded capture error reason without serializing the device error", () => {
    expect(captureFailureReason(new DOMException("camera details", "NotReadableError"))).toBe("NotReadableError");
    expect(captureFailureReason(new Error("camera ID: private"))).toBe("unknown_capture_error");
  });

  it("preserves original bytes only when the JPEG signature is real", async () => {
    expect(await hasJpegSignature(new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])]))).toBe(true);
    expect(await hasJpegSignature(new Blob(["fake-jpeg"]))).toBe(false);
  });

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
