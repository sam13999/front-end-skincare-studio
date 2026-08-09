import { ArrowRight, Blend, Camera, ClipboardList, FlaskConical, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";

const analysisInputs = [
  {
    icon: ClipboardList,
    title: "Votre contexte",
    text: "Le questionnaire précise vos habitudes, les produits déjà utilisés, vos préoccupations et vos objectifs.",
  },
  {
    icon: Camera,
    title: "Les signes visibles",
    text: "Les photos apportent une observation complémentaire sur l’aspect et les zones visibles de votre peau.",
  },
  {
    icon: Blend,
    title: "Les besoins à relier",
    text: "Réponses, photos et objectifs sont croisés pour distinguer les priorités des éléments secondaires.",
  },
  {
    icon: FlaskConical,
    title: "Les actifs à évaluer",
    text: "Le rôle, la fréquence, la compatibilité et la complémentarité des actifs sont étudiés dans leur ensemble.",
  },
];

const NotreCombat = () => (
  <PageShell
    title="Comprendre sa peau et construire une routine adaptée | SkinView"
    description="SkinView croise questionnaire, photos, besoins et actifs pour vous aider à comprendre votre peau et construire une routine skincare adaptée."
  >
    <article>
      <header className="bg-[#f5f0e8] pb-14 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-[850px] px-5 text-center sm:px-6">
          <span className="eyebrow">Pourquoi SkinView existe</span>
          <h1 className="mt-4 font-serif text-[2.7rem] leading-[0.96] tracking-[-0.04em] text-[#173f36] sm:text-5xl lg:text-[4rem]">
            Comprendre sa peau pour construire une{" "}
            <em className="font-normal">routine skincare adaptée.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[720px] font-sans text-[14px] leading-[1.7] text-[#52625e] sm:text-base">
            SkinView est né d’un constat simple : l’accès à davantage de conseils skincare n’a pas
            forcément rendu le choix plus clair. Entre les routines vues sur TikTok ou Instagram,
            les nouveautés permanentes et les recommandations génériques, il devient facile
            d’accumuler des produits sans savoir ce dont sa peau a réellement besoin. Notre rôle
            est de remettre du contexte avant le choix : partir de vos réponses et de vos photos,
            comprendre les priorités visibles, étudier les actifs pertinents et construire une
            routine sur mesure dont chaque étape a une raison d’être.
          </p>
        </div>
      </header>

      <section className="bg-[#fbf8f3] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1000px] gap-8 px-5 sm:px-6 md:grid-cols-[0.82fr_1.18fr] md:items-start lg:px-8">
          <div>
            <span className="eyebrow">Le problème</span>
            <h2 className="mt-3 font-serif text-[2.35rem] leading-none text-[#173f36] sm:text-4xl">
              Trop de conseils, pas assez de contexte
            </h2>
          </div>
          <div className="space-y-4 font-sans text-sm leading-[1.75] text-[#52625e] sm:text-[15px]">
            <p>
              Une vidéo peut présenter un actif intéressant. Une amie peut adorer un sérum. Une
              marque peut proposer une routine complète. Pourtant, aucune de ces informations ne
              suffit à savoir si l’ensemble correspond à votre peau, à sa sensibilité, à vos
              habitudes ou aux soins que vous utilisez déjà.
            </p>
            <p>
              Le problème n’est pas l’existence de ces conseils. Il apparaît lorsqu’ils sont
              additionnés sans logique : plusieurs exfoliants la même semaine, des actifs qui font
              double emploi, une fréquence trop rapide ou une routine si longue qu’elle devient
              impossible à suivre. Acheter un produit adapté à une préoccupation isolée ne garantit
              pas qu’il s’intègre correctement au reste du soin du visage.
            </p>
            <p>
              SkinView défend une approche plus lisible : moins de décisions prises au hasard, et
              davantage de raisons clairement expliquées derrière chaque recommandation.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#173f36]/10 bg-[#eee8de] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[820px] px-5 sm:px-6">
          <span className="eyebrow">Une peau n’est pas une tendance</span>
          <h2 className="mt-3 font-serif text-[2.35rem] leading-none text-[#173f36] sm:text-4xl">
            La routine d’une autre personne n’est pas forcément la vôtre
          </h2>
          <div className="mt-6 space-y-4 font-sans text-sm leading-[1.75] text-[#52625e] sm:text-[15px]">
            <p>
              Deux personnes peuvent parler de peau mixte et avoir des besoins très différents.
              L’une peut surtout observer des imperfections et des pores visibles ; l’autre peut
              connaître des tiraillements, des rougeurs ou une sensibilité qui limite la fréquence
              de certains actifs. Le climat, le maquillage, le nettoyage, les habitudes et les
              produits déjà présents dans la salle de bains changent aussi la manière dont une
              routine doit être construite.
            </p>
            <p>
              Connaître son type de peau peut donner un premier repère, mais ce n’est pas une réponse
              complète. Il faut également regarder les signes visibles, les réactions rapportées,
              les objectifs et la tolérance. C’est cette lecture plus nuancée qui permet de choisir
              des produits adaptés à sa peau sans transformer une tendance générale en règle
              personnelle.
            </p>
            <p>
              Pour approfondir cette démarche, vous pouvez aussi consulter notre guide consacré aux{" "}
              <Link className="font-medium text-[#173f36] underline decoration-[#173f36]/30 underline-offset-4" to="/comprendre-sa-peau">
                signes qui aident à reconnaître les besoins de sa peau
              </Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px] text-center">
            <span className="eyebrow">Comprendre avant de recommander</span>
            <h2 className="mt-3 font-serif text-[2.35rem] leading-none text-[#173f36] sm:text-4xl">
              Une analyse croisée, pas un score isolé
            </h2>
            <p className="mt-5 font-sans text-sm leading-[1.7] text-[#52625e] sm:text-[15px]">
              SkinView ne construit pas une routine à partir d’une seule réponse ou d’une photo
              considérée hors contexte. L’analyse de peau en ligne croise plusieurs sources pour
              former une lecture cohérente du profil.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {analysisInputs.map(({ icon: Icon, title, text }) => (
              <section key={title} className="rounded-[22px] border border-[#173f36]/10 bg-[#f5f0e8] p-5 sm:p-6">
                <Icon className="h-5 w-5 text-[#315f54]" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-2xl leading-none text-[#173f36]">{title}</h3>
                <p className="mt-3 font-sans text-[13px] leading-[1.6] text-[#52625e]">{text}</p>
              </section>
            ))}
          </div>

          <p className="mx-auto mt-7 max-w-[760px] text-center font-sans text-sm leading-[1.7] text-[#52625e]">
            Cette méthode permet d’expliquer ce qui est prioritaire, ce qu’il vaut mieux limiter et
            pourquoi certains choix sont écartés. Vous pouvez{" "}
            <Link className="font-medium text-[#173f36] underline decoration-[#173f36]/30 underline-offset-4" to="/">
              découvrir comment fonctionne l’analyse de peau SkinView
            </Link>{" "}
            depuis la page d’accueil.
          </p>
        </div>
      </section>

      <section className="bg-[#173f36] py-14 text-[#f8f4ed] sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1000px] gap-8 px-5 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:items-start lg:px-8">
          <div>
            <Sparkles className="h-5 w-5 text-[#d7c49e]" aria-hidden="true" />
            <h2 className="mt-4 font-serif text-[2.35rem] leading-none sm:text-4xl">
              Construire une routine cohérente, pas une pile de produits
            </h2>
          </div>
          <div className="space-y-4 font-sans text-sm leading-[1.75] text-white/72 sm:text-[15px]">
            <p>
              Une routine skincare sur mesure ne se résume pas à associer un nettoyant, un sérum et
              une crème à chaque préoccupation. Chaque étape doit avoir une fonction claire. Les
              actifs doivent être compatibles avec la peau, mais aussi complémentaires entre eux.
              Leur fréquence compte autant que leur présence.
            </p>
            <p>
              Un actif pertinent peut devenir inconfortable s’il est introduit trop vite ou associé
              à d’autres soins poursuivant le même effet. À l’inverse, hydratation, protection et
              progression peuvent rendre une stratégie plus simple et plus facile à suivre. La
              cohérence globale prime donc sur le nombre de produits ou la popularité d’un
              ingrédient.
            </p>
            <p>
              Le rapport SkinView rend ces arbitrages visibles : rôle de chaque produit, ordre,
              fréquence, priorités et points de vigilance. Vous pouvez{" "}
              <Link className="font-medium text-white underline decoration-white/30 underline-offset-4" to="/rapport-skincare-personnalise">
                découvrir la structure du rapport et de la routine sur mesure
              </Link>{" "}
              ou{" "}
              <Link className="font-medium text-white underline decoration-white/30 underline-offset-4" to="/exemple-rapport">
                voir un exemple réel de rapport SkinView
              </Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#eee8de] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[820px] px-5 sm:px-6">
          <span className="eyebrow">Des recommandations indépendantes</span>
          <h2 className="mt-3 font-serif text-[2.35rem] leading-none text-[#173f36] sm:text-4xl">
            Une composition doit répondre à un besoin, pas à un partenariat
          </h2>
          <div className="mt-6 rounded-[24px] border border-[#173f36]/12 bg-[#fbf8f3] p-5 sm:p-7">
            <p className="font-sans text-sm leading-[1.75] text-[#52625e] sm:text-[15px]">
              SkinView n’a pas vocation à favoriser une marque ou un produit particulier. Une
              recommandation doit pouvoir être expliquée par sa composition, le rôle de ses actifs,
              les besoins identifiés et sa place dans la routine complète. Cette indépendance ne
              signifie pas qu’un produit sera parfait pour tout le monde ; elle signifie que le
              choix repose sur une logique de profil et non sur une affiliation commerciale.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] py-14 sm:py-20">
        <div className="mx-auto max-w-[820px] px-5 sm:px-6">
          <h2 className="font-serif text-[2.2rem] leading-none text-[#173f36] sm:text-4xl">
            Ce que SkinView ne remplace pas
          </h2>
          <p className="mt-5 font-sans text-sm leading-[1.75] text-[#52625e] sm:text-[15px]">
            SkinView est un service de conseil cosmétique. L’analyse porte sur les besoins visibles
            et la construction d’une routine de soins ; elle ne constitue pas un diagnostic médical
            et ne remplace pas l’avis, l’examen ou le suivi d’un dermatologue ou d’un autre
            professionnel de santé.
          </p>
        </div>
      </section>
    </article>

    <section className="border-t border-[#173f36]/10 bg-[#f5f0e8] py-14 sm:py-20">
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-6">
        <h2 className="font-serif text-[2.35rem] leading-none text-[#173f36] sm:text-4xl">
          Commencer par comprendre votre peau
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#52625e]">
          Répondez au questionnaire, transmettez vos photos et recevez une analyse structurée avec
          une routine construite pour votre profil.
        </p>
        <div className="mx-auto mt-7 max-w-sm">
          <ReportCta label="Obtenir mon analyse et ma routine" showNote />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#173f36]" to="/exemple-rapport">
            Voir un exemple de rapport
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#173f36]" to="/tarif">
            Consulter le tarif
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  </PageShell>
);

export default NotreCombat;
