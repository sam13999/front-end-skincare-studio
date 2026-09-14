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
  label = "Commencer mon analyse",
  size = "xl",
  variant = "premium",
  showNote = false,
  showArrow = true,
  className = "",
}: ReportCtaProps) => {
  const { open } = useDiagnostic();

  return (
    <div className={"flex w-full flex-col items-center gap-2.5 " + className}>
      <Button
        variant={variant}
        size={size}
        onClick={open}
        className="group relative h-auto min-h-12 w-full rounded-full bg-[#a95c4d] px-6 py-3 font-sans text-[14px] font-semibold text-white shadow-[0_12px_28px_-16px_rgba(169,92,77,0.9)] transition hover:bg-[#8f493e] disabled:pointer-events-none"
      >
        <span>{label}</span>
        {showArrow && (
          <ArrowRight className="absolute right-5 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        )}
      </Button>
      {showNote && (
        <p className="max-w-xs text-center font-sans text-[11px] leading-relaxed text-[#69766f]">
          Vos photos servent uniquement à générer votre rapport.
        </p>
      )}
    </div>
  );
};

export default ReportCta;
