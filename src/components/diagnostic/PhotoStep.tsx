import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Check, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  validatePhoto,
  type PhotoQuality,
  type ValidationResult,
} from "./photoValidation";

interface PhotoStepProps {
  type: "face" | "profile";
  photo: string | null;
  onPhotoChange: (value: string | null) => void;
  onNext: () => void;
  canNext: boolean;
}

const faceChecklist = [
  "Votre visage est entièrement visible",
  "La photo est nette",
  "La lumière est suffisante",
  "Vous êtes seul(e) sur la photo",
  "Aucun élément ne cache votre visage",
];

const profileChecklist = [
  "Un côté de votre visage est bien visible",
  "La photo est nette",
  "La lumière est suffisante",
  "Votre profil est naturel, même légèrement incliné",
  "Aucun élément ne cache votre visage",
];

const qualityConfig: Record<
  Exclude<PhotoQuality, "none">,
  { label: string; color: string; border: string; icon: typeof AlertCircle }
> = {
  insufficient: {
    label: "Photo insuffisante",
    color: "text-red-400",
    border: "border-red-300",
    icon: AlertCircle,
  },
  acceptable: {
    label: "Photo acceptable",
    color: "text-accent",
    border: "border-accent",
    icon: CheckCircle2,
  },
  good: {
    label: "Très bien, vous pouvez continuer",
    color: "text-green-deep",
    border: "border-green-deep",
    icon: CheckCircle2,
  },
};

export const PhotoStep = ({
  type,
  photo,
  onPhotoChange,
  onNext,
}: PhotoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [quality, setQuality] = useState<PhotoQuality>(photo ? "good" : "none");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const checklist = type === "face" ? faceChecklist : profileChecklist;
  const title = type === "face" ? "Photo de face" : "Photo de profil";
  const subtitle =
    type === "face"
      ? "Prenez ou importez une photo de votre visage de face."
      : "Prenez ou importez une photo de votre profil.";

  const processPhoto = useCallback(
    async (dataUrl: string) => {
      onPhotoChange(dataUrl);
      setAnalyzing(true);
      try {
        const result = await validatePhoto(dataUrl, type);
        setQuality(result.quality);
        setValidation(result);
      } catch {
        // Fallback: accept the photo
        setQuality("acceptable");
        setValidation(null);
      } finally {
        setAnalyzing(false);
      }
    },
    [type, onPhotoChange]
  );

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        processPhoto(result);
      };
      reader.readAsDataURL(file);
    },
    [processPhoto]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRetake = () => {
    onPhotoChange(null);
    setQuality("none");
    setValidation(null);
  };

  const isUsable = quality === "acceptable" || quality === "good";

  return (
    <div className="flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-2">
          {title}
        </h2>
        <p className="font-sans text-warm text-sm font-light">{subtitle}</p>
      </div>

      {/* Photo area */}
      <div
        className={`relative w-full max-w-[280px] aspect-[3/4] rounded-lg overflow-hidden mb-5 border-2 transition-colors ${
          photo
            ? quality !== "none"
              ? qualityConfig[quality]?.border || "border-border"
              : "border-border"
            : "border-dashed border-border"
        } bg-ivory-light`}
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-foreground animate-spin" />
                <span className="font-sans text-xs text-foreground">
                  Analyse en cours…
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-warm/50 gap-3">
            <Camera className="w-10 h-10" />
            <span className="font-sans text-xs">Aucune photo</span>
          </div>
        )}
      </div>

      {/* Quality feedback */}
      {photo && quality !== "none" && !analyzing && (
        <div className="w-full max-w-[280px] mb-5 space-y-2">
          {/* Main status */}
          <div className="flex items-center gap-2 justify-center">
            {(() => {
              const cfg = qualityConfig[quality];
              const Icon = cfg.icon;
              return (
                <>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  <span className={`font-sans text-sm font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </>
              );
            })()}
          </div>

          {/* Detailed issues */}
          {validation && validation.issues.length > 0 && (
            <div className="space-y-1">
              {validation.issues.map((issue) => (
                <div
                  key={issue.code}
                  className="flex items-center gap-2 justify-center"
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                      issue.severity === "critical"
                        ? "bg-red-400"
                        : "bg-accent"
                    }`}
                  />
                  <span className="font-sans text-xs text-warm">
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      {!photo ? (
        <div className="flex gap-3 mb-8 w-full max-w-[280px]">
          <Button
            variant="premium"
            size="lg"
            className="flex-1 gap-2"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
            Prendre
          </Button>
          <Button
            variant="premium-outline"
            size="lg"
            className="flex-1 gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Importer
          </Button>
        </div>
      ) : (
        <div className="flex gap-3 mb-8 w-full max-w-[280px]">
          <Button
            variant="premium-outline"
            size="lg"
            className="flex-1"
            onClick={handleRetake}
            disabled={analyzing}
          >
            Reprendre
          </Button>
          <Button
            variant="premium"
            size="lg"
            className="flex-1"
            disabled={!isUsable || analyzing}
            onClick={onNext}
          >
            Utiliser
          </Button>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Checklist */}
      <div className="w-full bg-ivory-light rounded-lg p-5 border border-border">
        <p className="font-sans text-foreground text-sm font-medium mb-3">
          Pour une analyse fiable, vérifiez simplement que :
        </p>
        <ul className="space-y-2">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  photo && isUsable ? "text-green-deep" : "text-warm/30"
                }`}
              />
              <span className="font-sans text-sm text-warm font-light">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
