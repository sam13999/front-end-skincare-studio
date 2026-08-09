import { ReactNode } from "react";

interface ReportMockupProps {
  label: string;
  title: string;
  children?: ReactNode;
  image: string;
  imageAlt: string;
}

export const ReportMockup = ({
  label,
  title,
  children,
  image,
  imageAlt,
}: ReportMockupProps) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-2 bg-gold/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className="relative aspect-[0.705] overflow-hidden rounded-md border border-border bg-ivory-light shadow-[0_10px_40px_-15px_hsl(var(--foreground)/0.18)]"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent z-10" />
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          width={800}
          height={1135}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>

      <div className="mt-4 px-1">
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">
          {label}
        </span>
        <h4 className="font-serif text-foreground text-lg md:text-xl leading-snug mt-1">
          {title}
        </h4>
        {children && (
          <p className="font-sans text-warm text-sm leading-relaxed font-light mt-2">
            {children}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportMockup;
