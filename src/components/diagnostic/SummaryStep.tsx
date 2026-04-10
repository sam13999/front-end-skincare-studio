import { DiagnosticData, questions } from "./types";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface SummaryStepProps {
  data: DiagnosticData;
  onGoToStep: (step: number) => void;
  onLaunch: () => void;
}

export const SummaryStep = ({ data, onGoToStep, onLaunch }: SummaryStepProps) => {
  const getAnswerLabels = (questionId: number) => {
    const q = questions.find((q) => q.id === questionId);
    const answer = data.answers[questionId];
    if (!q || !answer) return "—";
    if (Array.isArray(answer)) {
      return answer
        .map((v) => q.options.find((o) => o.value === v)?.label || v)
        .join(", ");
    }
    return q.options.find((o) => o.value === answer)?.label || answer;
  };

  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-2">
          Récapitulatif
        </h2>
        <p className="font-sans text-warm text-sm font-light">
          Vérifiez vos informations avant de lancer l'analyse.
        </p>
      </div>

      {/* Photos */}
      <div className="flex gap-4 mb-8">
        {[
          { label: "Face", photo: data.photoFace, step: 1 },
          { label: "Profil", photo: data.photoProfile, step: 2 },
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
                {getAnswerLabels(q.id)}
              </p>
            </div>
            <button
              onClick={() => onGoToStep(i + 3)}
              className="shrink-0 p-1.5 text-warm hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Launch */}
      <Button variant="premium" size="xl" className="w-full" onClick={onLaunch}>
        Lancer mon analyse
      </Button>
    </div>
  );
};
