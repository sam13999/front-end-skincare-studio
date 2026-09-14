import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import { reportPreviewPages } from "@/data/reportPreviewPages";

const ExempleRapport = () => (
  <PageShell
    title="Exemple de rapport d’analyse de peau | SkinView"
    description="Découvrez des extraits réels et anonymisés d’un rapport SkinView : observation, profil, stratégie, routine et recommandations expliquées."
  >
    <section className="bg-[#f4eee6] py-16 sm:py-24 lg:py-32">
      <div className="site-container grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
        <div>
          <p className="eyebrow">Exemple de rapport SkinView</p>
          <h1 className="section-title mt-5">Voyez concrètement ce que vous recevez.</h1>
        </div>
        <p className="max-w-[650px] text-[16px] leading-[1.8] text-[#52625e] sm:text-[18px]">
          Un rapport clair, complet et pédagogique pour comprendre votre peau, définir vos
          priorités et savoir comment prendre soin d’elle. Les exemples présentés sont anonymisés.
        </p>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-16 sm:py-24">
      <div className="site-container">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-24">
          {reportPreviewPages.map((page, index) => (
            <article key={page.id} className={index % 2 === 1 ? "lg:translate-y-12" : ""}>
              <ReportMockup label={page.label} title={page.title} image={page.image} imageAlt={page.alt}>
                {page.description}
              </ReportMockup>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-[720px] border-t border-[#183e34]/15 pt-7 text-center">
          <p className="text-sm leading-[1.7] text-[#69766f]">
            Les extraits proviennent des supports réels de rapport utilisés par SkinView. Les
            informations personnelles inutiles à la compréhension ont été retirées ou anonymisées.
          </p>
        </div>
      </div>
    </section>

    <section className="border-y border-[#183e34]/10 bg-[#eee6dc] py-16 sm:py-24">
      <div className="site-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
        <h2 className="section-title text-[clamp(2.3rem,7vw,4.2rem)]">De l’observation à une routine cohérente.</h2>
        <div>
          <p className="max-w-[610px] text-[15px] leading-[1.8] text-[#586761] sm:text-base">
            Le rapport relie les observations, le profil et les objectifs à une stratégie de soin.
            Il présente les produits retenus, le rôle de leurs actifs, les fréquences, l’ordre
            d’application et les points de vigilance.
          </p>
          <Link to="/rapport-skincare-personnalise" className="quiet-link mt-7">
            Découvrir le contenu du rapport <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-16 text-center sm:py-24">
      <div className="site-container">
        <p className="font-serif text-3xl italic leading-tight text-[#183e34] sm:text-4xl">Comprendre d’abord. Choisir ensuite.</p>
        <div className="mx-auto mt-8 max-w-[350px]">
          <ReportCta label="Commencer mon analyse" showNote />
        </div>
      </div>
    </section>
  </PageShell>
);

export default ExempleRapport;
