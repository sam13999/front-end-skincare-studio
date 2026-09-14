import { useCallback, useRef, useState } from "react";
import { AlertCircle, Camera, Check, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_FILE_TYPES, createRejectedResult, validatePhoto, validatePhotoFile, type PhotoQuality, type ValidationResult } from "./photoValidation";

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

const qualityConfig: Record<Exclude<PhotoQuality, "none">, { label: string; color: string; border: string; icon: typeof AlertCircle }> = {
  insufficient: { label: "Photo refusée", color: "text-red-600", border: "border-red-400", icon: AlertCircle },
  acceptable: { label: "Photo validée", color: "text-[#a95c4d]", border: "border-[#a95c4d]", icon: CheckCircle2 },
  good: { label: "Photo validée", color: "text-[#183e34]", border: "border-[#183e34]", icon: CheckCircle2 },
};

export const PhotoStep = ({ type, photo, onPhotoChange, onNext }: PhotoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const validationIdRef = useRef(0);
  const [preview, setPreview] = useState<string | null>(photo);
  const [quality, setQuality] = useState<PhotoQuality>(photo ? "good" : "none");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const title = type === "face" ? "Photo de face" : "Vue 3/4";
  const subtitle = type === "face"
    ? "Prenez ou importez une photo de votre visage de face."
    : "Prenez ou importez une vue 3/4, le visage légèrement tourné (20–30°).";
  const checklist = type === "face" ? faceChecklist : profileChecklist;

  const rejectUnexpectedError = useCallback(() => {
    const result = createRejectedResult([{ code: "unexpected_validation_error", message: "La photo n’a pas pu être vérifiée. Réessayez avec une autre image.", severity: "critical" }]);
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
    <div className="flex flex-col">
      <div className="mb-7">
        <p className="eyebrow">{type === "face" ? "Étape 01" : "Étape 02"}</p>
        <h2 className="mt-4 font-serif text-3xl leading-none tracking-[-0.03em] text-[#183e34] sm:text-4xl">{title}</h2>
        <p className="mt-3 text-[15px] leading-[1.65] text-[#69766f]">{subtitle}</p>
      </div>

      <div className={"relative mb-5 aspect-[3/4] w-full max-w-[330px] self-center overflow-hidden rounded-[1.25rem] border-2 bg-white shadow-[0_18px_50px_-35px_rgba(24,62,52,0.7)] " + (preview ? (quality !== "none" ? qualityConfig[quality]?.border || "border-[#183e34]/20" : "border-[#183e34]/15") : "border-dashed border-[#183e34]/20")}>
        {preview ? (
          <>
            <img src={preview} alt={"Aperçu de votre " + title.toLowerCase()} className="h-full w-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f8f6f1]/88 px-5 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#183e34]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[#183e34]">Validation de la photo en cours…</span>
                <span className="text-xs leading-snug text-[#69766f]">Cette étape peut prendre quelques secondes.</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[#a2ada7]">
            <Camera className="h-10 w-10" aria-hidden="true" />
            <span className="text-sm">Aucune photo</span>
          </div>
        )}
      </div>

      {hasFeedback && (
        <div className="mb-5 w-full max-w-[360px] self-center space-y-3" role="status" aria-live="polite">
          <div className="flex items-center justify-center gap-2">
            {(() => {
              const config = qualityConfig[quality];
              const Icon = config.icon;
              return <><Icon className={"h-4 w-4 " + config.color} aria-hidden="true" /><span className={"text-sm font-semibold " + config.color}>{config.label}</span></>;
            })()}
          </div>
          {validation && validation.issues.length > 0 && (
            <div className="space-y-2 rounded-xl border border-[#183e34]/10 bg-white p-4">
              {validation.issues.map((issue) => (
                <div key={issue.code} className="flex items-start gap-2">
                  <span className={"mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full " + (issue.severity === "critical" ? "bg-red-500" : "bg-[#a95c4d]")} />
                  <span className="text-xs leading-[1.5] text-[#69766f]">{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!preview ? (
        <div className="mb-4 grid w-full max-w-[360px] grid-cols-2 gap-3 self-center">
          <Button variant="premium" size="lg" className="gap-2" disabled={analyzing} onClick={() => cameraInputRef.current?.click()}><Camera className="h-4 w-4" aria-hidden="true" />Prendre</Button>
          <Button variant="premium-outline" size="lg" className="gap-2" disabled={analyzing} onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" aria-hidden="true" />Importer</Button>
        </div>
      ) : (
        <div className="mb-4 grid w-full max-w-[360px] grid-cols-2 gap-3 self-center">
          <Button variant="premium-outline" size="lg" disabled={analyzing} onClick={handleRetake}>Reprendre</Button>
          <Button variant="premium" size="lg" disabled={!isUsable || analyzing} onClick={onNext}>Utiliser</Button>
        </div>
      )}

      {!isUsable && !analyzing && <Button variant="ghost" size="sm" className="mb-8 self-center text-[#69766f]" onClick={onNext}>Continuer sans cette photo</Button>}

      <input ref={cameraInputRef} type="file" accept={ACCEPTED_FILE_TYPES} capture="user" className="hidden" onChange={handleInputChange} />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} className="hidden" onChange={handleInputChange} />

      <div className="mt-2 w-full rounded-xl border border-[#183e34]/12 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-[#183e34]">Pour une analyse fiable, vérifiez que :</p>
        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className={"mt-0.5 h-4 w-4 shrink-0 " + (preview && isUsable ? "text-[#a95c4d]" : "text-[#a2ada7]")} aria-hidden="true" />
              <span className="text-sm leading-[1.45] text-[#69766f]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
