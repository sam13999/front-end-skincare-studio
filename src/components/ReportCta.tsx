import { Button } from "@/components/ui/button";
import { useDiagnostic } from "@/context/DiagnosticContext";

interface ReportCtaProps {
  label?: string;
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  variant?: "premium" | "default" | "outline" | "ghost";
  showNote?: boolean;
  className?: string;
}

export const ReportCta = ({
  label = "Recevoir mon rapport personnalisé — 29 €",
  size = "xl",
  variant = "premium",
  showNote = false,
  className = "",
}: ReportCtaProps) => {
  const { open } = useDiagnostic();
  return (
    <div className={`flex flex-col items-center gap-3 w-full ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={open}
        className="w-full sm:w-auto whitespace-normal text-center leading-tight px-6 py-4 h-auto min-h-[3.5rem]"
      >
        {label}
      </Button>
      {showNote && (
        <p className="text-warm font-sans text-[11px] tracking-wide text-center max-w-xs leading-relaxed">
          Prix visible dès le départ.
        </p>
      )}
    </div>
  );
};

export default ReportCta;
