import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { createSession, runPipeline, uploadPhotos, type RunPipelineResponse } from "@/lib/api";
import { DiagnosticData, QUESTIONNAIRE_VERSION, buildAndValidatePayload, questions, restoreStoredDiagnosticData } from "./types";
import { hasUsablePhotoForLaunch } from "./photoLaunch";
import { IdentityStep } from "./IdentityStep";
import { PhotoStep } from "./PhotoStep";
import { QuestionStep } from "./QuestionStep";
import { SummaryStep } from "./SummaryStep";

const IDENTITY_STEP = 3;
const FIRST_QUESTION_STEP = IDENTITY_STEP + 1;
const LAST_QUESTION_STEP = FIRST_QUESTION_STEP + questions.length - 1;
const SUMMARY_STEP = LAST_QUESTION_STEP + 1;
const TOTAL_STEPS = SUMMARY_STEP;
const STORAGE_KEY = "diagnostic_answers";

interface DiagnosticFlowProps {
  onClose: () => void;
}

const DiagnosticFlow = ({ onClose }: DiagnosticFlowProps) => {
  const [step, setStep] = useState(1);
  const [launching, setLaunching] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<RunPipelineResponse | null>(null);
  const [data, setData] = useState<DiagnosticData>(() => {
    const stored = restoreStoredDiagnosticData(localStorage.getItem(STORAGE_KEY));
    return { photoFace: null, photoProfile: null, ...stored };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        questionnaire_version: QUESTIONNAIRE_VERSION,
        answers: data.answers,
        prenom: data.prenom,
        email: data.email,
      }));
    } catch {
      /* ignore storage quota errors */
    }
  }, [data.answers, data.prenom, data.email]);

  const progress = (step / TOTAL_STEPS) * 100;

  const setPhoto = useCallback((key: "photoFace" | "photoProfile", value: string | null) => {
    setData((previous) => ({ ...previous, [key]: value }));
  }, []);

  const setAnswer = useCallback((key: string, value: string | string[]) => {
    setData((previous) => ({ ...previous, answers: { ...previous.answers, [key]: value } }));
  }, []);

  const canNext = () => {
    if (step === 1) return !!data.photoFace;
    if (step === 2) return !!data.photoProfile;
    if (step === IDENTITY_STEP) {
      return !!data.prenom?.trim() && !!data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
    }
    if (step >= FIRST_QUESTION_STEP && step <= LAST_QUESTION_STEP) {
      const question = questions[step - FIRST_QUESTION_STEP];
      const answer = data.answers[question.key];
      return Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.length > 0;
    }
    return true;
  };

  const goNext = () => { if (step < TOTAL_STEPS) setStep((current) => current + 1); };
  const goPrev = () => { if (step > 1) setStep((current) => current - 1); };
  const goToStep = (target: number) => setStep(target);

  const handleLaunch = async () => {
    if (launching) return;
    const result = buildAndValidatePayload(data);
    if (!result.ok) {
      toast({ variant: "destructive", title: "Une réponse n’est pas valide", description: "Merci de vérifier les réponses du questionnaire." });
      return;
    }
    if (!hasUsablePhotoForLaunch(data.photoFace, data.photoProfile)) {
      toast({ variant: "destructive", title: "Photos manquantes", description: "Ajoutez au moins une photo exploitable avant de lancer l’analyse." });
      return;
    }

    setLaunching(true);
    try {
      const session = await createSession(result.payload);
      await uploadPhotos(session.session_id, { face: data.photoFace, profil: data.photoProfile });
      const pipeline = await runPipeline(session.session_id, result.payload.questionnaire.email);
      setPipelineResult(pipeline);
      toast({
        title: "Analyse terminée",
        description: pipeline.email_status?.sent === true ? "Votre rapport a été envoyé par email." : "Votre rapport est disponible ci-dessous.",
      });
      localStorage.removeItem(STORAGE_KEY);
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

  const activeQuestion = step >= FIRST_QUESTION_STEP && step <= LAST_QUESTION_STEP
    ? questions[step - FIRST_QUESTION_STEP]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f8f6f1]">
      <header className="border-b border-[#183e34]/12 bg-[#f8f6f1]/95 px-4 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-3xl items-center justify-between">
          <button type="button" onClick={step > 1 ? goPrev : onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#183e34] transition hover:bg-[#183e34]/8" aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a95c4d]">Analyse de peau</span>
            <span className="mt-1 block font-sans text-[11px] text-[#69766f]">{step} / {TOTAL_STEPS}</span>
          </div>
          <button type="button" onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#183e34] transition hover:bg-[#183e34]/8" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 pt-3"><Progress value={progress} className="h-1 bg-[#183e34]/10" /></div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 sm:py-12">
          {step === 1 && <PhotoStep type="face" photo={data.photoFace} onPhotoChange={(value) => setPhoto("photoFace", value)} onNext={goNext} />}
          {step === 2 && <PhotoStep type="profile" photo={data.photoProfile} onPhotoChange={(value) => setPhoto("photoProfile", value)} onNext={goNext} />}
          {step === IDENTITY_STEP && <IdentityStep prenom={data.prenom ?? ""} email={data.email ?? ""} onPrenomChange={(value) => setData((previous) => ({ ...previous, prenom: value }))} onEmailChange={(value) => setData((previous) => ({ ...previous, email: value }))} onNext={goNext} canNext={canNext()} />}
          {activeQuestion && <QuestionStep question={activeQuestion} value={data.answers[activeQuestion.key]} onChange={(value) => setAnswer(activeQuestion.key, value)} onNext={goNext} canNext={canNext()} />}
          {step === SUMMARY_STEP && <SummaryStep data={data} onGoToStep={goToStep} onLaunch={handleLaunch} launching={launching} pipelineResult={pipelineResult} firstQuestionStep={FIRST_QUESTION_STEP} identityStep={IDENTITY_STEP} />}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
