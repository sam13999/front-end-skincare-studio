import { useState, useEffect, useCallback } from "react";
import {
  DiagnosticData,
  getVisibleQuestions,
  buildAndValidatePayload,
  QUESTIONNAIRE_VERSION,
  restoreStoredDiagnosticData,
} from "./types";
import { PhotoStep } from "./PhotoStep";
import { QuestionStep } from "./QuestionStep";
import { SummaryStep } from "./SummaryStep";
import { IdentityStep } from "./IdentityStep";
import { hasUsablePhotoForLaunch } from "./photoLaunch";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createSession, runPipeline, uploadPhotos, type RunPipelineResponse } from "@/lib/api";
import "./DiagnosticFlow.css";

const FIRST_QUESTION_STEP = 3;
const STORAGE_KEY = "diagnostic_answers_v3";

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
      /* Ignore storage quota errors. */
    }
  }, [data.answers, data.prenom, data.email]);

  const activeQuestions = getVisibleQuestions(data.answers);
  const identityStep = FIRST_QUESTION_STEP + activeQuestions.length;
  const summaryStep = identityStep + 1;
  const totalSteps = summaryStep;
  const progress = (step / totalSteps) * 100;

  const setPhoto = useCallback((key: "photoFace" | "photoProfile", value: string | null) => {
    setData((previous) => ({ ...previous, [key]: value }));
  }, []);

  const setAnswer = useCallback((key: string, value: string | string[]) => {
    setData((previous) => ({ ...previous, answers: { ...previous.answers, [key]: value } }));
  }, []);

  const canNext = () => {
    if (step === 1) return !!data.photoFace;
    if (step === 2) return !!data.photoProfile;
    if (step === identityStep) {
      return !!data.prenom?.trim()
        && !!data.email
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
    }
    if (step >= FIRST_QUESTION_STEP && step < identityStep) {
      const question = activeQuestions[step - FIRST_QUESTION_STEP];
      const answer = data.answers[question.key];
      return Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.length > 0;
    }
    return true;
  };

  const goNext = () => {
    if (step < totalSteps) setStep((current) => current + 1);
  };
  const goPrev = () => {
    if (step > 1) setStep((current) => current - 1);
  };
  const goToStep = (target: number) => setStep(target);

  const handleLaunch = async () => {
    if (launching) return;
    const result = buildAndValidatePayload(data);
    if (!result.ok) {
      toast({
        variant: "destructive",
        title: "Une réponse n’est pas valide",
        description: "Merci de vérifier les réponses du questionnaire.",
      });
      return;
    }
    if (!hasUsablePhotoForLaunch(data.photoFace, data.photoProfile)) {
      toast({
        variant: "destructive",
        title: "Photos manquantes",
        description: "Ajoutez au moins une photo exploitable avant de lancer l’analyse.",
      });
      return;
    }
    setLaunching(true);
    try {
      const payloadKey = JSON.stringify(result.payload);
      const photoKey = [data.photoFace, data.photoProfile]
        .map((value) => value ? `${value.length}:${value.slice(-32)}` : "")
        .join("|");
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
        description: pipeline.email_status?.sent === true
          ? "Votre rapport a été envoyé par email."
          : "Votre rapport est disponible ci-dessous.",
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

  const activeQuestion = step >= FIRST_QUESTION_STEP && step < identityStep
    ? activeQuestions[step - FIRST_QUESTION_STEP]
    : null;

  return (
    <div className="svd-shell">
      <header className="svd-header">
        <button
          type="button"
          onClick={step > 1 ? goPrev : onClose}
          className="svd-icon-button"
          aria-label="Retour"
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="svd-header-center">
          <span className="svd-kicker">Diagnostic</span>
          <span className="svd-counter">{step} / {totalSteps}</span>
        </div>
        <button type="button" onClick={onClose} className="svd-icon-button" aria-label="Fermer">
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="svd-progress-wrap" aria-label={`Progression : étape ${step} sur ${totalSteps}`}>
        <div className="svd-progress"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <main className="svd-scroll">
        <div className="svd-content">
          {step === 1 && (
            <PhotoStep
              type="face"
              photo={data.photoFace}
              onPhotoChange={(value) => setPhoto("photoFace", value)}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <PhotoStep
              type="profile"
              photo={data.photoProfile}
              onPhotoChange={(value) => setPhoto("photoProfile", value)}
              onNext={goNext}
            />
          )}
          {activeQuestion && (
            <QuestionStep
              question={activeQuestion}
              value={data.answers[activeQuestion.key]}
              onChange={(value) => setAnswer(activeQuestion.key, value)}
              onNext={goNext}
              canNext={canNext()}
            />
          )}
          {step === identityStep && (
            <IdentityStep
              prenom={data.prenom ?? ""}
              email={data.email ?? ""}
              onPrenomChange={(value) => setData((previous) => ({ ...previous, prenom: value }))}
              onEmailChange={(value) => setData((previous) => ({ ...previous, email: value }))}
              onNext={goNext}
              canNext={canNext()}
            />
          )}
          {step === summaryStep && (
            <SummaryStep
              data={data}
              onGoToStep={goToStep}
              onLaunch={handleLaunch}
              launching={launching}
              launchStage={launchStage}
              pipelineResult={pipelineResult}
              firstQuestionStep={FIRST_QUESTION_STEP}
              identityStep={identityStep}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DiagnosticFlow;
