import { Check } from "lucide-react";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const included = [
  "Analyse visible de votre peau",
  "Lecture des priorités",
  "Stratégie de routine",
  "Routine matin / soir / hebdomadaire",
  "Recommandations produits",
  "Conseils d’application",
  "Points de vigilance",
  "Rapport HTML et PDF envoyé par email",
];

const Tarif = () => (
  <PageShell
    title="Tarif — Analyse de peau et routine sur mesure SkinView"
    description="Découvrez le tarif de l’analyse de peau SkinView et le contenu du rapport : analyse, stratégie, routine, produits et conseils d’application."
  >
    <section className="bg-[#f4eee6] py-16 sm:py-24 lg:py-32">
      <div className="site-container max-w-[900px] text-center">
        <p className="eyebrow">Tarif</p>
        <h1 className="section-title mt-5">Une analyse complète.<br /><span className="italic">49 €.</span></h1>
        <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-[1.75] text-[#52625e]">
          Un paiement unique pour recevoir une lecture structurée de votre peau et une routine
          construite pour votre profil.
        </p>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-16 sm:py-24">
      <div className="site-container max-w-[760px]">
        <div className="overflow-hidden rounded-[1.5rem] border border-[#183e34]/12 bg-white shadow-[0_28px_80px_-45px_rgba(24,62,52,0.55)]">
          <div className="grid gap-8 bg-[#183e34] p-7 text-white sm:grid-cols-[1fr_auto] sm:items-end sm:p-10">
            <div>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e0b8a9]">Analyse SkinView</p>
              <h2 className="mt-4 font-serif text-3xl leading-none sm:text-4xl">Comprendre avant d’acheter.</h2>
            </div>
            <div className="font-serif text-6xl leading-none sm:text-7xl">49 €</div>
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-sm leading-[1.7] text-[#69766f]">Paiement unique. Prix visible dès le départ.</p>
            <ul className="mt-7 divide-y divide-[#183e34]/10 border-y border-[#183e34]/10">
              {included.map((item) => (
                <li key={item} className="flex gap-3 py-4 text-sm leading-[1.55] text-[#33483f]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#a95c4d]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8"><ReportCta label="Commencer mon analyse" showNote /></div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-[#183e34]/10 bg-[#eee6dc] py-16 text-center sm:py-20">
      <div className="site-container max-w-[700px]">
        <h2 className="font-serif text-3xl italic leading-tight text-[#183e34] sm:text-4xl">L’objectif n’est pas d’acheter plus, mais d’acheter avec plus de logique.</h2>
        <p className="mt-5 text-[15px] leading-[1.7] text-[#586761]">
          SkinView est indépendant des marques et ne promet pas de résultat médical ou universel.
        </p>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-12 sm:py-16">
      <div className="site-container max-w-[760px]">
        <ul className="space-y-2 text-[12px] leading-[1.7] text-[#69766f]">
          <li>· SkinView est un service de conseil cosmétique.</li>
          <li>· Le rapport ne constitue pas un avis médical.</li>
          <li>· Aucune promesse de résultat.</li>
          <li>· Le rapport est envoyé par email. Reprise manuelle sous 24 à 48 h en cas de problème technique.</li>
          <li>· Sans affiliation à une marque.</li>
        </ul>
      </div>
    </section>
  </PageShell>
);

export default Tarif;
