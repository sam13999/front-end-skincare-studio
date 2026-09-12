import { useState, useEffect, useCallback } from "react";
import { DiagnosticData, questions, buildAndValidatePayload } from "./types";
import { PhotoStep } from "./PhotoStep";
import { QuestionStep } from "./QuestionStep";
import { SummaryStep } from "./SummaryStep";
import { IdentityStep } from "./IdentityStep";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createSession, runPipeline, uploadPhotos } from "@/lib/api";

// 1: photo face, 2: photo profile, 3: identity, 4-10: 7 questions, 11: summary
const TOTAL_STEPS = 11;
const IDENTITY_STEP = 3;
const FIRST_QUESTION_STEP = 4;
const SUMMARY_STEP = 11;

interface DiagnosticFlowProps {
  onClose: () => void;
}

const DiagnosticFlow = ({ onClose }: DiagnosticFlowProps) => {
  const [step, setStep] = useState(1);
  const [launching, setLaunching] = useState(false);
  const [data, setData] = useState<DiagnosticData>(() => {
    try {
      const saved = localStorage.getItem("diagnostic_answers");
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        photoFace: null,
        photoProfile: null,
        answers: parsed.answers ?? {},
        prenom: parsed.prenom ?? "",
        email: parsed.email ?? "",
      };
    } catch {
      return { photoFace: null, photoProfile: null, answers: {}, prenom: "", email: "" };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "diagnostic_answers",
        JSON.stringify({
          answers: data.answers,
          prenom: data.prenom,
          email: data.email,
        })
      );
    } catch {
      /* ignore quota */
    }
  }, [data.answers, data.prenom, data.email]);

  const progress = (step / TOTAL_STEPS) * 100;

  const setPhoto = useCallback(
    (key: "photoFace" | "photoProfile", value: string | null) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setAnswer = useCallback((key: string, value: string | string[]) => {
    setData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [key]: value },
    }));
  }, []);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const canNext = () => {
    if (step === 1) return !!data.photoFace;
    if (step === 2) return !!data.photoProfile;
    if (step === IDENTITY_STEP) {
      return !!data.prenom?.trim() && !!data.email && emailRe.test(data.email.trim());
    }
    if (step >= FIRST_QUESTION_STEP && step <= FIRST_QUESTION_STEP + 6) {
      const q = questions[step - FIRST_QUESTION_STEP];
      const answer = data.answers[q.key];
      if (!answer) return false;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    }
    return true;
  };

  const goNext = () => step < TOTAL_STEPS && setStep(step + 1);
  const goPrev = () => step > 1 && setStep(step - 1);
  const goToStep = (s: number) => setStep(s);

  const handleLaunch = async () => {
    if (launching) return;
    const result = buildAndValidatePayload(data);
    if (!result.ok) {
      toast({
        variant: "destructive",
        title: "Une réponse n’est pas valide",
        description:
          "Une réponse du questionnaire n’est pas valide. Merci de la sélectionner à nouveau.",
      });
      return;
    }
    if (import.meta.env.DEV) {
      console.info("[questionnaire] payload", result.payload);
    }
    if (!data.photoFace || !data.photoProfile) {
      toast({ variant: "destructive", title: "Photos manquantes", description: "Ajoutez vos deux photos avant de lancer l’analyse." });
      return;
    }
    setLaunching(true);
    try {
      const session = await createSession(result.payload);
      await uploadPhotos(session.session_id, { face: data.photoFace, profil: data.photoProfile });
      const pipeline = await runPipeline(session.session_id);
      toast({
        title: "Analyse terminée",
        description: `Pipeline ${pipeline.status}. Aucun email n’a été envoyé pour ce test.`,
      });
      localStorage.removeItem("diagnostic_answers");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "L’analyse n’a pas pu être lancée",
        description: error instanceof Error ? error.message : "Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
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

      <div className="px-4 pt-2">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6">
          {step === 1 && (
            <PhotoStep
              type="face"
              photo={data.photoFace}
              onPhotoChange={(v) => setPhoto("photoFace", v)}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <PhotoStep
              type="profile"
              photo={data.photoProfile}
              onPhotoChange={(v) => setPhoto("photoProfile", v)}
              onNext={goNext}
            />
          )}
          {step === IDENTITY_STEP && (
            <IdentityStep
              prenom={data.prenom ?? ""}
              email={data.email ?? ""}
              onPrenomChange={(v) => setData((p) => ({ ...p, prenom: v }))}
              onEmailChange={(v) => setData((p) => ({ ...p, email: v }))}
              onNext={goNext}
              canNext={canNext()}
            />
          )}
          {step >= FIRST_QUESTION_STEP && step <= FIRST_QUESTION_STEP + 6 && (
            <QuestionStep
              question={questions[step - FIRST_QUESTION_STEP]}
              value={data.answers[questions[step - FIRST_QUESTION_STEP].key]}
              onChange={(v) =>
                setAnswer(questions[step - FIRST_QUESTION_STEP].key, v)
              }
              onNext={goNext}
              canNext={canNext()}
            />
          )}
          {step === SUMMARY_STEP && (
            <SummaryStep
              data={data}
              onGoToStep={goToStep}
              onLaunch={handleLaunch}
              launching={launching}
              firstQuestionStep={FIRST_QUESTION_STEP}
              identityStep={IDENTITY_STEP}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
