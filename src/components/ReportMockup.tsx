import { ReactNode } from "react";

interface ReportMockupProps {
  label: string;
  title: string;
  children?: ReactNode;
  image: string;
  imageAlt: string;
}

export const ReportMockup = ({ label, title, children, image, imageAlt }: ReportMockupProps) => {
  return (
    <figure className="group">
      <div className="report-frame relative aspect-[0.705]">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#a95c4d]/60 to-transparent" />
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          width={800}
          height={1135}
          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.012]"
        />
      </div>
      <figcaption className="mt-5 px-1">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a95c4d]">{label}</span>
        <h3 className="mt-2 font-serif text-xl leading-tight tracking-[-0.02em] text-[#183e34] sm:text-2xl">{title}</h3>
        {children && <p className="mt-2 max-w-[440px] font-sans text-sm leading-[1.65] text-[#69766f]">{children}</p>}
      </figcaption>
    </figure>
  );
};

export default ReportMockup;
