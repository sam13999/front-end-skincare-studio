import { API_BASE_URL, type RunPipelineResponse } from "@/lib/api";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosticData, questions } from "./types";

interface SummaryStepProps {
  data: DiagnosticData;
  onGoToStep: (step: number) => void;
  onLaunch: () => void;
  launching?: boolean;
  pipelineResult?: RunPipelineResponse | null;
  firstQuestionStep: number;
  identityStep: number;
}

export const SummaryStep = ({ data, onGoToStep, onLaunch, firstQuestionStep, identityStep, launching = false, pipelineResult = null }: SummaryStepProps) => {
  const renderAnswer = (key: string) => {
    const value = data.answers[key];
    if (!value) return "—";
    return Array.isArray(value) ? value.join(", ") : value;
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <p className="eyebrow">Dernière étape</p>
        <h2 className="mt-4 font-serif text-3xl leading-none tracking-[-0.03em] text-[#183e34] sm:text-4xl">Votre récapitulatif.</h2>
        <p className="mt-3 text-[15px] leading-[1.65] text-[#69766f]">Vérifiez vos informations avant de lancer l’analyse.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        {[
          { label: "Face", photo: data.photoFace, step: 1 },
          { label: "Vue 3/4", photo: data.photoProfile, step: 2 },
        ].map((item) => (
          <div key={item.label}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#183e34]/15 bg-white">
              {item.photo ? <img src={item.photo} alt={"Aperçu " + item.label.toLowerCase()} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[#a2ada7]">Non transmise</div>}
              <button type="button" onClick={() => onGoToStep(item.step)} className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f6f1]/90 text-[#183e34] shadow-sm" aria-label={"Modifier la photo " + item.label}><Pencil className="h-4 w-4" /></button>
            </div>
            <span className="mt-2 block font-sans text-xs font-semibold text-[#69766f]">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-[#183e34]/12 bg-white p-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a95c4d]">Coordonnées</p>
          <p className="mt-2 truncate text-sm font-medium text-[#183e34]">{data.prenom || "—"} · {data.email || "—"}</p>
        </div>
        <button type="button" onClick={() => onGoToStep(identityStep)} className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[#69766f] hover:bg-[#183e34]/8" aria-label="Modifier les coordonnées"><Pencil className="h-4 w-4" /></button>
      </div>

      <div className="mb-10 divide-y divide-[#183e34]/10 border-y border-[#183e34]/10">
        {questions.map((question, index) => (
          <div key={question.id} className="flex items-start justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="text-xs leading-[1.4] text-[#69766f]">{question.title}</p>
              <p className="mt-1 text-sm font-semibold leading-[1.45] text-[#183e34]">{renderAnswer(question.key)}</p>
            </div>
            <button type="button" onClick={() => onGoToStep(index + firstQuestionStep)} className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[#69766f] hover:bg-[#183e34]/8" aria-label={"Modifier " + question.title}><Pencil className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {pipelineResult ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-[#e8f0e8] p-4 text-sm leading-[1.6] text-[#183e34]" role="status">
            {pipelineResult.email_status?.sent === true
              ? "Votre rapport a été envoyé à " + data.email + "."
              : pipelineResult.email_status?.reason
                ? "Email non envoyé : " + pipelineResult.email_status.reason
                : "Votre rapport est disponible ci-dessous."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="premium" size="xl" className="w-full">
              <a href={API_BASE_URL + "/v1/session/" + encodeURIComponent(pipelineResult.session_id) + "/html"} target="_blank" rel="noreferrer">Voir mon rapport HTML</a>
            </Button>
            <Button asChild variant="premium-outline" size="xl" className="w-full">
              <a href={API_BASE_URL + "/v1/session/" + encodeURIComponent(pipelineResult.session_id) + "/pdf"} target="_blank" rel="noreferrer">Télécharger mon rapport PDF</a>
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
