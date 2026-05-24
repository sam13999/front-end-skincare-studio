import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import heroBgMobile from "@/assets/hero-bg-mobile.jpg";
import lectureExpressImg from "@/assets/report/lecture-express.jpg";
import analysePeauImg from "@/assets/report/analyse-peau.jpg";
import logiqueRetenueImg from "@/assets/report/logique-retenue.jpg";
import routineMatinImg from "@/assets/report/routine-matin.jpg";
import routineSoirImg from "@/assets/report/routine-soir.jpg";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const highlights = [
  {
    label: "P. 02",
    title: "Lecture express",
    image: lectureExpressImg,
    desc: "Les 3 points clés à retenir sur votre peau, en un coup d'œil.",
  },
  {
    label: "P. 03",
    title: "Analyse de la peau",
    image: analysePeauImg,
    desc: "Ce que vos photos et vos réponses révèlent vraiment.",
  },
  {
    label: "P. 04",
    title: "Logique retenue",
    image: logiqueRetenueImg,
    desc: "Pourquoi cette routine — et pas une autre.",
  },
  {
    label: "P. 06",
    title: "Routine du matin",
    image: routineMatinImg,
    desc: "Étapes, textures et gestes pour bien démarrer la journée.",
  },
  {
    label: "P. 07",
    title: "Routine du soir",
    image: routineSoirImg,
    desc: "Le détail des soins du soir, pensés pour la régularité.",
  },
];

const Index = () => {
  return (
    <PageShell
      title="Skincare Studio — Avant de racheter un soin, comprenez votre peau"
      description="Recevez un rapport personnalisé clair pour comprendre votre peau, éviter les erreurs et construire une routine cohérente. 29 €, prix visible dès le départ."
    >
      {/* HERO */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          width={1920}
          height={1080}
        />
        <img
          src={heroBgMobile}
          alt=""
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          width={768}
          height={1024}
        />
        <div className="absolute inset-0 bg-ivory/60" />

        <div className="relative z-10 flex flex-col items-center text-center px-5 max-w-3xl mx-auto py-16 md:py-20 w-full">
          <div
            className="mb-6 md:mb-8 flex items-center gap-3 text-gold animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-8 h-px bg-gold/50" />
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase font-light">
              Rapport personnalisé
            </span>
            <div className="w-8 h-px bg-gold/50" />
          </div>

          <h1
            className="font-serif text-foreground text-[1.85rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-5 md:mb-6 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            Avant de racheter un soin,
            <br />
            <span className="italic font-light">sachez ce que votre peau attend.</span>
          </h1>

          <p
            className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed max-w-xl mb-8 md:mb-10 animate-fade-in-up opacity-0 px-2"
            style={{ animationDelay: "0.5s" }}
          >
            Un rapport personnalisé pour comprendre ce que votre peau montre, éviter les erreurs
            et construire une routine cohérente.
          </p>

          <div className="w-full max-w-sm animate-fade-in-up opacity-0" style={{ animationDelay: "0.7s" }}>
            <ReportCta showNote />
          </div>

          <Link
            to="/exemple-rapport"
            className="mt-7 font-sans text-[11px] md:text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.9s" }}
          >
            Voir un exemple de rapport
          </Link>
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="bg-ivory-light py-16 md:py-32">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Le problème
          </span>
          <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-5xl leading-tight mt-5 mb-6 md:mb-8">
            La skincare est devenue <span className="italic">trop confuse.</span>
          </h2>
          <div className="gold-separator w-16 mx-auto mb-6 md:mb-8" />
          <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed mb-5">
            Entre les routines TikTok, les paniers Sephora, les actifs à la mode et les conseils
            contradictoires, il devient facile d'acheter sans savoir ce qui correspond
            réellement à votre peau.
          </p>
          <p className="text-foreground/80 font-sans font-light text-[15px] md:text-lg leading-relaxed italic">
            Le problème n'est pas le manque de produits. C'est le manque de logique entre ce que
            la peau montre, les actifs utilisés et l'ordre d'application.
          </p>
        </div>
      </section>

      {/* CE QUE VOUS RECEVEZ */}
      <section className="bg-background py-16 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Ce que vous recevez
            </span>
            <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-5xl leading-tight mt-5 mb-5 md:mb-6">
              Un rapport clair, <span className="italic">pas une réponse générique.</span>
            </h2>
            <div className="gold-separator w-16 mx-auto mb-6" />
            <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed max-w-2xl mx-auto">
              L'objectif n'est pas d'ajouter encore plus de produits. C'est de comprendre quoi
              garder, quoi éviter, quoi corriger et dans quel ordre avancer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-5 max-w-3xl mx-auto">
            {[
              ["Lecture express", "L'essentiel à retenir, en un coup d'œil."],
              ["Analyse de peau", "Ce que votre peau montre vraiment."],
              ["Logique retenue", "Pourquoi chaque soin est là."],
              ["Routine matin & soir", "Un plan d'application précis."],
              ["Conseils d'application", "Doses, fréquence, ordre."],
              ["Actifs à privilégier", "Ce qui mérite une place dans votre routine."],
              ["Erreurs à éviter", "Ce qui sabote vos efforts sans le savoir."],
              ["Routine hebdomadaire", "Le rythme à tenir, sans surcharge."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-4 py-3 border-b border-border/60">
                <div className="text-gold font-serif text-xl leading-none mt-0.5">·</div>
                <div>
                  <div className="font-serif text-foreground text-base md:text-lg leading-tight">{title}</div>
                  <p className="text-warm font-sans font-light text-sm leading-relaxed mt-1">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS — 5 captures réelles */}
      <section className="bg-ivory-light py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Aperçu du rapport
            </span>
            <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-5xl leading-tight mt-5 mb-5 md:mb-6">
              Des pages pensées pour <span className="italic">être utiles, pas remplies.</span>
            </h2>
            <div className="gold-separator w-16 mx-auto mb-6" />
            <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed max-w-2xl mx-auto">
              Chaque rapport explique ce que votre peau montre, la logique retenue et la routine
              à suivre. Voici les 5 sections clés telles qu'elles apparaissent dans le document.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {highlights.map((h) => (
              <ReportMockup
                key={h.title}
                label={h.label}
                title={h.title}
                image={h.image}
                imageAlt={`Extrait du rapport — ${h.title}`}
              >
                {h.desc}
              </ReportMockup>
            ))}
          </div>

          <p className="text-warm font-sans font-light text-sm text-center mt-10 italic max-w-xl mx-auto">
            Extraits anonymisés. Aucun visage identifiable n'est diffusé.
          </p>

          <div className="flex flex-col items-center gap-5 mt-10 md:mt-12">
            <div className="w-full max-w-sm">
              <ReportCta />
            </div>
            <Link
              to="/exemple-rapport"
              className="font-sans text-[11px] md:text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
            >
              Voir un exemple complet
            </Link>
          </div>
        </div>
      </section>

      {/* POURQUOI 29 € */}
      <section className="bg-background py-16 md:py-32">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Pourquoi 29 €
          </span>
          <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-5xl leading-tight mt-5 mb-6 md:mb-8">
            Un mauvais achat skincare coûte souvent{" "}
            <span className="italic">plus cher que le rapport.</span>
          </h2>
          <div className="gold-separator w-16 mx-auto mb-6 md:mb-8" />
          <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed mb-8 md:mb-10">
            Un sérum mal choisi, une crème trop riche ou un actif trop agressif peut coûter plus
            cher qu'un rapport complet. Le but n'est pas d'acheter plus, mais d'acheter avec plus
            de logique.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left mb-10 md:mb-12">
            {[
              ["Rapport personnalisé", "29 €"],
              ["Un sérum mal choisi", "20 à 50 €"],
              ["Routine incohérente", "Plusieurs achats inutiles"],
              ["Objectif Skincare Studio", "Réduire l'essai-erreur"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-4 px-5 py-4 bg-ivory-light border border-border rounded-sm"
              >
                <span className="font-sans text-warm text-xs tracking-wide">{label}</span>
                <span className="font-serif text-foreground text-base">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <ReportCta showNote />
            </div>
          </div>
        </div>
      </section>

      {/* COMBAT (condensé) */}
      <section className="bg-ivory-light py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Notre combat
          </span>
          <h2 className="font-serif text-foreground text-[1.6rem] sm:text-2xl md:text-4xl leading-tight mt-5 mb-6">
            Arrêter les achats skincare <span className="italic">à l'aveugle.</span>
          </h2>
          <div className="gold-separator w-16 mx-auto mb-6" />
          <p className="text-warm font-sans font-light text-[15px] md:text-lg leading-relaxed">
            Nous ne sommes pas contre les routines TikTok. Nous sommes contre les routines
            copiées sans comprendre. Comprendre d'abord, choisir ensuite.
          </p>
          <Link
            to="/notre-combat"
            className="inline-block mt-8 font-sans text-[11px] md:text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
          >
            Lire le manifeste
          </Link>
        </div>
      </section>

      {/* FAQ + Réassurance */}
      <section className="bg-background py-16 md:py-32">
        <div className="max-w-3xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Questions fréquentes
            </span>
            <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-4xl leading-tight mt-5">
              Tout ce qu'on vous a déjà demandé
            </h2>
            <div className="gold-separator w-16 mx-auto mt-6" />
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "Est-ce un avis médical ?",
                a: "Non. Skincare Studio ne remplace pas un dermatologue et ne fournit pas d'avis médical. Le rapport est un outil de clarification de votre routine, sans promesse de résultat.",
              },
              {
                q: "Quand vais-je recevoir mon rapport ?",
                a: "Le rapport est envoyé par email. En cas de problème technique, une reprise manuelle est prévue sous 24 à 48h.",
              },
              {
                q: "Que deviennent mes photos ?",
                a: "Les photos sont utilisées uniquement pour générer le rapport. Aucun visage identifiable n'est diffusé.",
              },
              {
                q: "Est-ce que les produits sont sponsorisés ?",
                a: "Non. Les recommandations sont faites sans affiliation à une marque.",
              },
              {
                q: "Dois-je acheter tous les produits recommandés ?",
                a: "Non. Le rapport vous aide à choisir ce qui mérite vraiment une place dans votre routine, en fonction de ce que vous avez déjà.",
              },
              {
                q: "Pourquoi le rapport coûte 29 € ?",
                a: "Parce qu'un seul mauvais achat skincare coûte souvent plus cher. Le rapport est conçu pour réduire l'essai-erreur avant l'achat.",
              },
              {
                q: "Est-ce réservé aux femmes ?",
                a: "Non. Skincare Studio peut être utilisé par toute personne qui souhaite mieux comprendre sa peau.",
              },
            ].map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border">
                <AccordionTrigger className="font-serif text-foreground text-base md:text-lg text-left hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-warm text-sm leading-relaxed font-light">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-ivory-light py-16 md:py-32">
        <div className="max-w-2xl mx-auto px-5 md:px-6 text-center">
          <div className="gold-separator w-16 mx-auto mb-6 md:mb-8" />
          <h2 className="font-serif text-foreground text-[1.7rem] sm:text-3xl md:text-5xl leading-tight mb-6 md:mb-8">
            Avant de racheter un soin,
            <br />
            <span className="italic">commencez par comprendre votre peau.</span>
          </h2>
          <p className="text-warm font-sans font-light text-[15px] md:text-base leading-relaxed mb-8 md:mb-10 max-w-md mx-auto">
            Moins d'achats au hasard. Plus de logique dans votre routine.
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <ReportCta showNote />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Index;
