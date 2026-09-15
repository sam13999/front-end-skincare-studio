import { DiagnosticData, questions } from "./types";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { clientReportUrl, type RunPipelineResponse } from "@/lib/api";

interface SummaryStepProps {
  data: DiagnosticData;
  onGoToStep: (step: number) => void;
  onLaunch: () => void;
  launching?: boolean;
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
  pipelineResult = null,
}: SummaryStepProps) => {
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
            <Button asChild variant="premium-outline" size="xl" className="w-full">
              <a href={clientReportUrl(pipelineResult.session_id, "pdf")} target="_blank" rel="noreferrer">
                Télécharger mon rapport PDF
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="premium" size="xl" className="w-full" onClick={onLaunch} disabled={launching}>
          {launching ? "Analyse en cours…" : "Lancer mon analyse"}
        </Button>
      )}
    </div>
  );
};
