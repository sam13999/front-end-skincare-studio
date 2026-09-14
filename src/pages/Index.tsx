import { ArrowRight, Blend, Camera, Check, ChevronRight, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import heroProduct from "@/assets/hero-product.jpg";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { homepageReportPages } from "@/data/reportPreviewPages";

const PAGE_TITLE = "Analyse de peau & routine sur mesure | SkinView";
const PAGE_DESCRIPTION =
  "Comprenez les besoins de votre peau grâce à une analyse personnalisée et recevez une routine claire, cohérente et adaptée à vos objectifs.";

const valuePoints = [
  {
    number: "01",
    title: "Les besoins d’abord",
    text: "Photos, questionnaire, habitudes, préoccupations et objectifs sont étudiés ensemble.",
  },
  {
    number: "02",
    title: "Les actifs dans leur ensemble",
    text: "Rôle, pertinence, complémentarité, fréquence et tolérance sont pris en compte.",
  },
  {
    number: "03",
    title: "Une routine qui tient debout",
    text: "Chaque étape répond à une fonction précise et trouve sa place matin ou soir.",
  },
  {
    number: "04",
    title: "Des choix expliqués",
    text: "Vous comprenez pourquoi un produit est retenu, comment l’utiliser et ce qu’il vaut mieux éviter.",
  },
];

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Vous partagez",
    text: "Vos photos et vos réponses au questionnaire.",
  },
  {
    number: "02",
    icon: Blend,
    title: "Nous croisons",
    text: "Vos besoins, vos habitudes, vos objectifs et les signes visibles.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Vous recevez",
    text: "Une analyse complète et une routine sur mesure, expliquées clairement.",
  },
];

const Index = () => (
  <PageShell title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
    <section className="overflow-hidden bg-[#f4eee6]">
      <div className="site-container grid gap-0 py-0 sm:gap-7 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-16">
        <div className="order-2 max-w-[590px] lg:order-1">
          <p className="eyebrow reveal-up">L’expertise dermo-cosmétique au service de votre peau</p>
          <h1 className="reveal-up mt-5 max-w-[650px] text-balance font-serif text-[clamp(2.65rem,10vw,5.4rem)] leading-[0.95] tracking-[-0.055em] text-[#183e34]">
            Une analyse de peau complète.
            <span className="block italic">Une routine sur mesure.</span>
          </h1>
          <p className="mt-6 max-w-[540px] text-[16px] leading-[1.7] text-[#52625e] sm:text-[17px]">
            Comprenez les besoins de votre peau grâce à une analyse approfondie et recevez des
            recommandations claires, cohérentes et adaptées à vos objectifs.
          </p>
          <div className="mt-7 flex max-w-[420px] flex-col items-stretch gap-3">
            <ReportCta label="Commencer mon analyse" showNote />
            <Link to="/exemple-rapport" className="quiet-link justify-center self-center">
              Voir un exemple de rapport
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="hero-visual reveal-up order-1 -mx-5 overflow-hidden bg-[#d9cbbb] shadow-[0_30px_75px_-42px_rgba(24,62,52,0.62)] sm:mx-0 sm:rounded-[1.5rem] lg:order-2">
          <img
            src={heroProduct}
            alt="Soin cosmétique dans une lumière naturelle, entouré de matières végétales"
            width={1124}
            height={1400}
            fetchPriority="high"
            className="h-[390px] w-full object-cover object-center sm:h-[540px] lg:h-[680px]"
          />
        </div>
      </div>

      <div className="border-y border-[#183e34]/10 bg-white/35">
        <div className="site-container grid grid-cols-2 gap-y-3 py-5 text-[12px] font-medium text-[#52625e] sm:grid-cols-4 sm:gap-6">
          {[
            { icon: ShieldCheck, text: "Analyse personnalisée" },
            { icon: LockKeyhole, text: "Photos confidentielles" },
            { icon: Check, text: "Routine sur mesure" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#a95c4d]" aria-hidden="true" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-16 sm:py-24" aria-labelledby="difference-title">
      <div className="site-container grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
        <div>
          <p className="eyebrow">Pourquoi SkinView est différent</p>
          <h2 id="difference-title" className="section-title mt-4 max-w-[530px]">
            Chaque peau mérite plus qu’une routine générique.
          </h2>
          <p className="section-copy mt-6">
            Une recommandation ne se résume pas à trouver un produit populaire pour une
            préoccupation isolée. Elle doit rester cohérente avec votre peau, vos habitudes et le
            reste de votre routine.
          </p>
        </div>

        <div className="border-t border-[#183e34]/15">
          {valuePoints.map((point) => (
            <article key={point.number} className="grid gap-3 border-b border-[#183e34]/15 py-6 sm:grid-cols-[58px_1fr] sm:gap-7 sm:py-7">
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[#a95c4d]">{point.number}</span>
              <div>
                <h3 className="font-serif text-[1.65rem] leading-none tracking-[-0.025em] text-[#183e34] sm:text-3xl">{point.title}</h3>
                <p className="mt-2 max-w-[610px] text-sm leading-[1.65] text-[#69766f] sm:text-[15px]">{point.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="comment-ca-marche" className="border-y border-[#183e34]/10 bg-[#eee6dc] py-16 sm:py-24" aria-labelledby="steps-title">
      <div className="site-container">
        <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr] md:items-end">
          <div>
            <p className="eyebrow">Comment ça marche</p>
            <h2 id="steps-title" className="section-title mt-4">Simple à partager.<br />Précis à recevoir.</h2>
          </div>
          <p className="section-copy max-w-[530px] md:justify-self-end">
            Trois étapes pour passer de vos questions à une routine que vous pouvez réellement
            comprendre et suivre.
          </p>
        </div>

        <ol className="mt-12 grid gap-0 border-y border-[#183e34]/15 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <li key={number} className={"relative py-7 md:px-7 md:py-9 " + (index > 0 ? "border-t border-[#183e34]/15 md:border-l md:border-t-0" : "")}>
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[#a95c4d]">{number}</span>
                <Icon className="h-5 w-5 text-[#183e34]" aria-hidden="true" />
              </div>
              <h3 className="mt-8 font-serif text-3xl leading-none text-[#183e34]">{title}</h3>
              <p className="mt-3 max-w-[250px] text-sm leading-[1.65] text-[#69766f]">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-9 flex justify-center">
          <ReportCta label="Commencer mon analyse" className="max-w-[330px]" />
        </div>
      </div>
    </section>

    <section className="overflow-hidden bg-[#fbfaf7] py-16 sm:py-24" aria-labelledby="report-title">
      <div className="site-container grid gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow">Aperçu du rapport</p>
          <h2 id="report-title" className="section-title mt-4">Voyez ce que vous recevez.</h2>
          <p className="section-copy mt-6">
            Un rapport clair pour comprendre votre peau, les priorités retenues et la logique de
            votre routine.
          </p>
          <Link to="/exemple-rapport" className="quiet-link mt-7">
            Découvrir un exemple de rapport
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Link to="/exemple-rapport" className="group relative grid grid-cols-[0.82fr_1fr] items-end gap-3 sm:gap-5" aria-label="Découvrir l’exemple de rapport SkinView">
          <div className="report-frame translate-y-5 rotate-[-3deg] transition duration-700 group-hover:-translate-y-1">
            <img src={homepageReportPages[0].image} alt={homepageReportPages[0].alt} loading="lazy" width="800" height="1135" className="aspect-[0.705] w-full object-cover object-top" />
          </div>
          <div className="z-10 space-y-3">
            <div className="report-frame rotate-[2deg] transition duration-700 group-hover:translate-y-1">
              <img src={homepageReportPages[1].image} alt={homepageReportPages[1].alt} loading="lazy" width="800" height="1135" className="aspect-[0.705] w-full object-cover object-top" />
            </div>
            <div className="report-frame rotate-[-1deg] transition duration-700 group-hover:-translate-y-1">
              <img src={homepageReportPages[2].image} alt={homepageReportPages[2].alt} loading="lazy" width="800" height="1135" className="aspect-[0.705] w-full object-cover object-top" />
            </div>
          </div>
          <span className="absolute -bottom-8 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-[#183e34] px-5 py-3 font-sans text-xs font-semibold text-white sm:inline-flex">
            Voir le rapport complet <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>

    <section className="bg-[#183e34] py-16 text-[#f8f6f1] sm:py-24" aria-labelledby="combat-title">
      <div className="site-container grid gap-8 md:grid-cols-[1fr_0.9fr] md:items-end">
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e0b8a9]">Notre combat</p>
          <h2 id="combat-title" className="mt-5 max-w-[700px] font-serif text-[clamp(2.55rem,8vw,5rem)] leading-[0.96] tracking-[-0.045em]">
            Moins de produits inutiles.<br /><span className="italic">Plus de choix éclairés.</span>
          </h2>
        </div>
        <div>
          <p className="max-w-[470px] text-[15px] leading-[1.7] text-white/70">
            Sortir des tendances copiées, des routines génériques et de l’accumulation pour remettre
            du contexte avant chaque recommandation.
          </p>
          <Link to="/notre-combat" className="mt-7 inline-flex min-h-11 items-center gap-2 border-b border-white/35 font-sans text-sm font-semibold text-white transition hover:border-white">
            Découvrir notre combat <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Index;
