import { Question } from "./types";

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

  const isSelected = (optionValue: string) =>
    question.type === "single" ? value === optionValue : current.includes(optionValue);

  return (
    <section className="svd-step" aria-labelledby={`question-title-${question.id}`}>
      <div className="svd-intro">
        <p className="svd-eyebrow">Votre peau, en quelques réponses</p>
        <h2 id={`question-title-${question.id}`}>{question.title}</h2>
        {question.subtitle && <p>{question.subtitle}</p>}
      </div>
      <div className="svd-question-options" role={question.type === "multiple" ? "group" : "radiogroup"}>
        {question.options.map((option) => {
          const selected = isSelected(option.value);
          const isExclusive = exclusiveValues.has(option.value);
          const maxReached = question.type === "multiple"
            && !selected
            && !isExclusive
            && current.length >= maxSelections;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={maxReached}
              aria-pressed={selected}
              className={`svd-choice${isExclusive ? " svd-choice--exclusive" : ""}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <button type="button" className="svd-primary svd-full" disabled={!canNext} onClick={onNext}>
        Continuer
      </button>
    </section>
  );
};
