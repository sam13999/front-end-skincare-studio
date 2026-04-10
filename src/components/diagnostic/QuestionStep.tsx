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
  const handleSelect = (optionValue: string) => {
    if (question.type === "single") {
      onChange(optionValue);
    } else {
      const current = (value as string[]) || [];
      if (optionValue === "unknown") {
        // "Je ne sais pas" clears others
        onChange(["unknown"]);
      } else {
        const without = current.filter((v) => v !== "unknown");
        if (without.includes(optionValue)) {
          onChange(without.filter((v) => v !== optionValue));
        } else {
          onChange([...without, optionValue]);
        }
      }
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
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`p-4 rounded-lg border text-center transition-all duration-200 font-sans text-sm ${
                selected
                  ? "border-green-deep bg-green-deep/5 text-foreground font-medium shadow-sm"
                  : "border-border bg-ivory-light text-warm hover:border-accent hover:bg-accent/5"
              } ${
                option.value === "unknown" ? "col-span-2" : ""
              }`}
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
