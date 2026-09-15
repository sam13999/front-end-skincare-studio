import { ArrowRight, Camera, ClipboardList, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const steps = [
  {
    number: "1",
    icon: Camera,
    title: "Vous partagez vos photos",
    text: "Quelques photos suffisent pour observer votre peau sous différents angles, en toute sécurité.",
  },
  {
    number: "2",
    icon: ClipboardList,
    title: "Vous répondez au questionnaire",
    text: "Vos habitudes, vos préoccupations et vos objectifs nous aident à comprendre votre peau dans son contexte.",
  },
  {
    number: "3",
    icon: FileText,
    title: "Vous recevez votre analyse complète",
    text: "Une analyse claire et pédagogique, avec des recommandations personnalisées et une routine sur mesure.",
  },
];

const CommentCaMarche = () => (
  <PageShell
    title="Comment ça marche ? | SkinView"
    description="Une expérience simple et guidée pour mieux comprendre votre peau et recevoir une routine adaptée."
  >
    <section className="bg-[#f4eee6] py-10 sm:py-20 lg:py-28">
      <div className="site-container max-w-[780px]">
        <p className="eyebrow">Comment ça marche ?</p>
        <h1 className="section-title mt-4 max-w-[640px]">Une expérience simple et guidée pour mieux comprendre votre peau.</h1>
        <p className="section-copy mt-6 max-w-[620px]">
          En quelques étapes, vous partagez les informations utiles à votre analyse et recevez des recommandations réellement adaptées à votre situation.
        </p>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-12 sm:py-20">
      <div className="site-container max-w-[820px]">
        <ol className="divide-y divide-[#183e34]/15 border-y border-[#183e34]/15">
          {steps.map(({ number, icon: Icon, title, text }) => (
            <li key={number} className="grid gap-5 py-7 sm:grid-cols-[58px_1fr] sm:gap-7 sm:py-9">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a95c4d] font-serif text-2xl text-white">{number}</div>
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-serif text-2xl leading-tight text-[#183e34] sm:text-3xl">{title}</h2>
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-[#a95c4d]" aria-hidden="true" />
                </div>
                <p className="mt-3 max-w-[580px] text-[15px] leading-[1.7] text-[#69766f]">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 border border-[#183e34]/10 bg-[#f4eee6] p-6 sm:p-8">
          <p className="eyebrow">Votre rapport</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#183e34]">Tout est expliqué, du profil aux produits.</h2>
          <p className="mt-4 max-w-[650px] text-[15px] leading-[1.7] text-[#69766f]">
            Vous y retrouvez les observations, le profil, les objectifs, la stratégie, les recommandations, les produits, les actifs, la fréquence et l’ordre d’utilisation.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 text-center">
          <ReportCta label="Commencer mon analyse" showNote />
          <Link to="/exemple-rapport" className="quiet-link">Voir un exemple de rapport <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  </PageShell>
);

export default CommentCaMarche;
