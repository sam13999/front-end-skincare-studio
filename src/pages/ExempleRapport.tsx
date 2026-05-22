import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  {
    label: "P. 01",
    title: "Lecture express",
    desc:
      "Une page d'entrée qui résume les 3 points clés à retenir sur votre peau — sans détour, sans jargon.",
  },
  {
    label: "P. 02",
    title: "Analyse de votre peau",
    desc:
      "Ce que vos photos et vos réponses révèlent : texture, sensibilité, déséquilibres potentiels, besoins prioritaires.",
  },
  {
    label: "P. 03",
    title: "Logique retenue",
    desc:
      "Pourquoi cette routine — et pas une autre. Les arbitrages, les compromis, les priorités assumées.",
  },
  {
    label: "P. 04",
    title: "Routine matin / soir / semaine",
    desc:
      "Un plan d'application clair, étape par étape, avec textures, fréquence et ordre logique.",
  },
  {
    label: "P. 05",
    title: "Produits recommandés",
    desc:
      "Des soins sélectionnés pour fonctionner ensemble, sans affiliation à une marque.",
  },
  {
    label: "P. 06",
    title: "Conseils d'application",
    desc:
      "Doses, temps de pose, ordre d'application, erreurs courantes à corriger immédiatement.",
  },
  {
    label: "P. 07",
    title: "Actifs à privilégier",
    desc:
      "Ce qui mérite vraiment une place dans votre routine, en fonction de ce que votre peau montre.",
  },
  {
    label: "P. 08",
    title: "À éviter",
    desc:
      "Les actifs trop agressifs, les associations à fuir, les habitudes qui sabotent vos efforts.",
  },
];

const ExempleRapport = () => {
  return (
    <PageShell
      title="Exemple de rapport — Skincare Studio"
      description="Découvrez concrètement ce que contient un rapport Skincare Studio : analyse de peau, logique de routine, produits recommandés et conseils d'application."
    >
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Exemple de rapport
          </span>
          <h1 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-[1.1] mt-5 mb-8">
            Ce que contient vraiment <span className="italic">votre rapport Skincare Studio.</span>
          </h1>
          <div className="gold-separator w-16 mx-auto mb-8" />
          <p className="text-warm font-sans font-light text-base md:text-lg leading-relaxed">
            Vous ne recevez pas une simple recommandation produit. Vous recevez un plan clair pour
            comprendre votre peau, éviter les erreurs et construire une routine cohérente.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {sections.slice(0, 6).map((s) => (
            <ReportMockup key={s.label} label={s.label} title={s.title}>
              {s.desc}
            </ReportMockup>
          ))}
        </div>
        <p className="text-warm font-sans font-light text-sm text-center mt-10 italic max-w-xl mx-auto">
          Extraits anonymisés. Les rapports réels ne sont jamais partagés et aucun visage
          identifiable n'est diffusé.
        </p>
      </section>

      <section className="bg-ivory-light py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Détail des sections
            </span>
            <h2 className="font-serif text-foreground text-3xl md:text-4xl mt-5">
              8 sections, une seule logique
            </h2>
            <div className="gold-separator w-16 mx-auto mt-6" />
          </div>

          <Accordion type="single" collapsible className="w-full">
            {sections.map((s) => (
              <AccordionItem key={s.label} value={s.label} className="border-border">
                <AccordionTrigger className="font-serif text-foreground text-lg text-left hover:no-underline">
                  <span className="text-gold font-sans text-[10px] tracking-[0.3em] mr-4">
                    {s.label}
                  </span>
                  {s.title}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-warm text-sm leading-relaxed font-light">
                  {s.desc}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-serif text-foreground text-2xl md:text-3xl italic leading-relaxed mb-10">
            Le rapport ne cherche pas à vous faire acheter plus.
            <br />
            <span className="not-italic">
              Il vous aide à comprendre ce qui mérite vraiment d'entrer dans votre routine.
            </span>
          </p>
          <ReportCta showNote />
        </div>
      </section>
    </PageShell>
  );
};

export default ExempleRapport;
