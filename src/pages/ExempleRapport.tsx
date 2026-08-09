import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import { reportPreviewPages } from "@/data/reportPreviewPages";

const ExempleRapport = () => (
  <PageShell
    title="Exemple de rapport d’analyse de peau | SkinView"
    description="Découvrez un exemple réel de rapport SkinView : diagnostic cosmétique, compréhension de la peau, stratégie et routine skincare sur mesure."
  >
    <section className="bg-[#f5f0e8] pb-12 pt-14 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">
        <span className="eyebrow">Exemple de rapport SkinView</span>
        <h1 className="mt-4 font-serif text-[2.65rem] leading-[0.98] tracking-[-0.035em] text-[#173f36] sm:text-5xl lg:text-6xl">
          Découvrez la structure d’un <em className="font-normal">rapport d’analyse de peau.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-sans text-sm leading-relaxed text-[#52625e] sm:text-base">
          Le rapport relie les signes visibles, vos réponses et vos objectifs à une stratégie de
          soin du visage expliquée. Chaque page montre comment les priorités conduisent à une
          routine skincare sur mesure, plutôt qu’à une simple liste de produits.
        </p>
      </div>
    </section>

    <section className="bg-[#fbf8f3] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1040px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12">
          {reportPreviewPages.map((page) => (
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
        <p className="mx-auto mt-10 max-w-2xl text-center font-sans text-[11px] leading-relaxed text-[#697672] sm:text-xs">
          Exemple anonymisé présenté avec l’accord nécessaire à sa démonstration. Les photos de
          peau ne sont pas affichées dans cet aperçu public.
        </p>
      </div>
    </section>

    <section className="border-y border-[#173f36]/10 bg-[#eee8de] py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">
        <h2 className="font-serif text-[2.15rem] leading-none text-[#173f36] sm:text-4xl">
          De l’observation à une routine cohérente
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-sans text-sm leading-relaxed text-[#52625e] sm:text-base">
          Le rapport complet précise également les produits retenus, le rôle de leurs actifs, les
          fréquences, l’ordre d’application et les ajustements utiles selon la tolérance de la peau.
        </p>
        <Link
          to="/rapport-skincare-personnalise"
          className="group mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#173f36]/30 font-sans text-sm font-medium text-[#173f36] transition hover:border-[#173f36]"
        >
          Découvrir ce que contient le rapport personnalisé
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </section>

    <section className="bg-[#fbf8f3] py-14 sm:py-20">
      <div className="mx-auto max-w-xl px-5 text-center sm:px-6">
        <p className="font-serif text-2xl italic leading-tight text-[#173f36] sm:text-3xl">
          Comprendre d’abord. Choisir ensuite.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <ReportCta label="Obtenir mon analyse et ma routine" showNote />
        </div>
      </div>
    </section>
  </PageShell>
);

export default ExempleRapport;
