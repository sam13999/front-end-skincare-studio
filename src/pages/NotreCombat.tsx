import { ArrowRight, Blend, Camera, ClipboardList, FlaskConical, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const analysisInputs = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Votre contexte",
    text: "Le questionnaire précise vos habitudes, les produits déjà utilisés, vos préoccupations et vos objectifs.",
  },
  {
    number: "02",
    icon: Camera,
    title: "Les signes visibles",
    text: "Les photos apportent une observation complémentaire sur l’aspect et les zones visibles de votre peau.",
  },
  {
    number: "03",
    icon: Blend,
    title: "Les besoins à relier",
    text: "Réponses, photos et objectifs sont croisés pour distinguer les priorités des éléments secondaires.",
  },
  {
    number: "04",
    icon: FlaskConical,
    title: "Les actifs à évaluer",
    text: "Le rôle, la fréquence, la compatibilité et la complémentarité des actifs sont étudiés dans leur ensemble.",
  },
];

const NotreCombat = () => (
  <PageShell
    title="Pourquoi SkinView existe | Analyse de peau indépendante"
    description="SkinView remet du contexte avant le choix : photos, questionnaire, besoins, actifs et cohérence de la routine sont étudiés ensemble."
  >
    <article>
      <header className="bg-[#f4eee6] py-16 sm:py-24 lg:py-32">
        <div className="site-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
          <div>
            <p className="eyebrow">Pourquoi SkinView existe</p>
            <h1 className="section-title mt-5 max-w-[620px]">
              Une peau n’est pas une tendance.
            </h1>
          </div>
          <p className="max-w-[680px] text-[16px] leading-[1.8] text-[#52625e] sm:text-[18px]">
            L’accès à davantage de conseils skincare n’a pas forcément rendu le choix plus clair.
            Entre les routines vues sur TikTok ou Instagram, les nouveautés permanentes et les
            recommandations génériques, il devient facile d’accumuler des produits sans savoir ce
            dont sa peau a réellement besoin. SkinView remet du contexte avant le choix : partir
            de vos réponses et de vos photos, comprendre les priorités visibles, étudier les actifs
            pertinents et construire une routine sur mesure dont chaque étape a une raison d’être.
          </p>
        </div>
      </header>

      <section className="bg-[#fbfaf7] py-16 sm:py-24">
        <div className="site-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="eyebrow">Le problème</p>
            <h2 className="section-title mt-4 text-[clamp(2.35rem,7vw,4rem)]">Trop de conseils, pas assez de contexte.</h2>
          </div>
          <div className="space-y-5 text-[15px] leading-[1.8] text-[#586761]">
            <p>
              Une vidéo peut présenter un actif intéressant. Une amie peut adorer un sérum. Une
              marque peut proposer une routine complète. Pourtant, aucune de ces informations ne
              suffit à savoir si l’ensemble correspond à votre peau, à sa sensibilité, à vos
              habitudes ou aux soins que vous utilisez déjà.
            </p>
            <p>
              Le problème apparaît lorsque ces conseils sont additionnés sans logique : plusieurs
              exfoliants la même semaine, des actifs qui font double emploi, une fréquence trop
              rapide ou une routine si longue qu’elle devient impossible à suivre.
            </p>
            <p className="font-medium text-[#183e34]">
              Moins de décisions prises au hasard. Davantage de raisons clairement expliquées
              derrière chaque recommandation.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#183e34]/10 bg-[#eee6dc] py-16 sm:py-24" aria-labelledby="method-title">
        <div className="site-container">
          <div className="max-w-[760px]">
            <p className="eyebrow">Comprendre avant de recommander</p>
            <h2 id="method-title" className="section-title mt-4 text-[clamp(2.35rem,7vw,4rem)]">Une lecture croisée, jamais isolée.</h2>
            <p className="section-copy mt-6">
              SkinView ne construit pas une routine à partir d’une seule réponse ou d’une photo
              considérée hors contexte. Plusieurs sources sont rapprochées pour former une lecture
              cohérente du profil.
            </p>
          </div>

          <ol className="mt-12 border-t border-[#183e34]/15">
            {analysisInputs.map(({ number, icon: Icon, title, text }) => (
              <li key={number} className="grid gap-5 border-b border-[#183e34]/15 py-7 sm:grid-cols-[70px_40px_0.75fr_1.25fr] sm:items-start sm:gap-6">
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[#a95c4d]">{number}</span>
                <Icon className="h-5 w-5 text-[#183e34]" aria-hidden="true" />
                <h3 className="font-serif text-2xl leading-none text-[#183e34] sm:text-3xl">{title}</h3>
                <p className="text-sm leading-[1.65] text-[#69766f]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#183e34] py-16 text-[#f8f6f1] sm:py-24">
        <div className="site-container grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
          <div>
            <Leaf className="h-6 w-6 text-[#e0b8a9]" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-[clamp(2.35rem,7vw,4.2rem)] leading-[0.98] tracking-[-0.04em]">
              Construire une routine cohérente, pas une pile de produits.
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-[1.8] text-white/70">
            <p>
              Une routine sur mesure ne se résume pas à associer un nettoyant, un sérum et une
              crème à chaque préoccupation. Chaque étape doit avoir une fonction claire. Les actifs
              doivent être compatibles avec la peau, mais aussi complémentaires entre eux. Leur
              fréquence compte autant que leur présence.
            </p>
            <p>
              Un actif pertinent peut devenir inconfortable s’il est introduit trop vite ou associé
              à d’autres soins poursuivant le même effet. À l’inverse, hydratation, protection et
              progression peuvent rendre une stratégie plus simple et plus facile à suivre.
            </p>
            <p>
              Le rapport rend ces arbitrages visibles : rôle de chaque produit, ordre, fréquence,
              priorités et points de vigilance. Vous pouvez{" "}
              <Link className="font-medium text-white underline decoration-white/30 underline-offset-4" to="/exemple-rapport">
                voir un exemple réel de rapport
              </Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-16 sm:py-24">
        <div className="site-container grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-24">
          <div>
            <p className="eyebrow">Des recommandations indépendantes</p>
            <h2 className="section-title mt-4 text-[clamp(2.35rem,7vw,4rem)]">Une composition doit répondre à un besoin, pas à un partenariat.</h2>
          </div>
          <div className="border-l-2 border-[#a95c4d] pl-6 text-[15px] leading-[1.8] text-[#586761] sm:pl-8">
            <p>
              SkinView n’a pas vocation à favoriser une marque ou un produit particulier. Une
              recommandation doit pouvoir être expliquée par sa composition, le rôle de ses actifs,
              les besoins identifiés et sa place dans la routine complète.
            </p>
            <p className="mt-5">
              Cette indépendance ne signifie pas qu’un produit sera parfait pour tout le monde ;
              elle signifie que le choix repose sur une logique de profil et non sur une affiliation
              commerciale.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#183e34]/10 bg-[#eee6dc] py-16 sm:py-20">
        <div className="site-container grid gap-6 sm:grid-cols-[0.7fr_1.3fr] sm:items-start">
          <h2 className="font-serif text-3xl leading-none text-[#183e34] sm:text-4xl">Ce que SkinView ne remplace pas.</h2>
          <p className="max-w-[720px] text-sm leading-[1.8] text-[#586761] sm:text-[15px]">
            SkinView est un service de conseil cosmétique. L’analyse porte sur les besoins visibles
            et la construction d’une routine de soins ; elle ne constitue pas un diagnostic médical
            et ne remplace pas l’avis, l’examen ou le suivi d’un dermatologue ou d’un autre
            professionnel de santé.
          </p>
        </div>
      </section>
    </article>

    <section className="bg-[#f4eee6] py-16 sm:py-24">
      <div className="site-container text-center">
        <h2 className="section-title text-[clamp(2.35rem,7vw,4rem)]">Commencer par comprendre votre peau.</h2>
        <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-[1.7] text-[#586761]">
          Répondez au questionnaire, transmettez vos photos et recevez une analyse structurée avec
          une routine construite pour votre profil.
        </p>
        <div className="mx-auto mt-8 max-w-[340px]">
          <ReportCta label="Commencer mon analyse" showNote />
        </div>
        <Link to="/exemple-rapport" className="quiet-link mt-6">Voir un exemple de rapport <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </section>
  </PageShell>
);

export default NotreCombat;
