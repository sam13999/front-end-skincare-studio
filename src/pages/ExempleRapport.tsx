import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import lectureExpressImg from "@/assets/report/lecture-express.jpg";
import analysePeauImg from "@/assets/report/analyse-peau.jpg";
import logiqueRetenueImg from "@/assets/report/logique-retenue.jpg";
import routineMatinImg from "@/assets/report/routine-matin.jpg";
import routineSoirImg from "@/assets/report/routine-soir.jpg";

const sections = [
  {
    label: "P. 02",
    title: "Lecture express",
    image: lectureExpressImg,
    desc:
      "Une page d'entrée qui résume les points clés à retenir sur votre peau — sans détour, sans jargon.",
  },
  {
    label: "P. 03",
    title: "Analyse de la peau",
    image: analysePeauImg,
    desc:
      "Ce que vos photos et vos réponses révèlent : zones, texture, déséquilibres, besoins prioritaires.",
  },
  {
    label: "P. 04",
    title: "Logique retenue",
    image: logiqueRetenueImg,
    desc:
      "Pourquoi cette routine — et pas une autre. Les arbitrages, les compromis, ce qui a été écarté.",
  },
  {
    label: "P. 06",
    title: "Routine du matin",
    image: routineMatinImg,
    desc:
      "Étapes, textures et gestes pensés pour démarrer la journée sans surcharge.",
  },
  {
    label: "P. 07",
    title: "Routine du soir",
    image: routineSoirImg,
    desc:
      "Le détail des soins du soir, avec fréquence et rythme progressifs.",
  },
];

const ExempleRapport = () => {
  return (
    <PageShell
      title="Exemple de rapport — Skincare Studio"
      description="Découvrez concrètement ce que contient un rapport Skincare Studio : lecture express, analyse de peau, logique retenue, routine matin et soir."
    >
      <section className="pt-16 pb-10 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Exemple de rapport
          </span>
          <h1 className="font-serif text-foreground text-[1.9rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mt-5 mb-6 md:mb-8">
            Ce que contient vraiment <span className="italic">votre rapport.</span>
          </h1>
          <div className="gold-separator w-16 mx-auto mb-6 md:mb-8" />
          <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed">
            Pas une simple recommandation produit. Un plan clair pour comprendre votre peau,
            éviter les erreurs et construire une routine cohérente.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-5 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {sections.map((s) => (
            <ReportMockup
              key={s.label}
              label={s.label}
              title={s.title}
              image={s.image}
              imageAlt={`Extrait du rapport — ${s.title}`}
            >
              {s.desc}
            </ReportMockup>
          ))}
        </div>
        <p className="text-warm font-sans font-light text-sm text-center mt-10 italic max-w-xl mx-auto px-5">
          Extraits anonymisés. Les rapports réels ne sont jamais partagés et aucun visage
          identifiable n'est diffusé.
        </p>
      </section>

      <section className="bg-ivory-light py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Et aussi
          </span>
          <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-4xl mt-5 mb-6">
            Tout ce que le rapport contient en plus
          </h2>
          <div className="gold-separator w-16 mx-auto mb-8" />
          <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed">
            En complément des 5 sections principales, votre rapport inclut une routine
            hebdomadaire, les actifs à privilégier ou éviter, les conseils d'application (doses,
            ordre, fréquence) et une sélection de produits cohérents — sans affiliation à une
            marque.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-5 md:px-6 text-center">
          <p className="font-serif text-foreground text-xl md:text-3xl italic leading-relaxed mb-8 md:mb-10">
            Le rapport ne cherche pas à vous faire acheter plus.
            <br />
            <span className="not-italic">
              Il vous aide à comprendre ce qui mérite d'entrer dans votre routine.
            </span>
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <ReportCta showNote />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ExempleRapport;
