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
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import heroProduct from "@/assets/hero-product.jpg";
import analysePeauImg from "@/assets/report/analyse-peau.jpg";
import lectureExpressImg from "@/assets/report/lecture-express.jpg";
import routineMatinImg from "@/assets/report/routine-matin.jpg";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const PAGE_TITLE = "Analyse de peau & routine skincare sur mesure | SkinView";
const PAGE_DESCRIPTION =
  "Analysez votre peau à partir de vos photos et réponses. SkinView identifie vos besoins et construit une routine skincare sur mesure adaptée à votre profil.";

const deliverables = [
  {
    icon: ScanLine,
    title: "Analyse détaillée de votre peau",
    text: "Une lecture structurée des signes visibles et des éléments importants à comprendre.",
  },
  {
    icon: MessageCircleMore,
    title: "Vos besoins expliqués",
    text: "Des explications claires sur les besoins de votre peau et les priorités à retenir.",
  },
  {
    icon: ShieldCheck,
    title: "Priorités & points de vigilance",
    text: "Ce qu’il vaut mieux prioriser, limiter ou éviter selon votre profil.",
  },
  {
    icon: Sparkles,
    title: "Votre routine sur mesure",
    text: "Des produits, actifs et fréquences sélectionnés pour former une routine cohérente adaptée à votre peau.",
    featured: true,
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Questionnaire",
    text: "Vos habitudes, vos produits actuels, vos préoccupations et vos objectifs.",
  },
  {
    icon: Camera,
    title: "Photos",
    text: "Des photos nettes permettent d’observer les signes visibles de votre peau.",
  },
  {
    icon: Blend,
    title: "Analyse croisée",
    text: "Nous croisons vos réponses, vos photos et les données utiles sur les actifs skincare.",
  },
  {
    icon: FileText,
    title: "Rapport sur mesure",
    text: "Vous recevez une analyse claire, des explications concrètes et votre routine sur mesure.",
  },
];

const reportPages = [
  {
    title: "Votre analyse",
    image: analysePeauImg,
    alt: "Exemple de page d’analyse de peau SkinView",
    rotate: "-rotate-[3deg]",
  },
  {
    title: "Comprendre votre peau",
    image: lectureExpressImg,
    alt: "Exemple de page expliquant les besoins de la peau dans un rapport SkinView",
    rotate: "rotate-[1deg]",
  },
  {
    title: "Votre routine",
    image: routineMatinImg,
    alt: "Exemple de page de routine skincare sur mesure SkinView",
    rotate: "rotate-[3deg]",
  },
];

const analysisValue = [
  {
    icon: Blend,
    title: "Analyse croisée",
    text: "Vos réponses et vos photos sont étudiées ensemble pour comprendre votre profil dans son ensemble.",
  },
  {
    icon: ScanLine,
    title: "Lecture des besoins",
    text: "Nous identifions les priorités, les points de vigilance et ce qui peut expliquer certaines réactions.",
  },
  {
    icon: FlaskConical,
    title: "Analyse des actifs",
    text: "Rôle, compatibilité, complémentarité et fréquence sont pris en compte avant de construire la routine.",
  },
  {
    icon: Sparkles,
    title: "Cohérence de la routine",
    text: "Chaque étape a une fonction claire et doit fonctionner avec le reste de votre routine de soin visage.",
  },
];

const reassurance = [
  { icon: LockKeyhole, title: "Données sécurisées", text: "Confidentialité" },
  { icon: FlaskConical, title: "Analyse croisée", text: "Photos et réponses" },
  { icon: Sparkles, title: "Recommandations sur mesure", text: "Actifs et fréquences" },
  { icon: FileText, title: "Rapport clair", text: "Facile à suivre" },
];

const Index = () => (
  <PageShell title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
    <section className="overflow-hidden bg-[#f5f0e8]">
      <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-5 pb-5 pt-7 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:px-8 lg:py-14">
        <div className="relative z-10 max-w-[610px]">
          <div className="hero-enter mb-[18px] inline-flex h-8 items-center gap-2 rounded-full border border-[#173f36]/12 bg-white/55 px-[13px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#315f54]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Analyse de peau en ligne
          </div>

          <h1 className="hero-enter hero-enter-delay-1 text-[clamp(2.3rem,11.5vw,2.85rem)] leading-[0.95] tracking-[-0.045em] text-[#173f36] sm:text-[4rem] lg:text-[4.1rem]">
            <span className="block">Comprenez votre peau.</span>
            <span className="block">Recevez une routine</span>
            <em className="block font-normal">sur mesure.</em>
          </h1>

          <p className="hero-enter hero-enter-delay-2 mt-5 text-[15px] font-semibold leading-snug text-[#173f36] sm:text-[16px]">
            Une analyse croisée de votre peau, de vos habitudes et de vos besoins.
          </p>
          <p className="hero-enter hero-enter-delay-2 mt-2.5 max-w-[560px] text-[13.5px] leading-[1.55] text-[#52625e] sm:text-[15px]">
            Répondez à un questionnaire détaillé et envoyez vos photos. SkinView croise ces
            informations pour analyser votre peau, expliquer ses besoins, identifier les priorités,
            étudier les actifs pertinents et construire une routine sur mesure.
          </p>

          <div className="hero-enter hero-enter-delay-3 mt-[18px] flex items-end gap-3">
            <span className="font-serif text-[3.35rem] leading-none tracking-[-0.04em] text-[#173f36]">49 €</span>
            <span className="max-w-[158px] pb-1 text-[11px] leading-[1.35] text-[#52625e]">
              Analyse complète + routine sur mesure
            </span>
          </div>

          <div className="hero-enter hero-enter-delay-3 mt-3.5 w-full sm:max-w-[390px]">
            <ReportCta label="Obtenir mon analyse et ma routine" showNote showArrow />
          </div>
        </div>

        <div className="hero-enter hero-enter-delay-2 relative mt-1 h-[270px] w-full overflow-hidden rounded-[27px] bg-[#e8ddce] shadow-[0_22px_55px_-42px_rgba(23,63,54,0.5)] min-[420px]:h-[300px] sm:h-[330px] lg:mt-0 lg:h-[610px]">
          <img
            src={heroProduct}
            alt="Flacon de soin non marqué posé sur du travertin, entouré de lin beige et de feuillages"
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
            Une analyse de peau claire, des choix expliqués et une routine conçue pour votre profil.
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
            Un rapport structuré pour comprendre votre peau, les choix proposés et votre routine sur mesure.
          </p>
          <Link
            to="/exemple-rapport"
            className="group mt-4 inline-flex min-h-10 items-center gap-2 border-b border-[#173f36]/30 text-[12px] font-medium text-[#173f36] transition hover:border-[#173f36] sm:text-sm"
          >
            Voir un exemple de rapport SkinView
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
                    alt={page.alt}
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

    <section className="bg-[#ebe5db] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[980px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-7 max-w-[720px] text-center">
          <span className="eyebrow">Une analyse complète à 49 €</span>
          <h2 className="mt-3 text-[2.45rem] leading-[0.98] tracking-[-0.035em] text-[#173f36] sm:text-5xl">
            Pourquoi l’analyse va plus loin qu’une simple routine.
          </h2>
          <p className="mx-auto mt-3 max-w-[650px] text-[13px] leading-[1.55] text-[#52625e] sm:text-[15px]">
            Vous ne recevez pas une liste générique de produits. Chaque recommandation découle
            d’une analyse croisée de votre peau, de vos besoins et des actifs présents dans les produits.
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#173f36]/12 bg-[#fbf8f3]">
          {analysisValue.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className={`grid grid-cols-[38px_1fr] gap-3 p-4 sm:grid-cols-[44px_1fr] sm:p-5 ${index < analysisValue.length - 1 ? "border-b border-[#173f36]/10" : ""}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9efe9] text-[#315f54] sm:h-11 sm:w-11">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[1.25rem] leading-none text-[#173f36] sm:text-2xl">{title}</h3>
                <p className="mt-1.5 text-[11px] leading-[1.45] text-[#52625e] sm:text-sm">{text}</p>
              </div>
            </article>
          ))}
        </div>

        <aside className="mt-4 rounded-[24px] bg-[#173f36] p-5 text-[#f8f4ed] sm:p-7">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#d7c49e]">Recommandations indépendantes</span>
          <h3 className="mt-2 text-[1.65rem] leading-[1.02] sm:text-3xl">Guidées par votre peau, pas par une marque.</h3>
          <p className="mt-3 max-w-[760px] text-[11.5px] leading-[1.55] text-white/72 sm:text-sm">
            SkinView n’a aucun partenariat avec des marques ou des produits. Une recommandation
            repose uniquement sur une composition adaptée au besoin identifié et sur sa cohérence
            avec l’ensemble de la routine proposée.
          </p>
        </aside>
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

export default Index;
