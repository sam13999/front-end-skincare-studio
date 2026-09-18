import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import {
  CAMERA_GUIDANCE_THRESHOLDS,
  analyzeSharpness,
  calculateCoverCrop,
  buildCameraGuidanceState,
  analyzeBrightness,
  getFaceBox,
  getFaceRoi,
  getVideoFaceLandmarker,
  getVideoGuidanceResult,
  isTolerableSharpnessDrop,
  readRegionFromSource,
  type CameraGuidanceState,
  type CameraStep,
} from "./cameraGuidance";

interface GuidedCameraProps {
  step: CameraStep;
  onCapture: (dataUrl: string, fileSize: number) => void;
  onClose: () => void;
  onFallback: () => void;
}

const EMPTY_STATE: CameraGuidanceState = buildCameraGuidanceState({
  step: "face",
  cameraReady: false,
  brightness: null,
  sharpness: null,
  faces: [],
});

const CAMERA_CAPTURE_MAX_DIMENSION = 4095;
const CAMERA_CAPTURE_MAX_BYTES = 5 * 1024 * 1024;
const CAMERA_CAPTURE_JPEG_QUALITY = 0.97;

type NativeImageCapture = {
  takePhoto: () => Promise<Blob>;
};

type NativeImageCaptureConstructor = new (track: MediaStreamTrack) => NativeImageCapture;

type NativeBitmapFactory = (
  blob: Blob,
  options?: { imageOrientation?: "none" | "from-image" },
) => Promise<ImageBitmap>;

function createNativeImageCapture(track: MediaStreamTrack): NativeImageCapture | null {
  const browserWindow = window as unknown as { ImageCapture?: NativeImageCaptureConstructor };
  const ImageCaptureConstructor = browserWindow.ImageCapture;
  if (typeof ImageCaptureConstructor !== "function") return null;

  try {
    const imageCapture = new ImageCaptureConstructor(track);
    return typeof imageCapture.takePhoto === "function" ? imageCapture : null;
  } catch {
    return null;
  }
}

async function decodeNativePhoto(blob: Blob): Promise<ImageBitmap> {
  const browserWindow = window as unknown as { createImageBitmap?: NativeBitmapFactory };
  const createBitmap = browserWindow.createImageBitmap;
  if (typeof createBitmap !== "function") throw new Error("native_photo_decode_unavailable");
  return createBitmap(blob, { imageOrientation: "from-image" });
}

function Indicator({ label, value }: { label: string; value: boolean | null }) {
  const status = value === null ? "pending" : value ? "valid" : "invalid";
  return (
    <div className={`svd-camera-indicator svd-camera-indicator--${status}`}>
      {status === "valid" ? <CheckCircle2 aria-hidden="true" /> : status === "invalid" ? <XCircle aria-hidden="true" /> : <Loader2 aria-hidden="true" />}
      <span>{label}</span>
    </div>
  );
}

export const GuidedCamera = ({ step, onCapture, onClose, onFallback }: GuidedCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const brightnessCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const lastAnalysisRef = useRef(0);
  const stableFramesRef = useRef(0);
  const transientSharpnessDropsRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraGuidanceState>(() => ({ ...EMPTY_STATE }));
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [stableFrames, setStableFrames] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const stop = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("La caméra n’est pas disponible sur cet appareil.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1440 },
            height: { ideal: 1920 },
          },
        });
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          void videoTrack.getSettings();
        }
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (!active) return;
        setCameraReady(true);

        const landmarker = await getVideoFaceLandmarker();
        if (!active) return;
        setModelReady(true);

        const analyse = (time: number) => {
          if (!active) return;
          frameRef.current = requestAnimationFrame(analyse);
          if (processingRef.current || time - lastAnalysisRef.current < CAMERA_GUIDANCE_THRESHOLDS.analysisIntervalMs) return;
          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return;
          lastAnalysisRef.current = time;
          processingRef.current = true;

          try {
            const result = getVideoGuidanceResult(landmarker, video, Math.max(time, lastAnalysisRef.current));
            const metricsCanvas = brightnessCanvasRef.current;
            const videoRect = video.getBoundingClientRect();
            const displayWidth = videoRect.width || video.clientWidth || window.innerWidth;
            const displayHeight = videoRect.height || video.clientHeight || window.innerHeight;
            const crop = calculateCoverCrop(video.videoWidth, video.videoHeight, displayWidth, displayHeight);
            const sourceFaceBox = result.faceLandmarks.length === 1 ? getFaceBox(result.faceLandmarks[0]) : null;
            const qualityRegion = sourceFaceBox
              ? getFaceRoi(sourceFaceBox, video.videoWidth, video.videoHeight, crop)
              : {
                x: crop.sourceX,
                y: crop.sourceY,
                width: crop.sourceWidth,
                height: crop.sourceHeight,
              };
            const qualityData = metricsCanvas
              ? readRegionFromSource(video, qualityRegion, metricsCanvas)
              : null;
            const brightness = qualityData ? analyzeBrightness(qualityData) : null;
            const sharpness = qualityData ? analyzeSharpness(qualityData) : null;
            const guideElement = video.parentElement?.querySelector<HTMLElement>(".svd-camera-guide");
            const guideRect = guideElement?.getBoundingClientRect();
            const nextState = buildCameraGuidanceState({
              step,
              cameraReady: true,
              brightness,
              sharpness,
              faces: result.faceLandmarks,
              transformationMatrix: result.facialTransformationMatrixes?.[0],
              frame: {
                sourceWidth: video.videoWidth,
                sourceHeight: video.videoHeight,
                displayWidth,
                displayHeight,
                guideRect: guideRect && guideRect.width > 0 && guideRect.height > 0
                  ? { left: guideRect.left, top: guideRect.top, width: guideRect.width, height: guideRect.height }
                  : undefined,
              },
            });
            setState(nextState);
            if (nextState.isRawValid) {
              stableFramesRef.current = Math.min(
                stableFramesRef.current + 1,
                CAMERA_GUIDANCE_THRESHOLDS.stableFramesRequired,
              );
              transientSharpnessDropsRef.current = 0;
            } else if (
              isTolerableSharpnessDrop(nextState, step)
              && transientSharpnessDropsRef.current < CAMERA_GUIDANCE_THRESHOLDS.maxTransientSharpnessDrops
            ) {
              // Keep the short valid streak through a minor focus/motion dip.
              // A persistent blur still resets it on the next failed frame.
              transientSharpnessDropsRef.current += 1;
            } else {
              stableFramesRef.current = 0;
              transientSharpnessDropsRef.current = 0;
            }
            setStableFrames(stableFramesRef.current);
          } catch {
            setError("La détection du visage n’a pas pu démarrer. Vous pouvez importer une photo.");
          } finally {
            processingRef.current = false;
          }
        };

        frameRef.current = requestAnimationFrame(analyse);
      } catch (cameraError) {
        if (!active) return;
        const name = cameraError instanceof DOMException ? cameraError.name : "";
        setError(name === "NotAllowedError"
          ? "Autorisez l’accès à la caméra dans les réglages de votre navigateur."
          : "La caméra n’a pas pu être ouverte sur cet appareil.");
      }
    };

    void start();
    return () => {
      active = false;
      stop();
    };
  }, [step]);

  const transientSharpnessDrop = isTolerableSharpnessDrop(state, step)
    && transientSharpnessDropsRef.current <= CAMERA_GUIDANCE_THRESHOLDS.maxTransientSharpnessDrops;
  const isStable = (state.isRawValid || transientSharpnessDrop)
    && stableFrames >= CAMERA_GUIDANCE_THRESHOLDS.stableFramesRequired;
  const positionStatus = state.faceDetected && state.faceCount === 1 ? state.facePositionOk : false;
  const orientationStatus = state.faceDetected ? state.poseOk : false;

  const capture = () => {
    if (!isStable) return;
    // Do not use a stale green frame if analysis was paused while the device
    // was moving or the tab was backgrounded.
    if (performance.now() - lastAnalysisRef.current > CAMERA_GUIDANCE_THRESHOLDS.analysisIntervalMs * 2) {
      stableFramesRef.current = 0;
      transientSharpnessDropsRef.current = 0;
      setStableFrames(0);
      return;
    }
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const videoRect = video.getBoundingClientRect();
    const displayWidth = videoRect.width || video.clientWidth || window.innerWidth;
    const displayHeight = videoRect.height || video.clientHeight || window.innerHeight;

    const encodeCapture = (
      source: HTMLVideoElement | ImageBitmap,
      sourceWidth: number,
      sourceHeight: number,
    ): Promise<void> => new Promise((resolve, reject) => {
      const crop = calculateCoverCrop(sourceWidth, sourceHeight, displayWidth, displayHeight);
      const scale = Math.min(
        1,
        CAMERA_CAPTURE_MAX_DIMENSION / Math.max(crop.sourceWidth, crop.sourceHeight),
      );
      const initialWidth = Math.max(1, Math.round(crop.sourceWidth * scale));
      const initialHeight = Math.max(1, Math.round(crop.sourceHeight * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("capture_canvas_unavailable"));
        return;
      }

      const encode = (width: number, height: number) => {
        canvas.width = width;
        canvas.height = height;
        try {
          // Keep the same unmirrored source orientation as the former file-input flow.
          context.drawImage(
            source,
            crop.sourceX,
            crop.sourceY,
            crop.sourceWidth,
            crop.sourceHeight,
            0,
            0,
            width,
            height,
          );
        } catch (error) {
          reject(error);
          return;
        }
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("capture_blob_unavailable"));
            return;
          }
          if (blob.size > CAMERA_CAPTURE_MAX_BYTES && (width > 1 || height > 1)) {
            const scaleToLimit = Math.sqrt(CAMERA_CAPTURE_MAX_BYTES / blob.size);
            const nextWidth = Math.max(1, Math.min(width - 1, Math.floor(width * scaleToLimit)));
            const nextHeight = Math.max(1, Math.min(height - 1, Math.floor(height * scaleToLimit)));
            if (nextWidth < width || nextHeight < height) {
              encode(nextWidth, nextHeight);
              return;
            }
          }
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== "string") {
              reject(new Error("capture_data_url_unavailable"));
              return;
            }
            onCapture(reader.result, blob.size);
            resolve();
          };
          reader.onerror = () => reject(new Error("capture_file_read_failed"));
          reader.readAsDataURL(blob);
        }, "image/jpeg", CAMERA_CAPTURE_JPEG_QUALITY);
      };

      encode(initialWidth, initialHeight);
    });

    const captureFromVideo = () => {
      void encodeCapture(video, video.videoWidth, video.videoHeight).catch(() => undefined);
    };

    const captureNativePhoto = async () => {
      const videoTrack = streamRef.current?.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState !== "live") {
        captureFromVideo();
        return;
      }
      const imageCapture = createNativeImageCapture(videoTrack);
      if (!imageCapture) {
        captureFromVideo();
        return;
      }

      try {
        const photoBlob = await imageCapture.takePhoto();
        if (!photoBlob.size) throw new Error("native_photo_empty");
        const bitmap = await decodeNativePhoto(photoBlob);
        try {
          await encodeCapture(bitmap, bitmap.width, bitmap.height);
        } finally {
          bitmap.close();
        }
      } catch {
        captureFromVideo();
      }
    };

    void captureNativePhoto();
  };

  return (
    <div className="svd-camera" role="dialog" aria-modal="true" aria-labelledby="svd-camera-title">
      <video ref={videoRef} className="svd-camera-video" autoPlay muted playsInline aria-label="Aperçu de la caméra" />
      <canvas ref={brightnessCanvasRef} className="svd-camera-analysis-canvas" aria-hidden="true" />
      <div className="svd-camera-shade" aria-hidden="true" />

      <header className="svd-camera-header">
        <button type="button" className="svd-camera-close" onClick={onClose} aria-label="Fermer la caméra">
          <X aria-hidden="true" />
        </button>
        <div>
          <p className="svd-camera-step">Photo {step === "face" ? "1" : "2"} sur 2</p>
          <h2 id="svd-camera-title">{step === "face" ? "Photo de face" : "Vue 3/4"}</h2>
        </div>
      </header>

      <div className="svd-camera-indicators" aria-label="État de la prise de vue">
        <Indicator label="Luminosité" value={state.brightnessOk} />
        <Indicator label="Position" value={positionStatus} />
        <Indicator label="Orientation" value={orientationStatus} />
      </div>

      <div className={`svd-camera-guide ${isStable ? "svd-camera-guide--valid" : ""}`} aria-hidden="true">
        <div className="svd-camera-oval" />
      </div>

      <div className="svd-camera-bottom">
        <p className="svd-camera-message" role="status" aria-live="polite">
          {!cameraReady && !error ? "Activation de la caméra…" : !modelReady && !error ? "Préparation de la détection…" : error || state.guidanceMessage}
        </p>
        {error ? (
          <button type="button" className="svd-primary svd-camera-fallback" onClick={onFallback}>Importer une photo</button>
        ) : (
          <button type="button" className="svd-camera-capture" onClick={capture} disabled={!isStable}>
            <span className="svd-camera-capture-ring"><Check aria-hidden="true" /></span>
            <span>{isStable ? "Prendre la photo" : "Cadrez votre visage"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
