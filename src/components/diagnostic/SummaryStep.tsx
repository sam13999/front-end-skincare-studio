import { useState } from "react";
import { DiagnosticData, questions } from "./types";
import { Loader2, Pencil } from "lucide-react";
import { clientReportUrl, downloadClientReport, type RunPipelineResponse } from "@/lib/api";

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
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
        {questions.map((question, index) => (
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
          <p>
            {pipelineResult.email_status?.sent === true
              ? `Email envoyé à ${data.email}.`
              : pipelineResult.email_status?.reason
                ? `Email non envoyé : ${pipelineResult.email_status.reason}`
                : "Email non envoyé."}
          </p>
          <div className="svd-result-actions">
            <a
              className="svd-primary svd-full"
              href={clientReportUrl(pipelineResult.session_id, "html")}
              target="_blank"
              rel="noreferrer"
            >
              Voir mon rapport HTML
            </a>
            <button
              type="button"
              className="svd-secondary svd-full"
              disabled={downloadingPdf}
              onClick={async () => {
                setPdfError(null);
                setDownloadingPdf(true);
                try {
                  const blob = await downloadClientReport(pipelineResult.session_id);
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = "rapport-skinview.pdf";
                  anchor.rel = "noopener";
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                } catch (error) {
                  setPdfError(error instanceof Error ? error.message : "Le rapport PDF n’est pas disponible pour le moment.");
                } finally {
                  setDownloadingPdf(false);
                }
              }}
            >
              {downloadingPdf ? (
                <><Loader2 className="svd-spinner" aria-hidden="true" /> Préparation du PDF…</>
              ) : pdfError ? (
                "Réessayer le téléchargement PDF"
              ) : (
                "Télécharger mon rapport PDF"
              )}
            </button>
          </div>
          {pdfError && <p className="svd-error" role="alert">{pdfError}</p>}
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
