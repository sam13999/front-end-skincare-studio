import { useCallback, useRef, useState } from "react";
import { AlertCircle, Camera, Check, CheckCircle2, Loader2, Upload } from "lucide-react";
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
  "Votre visage est légèrement tourné (20–30°), avec ses principaux traits visibles",
  "Aucun élément ne cache votre visage",
  "Format JPG ou JPEG, 5 Mo maximum",
];

export const PhotoStep = ({ type, photo, onPhotoChange, onNext }: PhotoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const validationIdRef = useRef(0);
  const [preview, setPreview] = useState<string | null>(photo);
  const [quality, setQuality] = useState<PhotoQuality>(photo ? "good" : "none");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const checklist = type === "face" ? faceChecklist : profileChecklist;
  const title = type === "face" ? "Photo de face" : "Vue 3/4";
  const subtitle = type === "face"
    ? "Prenez ou importez une photo de votre visage de face."
    : "Prenez ou importez une vue 3/4, le visage légèrement tourné (20–30°).";

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
    const fileIssues = validatePhotoFile(file);
    if (fileIssues.some((issue) => issue.severity === "critical")) {
      validationIdRef.current += 1;
      setPreview(null);
      setQuality("insufficient");
      setValidation(createRejectedResult(fileIssues, Math.round(file.size / 1024)));
      setAnalyzing(false);
      onPhotoChange(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") processPhoto(result, file.size);
      else rejectUnexpectedError();
    };
    reader.onerror = rejectUnexpectedError;
    reader.readAsDataURL(file);
  }, [onPhotoChange, processPhoto, rejectUnexpectedError]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  };

  const handleRetake = () => {
    validationIdRef.current += 1;
    setPreview(null);
    onPhotoChange(null);
    setQuality("none");
    setValidation(null);
    setAnalyzing(false);
  };

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

      {!preview ? (
        <div className="svd-photo-tools">
          <button type="button" className="svd-primary" disabled={analyzing} onClick={() => cameraInputRef.current?.click()}>
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

      <input ref={cameraInputRef} type="file" accept={ACCEPTED_FILE_TYPES} capture="user" className="svd-hidden-input" onChange={handleInputChange} />
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
