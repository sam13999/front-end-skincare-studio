import { Link } from "react-router-dom";
import {
  ArrowRight,
  Blend,
  Camera,
  Check,
  ClipboardList,
  FileText,
  FlaskConical,
  LockKeyhole,
  MessageCircleMore,
  Moon,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import heroProduct from "@/assets/hero-product.jpg";
import analysePeauImg from "@/assets/report/analyse-peau.jpg";
import lectureExpressImg from "@/assets/report/lecture-express.jpg";
import routineMatinImg from "@/assets/report/routine-matin.jpg";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const deliverables = [
  {
    icon: ScanLine,
    title: "Analyse détaillée de votre peau",
    text: "Une lecture structurée des signes visibles et des points clés.",
  },
  {
    icon: MessageCircleMore,
    title: "Vos besoins expliqués",
    text: "Des explications claires sur les besoins réels de votre peau.",
  },
  {
    icon: ShieldCheck,
    title: "Priorités & points de vigilance",
    text: "Ce qu’il faut prioriser, éviter et surveiller.",
  },
  {
    icon: Sparkles,
    title: "Votre routine personnalisée",
    text: "Produits, actifs et fréquences adaptés à votre profil.",
    featured: true,
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Questionnaire",
    text: "Votre peau, vos habitudes et vos préoccupations.",
  },
  {
    icon: Camera,
    title: "Photos",
    text: "Quelques photos prises dans les conditions indiquées.",
  },
  {
    icon: Blend,
    title: "Analyse croisée",
    text: "Réponses, photos et actifs skincare sont croisés.",
  },
  {
    icon: FileText,
    title: "Rapport + routine",
    text: "Votre analyse détaillée et votre routine sur mesure.",
  },
];

const reportPages = [
  { title: "Votre analyse", image: analysePeauImg, rotate: "-rotate-[3deg]" },
  { title: "Comprendre votre peau", image: lectureExpressImg, rotate: "rotate-[1deg]" },
  { title: "Votre routine", image: routineMatinImg, rotate: "rotate-[3deg]" },
];

const routines = [
  {
    icon: Sun,
    period: "Matin",
    items: ["Nettoyage", "Actif ciblé", "Hydratation", "Protection solaire"],
  },
  {
    icon: Moon,
    period: "Soir",
    items: ["Nettoyage", "Actif adapté", "Soin complémentaire", "Hydratation"],
  },
];

const method = [
  {
    icon: ScanLine,
    title: "Besoins de la peau",
    text: "Signes visibles et priorités.",
  },
  {
    icon: FlaskConical,
    title: "Analyse des actifs",
    text: "Rôle, fréquence et compatibilité.",
  },
  {
    icon: Blend,
    title: "Complémentarité",
    text: "Une routine cohérente, sans superflu.",
  },
];

const reassurance = [
  { icon: LockKeyhole, title: "Données sécurisées", text: "Confidentialité" },
  { icon: FlaskConical, title: "Expertise skincare", text: "Analyse personnalisée" },
  { icon: Sparkles, title: "Recommandations sur mesure", text: "Actifs et fréquences" },
  { icon: FileText, title: "Rapport clair", text: "Facile à suivre" },
];

const Index = () => {
  return (
    <PageShell
      title="SkinView — Analyse de peau & routine skincare personnalisée"
      description="Envoyez vos photos, répondez à quelques questions et recevez une analyse détaillée de votre peau avec une routine skincare personnalisée."
    >
      <section className="overflow-hidden bg-[#f5f0e8]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-5 pb-5 pt-7 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:px-8 lg:py-14">
          <div className="relative z-10 max-w-[610px]">
            <div className="hero-enter mb-[18px] inline-flex h-8 items-center gap-2 rounded-full border border-[#173f36]/12 bg-white/55 px-[13px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#315f54]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Votre peau, votre routine
            </div>

            <h1 className="hero-enter hero-enter-delay-1 text-[clamp(2.3rem,11.5vw,2.85rem)] leading-[0.95] tracking-[-0.045em] text-[#173f36] sm:text-[4.2rem] lg:text-[4.25rem]">
              <span className="block">Recevez une</span>
              <span className="block">routine personnalisée</span>
              <em className="block font-normal">pensée pour votre peau.</em>
            </h1>

            <p className="hero-enter hero-enter-delay-2 mt-5 text-[16px] font-semibold leading-snug text-[#173f36]">
              Comprenez votre peau. Agissez avec clarté.
            </p>
            <p className="hero-enter hero-enter-delay-2 mt-2.5 max-w-[550px] text-[14px] leading-[1.58] text-[#52625e] sm:text-[15px]">
              Répondez à quelques questions et envoyez vos photos. SkinView analyse votre peau,
              explique ses besoins, identifie les priorités et construit une routine adaptée à
              votre profil.
            </p>

            <div className="hero-enter hero-enter-delay-3 mt-[18px] flex items-end gap-3">
              <span className="font-serif text-[3.35rem] leading-none tracking-[-0.04em] text-[#173f36]">49 €</span>
              <span className="max-w-[158px] pb-1 text-[11px] leading-[1.35] text-[#52625e]">
                Analyse complète + routine personnalisée
              </span>
            </div>

            <div className="hero-enter hero-enter-delay-3 mt-3.5 w-full sm:max-w-[390px]">
              <ReportCta showNote showArrow />
            </div>
          </div>

          <div className="hero-enter hero-enter-delay-2 relative mt-1 h-[270px] w-full overflow-hidden rounded-[27px] bg-[#e8ddce] shadow-[0_22px_55px_-42px_rgba(23,63,54,0.5)] min-[420px]:h-[300px] sm:h-[330px] lg:mt-0 lg:h-[610px]">
            <img
              src={heroProduct}
              alt="Composition skincare avec un flacon non marqué, du travertin, du lin beige et des feuillages"
              className="h-full w-full object-cover object-[55%_64%] lg:object-[54%_center]"
              width={1122}
              height={1402}
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="border-y border-[#173f36]/10 bg-white/35">
          <div className="mx-auto grid min-h-[84px] max-w-[1180px] grid-cols-2 place-content-center gap-x-4 gap-y-3 px-5 py-3 text-[10px] font-medium text-[#40534e] sm:flex sm:min-h-0 sm:justify-between sm:px-8 sm:py-4 sm:text-[11px]">
            {["Photos confidentielles", "Analyse personnalisée", "Routine sur mesure", "Rapport clair"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#315f54]" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="mx-auto mb-7 max-w-[580px] text-center">
            <h2 className="text-[2.55rem] leading-none tracking-[-0.035em] text-[#173f36] sm:text-5xl">Ce que vous recevez</h2>
            <p className="mx-auto mt-3 max-w-[520px] text-[13px] leading-[1.55] text-[#52625e] sm:text-[15px]">
              Une lecture claire de votre peau et une stratégie concrète pour savoir quoi faire et pourquoi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            {deliverables.map(({ icon: Icon, title, text, featured }) => (
              <article
                key={title}
                className={`min-w-0 rounded-[20px] border p-4 sm:p-6 ${
                  featured
                    ? "border-[#315f54] bg-[#e9efe9] shadow-[0_16px_35px_-32px_rgba(23,63,54,0.8)]"
                    : "border-[#173f36]/10 bg-white/55"
                }`}
              >
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full sm:h-11 sm:w-11 ${featured ? "bg-[#173f36] text-white" : "bg-[#f0ece4] text-[#315f54]"}`}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <h3 className="text-[1.2rem] leading-[1.02] text-[#173f36] sm:text-[1.6rem]">{title}</h3>
                <p className="mt-2 text-[11px] leading-[1.42] text-[#52625e] sm:text-sm">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#173f36]/8 bg-[#f2ece3] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="mb-7 text-center">
            <h2 className="text-[2.45rem] leading-none tracking-[-0.035em] text-[#173f36] sm:text-5xl">Comment ça marche</h2>
          </div>

          <ol className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="min-w-0 rounded-[18px] border border-[#173f36]/10 bg-[#fbf8f3] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173f36] font-sans text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <Icon className="h-4 w-4 text-[#315f54]" aria-hidden="true" />
                </div>
                <h3 className="text-[1.15rem] leading-none text-[#173f36] sm:text-2xl">{title}</h3>
                <p className="mt-2 text-[10.5px] leading-[1.42] text-[#52625e] sm:text-sm">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="overflow-hidden bg-[#fbf8f3] py-12 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-4 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <div>
            <span className="eyebrow">Aperçu du rapport</span>
            <h2 className="mt-3 text-[2.5rem] leading-[0.98] tracking-[-0.035em] text-[#173f36] sm:text-5xl">Votre analyse, expliquée clairement.</h2>
            <p className="mt-3 text-[13px] leading-[1.55] text-[#52625e] sm:text-[15px]">
              Un rapport structuré pour comprendre vos besoins et votre routine personnalisée.
            </p>
            <Link
              to="/exemple-rapport"
              className="group mt-4 inline-flex min-h-10 items-center gap-2 border-b border-[#173f36]/30 text-[12px] font-medium text-[#173f36] transition hover:border-[#173f36] sm:text-sm"
            >
              Voir un exemple de rapport
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mx-auto h-[250px] w-full max-w-[620px] sm:h-[360px]">
            <div className="absolute inset-x-[5%] bottom-0 top-[18%] rounded-[26px] bg-[#e7ddd0]" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-4 grid grid-cols-3 items-end px-1 sm:px-5">
              {reportPages.map((page, index) => (
                <figure
                  key={page.title}
                  className={`relative ${index === 1 ? "z-20 -mx-3 mb-4 sm:-mx-5" : "z-10"} ${page.rotate}`}
                >
                  <div className="overflow-hidden rounded-[4px] border border-white/70 bg-white shadow-[0_18px_38px_-20px_rgba(23,63,54,0.42)]">
                    <img
                      src={page.image}
                      alt={`Extrait du rapport : ${page.title}`}
                      loading="lazy"
                      className="aspect-[0.705] w-full object-cover object-top"
                    />
                  </div>
                  <figcaption className="mt-2 text-center font-serif text-[11px] leading-tight text-[#173f36] sm:text-base">
                    {page.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#ebe5db] py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[980px] px-5 sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 max-w-[650px] text-center">
            <span className="eyebrow">Une logique d’ensemble</span>
            <h2 className="mt-3 text-[2.45rem] leading-[0.98] tracking-[-0.035em] text-[#173f36] sm:text-5xl">Une routine pensée comme un ensemble.</h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[13px] leading-[1.5] text-[#52625e] sm:text-[15px]">
              Chaque actif, chaque fréquence et chaque étape sont choisis pour fonctionner ensemble.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
            {routines.map(({ icon: Icon, period, items }) => (
              <article key={period} className="min-w-0 rounded-[20px] border border-[#173f36]/12 bg-[#fbf8f3] p-4 sm:p-7">
                <div className="mb-3 flex items-center justify-between border-b border-[#173f36]/10 pb-3">
                  <h3 className="text-[1.65rem] leading-none text-[#173f36] sm:text-3xl">{period}</h3>
                  <Icon className="h-[18px] w-[18px] text-[#315f54]" aria-hidden="true" />
                </div>
                <ol className="space-y-2.5">
                  {items.map((item, index) => (
                    <li key={item} className="flex min-w-0 items-baseline gap-2 text-[10.5px] leading-tight text-[#40534e] sm:text-sm">
                      <span className="shrink-0 font-serif text-base text-[#8c7757]">{String(index + 1).padStart(2, "0")}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#173f36] py-10 text-[#f8f4ed] sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="max-w-[720px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#d7c49e]">Notre méthode</span>
            <h2 className="mt-3 text-[2.45rem] leading-[0.98] tracking-[-0.035em] sm:text-5xl">
              Une recommandation cohérente de bout en bout.
            </h2>
          </div>

          <div className="mt-6 grid gap-3.5 border-t border-white/15 pt-5 md:grid-cols-3 md:gap-8">
            {method.map(({ icon: Icon, title, text }) => (
              <article key={title} className="grid grid-cols-[24px_1fr] gap-3 md:block">
                <Icon className="mt-0.5 h-[18px] w-[18px] text-[#d7c49e] md:mb-3" aria-hidden="true" />
                <div>
                  <h3 className="text-[1.25rem] leading-none text-[#f8f4ed] sm:text-2xl">{title}</h3>
                  <p className="mt-1.5 text-[11px] leading-[1.4] text-[#f8f4ed]/70 sm:text-sm">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] py-8 sm:py-14">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-[22px] border border-[#173f36]/12 px-4 py-6 sm:grid-cols-4 sm:px-6">
            {reassurance.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto mb-2 h-[18px] w-[18px] text-[#315f54]" aria-hidden="true" />
                <h3 className="font-sans text-[10.5px] font-semibold leading-tight text-[#173f36] sm:text-xs">{title}</h3>
                <p className="mt-1 text-[9.5px] leading-tight text-[#52625e] sm:text-[11px]">{text}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[650px] text-center text-[10.5px] leading-[1.5] text-[#697672]">
            SkinView est un service de conseil cosmétique. Il ne remplace pas l’avis ou le suivi d’un professionnel de santé.
          </p>
        </div>
      </section>
    </PageShell>
  );
};

export default Index;
