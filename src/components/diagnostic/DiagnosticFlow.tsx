import { useState, useEffect, useCallback } from "react";
import { DiagnosticData, questions } from "./types";
import { PhotoStep } from "./PhotoStep";
import { QuestionStep } from "./QuestionStep";
import { SummaryStep } from "./SummaryStep";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, X } from "lucide-react";

const TOTAL_STEPS = 10; // 2 photos + 7 questions + 1 summary

interface DiagnosticFlowProps {
  onClose: () => void;
}

const DiagnosticFlow = ({ onClose }: DiagnosticFlowProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<DiagnosticData>(() => {
    const saved = localStorage.getItem("diagnostic_data");
    return saved
      ? JSON.parse(saved)
      : { photoFace: null, photoProfile: null, answers: {} };
  });

  useEffect(() => {
    localStorage.setItem("diagnostic_data", JSON.stringify(data));
  }, [data]);

  const progress = (step / TOTAL_STEPS) * 100;

  const setPhoto = useCallback(
    (key: "photoFace" | "photoProfile", value: string | null) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setAnswer = useCallback(
    (questionId: number, value: string | string[]) => {
      setData((prev) => ({
        ...prev,
        answers: { ...prev.answers, [questionId]: value },
      }));
    },
    []
  );

  const canNext = () => {
    if (step === 1) return !!data.photoFace;
    if (step === 2) return !!data.photoProfile;
    if (step >= 3 && step <= 9) {
      const q = questions[step - 3];
      const answer = data.answers[q.id];
      if (!answer) return false;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };
  const goToStep = (s: number) => setStep(s);

  const handleLaunch = () => {
    // Mock: in real app this would submit to backend
    alert("Analyse lancée ! Vos données ont été enregistrées.");
    localStorage.removeItem("diagnostic_data");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={step > 1 ? goPrev : onClose}
          className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-warm">
            Diagnostic
          </span>
          <span className="font-sans text-[10px] text-warm ml-2">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-2">
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6">
          {step === 1 && (
            <PhotoStep
              type="face"
              photo={data.photoFace}
              onPhotoChange={(v) => setPhoto("photoFace", v)}
              onNext={goNext}
              canNext={!!data.photoFace}
            />
          )}
          {step === 2 && (
            <PhotoStep
              type="profile"
              photo={data.photoProfile}
              onPhotoChange={(v) => setPhoto("photoProfile", v)}
              onNext={goNext}
              canNext={!!data.photoProfile}
            />
          )}
          {step >= 3 && step <= 9 && (
            <QuestionStep
              question={questions[step - 3]}
              value={data.answers[questions[step - 3].id]}
              onChange={(v) => setAnswer(questions[step - 3].id, v)}
              onNext={goNext}
              canNext={canNext()}
            />
          )}
          {step === 10 && (
            <SummaryStep
              data={data}
              onGoToStep={goToStep}
              onLaunch={handleLaunch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
