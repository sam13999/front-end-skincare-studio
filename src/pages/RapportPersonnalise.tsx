import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import { reportPreviewPages } from "@/data/reportPreviewPages";
import { Link } from "react-router-dom";

const inclusions = [
  ["Diagnostic cosmétique", "Les signes visibles et les objectifs retenus."],
  ["Compréhension de votre peau", "Une lecture claire de ce que votre peau montre."],
  ["Stratégie expliquée", "Pourquoi cette logique de routine — et pas une autre."],
  ["Routine conseillée", "Un plan structuré, étape par étape."],
  ["Produits qui fonctionnent ensemble", "Des soins sélectionnés pour leur cohérence."],
  ["Conseils d'application précis", "Dose, ordre, fréquence, temps de pose."],
  ["Actifs à privilégier", "Ce qui mérite une place dans votre routine."],
  ["Erreurs à éviter", "Les habitudes qui sabotent vos efforts."],
  ["Rapport PDF envoyé par email", "Pour le relire et l'ajuster dans le temps."],
];

const RapportPersonnalise = () => {
  const featuredPages = reportPreviewPages.filter((page) =>
    ["diagnostic", "strategy", "routine"].includes(page.id),
  );

  return (
    <PageShell
      title="Rapport skincare sur mesure et analyse de peau | SkinView"
      description="Un rapport sur mesure pour comprendre votre peau et construire une routine skincare cohérente : analyse, stratégie, actifs et conseils d’application."
    >
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Le rapport
          </span>
          <h1 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-[1.1] mt-5 mb-8">
            Un rapport sur mesure pour comprendre votre peau et{" "}
            <span className="italic">construire une routine cohérente.</span>
          </h1>
          <div className="gold-separator w-16 mx-auto mb-8" />
          <p className="text-warm font-sans font-light text-base md:text-lg leading-relaxed">
            Une bonne routine ne dépend pas seulement d'un bon produit. Elle dépend de la
            cohérence entre les besoins de la peau, les actifs, les textures, la fréquence et
            l'ordre d'application.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {featuredPages.map((page) => (
            <ReportMockup
              key={page.id}
              label={page.label}
              title={page.title}
              image={page.image}
              imageAlt={page.alt}
            >
              {page.description}
            </ReportMockup>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/exemple-rapport"
            className="inline-flex min-h-11 items-center border-b border-foreground/25 font-sans text-sm text-foreground transition hover:border-foreground"
          >
            Voir toutes les pages de l’exemple de rapport SkinView
          </Link>
        </div>
      </section>

      <section className="bg-ivory-light py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Inclus
            </span>
            <h2 className="font-serif text-foreground text-3xl md:text-4xl mt-5">
              Tout ce que contient votre rapport
            </h2>
            <div className="gold-separator w-16 mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-5">
            {inclusions.map(([t, d]) => (
              <div key={t} className="flex gap-4 py-3 border-b border-border/60">
                <div className="text-gold font-serif text-xl leading-none mt-0.5">·</div>
                <div>
                  <div className="font-serif text-foreground text-lg leading-tight">{t}</div>
                  <p className="text-warm font-sans font-light text-sm leading-relaxed mt-1">
                    {d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="font-serif text-foreground text-2xl md:text-3xl italic leading-relaxed mb-10">
            Comprenez d'abord. <br />
            <span className="not-italic">Choisissez ensuite.</span>
          </p>
          <ReportCta showNote />
          <p className="font-sans text-warm text-[11px] mt-8 leading-relaxed max-w-md mx-auto">
            SkinView est un service de conseil cosmétique. Le rapport n'est pas un avis médical.
            L'analyse repose sur les photos et réponses transmises. Les photos servent uniquement
            à générer votre rapport.
          </p>
        </div>
      </section>
    </PageShell>
  );
};

export default RapportPersonnalise;
