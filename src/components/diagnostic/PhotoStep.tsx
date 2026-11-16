import { useCallback, useRef, useState } from "react";
import { AlertCircle, Camera, Check, CheckCircle2, Loader2, Upload } from "lucide-react";
import { GuidedCamera } from "./GuidedCamera";
import { encodeJpegWithinLimit, readBlobAsDataUrl, type NativeCaptureDiagnostics } from "./cameraCapture";
import {
  ACCEPTED_FILE_TYPES,
  createRejectedResult,
  validatePhoto,
  validatePhotoFile,
  type PhotoQuality,
  type ValidationResult,
} from "./photoValidation";

interface PhotoStepProps {
  type: "face" | "profile";
  photo: string | null;
  onPhotoChange: (value: string | null) => void;
  onNext: () => void;
}

const faceChecklist = [
  "Votre visage est entièrement visible",
  "La photo est nette et bien éclairée",
  "Vous êtes seul(e) sur la photo",
  "Aucun élément ne cache votre visage",
  "Format JPG ou JPEG, 5 Mo maximum",
];

const profileChecklist = [
  "Un côté de votre visage est bien visible",
  "La photo est nette et bien éclairée",
  "Votre visage est légèrement tourné sur le côté, avec ses principaux traits visibles",
  "Aucun élément ne cache votre visage",
  "Format JPG ou JPEG, 5 Mo maximum",
];

export const PhotoStep = ({ type, photo, onPhotoChange, onNext }: PhotoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validationIdRef = useRef(0);
  const [preview, setPreview] = useState<string | null>(photo);
  const [quality, setQuality] = useState<PhotoQuality>(photo ? "good" : "none");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [captureDiagnostics, setCaptureDiagnostics] = useState<NativeCaptureDiagnostics | null>(null);

  const checklist = type === "face" ? faceChecklist : profileChecklist;
  const title = type === "face" ? "Photo de face" : "Vue 3/4";
  const subtitle = type === "face"
    ? "Prenez ou importez une photo de votre visage de face."
    : "Prenez ou importez une vue 3/4, le visage légèrement tourné sur le côté.";

  const rejectUnexpectedError = useCallback(() => {
    const result = createRejectedResult([{
      code: "unexpected_validation_error",
      message: "La photo n’a pas pu être vérifiée. Réessayez avec une autre image.",
      severity: "critical",
    }]);
    setQuality("insufficient");
    setValidation(result);
    onPhotoChange(null);
  }, [onPhotoChange]);

  const processPhoto = useCallback(async (dataUrl: string, fileSize: number) => {
    const validationId = ++validationIdRef.current;
    setPreview(dataUrl);
    setQuality("none");
    setValidation(null);
    setAnalyzing(true);
    onPhotoChange(null);
    try {
      const result = await validatePhoto(dataUrl, type, fileSize);
      if (validationId !== validationIdRef.current) return;
      const usable = result.quality === "acceptable" || result.quality === "good";
      setQuality(result.quality);
      setValidation(result);
      onPhotoChange(usable ? dataUrl : null);
    } catch {
      if (validationId === validationIdRef.current) rejectUnexpectedError();
    } finally {
      if (validationId === validationIdRef.current) setAnalyzing(false);
    }
  }, [onPhotoChange, rejectUnexpectedError, type]);

  const handleFile = useCallback((file: File) => {
    const preparationId = ++validationIdRef.current;
    setPreview(null);
    setQuality("none");
    setValidation(null);
    setCaptureDiagnostics(null);
    setAnalyzing(true);
    onPhotoChange(null);

    void (async () => {
      if (!file.size) throw new Error("empty_image_file");
      // Keep compliant JPEG bytes unchanged. Normalize only when the provider
      // would reject its format, dimensions or file size.
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      let prepared: Blob = file;
      let jpegQuality: number | null = null;
      let resizedForByteLimit = false;
      try {
        const isJpeg = ["image/jpeg", "image/jpg"].includes(file.type.toLowerCase());
        const isAlreadyCompliant = isJpeg
          && file.size <= 5 * 1024 * 1024
          && Math.max(bitmap.width, bitmap.height) <= 4095;
        if (!isAlreadyCompliant) {
          const result = await encodeJpegWithinLimit(
            bitmap, { x: 0, y: 0, width: bitmap.width, height: bitmap.height },
          );
          prepared = result.blob;
          jpegQuality = result.jpegQuality;
          resizedForByteLimit = result.resizedForByteLimit;
        }
        const preparedFile = new File([prepared], "photo.jpg", { type: "image/jpeg" });
        const fileIssues = validatePhotoFile(preparedFile);
        if (fileIssues.some((issue) => issue.severity === "critical")) {
          if (preparationId === validationIdRef.current) {
            setQuality("insufficient");
            setValidation(createRejectedResult(fileIssues, Math.round(prepared.size / 1024)));
          }
          return;
        }
        const dataUrl = await readBlobAsDataUrl(prepared);
        if (preparationId !== validationIdRef.current) return;
        setCaptureDiagnostics({
          method: "imported-photo",
          streamWidth: null,
          streamHeight: null,
          browserMaxWidth: null,
          browserMaxHeight: null,
          requestedMaxResolution: false,
          sourceWidth: bitmap.width,
          sourceHeight: bitmap.height,
          cropWidth: bitmap.width,
          cropHeight: bitmap.height,
          outputWidth: jpegQuality === null ? bitmap.width : Math.min(bitmap.width, 4095),
          outputHeight: jpegQuality === null ? bitmap.height : Math.min(bitmap.height, 4095),
          jpegQuality,
          outputBytes: prepared.size,
          resizedForByteLimit,
        });
        void processPhoto(dataUrl, prepared.size);
      } finally {
        bitmap.close();
      }
    })().catch(() => {
      if (preparationId === validationIdRef.current) rejectUnexpectedError();
    }).finally(() => {
      if (preparationId === validationIdRef.current) setAnalyzing(false);
    });
  }, [onPhotoChange, processPhoto, rejectUnexpectedError]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  };

  const handleRetake = () => {
    setCaptureDiagnostics(null);
    validationIdRef.current += 1;
    setPreview(null);
    onPhotoChange(null);
    setQuality("none");
    setValidation(null);
    setAnalyzing(false);
  };

  const handleGuidedCapture = useCallback((dataUrl: string, fileSize: number, diagnostics: NativeCaptureDiagnostics) => {
    setCaptureDiagnostics(diagnostics);
    setCameraOpen(false);
    void processPhoto(dataUrl, fileSize);
  }, [processPhoto]);

  if (cameraOpen) {
    return (
      <GuidedCamera
        step={type}
        onCapture={handleGuidedCapture}
        onClose={() => setCameraOpen(false)}
        onFallbackFile={(file) => {
          setCameraOpen(false);
          handleFile(file);
        }}
      />
    );
  }

  const isUsable = quality === "acceptable" || quality === "good";
  const hasFeedback = quality !== "none" && !analyzing;

  return (
    <section className="svd-step" aria-labelledby="photo-title">
      <div className="svd-intro">
        <p className="svd-eyebrow">Étape photo</p>
        <h2 id="photo-title">{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="svd-photo-preview">
        {preview ? (
          <>
            <img src={preview} alt={`Aperçu de votre ${title.toLowerCase()}`} />
            {analyzing && (
              <div className="svd-loading">
                <Loader2 aria-hidden="true" />
                <span>Validation du visage en cours…</span>
              </div>
            )}
          </>
        ) : (
          <div className="svd-photo-empty">
            <Camera aria-hidden="true" />
          </div>
        )}
      </div>

      {hasFeedback && (
        <div className="svd-photo-feedback" role="status" aria-live="polite">
          <div className="svd-photo-status" data-quality={quality}>
            {quality === "insufficient"
              ? <><AlertCircle aria-hidden="true" /> Photo refusée</>
              : <><CheckCircle2 aria-hidden="true" /> Photo validée</>}
          </div>
          {validation && validation.issues.length > 0 && (
            <div className="svd-photo-issues">
              {validation.issues.map((issue) => <p key={issue.code}>{issue.message}</p>)}
            </div>
          )}
        </div>
      )}

      {preview && captureDiagnostics && (
        <details className="svd-photo-technical">
          <summary>Détails techniques de la photo</summary>
          <p>Mode : {captureDiagnostics.method === "native-photo"
            ? "photo native SkinView, sans extraction vidéo"
            : "photo fournie par l’appareil ou la galerie, sans extraction vidéo"}.</p>
          <p>Flux de guidage : {captureDiagnostics.streamWidth ?? "?"} × {captureDiagnostics.streamHeight ?? "?"} px.</p>
          <p>
            Maximum annoncé par le navigateur : {captureDiagnostics.browserMaxWidth !== null
              ? `${captureDiagnostics.browserMaxWidth} × ${captureDiagnostics.browserMaxHeight} px`
              : "non communiqué"}.
            {" "}Demande de résolution maximale : {captureDiagnostics.method === "imported-photo"
              ? "non applicable" : captureDiagnostics.requestedMaxResolution ? "oui" : "non (réglages indisponibles ou refusés)"}.
          </p>
          <p>Photographie native : {captureDiagnostics.sourceWidth} × {captureDiagnostics.sourceHeight} px.</p>
          <p>Zone recadrée : {captureDiagnostics.cropWidth} × {captureDiagnostics.cropHeight} px.</p>
          <p>
            JPEG final : {captureDiagnostics.outputWidth} × {captureDiagnostics.outputHeight} px,
            {" "}{(captureDiagnostics.outputBytes / (1024 * 1024)).toFixed(2)} Mo,
            {" "}qualité {captureDiagnostics.jpegQuality === null
              ? "du fichier original, non réencodé" : `${Math.round(captureDiagnostics.jpegQuality * 100)} %`}.
          </p>
          <p>
            Réduction supplémentaire pour respecter 5 Mo : {captureDiagnostics.resizedForByteLimit ? "oui" : "non"}.
            {" "}Ces valeurs reflètent les possibilités exposées par le navigateur, pas nécessairement toute la résolution physique du capteur.
          </p>
        </details>
      )}

      {!preview ? (
        <div className="svd-photo-tools">
          <button type="button" className="svd-primary" disabled={analyzing} onClick={() => setCameraOpen(true)}>
            <Camera aria-hidden="true" /> Prendre
          </button>
          <button type="button" className="svd-secondary" disabled={analyzing} onClick={() => fileInputRef.current?.click()}>
            <Upload aria-hidden="true" /> Importer
          </button>
        </div>
      ) : (
        <div className="svd-photo-tools">
          <button type="button" className="svd-secondary" onClick={handleRetake} disabled={analyzing}>Reprendre</button>
          <button type="button" className="svd-primary" disabled={!isUsable || analyzing} onClick={onNext}>Utiliser</button>
        </div>
      )}

      {!isUsable && !analyzing && (
        <button type="button" className="svd-photo-note" onClick={onNext}>
          Continuer sans cette photo
        </button>
      )}

      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} className="svd-hidden-input" onChange={handleInputChange} />

      <div className="svd-checklist">
        <h3>Pour une analyse fiable, vérifiez que :</h3>
        <ul>
          {checklist.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
