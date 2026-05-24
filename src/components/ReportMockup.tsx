import { ReactNode } from "react";

interface ReportMockupProps {
  label: string;
  title: string;
  children?: ReactNode;
  variant?: "page" | "card";
  image?: string;
  imageAlt?: string;
}

export const ReportMockup = ({
  label,
  title,
  children,
  variant = "page",
  image,
  imageAlt,
}: ReportMockupProps) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-2 bg-gold/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className={`relative rounded-md border border-border bg-ivory-light shadow-[0_10px_40px_-15px_hsl(var(--foreground)/0.18)] overflow-hidden ${
          variant === "page" ? "aspect-[3/4]" : "aspect-[4/3]"
        }`}
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent z-10" />

        {image ? (
          <img
            src={image}
            alt={imageAlt || title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
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
        )}
      </div>

      <div className="mt-4 px-1">
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">
          {label}
        </span>
        <h4 className="font-serif text-foreground text-lg md:text-xl leading-snug mt-1">
          {title}
        </h4>
        {image && children && (
          <p className="font-sans text-warm text-sm leading-relaxed font-light mt-2">
            {children}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportMockup;
