import { ReactNode } from "react";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

interface SeoPageProps {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  intro: string;
  sections: { title: string; body: ReactNode }[];
}

export const SeoPage = ({ title, metaTitle, metaDescription, intro, sections }: SeoPageProps) => {
  return (
    <PageShell title={metaTitle ?? `${title} — SkinView`} description={metaDescription ?? intro}>
      <article className="pt-20 pb-16 md:pt-28">
        <div className="max-w-2xl mx-auto px-6">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Comprendre votre peau
          </span>
          <h1 className="font-serif text-foreground text-3xl md:text-5xl leading-[1.15] mt-5 mb-8">
            {title}
          </h1>
          <div className="gold-separator w-16 mb-8" />
          <p className="font-sans text-warm text-base md:text-lg leading-relaxed font-light mb-12">
            {intro}
          </p>

          {sections.map((s) => (
            <section key={s.title} className="mb-10">
              <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-4">{s.title}</h2>
              <div className="font-sans text-warm text-base leading-relaxed font-light space-y-4">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </article>

      <section className="bg-ivory-light py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="font-serif text-foreground text-xl md:text-2xl italic leading-relaxed mb-8">
            Si vous ne savez pas ce qui s'applique vraiment à votre peau, commencez par comprendre
            votre profil avant de racheter un produit.
          </p>
          <ReportCta showNote />
        </div>
      </section>
    </PageShell>
  );
};

export default SeoPage;
