// Technical capture metrics only: no image contents or biometric landmarks.
export interface NativeCaptureDiagnostics {
  method: "native-photo";
  streamWidth: number | null;
  streamHeight: number | null;
  browserMaxWidth: number | null;
  browserMaxHeight: number | null;
  requestedMaxResolution: boolean;
  sourceWidth: number;
  sourceHeight: number;
  cropWidth: number;
  cropHeight: number;
  outputWidth: number;
  outputHeight: number;
  jpegQuality: number;
  outputBytes: number;
  resizedForByteLimit: boolean;
}

type ResolutionRange = { max?: number };
export type NativePhotoCapabilities = {
  imageWidth?: ResolutionRange;
  imageHeight?: ResolutionRange;
};

export type RequestedPhotoSize = { imageWidth: number; imageHeight: number };

export const JPEG_QUALITY_STEPS = [0.95, 0.93, 0.91, 0.89, 0.87, 0.85, 0.82, 0.80] as const;

export function selectMaximumPhotoSize(capabilities: NativePhotoCapabilities | null): RequestedPhotoSize | null {
  const width = capabilities?.imageWidth?.max;
  const height = capabilities?.imageHeight?.max;
  if (!Number.isFinite(width) || !Number.isFinite(height) || !width || !height || width < 1 || height < 1) {
    return null;
  }
  return { imageWidth: Math.floor(width), imageHeight: Math.floor(height) };
}

export function sizeUnderDimensionLimit(width: number, height: number, maxDimension: number) {
  const ratio = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.floor(width * ratio)),
    height: Math.max(1, Math.floor(height * ratio)),
  };
}

// Only used after all full-resolution JPEG quality attempts fail the byte limit.
export function nextSizeForByteLimit(width: number, height: number, actualBytes: number, limitBytes: number) {
  const ratio = Math.max(0.7, Math.min(0.92, Math.sqrt(limitBytes / actualBytes) * 0.96));
  return {
    width: Math.max(1, Math.floor(width * ratio)),
    height: Math.max(1, Math.floor(height * ratio)),
  };
}

export interface EncodedStillPhoto {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  jpegQuality: number;
  resizedForByteLimit: boolean;
}

/**
 * Encode from the original decoded still source at every attempt.
 * Try all JPEG quality levels at unchanged dimensions before dropping pixels.
 */
export async function encodeJpegWithinLimit(
  source: CanvasImageSource,
  rectangle: { x: number; y: number; width: number; height: number },
  maxDimension = 4095,
  maxBytes = 5 * 1024 * 1024,
): Promise<EncodedStillPhoto> {
  let { width, height } = sizeUnderDimensionLimit(
    Math.round(rectangle.width), Math.round(rectangle.height), maxDimension,
  );
  const initialWidth = width;
  const initialHeight = height;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("capture_canvas_unavailable");

  for (let pass = 0; pass < 8; pass += 1) {
    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      source, rectangle.x, rectangle.y, rectangle.width, rectangle.height,
      0, 0, width, height,
    );
    let smallestAttemptBytes = 0;
    for (const quality of JPEG_QUALITY_STEPS) {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error("capture_blob_unavailable")),
          "image/jpeg", quality,
        );
      });
      smallestAttemptBytes = blob.size;
      if (blob.size > 0 && blob.size <= maxBytes) {
        return {
          blob,
          outputWidth: width,
          outputHeight: height,
          jpegQuality: quality,
          resizedForByteLimit: width < initialWidth || height < initialHeight,
        };
      }
    }
    if (!smallestAttemptBytes) throw new Error("capture_invalid_blob");
    const next = nextSizeForByteLimit(width, height, smallestAttemptBytes, maxBytes);
    if (next.width >= width || next.height >= height || Math.min(next.width, next.height) < 201) {
      throw new Error("capture_size_limit_unreachable");
    }
    width = next.width;
    height = next.height;
  }
  throw new Error("capture_size_limit_unreachable");
}

export function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result) : reject(new Error("capture_data_url_unavailable"));
    reader.onerror = () => reject(new Error("capture_file_read_failed"));
    reader.readAsDataURL(blob);
  });
}
