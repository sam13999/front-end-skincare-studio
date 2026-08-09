import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const included = [
  "Analyse visible de votre peau",
  "Lecture des priorités",
  "Stratégie de routine",
  "Routine matin / soir / hebdomadaire",
  "Recommandations produits",
  "Conseils d'application",
  "Erreurs à éviter",
  "Rapport PDF envoyé par email",
];

const Tarif = () => {
  return (
    <PageShell
      title="Tarif — Analyse de peau et routine personnalisée SkinView 49 €"
      description="Analyse de peau et routine skincare personnalisée à 49 €. Rapport détaillé, produits, actifs et conseils d'application inclus."
    >
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">Tarif</span>
          <h1 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-[1.1] mt-5 mb-8">
            Analyse et routine personnalisée SkinView
            <br />
            <span className="italic">49 €.</span>
          </h1>
          <div className="gold-separator w-16 mx-auto" />
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="relative border border-border bg-ivory-light rounded-sm p-8 md:p-12">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

            <div className="text-center mb-8">
              <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
                Standard
              </div>
              <div className="font-serif text-foreground text-6xl md:text-7xl mb-2">49 €</div>
              <p className="font-sans text-warm text-xs tracking-wide">
                Paiement unique. Prix visible dès le départ.
              </p>
            </div>

            <div className="gold-separator w-16 mx-auto mb-8" />

            <ul className="space-y-3 mb-10">
              {included.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-gold font-serif text-lg leading-none mt-0.5">·</span>
                  <span className="font-sans text-foreground/85 text-sm leading-relaxed">{i}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <ReportCta showNote />
            </div>
          </div>

        </div>
      </section>

      <section className="bg-ivory-light py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-foreground text-2xl md:text-3xl italic leading-relaxed mb-6">
            Un sérum mal choisi peut coûter plus cher que le rapport.
          </h2>
          <p className="font-sans text-warm text-base leading-relaxed font-light">
            L'objectif n'est pas d'acheter plus, mais d'acheter avec plus de logique.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <ul className="space-y-2">
            {[
              "SkinView est un service de conseil cosmétique.",
              "Le rapport n'est pas un avis médical.",
              "Aucune promesse de résultat.",
              "Le rapport est envoyé par email. Reprise manuelle sous 24 à 48h en cas de problème technique.",
              "Sans affiliation à une marque.",
            ].map((d) => (
              <li
                key={d}
                className="font-sans text-warm text-[12px] leading-relaxed font-light"
              >
                · {d}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
};

export default Tarif;
