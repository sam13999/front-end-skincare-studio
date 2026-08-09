import { Button } from "@/components/ui/button";
import { useDiagnostic } from "@/context/DiagnosticContext";
import { ArrowRight } from "lucide-react";

interface ReportCtaProps {
  label?: string;
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  variant?: "premium" | "default" | "outline" | "ghost";
  showNote?: boolean;
  showArrow?: boolean;
  className?: string;
}

export const ReportCta = ({
  label = "Obtenir ma routine sur mesure",
  size = "xl",
  variant = "premium",
  showNote = false,
  showArrow = false,
  className = "",
}: ReportCtaProps) => {
  const { open } = useDiagnostic();
  return (
    <div className={`flex w-full flex-col items-center gap-2.5 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={open}
        className="group relative h-14 min-h-14 w-full whitespace-normal px-5 py-3 text-center text-[14px] leading-tight"
      >
        <span>{label}</span>
        {showArrow && (
          <ArrowRight className="absolute right-5 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        )}
      </Button>
      {showNote && (
        <p className="text-warm font-sans text-[11px] text-center max-w-xs leading-relaxed">
          Vos photos restent confidentielles.
        </p>
      )}
    </div>
  );
};

export default ReportCta;
