import { DiagnosticData, getVisibleQuestions } from "./types";
import { Loader2, Pencil } from "lucide-react";
import { type RunPipelineResponse } from "@/lib/api";

interface SummaryStepProps {
  data: DiagnosticData;
  onGoToStep: (step: number) => void;
  onLaunch: () => void;
  launching?: boolean;
  launchStage?: "session" | "photos" | "analysis" | null;
  pipelineResult?: RunPipelineResponse | null;
  firstQuestionStep: number;
  identityStep: number;
}

export const SummaryStep = ({
  data,
  onGoToStep,
  onLaunch,
  firstQuestionStep,
  identityStep,
  launching = false,
  launchStage = null,
  pipelineResult = null,
}: SummaryStepProps) => {

  const renderAnswer = (key: string) => {
    const value = data.answers[key];
    if (!value) return "—";
    return Array.isArray(value) ? value.join(", ") : value;
  };

  return (
    <section className="svd-step svd-summary" aria-labelledby="summary-title">
      <div className="svd-step-intro">
        <p className="svd-eyebrow">Vérification</p>
        <h2 id="summary-title">Récapitulatif</h2>
        <p>Vérifiez vos informations avant de lancer l’analyse.</p>
      </div>

      <div className="svd-summary-photos">
        {[
          { label: "Face", photo: data.photoFace, step: 1 },
          { label: "Vue 3/4", photo: data.photoProfile, step: 2 },
        ].map((item) => (
          <div key={item.label} className="svd-summary-photo-wrap">
            <div className="svd-summary-photo">
              {item.photo && <img src={item.photo} alt={item.label} />}
              <button
                type="button"
                onClick={() => onGoToStep(item.step)}
                className="svd-icon-button"
                aria-label={`Modifier la photo ${item.label}`}
              >
                <Pencil aria-hidden="true" />
              </button>
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="svd-summary-card">
        <div>
          <p className="svd-summary-label">Coordonnées</p>
          <p className="svd-summary-value">{data.prenom || "—"} · {data.email || "—"}</p>
        </div>
        <button
          type="button"
          onClick={() => onGoToStep(identityStep)}
          className="svd-text-button"
          aria-label="Modifier les coordonnées"
        >
          <Pencil aria-hidden="true" />
        </button>
      </div>

      <div className="svd-summary-answers">
        {getVisibleQuestions(data.answers).map((question, index) => (
          <div key={question.id} className="svd-summary-card">
            <div>
              <p className="svd-summary-label">{question.title}</p>
              <p className="svd-summary-value">{renderAnswer(question.key)}</p>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(index + firstQuestionStep)}
              className="svd-text-button"
              aria-label={`Modifier : ${question.title}`}
            >
              <Pencil aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {pipelineResult ? (
        <div className="svd-result" role="status">
          <p>Votre demande est reçue. Votre rapport sera vérifié par notre équipe puis envoyé à {data.email} sous 24 heures après votre demande.</p>
        </div>
      ) : (
        <button type="button" className="svd-primary svd-full" onClick={onLaunch} disabled={launching}>
          {launching ? (
            <><Loader2 className="svd-spinner" aria-hidden="true" /> {launchStage === "session" ? "Préparation…" : launchStage === "photos" ? "Envoi des photos…" : "Analyse en cours…"}</>
          ) : (
            "Lancer mon analyse"
          )}
        </button>
      )}
    </section>
  );
};

