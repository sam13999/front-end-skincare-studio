import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import heroBgMobile from "@/assets/hero-bg-mobile.jpg";
import PageShell from "@/components/PageShell";
import { ReportCta } from "@/components/ReportCta";
import { ReportMockup } from "@/components/ReportMockup";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  return (
    <PageShell
      title="Skincare Studio — Avant de racheter un soin, comprenez votre peau"
      description="Recevez un rapport personnalisé clair pour comprendre votre peau, éviter les erreurs et construire une routine cohérente. 29 €, prix visible dès le départ."
    >
      {/* HERO */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-ivory/55" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto py-20">
          <div
            className="mb-8 flex items-center gap-3 text-gold animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-8 h-px bg-gold/50" />
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase font-light">
              Rapport personnalisé
            </span>
            <div className="w-8 h-px bg-gold/50" />
          </div>

          <h1
            className="font-serif text-foreground text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            Avant de racheter un soin,
            <br />
            <span className="italic font-light">sachez enfin ce que votre peau attend.</span>
          </h1>

          <p
            className="text-warm font-sans font-light text-base md:text-lg leading-relaxed max-w-xl mb-10 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.5s" }}
          >
            Un rapport personnalisé pour comprendre ce que votre peau montre, éviter les erreurs
            et construire une routine skincare cohérente.
          </p>

          <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.7s" }}>
            <ReportCta showNote />
          </div>

          <Link
            to="/exemple-rapport"
            className="mt-8 font-sans text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.9s" }}
          >
            Voir un exemple de rapport
          </Link>
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="bg-ivory-light py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Le problème
          </span>
          <h2 className="font-serif text-foreground text-3xl md:text-5xl leading-tight mt-5 mb-8">
            La skincare est devenue <span className="italic">trop confuse.</span>
          </h2>
          <div className="gold-separator w-16 mx-auto mb-8" />
          <p className="text-warm font-sans font-light text-base md:text-lg leading-relaxed mb-5">
            Entre les routines TikTok, les paniers Sephora, les actifs à la mode et les conseils
            contradictoires, il devient facile d'acheter sans savoir ce qui correspond
            réellement à votre peau.
          </p>
          <p className="text-foreground/80 font-sans font-light text-base md:text-lg leading-relaxed italic">
            Le problème n'est pas toujours le manque de produits. C'est souvent le manque de
            logique entre ce que la peau montre, les actifs utilisés, l'ordre d'application et
            les objectifs réels de la routine.
          </p>
        </div>
      </section>

      {/* COMBAT */}
      <section className="bg-background py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Notre combat
          </span>
          <h2 className="font-serif text-foreground text-3xl md:text-5xl leading-tight mt-5 mb-8">
            Arrêter les achats skincare <span className="italic">à l'aveugle.</span>
          </h2>
          <div className="gold-separator w-16 mx-auto mb-8" />
          <p className="text-warm font-sans font-light text-base md:text-lg leading-relaxed mb-5">
            Nous ne sommes pas contre les routines TikTok. Nous sommes contre les routines
            copiées sans comprendre. Un produit peut être excellent pour une peau, inutile ou
            trop agressif pour une autre.
          </p>
          <p className="text-foreground/80 font-sans font-light text-base md:text-lg leading-relaxed">
            Skincare Studio existe pour remettre de la clarté avant l'achat : comprendre d'abord,
            choisir ensuite.
          </p>
          <Link
            to="/notre-combat"
            className="inline-block mt-10 font-sans text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
          >
            Lire le manifeste
          </Link>
        </div>
      </section>

      {/* CE QUE VOUS RECEVEZ */}
      <section className="bg-ivory-light py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Ce que vous recevez
            </span>
            <h2 className="font-serif text-foreground text-3xl md:text-5xl leading-tight mt-5 mb-6">
              Un rapport clair, <span className="italic">pas une réponse générique.</span>
            </h2>
            <div className="gold-separator w-16 mx-auto mb-6" />
            <p className="text-warm font-sans font-light text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              L'objectif n'est pas d'ajouter encore plus de produits dans votre salle de bain.
              L'objectif est de comprendre quoi garder, quoi éviter, quoi corriger et dans quel
              ordre avancer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-5 max-w-3xl mx-auto">
            {[
              ["Lecture express", "L'essentiel à retenir, en un coup d'œil."],
              ["Analyse de peau", "Ce que votre peau montre vraiment."],
              ["Logique de routine", "Pourquoi chaque soin est là."],
              ["Routine matin / soir / semaine", "Un plan d'application précis."],
              ["Produits qui fonctionnent ensemble", "Des soins sélectionnés pour leur cohérence."],
              ["Conseils d'application", "Doses, fréquence, ordre."],
              ["Actifs à privilégier", "Ce qui mérite une place dans votre routine."],
              ["Erreurs à éviter", "Ce qui sabote vos efforts sans le savoir."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-4 py-3 border-b border-border/60">
                <div className="text-gold font-serif text-xl leading-none mt-0.5">·</div>
                <div>
                  <div className="font-serif text-foreground text-lg leading-tight">{title}</div>
                  <p className="text-warm font-sans font-light text-sm leading-relaxed mt-1">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS VISUELS */}
      <section className="bg-background py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Aperçu du rapport
            </span>
            <h2 className="font-serif text-foreground text-3xl md:text-5xl leading-tight mt-5 mb-6">
              Des pages pensées pour <span className="italic">être utiles, pas remplies.</span>
            </h2>
            <div className="gold-separator w-16 mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            <ReportMockup label="P. 01" title="Lecture express">
              Les 3 points clés à retenir sur votre peau, sans détour.
            </ReportMockup>
            <ReportMockup label="P. 02" title="Analyse de votre peau">
              Ce que vos photos et vos réponses révèlent.
            </ReportMockup>
            <ReportMockup label="P. 03" title="Logique retenue">
              Pourquoi cette routine — et pas une autre.
            </ReportMockup>
            <ReportMockup label="P. 04" title="Routine matin & soir">
              Étape par étape, avec textures et fréquence.
            </ReportMockup>
            <ReportMockup label="P. 05" title="Conseils d'application">
              Dose, ordre, temps de pose. Sans surcharge.
            </ReportMockup>
            <ReportMockup label="P. 06" title="À prioriser / éviter">
              Les actifs qui méritent leur place — et ceux à fuir.
            </ReportMockup>
          </div>

          <p className="text-warm font-sans font-light text-sm text-center mt-10 italic max-w-xl mx-auto">
            Extraits anonymisés. Les rapports réels ne sont jamais partagés.
          </p>

          <div className="text-center mt-10">
            <Link
              to="/exemple-rapport"
              className="font-sans text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
            >
              Voir un exemple complet
            </Link>
          </div>
        </div>
      </section>

      {/* POURQUOI 29 € */}
      <section className="bg-ivory-light py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
            Pourquoi 29 €
          </span>
          <h2 className="font-serif text-foreground text-3xl md:text-5xl leading-tight mt-5 mb-8">
            Un seul mauvais achat skincare peut coûter{" "}
            <span className="italic">plus cher que le rapport.</span>
          </h2>
          <div className="gold-separator w-16 mx-auto mb-8" />
          <p className="text-warm font-sans font-light text-base md:text-lg leading-relaxed mb-10">
            Un sérum mal choisi, une crème trop riche ou un actif trop agressif peut coûter plus
            cher qu'un rapport complet. Le but n'est pas d'acheter plus, mais d'acheter avec plus
            de logique.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left mb-12">
            {[
              ["Rapport personnalisé", "29 €"],
              ["Un sérum mal choisi", "20 à 50 €"],
              ["Routine incohérente", "Plusieurs achats inutiles"],
              ["Objectif Skincare Studio", "Réduire l'essai-erreur"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-4 px-5 py-4 bg-background border border-border rounded-sm"
              >
                <span className="font-sans text-warm text-xs tracking-wide">{label}</span>
                <span className="font-serif text-foreground text-base">{value}</span>
              </div>
            ))}
          </div>

          <ReportCta showNote />
        </div>
      </section>

      {/* AVIS */}
      <section className="bg-background py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Retours
            </span>
            <h2 className="font-serif text-foreground text-3xl md:text-4xl leading-tight mt-5">
              Ce que disent les premières lectures
            </h2>
            <div className="gold-separator w-16 mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 border border-border bg-ivory-light rounded-sm text-center"
              >
                <div className="text-gold font-serif text-3xl mb-3">"</div>
                <p className="font-sans text-warm text-sm leading-relaxed italic font-light">
                  Retour client à intégrer.
                </p>
                <div className="gold-separator w-10 mx-auto mt-5 mb-3" />
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-warm/70">
                  Témoignage à venir
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ivory-light py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold">
              Questions fréquentes
            </span>
            <h2 className="font-serif text-foreground text-3xl md:text-4xl leading-tight mt-5">
              Tout ce qu'on vous a déjà demandé
            </h2>
            <div className="gold-separator w-16 mx-auto mt-6" />
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "Est-ce un avis médical ?",
                a: "Non. Skincare Studio ne remplace pas un dermatologue et ne fournit pas d'avis médical. Le rapport est un outil de clarification de votre routine.",
              },
              {
                q: "Quand vais-je recevoir mon rapport ?",
                a: "Le rapport est envoyé par email. En cas de problème technique, une reprise manuelle est prévue sous 24 à 48h.",
              },
              {
                q: "Est-ce que les produits sont sponsorisés ?",
                a: "Non. Les recommandations sont faites sans affiliation à une marque. L'objectif n'est pas de vous pousser à acheter plus, mais de construire une routine plus cohérente.",
              },
              {
                q: "Dois-je acheter tous les produits recommandés ?",
                a: "Non. Le rapport vous aide à choisir ce qui mérite vraiment une place dans votre routine, en fonction de ce que vous avez déjà et de vos priorités.",
              },
              {
                q: "Pourquoi le rapport coûte 29 € ?",
                a: "Parce qu'un seul mauvais achat skincare coûte souvent plus cher. Le rapport est conçu pour réduire l'essai-erreur et apporter de la logique avant l'achat.",
              },
              {
                q: "Que se passe-t-il si la génération rencontre un problème ?",
                a: "Une reprise manuelle est prévue. Vous serez recontacté·e par email sous 24 à 48h pour finaliser votre rapport.",
              },
              {
                q: "Est-ce réservé aux femmes ?",
                a: "Non. Skincare Studio peut être utilisé par toute personne qui souhaite mieux comprendre sa peau et éviter les achats au hasard.",
              },
            ].map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border">
                <AccordionTrigger className="font-serif text-foreground text-lg text-left hover:no-underline">
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
      <section className="bg-background py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="gold-separator w-16 mx-auto mb-8" />
          <h2 className="font-serif text-foreground text-3xl md:text-5xl leading-tight mb-8">
            Avant de racheter encore un soin,
            <br />
            <span className="italic">commencez par comprendre votre peau.</span>
          </h2>
          <p className="text-warm font-sans font-light text-base leading-relaxed mb-10 max-w-md mx-auto">
            Moins d'achats au hasard. Plus de logique dans votre routine.
          </p>
          <ReportCta showNote />
        </div>
      </section>
    </PageShell>
  );
};

export default Index;
