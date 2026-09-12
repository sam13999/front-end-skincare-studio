import { useCallback, useRef, useState } from "react";
import { AlertCircle, Camera, Check, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const qualityConfig: Record<
  Exclude<PhotoQuality, "none">,
  { label: string; color: string; border: string; icon: typeof AlertCircle }
> = {
  insufficient: {
    label: "Photo refusée",
    color: "text-red-500",
    border: "border-red-300",
    icon: AlertCircle,
  },
  acceptable: {
    label: "Photo validée",
    color: "text-[#315f54]",
    border: "border-[#315f54]",
    icon: CheckCircle2,
  },
  good: {
    label: "Photo validée",
    color: "text-[#173f36]",
    border: "border-[#173f36]",
    icon: CheckCircle2,
  },
};

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
  const subtitle =
    type === "face"
      ? "Prenez ou importez une photo de votre visage de face."
      : "Prenez ou importez une vue 3/4, le visage légèrement tourné (20–30°).";

  const rejectUnexpectedError = useCallback(() => {
    const result = createRejectedResult([
      {
        code: "unexpected_validation_error",
        message: "La photo n’a pas pu être vérifiée. Réessayez avec une autre image.",
        severity: "critical",
      },
    ]);
    setQuality("insufficient");
    setValidation(result);
    onPhotoChange(null);
  }, [onPhotoChange]);

  const processPhoto = useCallback(
    async (dataUrl: string, fileSize: number) => {
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
    },
    [onPhotoChange, rejectUnexpectedError, type]
  );

  const handleFile = useCallback(
    (file: File) => {
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
    },
    [onPhotoChange, processPhoto, rejectUnexpectedError]
  );

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
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-serif text-2xl text-foreground md:text-3xl">{title}</h2>
        <p className="font-sans text-sm font-light text-warm">{subtitle}</p>
      </div>

      <div
        className={`relative mb-5 aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-lg border-2 bg-ivory-light transition-colors ${
          preview
            ? quality !== "none"
              ? qualityConfig[quality]?.border || "border-border"
              : "border-border"
            : "border-dashed border-border"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={`Aperçu de votre ${title.toLowerCase()}`} className="h-full w-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 px-5 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" aria-hidden="true" />
                <span className="font-sans text-xs font-medium text-foreground">Validation du visage en cours…</span>
                <span className="font-sans text-[10px] leading-snug text-warm">Cette étape peut prendre quelques secondes.</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-warm/50">
            <Camera className="h-10 w-10" aria-hidden="true" />
            <span className="font-sans text-xs">Aucune photo</span>
          </div>
        )}
      </div>

      {hasFeedback && (
        <div className="mb-5 w-full max-w-[300px] space-y-2" role="status" aria-live="polite">
          <div className="flex items-center justify-center gap-2">
            {(() => {
              const config = qualityConfig[quality];
              const Icon = config.icon;
              return (
                <>
                  <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                  <span className={`font-sans text-sm font-medium ${config.color}`}>{config.label}</span>
                </>
              );
            })()}
          </div>

          {validation && validation.issues.length > 0 && (
            <div className="space-y-1.5 rounded-lg bg-white/55 px-3 py-2.5">
              {validation.issues.map((issue) => (
                <div key={issue.code} className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                      issue.severity === "critical" ? "bg-red-400" : "bg-[#8c7757]"
                    }`}
                  />
                  <span className="font-sans text-[11px] leading-[1.4] text-warm">{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!preview ? (
        <div className="mb-3 flex w-full max-w-[280px] gap-3">
          <Button
            variant="premium"
            size="lg"
            className="flex-1 gap-2"
            disabled={analyzing}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Prendre
          </Button>
          <Button
            variant="premium-outline"
            size="lg"
            className="flex-1 gap-2"
            disabled={analyzing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Importer
          </Button>
        </div>
      ) : (
        <div className="mb-3 flex w-full max-w-[280px] gap-3">
          <Button variant="premium-outline" size="lg" className="flex-1" onClick={handleRetake} disabled={analyzing}>
            Reprendre
          </Button>
          <Button variant="premium" size="lg" className="flex-1" disabled={!isUsable || analyzing} onClick={onNext}>
            Utiliser
          </Button>
        </div>
      )}

      {!isUsable && !analyzing && (
        <Button variant="ghost" size="sm" className="mb-8" onClick={onNext}>
          Continuer sans cette photo
        </Button>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        capture="user"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="w-full rounded-lg border border-border bg-ivory-light p-5">
        <p className="mb-3 font-sans text-sm font-medium text-foreground">Pour une analyse fiable, vérifiez que :</p>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${preview && isUsable ? "text-green-deep" : "text-warm/30"}`} aria-hidden="true" />
              <span className="font-sans text-sm font-light text-warm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
