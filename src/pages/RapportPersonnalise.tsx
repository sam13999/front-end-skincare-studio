import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import { reportPreviewPages } from "@/data/reportPreviewPages";

const inclusions = [
  ["Lecture de votre peau", "Les signes visibles et les objectifs retenus."],
  ["Compréhension de vos besoins", "Une lecture claire de ce que votre peau montre."],
  ["Stratégie expliquée", "Pourquoi cette logique de routine — et pas une autre."],
  ["Routine conseillée", "Un plan structuré, étape par étape."],
  ["Produits qui fonctionnent ensemble", "Des soins sélectionnés pour leur cohérence."],
  ["Conseils d’application précis", "Dose, ordre, fréquence et temps de pose lorsque nécessaire."],
  ["Actifs à privilégier", "Ce qui mérite une place dans votre routine."],
  ["Points de vigilance", "Les habitudes et associations à surveiller."],
  ["Rapport HTML et PDF", "Pour le consulter facilement et le conserver."],
];

const RapportPersonnalise = () => {
  const featuredPages = reportPreviewPages.filter((page) => ["diagnostic", "strategy", "routine"].includes(page.id));

  return (
    <PageShell
      title="Rapport d’analyse de peau et routine sur mesure | SkinView"
      description="Découvrez le contenu du rapport SkinView : lecture de votre peau, stratégie, actifs, routine, produits et conseils d’application."
    >
      <section className="bg-[#f4eee6] py-16 sm:py-24 lg:py-32">
        <div className="site-container grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <div>
            <p className="eyebrow">Le contenu du rapport</p>
            <h1 className="section-title mt-5">Une analyse pour comprendre. Une routine pour agir.</h1>
          </div>
          <p className="max-w-[640px] text-[16px] leading-[1.8] text-[#52625e] sm:text-[18px]">
            Une bonne routine ne dépend pas seulement d’un bon produit. Elle dépend de la
            cohérence entre les besoins de la peau, les actifs, les textures, la fréquence et
            l’ordre d’application.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-16 sm:py-24">
        <div className="site-container grid gap-8 sm:grid-cols-3 sm:gap-6">
          {featuredPages.map((page) => (
            <ReportMockup key={page.id} label={page.label} title={page.title} image={page.image} imageAlt={page.alt}>
              {page.description}
            </ReportMockup>
          ))}
        </div>
        <div className="site-container text-center">
          <Link to="/exemple-rapport" className="quiet-link mt-12">Voir tous les extraits du rapport <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="border-y border-[#183e34]/10 bg-[#eee6dc] py-16 sm:py-24">
        <div className="site-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="eyebrow">Ce que vous recevez</p>
            <h2 className="section-title mt-4 text-[clamp(2.3rem,7vw,4rem)]">Tout ce qui aide à faire les bons choix.</h2>
          </div>
          <div className="grid gap-x-10 sm:grid-cols-2">
            {inclusions.map(([title, text]) => (
              <div key={title} className="border-t border-[#183e34]/15 py-5">
                <div className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#a95c4d]" aria-hidden="true" />
                  <div>
                    <h3 className="font-serif text-xl leading-tight text-[#183e34]">{title}</h3>
                    <p className="mt-2 text-sm leading-[1.6] text-[#69766f]">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-16 text-center sm:py-24">
        <div className="site-container">
          <p className="font-serif text-3xl italic leading-tight text-[#183e34] sm:text-4xl">Comprenez d’abord. Choisissez ensuite.</p>
          <div className="mx-auto mt-8 max-w-[350px]"><ReportCta label="Commencer mon analyse" showNote /></div>
          <p className="mx-auto mt-8 max-w-[620px] text-[11px] leading-[1.7] text-[#69766f]">
            SkinView est un service de conseil cosmétique. Le rapport ne constitue pas un avis
            médical et l’analyse repose sur les photos et réponses transmises.
          </p>
        </div>
      </section>
    </PageShell>
  );
};

export default RapportPersonnalise;
