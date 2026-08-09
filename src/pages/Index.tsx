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
  Sun,
  Moon,
} from "lucide-react";
import heroProduct from "@/assets/hero-product.jpg";
import lectureExpressImg from "@/assets/report/lecture-express.jpg";
import analysePeauImg from "@/assets/report/analyse-peau.jpg";
import routineMatinImg from "@/assets/report/routine-matin.jpg";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const deliverables = [
  {
    icon: ScanLine,
    title: "Analyse détaillée de votre peau",
    text: "Une lecture structurée de ce que votre peau montre et des points importants à comprendre.",
  },
  {
    icon: MessageCircleMore,
    title: "Vos besoins expliqués",
    text: "Nous expliquons pourquoi votre peau réagit ainsi et ce dont elle a réellement besoin.",
  },
  {
    icon: ShieldCheck,
    title: "Priorités & points de vigilance",
    text: "Ce qu’il faut traiter en priorité, ce qu’il faut éviter et les erreurs qui peuvent ralentir les résultats.",
  },
  {
    icon: Sparkles,
    title: "Votre routine personnalisée",
    text: "Des produits, actifs, fréquences et étapes sélectionnés selon votre peau, vos besoins et votre quotidien.",
    featured: true,
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Questionnaire",
    text: "Quelques questions sur votre peau, vos habitudes et vos préoccupations.",
  },
  {
    icon: Camera,
    title: "Photos",
    text: "Vous transmettez quelques photos prises dans les conditions demandées.",
  },
  {
    icon: Blend,
    title: "Analyse croisée",
    text: "Nous croisons vos réponses, vos photos et les informations utiles sur les actifs skincare.",
  },
  {
    icon: FileText,
    title: "Rapport + routine",
    text: "Vous recevez une analyse détaillée et une routine construite spécifiquement pour votre profil.",
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
    items: ["Nettoyage si nécessaire", "Actif ciblé", "Hydratation", "Protection solaire"],
  },
  {
    icon: Moon,
    period: "Soir",
    items: ["Nettoyage", "Actif adapté", "Traitement selon la fréquence", "Hydratation"],
  },
];

const method = [
  {
    icon: ScanLine,
    title: "Besoins de la peau",
    text: "Photos et réponses permettent d’identifier les besoins visibles et les priorités.",
  },
  {
    icon: FlaskConical,
    title: "Analyse des actifs",
    text: "Rôle, concentration, fréquence et compatibilité guident la construction de la routine.",
  },
  {
    icon: Blend,
    title: "Complémentarité",
    text: "Chaque étape a une fonction claire, sans multiplier inutilement les produits.",
  },
];

const Index = () => {
  return (
    <PageShell
      title="SkinView — Analyse de peau & routine skincare personnalisée"
      description="Envoyez vos photos, répondez à quelques questions et recevez une analyse détaillée de votre peau avec une routine skincare personnalisée."
    >
      <section className="relative overflow-hidden bg-[#f5f0e8]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-9 px-5 pb-16 pt-10 max-[359px]:pt-5 sm:px-6 sm:pt-14 lg:min-h-[760px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8 lg:py-16">
          <div className="relative z-10 max-w-[620px]">
            <div className="hero-enter mb-6 inline-flex items-center gap-2 rounded-full border border-[#173f36]/12 bg-white/55 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#315f54] max-[359px]:mb-5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Votre peau, votre routine
            </div>

            <h1 className="hero-enter hero-enter-delay-1 max-w-[580px] text-[clamp(2.55rem,12vw,4.4rem)] leading-[0.94] tracking-[-0.045em] text-[#173f36] max-[359px]:text-[2.35rem] sm:text-[4.5rem] lg:text-[5.15rem]">
              Recevez une routine personnalisée <em className="font-normal">pensée pour votre peau.</em>
            </h1>

            <p className="hero-enter hero-enter-delay-2 mt-6 text-base font-medium leading-snug text-[#173f36] max-[359px]:mt-5 max-[359px]:text-sm sm:text-lg">
              Comprenez votre peau. Agissez avec clarté.
            </p>
            <p className="hero-enter hero-enter-delay-2 mt-3 max-w-[550px] text-[15px] leading-[1.65] text-[#40534e] max-[359px]:hidden sm:text-base">
              Répondez à quelques questions et envoyez vos photos. SkinView analyse votre peau,
              explique ses besoins, identifie les priorités et construit une routine adaptée à
              votre profil.
            </p>

            <p className="hero-enter hero-enter-delay-2 mt-2 hidden text-[14px] leading-[1.5] text-[#40534e] max-[359px]:block">
              Répondez à quelques questions et envoyez vos photos. SkinView croise ces informations
              pour comprendre votre peau et construire votre routine.
            </p>

            <div className="hero-enter hero-enter-delay-3 mt-7 flex items-end gap-3 border-t border-[#173f36]/12 pt-6 max-[359px]:mt-5 max-[359px]:pt-4">
              <span className="font-serif text-[3.5rem] leading-none tracking-[-0.04em] text-[#173f36]">49 €</span>
              <span className="max-w-[170px] pb-1 text-xs leading-snug text-[#52625e]">
                Analyse complète + routine personnalisée
              </span>
            </div>

            <div className="hero-enter hero-enter-delay-3 mt-5 w-full sm:max-w-[390px]">
              <ReportCta showNote />
            </div>
          </div>

          <div className="hero-enter hero-enter-delay-2 relative mx-auto w-full max-w-[580px] lg:max-w-none">
            <div className="absolute -inset-4 rounded-[36px] border border-[#173f36]/8 sm:-inset-5" aria-hidden="true" />
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[28px] bg-[#e8ddce] shadow-[0_28px_70px_-45px_rgba(23,63,54,0.5)] sm:aspect-[4/3] lg:aspect-[4/5]">
              <img
                src={heroProduct}
                alt="Composition skincare avec un flacon non marqué, du travertin, du lin beige et des feuillages"
                className="h-full w-full object-cover object-[56%_64%] lg:object-[54%_center]"
                width={1152}
                height={1440}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#173f36]/8 via-transparent to-white/5" />
            </div>
          </div>
        </div>

        <div className="border-y border-[#173f36]/10 bg-white/35">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-7 gap-y-3 px-5 py-4 text-[11px] font-medium text-[#40534e] sm:justify-between sm:px-8">
            {[
              "Photos confidentielles",
              "Analyse personnalisée",
              "Routine sur mesure",
              "Rapport clair",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#315f54]" aria-hidden="true" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-[620px] sm:mb-14">
            <span className="eyebrow">Votre rapport personnalisé</span>
            <h2 className="section-title mt-4">Ce que vous recevez</h2>
            <p className="section-copy mt-4">
              Une lecture claire de votre peau, puis une stratégie concrète pour savoir quoi faire
              et pourquoi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            {deliverables.map(({ icon: Icon, title, text, featured }) => (
              <article
                key={title}
                className={`group rounded-[24px] border p-6 transition duration-300 sm:p-7 ${
                  featured
                    ? "border-[#315f54] bg-[#e9efe9] shadow-[0_18px_45px_-38px_rgba(23,63,54,0.8)]"
                    : "border-[#173f36]/10 bg-white/55 hover:-translate-y-0.5 hover:border-[#173f36]/25"
                }`}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${featured ? "bg-[#173f36] text-white" : "bg-[#f0ece4] text-[#315f54]"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-[1.65rem] leading-[1.03] text-[#173f36] sm:text-[1.8rem]">{title}</h3>
                <p className="mt-3 max-w-[430px] text-sm leading-relaxed text-[#52625e]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#173f36]/8 bg-[#f2ece3] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="mb-11 text-center sm:mb-14">
            <span className="eyebrow">Simple et guidé</span>
            <h2 className="section-title mt-4">Comment ça marche</h2>
          </div>

          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="relative rounded-[22px] border border-[#173f36]/10 bg-[#fbf8f3] p-6 sm:p-7">
                <div className="mb-7 flex items-center justify-between">
                  <span className="font-serif text-3xl text-[#315f54]">{String(index + 1).padStart(2, "0")}</span>
                  <Icon className="h-5 w-5 text-[#315f54]" aria-hidden="true" />
                </div>
                <h3 className="text-[1.55rem] leading-none text-[#173f36]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#52625e]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="overflow-hidden bg-[#fbf8f3] py-20 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1120px] items-center gap-14 px-5 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:px-8">
          <div>
            <span className="eyebrow">Aperçu du rapport</span>
            <h2 className="section-title mt-4">Voyez clairement ce que votre peau vous dit.</h2>
            <p className="section-copy mt-5">
              Un rapport clair, structuré et personnalisé, conçu pour vous permettre de comprendre
              les choix proposés — pas simplement suivre une liste de produits.
            </p>
            <Link
              to="/exemple-rapport"
              className="group mt-7 inline-flex min-h-11 items-center gap-2 border-b border-[#173f36]/30 text-sm font-medium text-[#173f36] transition hover:border-[#173f36]"
            >
              Voir un exemple de rapport
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[650px] pb-8 pt-4">
            <div className="absolute inset-x-[7%] bottom-0 top-[12%] rounded-[30px] bg-[#e7ddd0]" aria-hidden="true" />
            <div className="relative grid grid-cols-3 items-end gap-0 px-1 sm:px-5">
              {reportPages.map((page, index) => (
                <figure
                  key={page.title}
                  className={`relative ${index === 1 ? "z-20 -mx-3 mb-5 sm:-mx-5" : "z-10"} ${page.rotate}`}
                >
                  <div className="overflow-hidden rounded-[5px] border border-white/70 bg-white shadow-[0_20px_45px_-22px_rgba(23,63,54,0.42)]">
                    <img
                      src={page.image}
                      alt={`Extrait du rapport : ${page.title}`}
                      loading="lazy"
                      className="aspect-[0.705] h-auto w-full object-cover object-top"
                    />
                  </div>
                  <figcaption className="mt-4 text-center font-serif text-[0.9rem] leading-tight text-[#173f36] sm:text-lg">
                    {page.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#ebe5db] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="mx-auto mb-11 max-w-[680px] text-center sm:mb-14">
            <span className="eyebrow">Une logique d’ensemble</span>
            <h2 className="section-title mt-4">Pas une routine générique.</h2>
            <p className="section-copy mx-auto mt-4">Votre routine est construite à partir de votre peau.</p>
          </div>

          <div className="mx-auto grid max-w-[900px] gap-4 md:grid-cols-2 md:gap-5">
            {routines.map(({ icon: Icon, period, items }) => (
              <article key={period} className="rounded-[26px] border border-[#173f36]/12 bg-[#fbf8f3] p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-[#173f36]/10 pb-5">
                  <h3 className="text-[2rem] leading-none text-[#173f36]">{period}</h3>
                  <Icon className="h-5 w-5 text-[#315f54]" aria-hidden="true" />
                </div>
                <ol className="space-y-4">
                  {items.map((item, index) => (
                    <li key={item} className="flex items-baseline gap-4 text-sm text-[#40534e]">
                      <span className="font-serif text-xl text-[#8c7757]">{String(index + 1).padStart(2, "0")}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-[720px] text-center text-sm leading-relaxed text-[#52625e]">
            Exemple illustratif. Nous ne sélectionnons pas des produits isolément : nous
            construisons une routine cohérente dans son ensemble, selon les fréquences et la
            tolérance de votre peau.
          </p>
        </div>
      </section>

      <section className="bg-[#173f36] py-20 text-[#f8f4ed] sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-[760px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#d7c49e]">Notre méthode</span>
            <h2 className="mt-4 text-[clamp(2.35rem,7vw,4.4rem)] leading-[0.98] tracking-[-0.035em]">
              Une recommandation ne vaut que si l’ensemble est cohérent.
            </h2>
          </div>

          <div className="grid gap-8 border-t border-white/15 pt-10 md:grid-cols-3 md:gap-10">
            {method.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon className="mb-5 h-5 w-5 text-[#d7c49e]" aria-hidden="true" />
                <h3 className="text-[1.55rem] leading-tight text-[#f8f4ed]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#f8f4ed]/70">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f2ea] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[820px] px-5 text-center sm:px-6">
          <LockKeyhole className="mx-auto mb-6 h-6 w-6 text-[#315f54]" aria-hidden="true" />
          <h2 className="section-title">Prête à mieux comprendre votre peau ?</h2>
          <p className="section-copy mx-auto mt-4 max-w-[570px]">
            Votre analyse complète et votre routine personnalisée, réunies dans un rapport clair.
          </p>
          <div className="mt-8">
            <div className="font-serif text-5xl leading-none text-[#173f36]">49 €</div>
            <div className="mt-2 text-xs text-[#52625e]">Paiement unique</div>
          </div>
          <div className="mx-auto mt-6 w-full sm:max-w-[390px]">
            <ReportCta showNote />
          </div>
          <p className="mx-auto mt-9 max-w-[650px] border-t border-[#173f36]/10 pt-7 text-[11px] leading-relaxed text-[#697672]">
            SkinView est un service de conseil cosmétique. Il ne remplace pas l’avis ou le suivi
            d’un professionnel de santé.
          </p>
        </div>
      </section>
    </PageShell>
  );
};

export default Index;
