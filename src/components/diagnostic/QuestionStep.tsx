import { Question } from "./types";
import { Button } from "@/components/ui/button";

interface QuestionStepProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
  canNext: boolean;
}

// Values that, when selected in a multi-select, deselect all others (and vice-versa).
const EXCLUSIVE_VALUES = new Set(["Je ne sais pas", "Aucun"]);

export const QuestionStep = ({
  question,
  value,
  onChange,
  onNext,
  canNext,
}: QuestionStepProps) => {
  const handleSelect = (optionValue: string) => {
    if (question.type === "single") {
      onChange(optionValue);
      return;
    }

    const current = (value as string[]) || [];

    // If selecting an exclusive value: replace selection with just that value
    if (EXCLUSIVE_VALUES.has(optionValue)) {
      if (current.length === 1 && current[0] === optionValue) {
        onChange([]);
      } else {
        onChange([optionValue]);
      }
      return;
    }

    // Otherwise: remove any exclusive value, then toggle this option
    const without = current.filter((v) => !EXCLUSIVE_VALUES.has(v));
    if (without.includes(optionValue)) {
      onChange(without.filter((v) => v !== optionValue));
    } else {
      onChange([...without, optionValue]);
    }
  };

  const isSelected = (optionValue: string) => {
    if (!value) return false;
    if (question.type === "single") return value === optionValue;
    return (value as string[]).includes(optionValue);
  };

  return (
    <div className="flex flex-col">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-2">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="font-sans text-warm text-sm font-light">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {question.options.map((option) => {
          const selected = isSelected(option.value);
          const isExclusive = EXCLUSIVE_VALUES.has(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
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

      {/* Next button */}
      <Button
        variant="premium"
        size="xl"
        className="w-full"
        disabled={!canNext}
        onClick={onNext}
      >
        Continuer
      </Button>
    </div>
  );
};
