import { useState } from "react";
import { DiagnosticData, questions } from "./types";
import { Button } from "@/components/ui/button";
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
    const v = data.answers[key];
    if (!v) return "—";
    return Array.isArray(v) ? v.join(", ") : v;
  };

  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-2">
          Récapitulatif
        </h2>
        <p className="font-sans text-warm text-sm font-light">
          Vérifiez vos informations avant de lancer l’analyse.
        </p>
      </div>

      {/* Photos */}
      <div className="flex gap-4 mb-8">
        {[
          { label: "Face", photo: data.photoFace, step: 1 },
          { label: "Vue 3/4", photo: data.photoProfile, step: 2 },
        ].map((item) => (
          <div key={item.label} className="flex-1">
            <div className="relative rounded-lg overflow-hidden border border-border aspect-[3/4] bg-ivory-light mb-2">
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => onGoToStep(item.step)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="font-sans text-xs text-warm">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Identity */}
      <div className="mb-4 p-4 rounded-lg bg-ivory-light border border-border flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs text-warm mb-1">Coordonnées</p>
          <p className="font-sans text-sm text-foreground font-medium truncate">
            {data.prenom || "—"} · {data.email || "—"}
          </p>
        </div>
        <button
          onClick={() => onGoToStep(identityStep)}
          className="shrink-0 p-1.5 text-warm hover:text-foreground transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Answers */}
      <div className="space-y-4 mb-10">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="flex items-start justify-between gap-3 p-4 rounded-lg bg-ivory-light border border-border"
          >
            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs text-warm mb-1 truncate">
                {q.title}
              </p>
              <p className="font-sans text-sm text-foreground font-medium">
                {renderAnswer(q.key)}
              </p>
            </div>
            <button
              onClick={() => onGoToStep(i + firstQuestionStep)}
              className="shrink-0 p-1.5 text-warm hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {pipelineResult ? (
        <div className="space-y-3">
          <p className="font-sans text-sm text-foreground" role="status">
            {pipelineResult.email_status?.sent === true
              ? `Email envoyé à ${data.email}.`
              : pipelineResult.email_status?.reason
                ? `Email non envoyé : ${pipelineResult.email_status.reason}`
                : "Email non envoyé."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="premium" size="xl" className="w-full">
              <a href={clientReportUrl(pipelineResult.session_id, "html")} target="_blank" rel="noreferrer">
                Voir mon rapport HTML
              </a>
            </Button>
            <Button
              variant="premium-outline"
              size="xl"
              className="w-full"
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
              {downloadingPdf ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Préparation du PDF…</> : pdfError ? "Réessayer le téléchargement PDF" : "Télécharger mon rapport PDF"}
            </Button>
          </div>
          {pdfError && <p className="font-sans text-xs text-red-600" role="alert">{pdfError}</p>}
        </div>
      ) : (
        <Button variant="premium" size="xl" className="w-full" onClick={onLaunch} disabled={launching}>
          {launching ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {launchStage === "session" ? "Préparation…" : launchStage === "photos" ? "Envoi des photos…" : "Analyse en cours…"}</> : "Lancer mon analyse"}
        </Button>
      )}
    </div>
  );
};
