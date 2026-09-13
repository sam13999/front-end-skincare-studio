import { Question } from "./types";
import { Button } from "@/components/ui/button";

interface QuestionStepProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
  canNext: boolean;
}

export const QuestionStep = ({
  question,
  value,
  onChange,
  onNext,
  canNext,
}: QuestionStepProps) => {
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

  const isSelected = (optionValue: string) =>
    question.type === "single" ? value === optionValue : current.includes(optionValue);

  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-2">{question.title}</h2>
        {question.subtitle && <p className="font-sans text-warm text-sm font-light">{question.subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
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
              className={`p-4 rounded-lg border text-center transition-all duration-200 font-sans text-sm ${
                selected
                  ? "border-green-deep bg-green-deep/5 text-foreground font-medium shadow-sm"
                  : "border-border bg-ivory-light text-warm hover:border-accent hover:bg-accent/5"
              } ${isExclusive ? "col-span-2" : ""}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <Button variant="premium" size="xl" className="w-full" disabled={!canNext} onClick={onNext}>
        Continuer
      </Button>
    </div>
  );
};

