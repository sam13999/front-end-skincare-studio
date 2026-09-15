import { useState, useEffect, useCallback } from "react";
import { DiagnosticData, questions, buildAndValidatePayload, QUESTIONNAIRE_VERSION, restoreStoredDiagnosticData } from "./types";
import { PhotoStep } from "./PhotoStep";
import { QuestionStep } from "./QuestionStep";
import { SummaryStep } from "./SummaryStep";
import { IdentityStep } from "./IdentityStep";
import { hasUsablePhotoForLaunch } from "./photoLaunch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createSession, runPipeline, uploadPhotos, type RunPipelineResponse } from "@/lib/api";

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
  const [launchStage, setLaunchStage] = useState<"session" | "photos" | "analysis" | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const [sessionPayloadKey, setSessionPayloadKey] = useState<string | null>(null);
  const [uploadedPhotoKey, setUploadedPhotoKey] = useState<string | null>(null);
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
      const payloadKey = JSON.stringify(result.payload);
      const photoKey = [data.photoFace, data.photoProfile].map((value) => value ? `${value.length}:${value.slice(-32)}` : "").join("|");
      let currentSessionId = sessionId;
      if (!currentSessionId || sessionPayloadKey !== payloadKey) {
        setLaunchStage("session");
        const session = await createSession(result.payload);
        currentSessionId = session.session_id;
        setSessionId(currentSessionId);
        setSessionPayloadKey(payloadKey);
        setPhotosUploaded(false);
        setUploadedPhotoKey(null);
      }
      if (!photosUploaded || uploadedPhotoKey !== photoKey) {
        setLaunchStage("photos");
        await uploadPhotos(currentSessionId, { face: data.photoFace, profil: data.photoProfile });
        setPhotosUploaded(true);
        setUploadedPhotoKey(photoKey);
      }
      setLaunchStage("analysis");
      const pipeline = await runPipeline(currentSessionId, result.payload.questionnaire.email);
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
      setLaunchStage(null);
    }
  };

  const activeQuestion = step >= FIRST_QUESTION_STEP && step <= LAST_QUESTION_STEP
    ? questions[step - FIRST_QUESTION_STEP]
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button type="button" onClick={step > 1 ? goPrev : onClose} className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors" aria-label="Retour">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-warm">Diagnostic</span>
          <span className="font-sans text-[10px] text-warm ml-2">{step}/{TOTAL_STEPS}</span>
        </div>
        <button type="button" onClick={onClose} className="p-2 -mr-2 text-foreground/70 hover:text-foreground transition-colors" aria-label="Fermer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-4 pt-2"><Progress value={progress} className="h-1" /></div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6">
          {step === 1 && <PhotoStep type="face" photo={data.photoFace} onPhotoChange={(value) => setPhoto("photoFace", value)} onNext={goNext} />}
          {step === 2 && <PhotoStep type="profile" photo={data.photoProfile} onPhotoChange={(value) => setPhoto("photoProfile", value)} onNext={goNext} />}
          {step === IDENTITY_STEP && <IdentityStep prenom={data.prenom ?? ""} email={data.email ?? ""} onPrenomChange={(value) => setData((previous) => ({ ...previous, prenom: value }))} onEmailChange={(value) => setData((previous) => ({ ...previous, email: value }))} onNext={goNext} canNext={canNext()} />}
          {activeQuestion && <QuestionStep question={activeQuestion} value={data.answers[activeQuestion.key]} onChange={(value) => setAnswer(activeQuestion.key, value)} onNext={goNext} canNext={canNext()} />}
          {step === SUMMARY_STEP && <SummaryStep data={data} onGoToStep={goToStep} onLaunch={handleLaunch} launching={launching} launchStage={launchStage} pipelineResult={pipelineResult} firstQuestionStep={FIRST_QUESTION_STEP} identityStep={IDENTITY_STEP} />}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
