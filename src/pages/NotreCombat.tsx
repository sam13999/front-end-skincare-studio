import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const NotreCombat = () => {
  return (
    <PageShell
      title="Notre combat — Skincare Studio"
      description="Skincare Studio existe pour simplifier la skincare et arrêter les achats à l'aveugle. Comprendre sa peau avant de dépenser encore."
    >
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Notre combat
          </span>
          <h1 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-[1.1] mt-5 mb-8">
            Simplifions la skincare. <br />
            <span className="italic">Comprenez votre peau avant de dépenser encore.</span>
          </h1>
          <div className="gold-separator w-16 mx-auto" />
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <p className="font-serif text-foreground text-xl md:text-2xl leading-relaxed italic text-center">
            La skincare ne devrait pas être une accumulation de tendances, de paniers Sephora et
            de routines copiées.
            <br />
            <span className="not-italic">
              Elle devrait commencer par une chose simple : comprendre sa peau.
            </span>
          </p>

          <div className="gold-separator w-12 mx-auto" />

          <p className="font-sans text-warm text-base leading-relaxed font-light">
            Nous ne sommes pas contre les routines TikTok. Nous sommes contre les routines
            copiées sans comprendre. Un produit peut être excellent pour une peau, inutile ou
            trop agressif pour une autre.
          </p>

          <p className="font-sans text-warm text-base leading-relaxed font-light">
            Skincare Studio existe pour remettre de la logique avant l'achat : comprendre
            d'abord, choisir ensuite.
          </p>
        </div>
      </section>

      <section className="bg-ivory-light py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                t: "Moins d'achats au hasard",
                d: "Arrêter d'empiler les soins sans comprendre ce que la peau attend vraiment.",
              },
              {
                t: "Plus de logique",
                d: "Construire une routine où chaque produit a une raison d'être.",
              },
              {
                t: "Sans affiliation",
                d: "Les recommandations sont faites pour votre peau, pas pour une marque.",
              },
            ].map((b) => (
              <div key={b.t} className="text-center">
                <div className="w-px h-8 bg-gold/40 mx-auto mb-5" />
                <h3 className="font-serif text-foreground text-xl mb-3">{b.t}</h3>
                <p className="font-sans text-warm text-sm leading-relaxed font-light max-w-[240px] mx-auto">
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-foreground text-2xl md:text-3xl italic leading-relaxed mb-10">
            Comprenez votre peau. Choisissez ensuite.
          </h2>
          <ReportCta showNote />
        </div>
      </section>
    </PageShell>
  );
};

export default NotreCombat;
