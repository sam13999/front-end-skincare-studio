import { ReactNode } from "react";

interface ReportMockupProps {
  label: string;
  title: string;
  children?: ReactNode;
  variant?: "page" | "card";
}

export const ReportMockup = ({ label, title, children, variant = "page" }: ReportMockupProps) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-2 bg-gold/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className={`relative rounded-sm border border-border bg-ivory-light shadow-[0_8px_32px_-12px_hsl(var(--foreground)/0.12)] overflow-hidden ${
          variant === "page" ? "aspect-[3/4]" : "aspect-[4/3]"
        }`}
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="p-5 md:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-gold">
              {label}
            </span>
            <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-warm/60">
              Skincare Studio
            </span>
          </div>
          <h4 className="font-serif text-foreground text-lg md:text-xl leading-snug mb-3">
            {title}
          </h4>
          <div className="gold-separator w-10 mb-4" />
          <div className="flex-1 font-sans text-[12px] text-warm leading-relaxed font-light">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportMockup;
