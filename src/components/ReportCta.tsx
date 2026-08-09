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
  label = "Obtenir ma routine personnalisée",
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
        className="group w-full whitespace-normal px-6 py-4 text-center leading-tight h-auto min-h-[3.5rem] max-[359px]:min-h-[3.25rem]"
      >
        {label}
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
