import { Link } from "react-router-dom";

const disclaimers = [
  "Skincare Studio ne remplace pas un dermatologue.",
  "Le rapport n'est pas un avis médical.",
  "Aucune promesse de résultat — l'analyse repose sur les photos et réponses transmises.",
  "Les photos servent uniquement à générer votre rapport.",
  "Le rapport est envoyé par email. En cas de problème technique, reprise manuelle sous 24 à 48h.",
  "Sans affiliation à une marque.",
];

const SiteFooter = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="font-serif tracking-[0.3em] text-sm mb-3">SKINCARE STUDIO</div>
            <p className="font-sans text-primary-foreground/60 text-xs leading-relaxed font-light max-w-xs">
              Comprendre votre peau avant de racheter. Un rapport clair, personnalisé et
              actionnable.
            </p>
          </div>

          <div>
            <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">
              Le rapport
            </div>
            <ul className="space-y-2 font-sans text-xs font-light">
              <li>
                <Link
                  to="/rapport-skincare-personnalise"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Ce que contient le rapport
                </Link>
              </li>
              <li>
                <Link
                  to="/exemple-rapport"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Voir un exemple
                </Link>
              </li>
              <li>
                <Link
                  to="/tarif"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Tarif
                </Link>
              </li>
              <li>
                <Link
                  to="/notre-combat"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Notre combat
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">
              Comprendre votre peau
            </div>
            <ul className="space-y-2 font-sans text-xs font-light">
              <li>
                <Link
                  to="/comprendre-sa-peau"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Comprendre sa peau
                </Link>
              </li>
              <li>
                <Link
                  to="/ordre-routine-skincare"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Ordre d'une routine
                </Link>
              </li>
              <li>
                <Link
                  to="/acheter-moins-de-skincare"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Acheter moins de skincare
                </Link>
              </li>
              <li>
                <Link
                  to="/peau-sensible-actifs-a-eviter"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Peau sensible : actifs à éviter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 pt-8">
          <ul className="space-y-1.5 mb-6">
            {disclaimers.map((d) => (
              <li
                key={d}
                className="font-sans text-[11px] text-primary-foreground/50 leading-relaxed font-light"
              >
                · {d}
              </li>
            ))}
          </ul>
          <p className="font-sans text-primary-foreground/40 text-[11px] tracking-wider font-light text-center">
            © {new Date().getFullYear()} Skincare Studio — L'expertise au service de votre peau
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
