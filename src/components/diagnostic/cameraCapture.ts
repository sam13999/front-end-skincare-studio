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
