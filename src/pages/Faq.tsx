import { Link } from "react-router-dom";
import { ReportCta } from "@/components/ReportCta";
import PageShell from "@/components/PageShell";

const faqItems = [
  {
    question: "Pourquoi payer alors que certaines marques proposent des diagnostics gratuits ?",
    answer: "Les outils proposés gratuitement par les marques sont généralement conçus autour de leur propre catalogue. SkinView adopte une approche différente : l’analyse est indépendante d’une marque et prend en compte vos photos, vos réponses, vos habitudes, vos objectifs et l’ensemble de votre routine. Les actifs sont étudiés selon leur pertinence, leur complémentarité, leur fréquence et leur place dans la routine avant de sélectionner des produits. Vous payez donc pour une analyse approfondie et une stratégie personnalisée, pas pour un outil destiné à vous orienter vers une gamme.",
  },
  {
    question: "Comment se déroule l’analyse ?",
    answer: "Vous envoyez une ou plusieurs photos dans le parcours prévu à cet effet, répondez au questionnaire, indiquez vos coordonnées puis vérifiez le récapitulatif avant le lancement. Les informations transmises servent à construire votre rapport personnalisé.",
  },
  {
    question: "Combien de temps faut-il ?",
    answer: "Le temps dépend du parcours de transmission et du traitement nécessaire à votre rapport. Le questionnaire vous guide étape par étape ; une fois l’analyse terminée, le rapport est affiché et envoyé à l’adresse indiquée lorsque l’envoi est disponible.",
  },
  {
    question: "Qu’est-ce que je reçois exactement ?",
    answer: "Vous recevez un rapport structuré avec les observations, le profil, les objectifs, la stratégie, les recommandations, les produits retenus, les actifs, la fréquence et l’ordre d’utilisation. Les formats HTML et PDF sont proposés lorsque la génération a abouti.",
  },
  {
    question: "Les recommandations conviennent-elles aux peaux sensibles ?",
    answer: "La sensibilité et la tolérance déclarées dans le questionnaire font partie des éléments pris en compte. En cas d’irritation importante, de réaction inhabituelle ou de problème persistant, demandez l’avis d’un professionnel de santé.",
  },
  {
    question: "Mes photos et mes données sont-elles confidentielles ?",
    answer: "Les photos sont transmises dans le cadre de votre analyse et servent à générer votre rapport. Elles ne sont pas destinées à être affichées publiquement. Indiquez uniquement les informations nécessaires au parcours.",
  },
  {
    question: "Pourquoi dois-je envoyer des photos ?",
    answer: "Les photos apportent une observation complémentaire sur les signes visibles et les zones de votre peau. Elles sont croisées avec vos réponses, vos habitudes et vos objectifs ; elles ne suffisent pas à elles seules à déterminer une routine.",
  },
  {
    question: "Puis-je indiquer les produits que j’utilise déjà ?",
    answer: "Oui. Le questionnaire permet d’indiquer les catégories de produits que vous utilisez régulièrement. Ces informations aident à tenir compte de votre routine existante et de la complémentarité des actifs.",
  },
  {
    question: "SkinView remplace-t-il un dermatologue ?",
    answer: "Non. SkinView est un service de conseil cosmétique. Il ne constitue pas un diagnostic médical et ne remplace pas l’avis, l’examen ou le suivi d’un dermatologue ou d’un autre professionnel de santé.",
  },
  {
    question: "Puis-je refaire une analyse plus tard ?",
    answer: "Oui, vous pouvez recommencer le parcours avec de nouvelles photos et des réponses actualisées afin de recevoir une nouvelle analyse correspondant à votre situation du moment.",
  },
];

const Faq = () => (
  <PageShell
    title="Questions fréquentes sur l’analyse de peau | SkinView"
    description="Toutes les réponses sur le fonctionnement de l’analyse de peau SkinView, les photos, la confidentialité, le rapport et les recommandations."
  >
    <section className="bg-[#f4eee6] py-16 sm:py-24 lg:py-32">
      <div className="site-container grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-20">
        <div>
          <p className="eyebrow">Questions fréquentes</p>
          <h1 className="section-title mt-5">Avancer en toute confiance.</h1>
        </div>
        <p className="max-w-[650px] text-[16px] leading-[1.8] text-[#52625e] sm:text-[18px]">
          Le fonctionnement, le contenu du rapport et les limites du service, expliqués simplement.
        </p>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-12 sm:py-20">
      <div className="site-container max-w-[920px]">
        <div className="divide-y divide-[#183e34]/15 border-y border-[#183e34]/15">
          {faqItems.map((item, index) => (
            <details key={item.question} open={index === 0} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 font-serif text-xl leading-tight text-[#183e34] marker:hidden sm:text-2xl">
                <span>{item.question}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#183e34]/20 font-sans text-xl leading-none text-[#a95c4d] transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-[760px] pb-6 pr-10 text-[15px] leading-[1.75] text-[#69766f]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>

    <section className="border-t border-[#183e34]/10 bg-[#eee6dc] py-16 text-center sm:py-20">
      <div className="site-container">
        <h2 className="section-title text-[clamp(2.35rem,7vw,4rem)]">Prêt à comprendre votre peau ?</h2>
        <div className="mx-auto mt-8 max-w-[350px]"><ReportCta label="Commencer mon analyse" showNote /></div>
        <Link to="/exemple-rapport" className="quiet-link mt-6">Voir un exemple de rapport <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  </PageShell>
);

export default Faq;
