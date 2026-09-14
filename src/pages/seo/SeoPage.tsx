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

export const SeoPage = ({ title, metaTitle, metaDescription, intro, sections }: SeoPageProps) => (
  <PageShell title={metaTitle ?? title + " — SkinView"} description={metaDescription ?? intro}>
    <article className="bg-[#fbfaf7]">
      <header className="bg-[#f4eee6] py-16 sm:py-24">
        <div className="site-container max-w-[840px]">
          <p className="eyebrow">Comprendre votre peau</p>
          <h1 className="section-title mt-5 text-[clamp(2.5rem,7vw,4.6rem)]">{title}</h1>
          <p className="mt-7 max-w-[720px] text-[16px] leading-[1.8] text-[#586761] sm:text-[18px]">{intro}</p>
        </div>
      </header>

      <div className="site-container max-w-[840px] py-14 sm:py-20">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-[#183e34]/15 py-8 sm:py-10">
            <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em] text-[#183e34] sm:text-4xl">{section.title}</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-[#69766f]">{section.body}</div>
          </section>
        ))}
      </div>
    </article>

    <section className="border-t border-[#183e34]/10 bg-[#eee6dc] py-16 text-center sm:py-20">
      <div className="site-container max-w-[700px]">
        <p className="font-serif text-3xl italic leading-tight text-[#183e34] sm:text-4xl">
          Si vous ne savez pas ce qui s’applique vraiment à votre peau, commencez par comprendre
          votre profil avant de racheter un produit.
        </p>
        <div className="mx-auto mt-8 max-w-[350px]"><ReportCta label="Commencer mon analyse" showNote /></div>
      </div>
    </section>
  </PageShell>
);

export default SeoPage;
