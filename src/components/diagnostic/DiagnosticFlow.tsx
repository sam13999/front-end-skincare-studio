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
import {
  checkPhotos,
  createSession,
  savePendingCheckout,
  startCheckout,
  uploadPhotos,
  type Offer,
  type PhotoCheckResponse,
} from "@/lib/api";
import { preloadPhotoValidation } from "./photoValidation";
import "./DiagnosticFlow.css";

const FIRST_QUESTION_STEP = 3;
const STORAGE_KEY = "diagnostic_answers_v3";

interface DiagnosticFlowProps {
  onClose: () => void;
  initialOffer?: Offer;
}

const DiagnosticFlow = ({ onClose, initialOffer = "analyse" }: DiagnosticFlowProps) => {
  const [step, setStep] = useState(1);
  const [launching, setLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState<"session" | "photos" | "checking" | "payment" | null>(null);
  const [checkedPhotoKey, setCheckedPhotoKey] = useState<string | null>(null);
  const [photoProblems, setPhotoProblems] = useState<PhotoCheckResponse["problems"]>([]);
  const [offer, setOffer] = useState<Offer>(initialOffer);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const [sessionPayloadKey, setSessionPayloadKey] = useState<string | null>(null);
  const [uploadedPhotoKey, setUploadedPhotoKey] = useState<string | null>(null);
  const [launched, setLaunched] = useState(false);
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

  useEffect(() => {
    // Charge l'outil de vérification des photos pendant que la personne lit les consignes.
    const timer = window.setTimeout(() => preloadPhotoValidation(), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Retour arrière depuis la page de paiement : Safari restaure la page telle quelle.
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLaunching(false);
        setLaunchStage(null);
      }
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

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
    let redirecting = false;
    try {
      const payloadKey = JSON.stringify(result.payload);
      const photoKey = [data.photoFace, data.photoProfile]
        .map((value) => value ? `${value.length}:${value.slice(-32)}` : "")
        .join("|");
      let currentSessionId = sessionId;
      let needsPhotoCheck = checkedPhotoKey !== photoKey;
      let photosReady = photosUploaded && uploadedPhotoKey === photoKey;
      if (!currentSessionId || sessionPayloadKey !== payloadKey) {
        setLaunchStage("session");
        const session = await createSession(result.payload);
        currentSessionId = session.session_id;
        setSessionId(currentSessionId);
        setSessionPayloadKey(payloadKey);
        setPhotosUploaded(false);
        setUploadedPhotoKey(null);
        setCheckedPhotoKey(null);
        needsPhotoCheck = true;
        photosReady = false;
      }
      if (!photosReady) {
        setLaunchStage("photos");
        await uploadPhotos(currentSessionId, { face: data.photoFace, profil: data.photoProfile });
        setPhotosUploaded(true);
        setUploadedPhotoKey(photoKey);
        needsPhotoCheck = true;
      }
      if (needsPhotoCheck) {
        setLaunchStage("checking");
        setPhotoProblems([]);
        const check = await checkPhotos(currentSessionId);
        if (!check.ok) {
          setPhotoProblems(check.problems);
          return;
        }
        setCheckedPhotoKey(photoKey);
      }
      setLaunchStage("payment");
      const checkout = await startCheckout(currentSessionId, offer, promoCode);
      if (checkout.status === "redirect" && checkout.checkout_url) {
        savePendingCheckout({ sessionId: currentSessionId, offer, promoCode, email: result.payload.questionnaire.email });
        redirecting = true;
        window.location.assign(checkout.checkout_url);
        return;
      }
      setLaunched(true);
      toast({
        title: "Demande reçue",
        description: "Votre rapport sera vérifié par notre équipe puis envoyé par email sous 24 heures après votre demande.",
      });
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Votre demande n’a pas pu être envoyée",
        description: error instanceof Error ? error.message : "Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      if (!redirecting) {
        setLaunching(false);
        setLaunchStage(null);
      }
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
              launched={launched}
              photoProblems={photoProblems}
              offer={offer}
              onOfferChange={setOffer}
              promoCode={promoCode}
              onPromoChange={setPromoCode}
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

