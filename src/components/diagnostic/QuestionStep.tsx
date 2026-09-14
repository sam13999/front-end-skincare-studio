import { Question } from "./types";
import { Button } from "@/components/ui/button";

interface QuestionStepProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
  canNext: boolean;
}

export const QuestionStep = ({ question, value, onChange, onNext, canNext }: QuestionStepProps) => {
  const current = Array.isArray(value) ? value : [];
  const exclusiveValues = new Set(question.exclusiveValues ?? []);
  const maxSelections = question.maxSelections ?? Number.POSITIVE_INFINITY;

  const handleSelect = (optionValue: string) => {
    if (question.type === "single") {
      onChange(optionValue);
      return;
    }

    if (exclusiveValues.has(optionValue)) {
      onChange(current.length === 1 && current[0] === optionValue ? [] : [optionValue]);
      return;
    }

    const withoutExclusive = current.filter((item) => !exclusiveValues.has(item));
    if (withoutExclusive.includes(optionValue)) {
      onChange(withoutExclusive.filter((item) => item !== optionValue));
      return;
    }
    if (withoutExclusive.length >= maxSelections) return;
    onChange([...withoutExclusive, optionValue]);
  };

  const isSelected = (optionValue: string) => question.type === "single" ? value === optionValue : current.includes(optionValue);

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <p className="eyebrow">Question {question.id}</p>
        <h2 className="mt-4 font-serif text-3xl leading-[1.03] tracking-[-0.03em] text-[#183e34] sm:text-4xl">{question.title}</h2>
        {question.subtitle && <p className="mt-3 text-[15px] leading-[1.65] text-[#69766f]">{question.subtitle}</p>}
      </div>

      <div className="mb-8 grid gap-2.5">
        {question.options.map((option) => {
          const selected = isSelected(option.value);
          const isExclusive = exclusiveValues.has(option.value);
          const maxReached = question.type === "multiple" && !selected && !isExclusive && current.length >= maxSelections;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={maxReached}
              aria-pressed={selected}
              className={"flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left font-sans text-[15px] leading-[1.35] transition " + (selected ? "border-[#a95c4d] bg-[#a95c4d]/8 font-semibold text-[#183e34]" : "border-[#183e34]/15 bg-white text-[#52625e] hover:border-[#a95c4d]/60 hover:bg-[#a95c4d]/5") + (maxReached ? " cursor-not-allowed opacity-45" : "")}
            >
              <span>{option.label}</span>
              <span className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs " + (selected ? "border-[#a95c4d] bg-[#a95c4d] text-white" : "border-[#183e34]/20 text-transparent")} aria-hidden="true">✓</span>
            </button>
          );
        })}
      </div>

      <Button variant="premium" size="xl" className="w-full" disabled={!canNext} onClick={onNext}>Continuer</Button>
    </div>
  );
};
