import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDiagnostic } from "@/context/DiagnosticContext";
import logo from "@/assets/landing/logo.png";
import "./SkinViewLanding.css";
import "./NotreHistoire.css";

const TITLE = "Notre histoire | SkinView";
const DESCRIPTION =
  "Comment une crème de trop et un mari qui ne lâche jamais ses idées ont donné naissance à SkinView, le créateur de routine sur mesure.";

export default function NotreHistoire() {
  const { open } = useDiagnostic();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = TITLE;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    if (meta) meta.content = DESCRIPTION;
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, []);

  return (
    <div className="sv-page sv-story">
      <header className="sv-header">
        <Link className="sv-brand" to="/" aria-label="SkinView, retour à l’accueil">
          <img src={logo} alt="SkinView" />
          <small>Créateur de routine sur mesure</small>
        </Link>
        <Link className="sv-story-back" to="/">Accueil</Link>
      </header>

      <main>
        <section className="sv-story-intro">
          <p className="sv-story-kicker">Notre histoire</p>
          <h1>À la base, mon mari voulait juste m’aider à trouver <em>une crème.</em></h1>
          <p className="sv-story-lead">Aujourd’hui, nous avons créé SkinView.</p>
        </section>

        <article className="sv-story-body">
          <section>
            <h2>Tout a commencé avec ma peau</h2>
            <p>J’avais des taches, un teint qui manquait d’éclat et une collection de crèmes qui ne tenaient pas vraiment leurs promesses.</p>
            <p>Je passais des heures sur TikTok à regarder des routines, des avis, des « produits incroyables » que tout le monde recommandait. Et j’achetais.</p>
            <p className="sv-story-prices" aria-label="35 euros, 60 euros, parfois 70 euros pour une seule crème"><span>35&nbsp;€</span><span>60&nbsp;€</span><span>70&nbsp;€</span></p>
            <p>Parfois 70&nbsp;€ pour une seule crème. Et quelques semaines plus tard, j’en cherchais déjà une autre.</p>
          </section>

          <blockquote className="sv-story-quote">
            <p>« Mais comment tu sais que cette crème est vraiment faite pour ta peau&nbsp;? »</p>
            <footer>Je n’en savais rien.</footer>
          </blockquote>

          <section>
            <h2>L’idée des vacances</h2>
            <p>Un jour de vacances, il me lance&nbsp;: « Et si je créais un site qui t’aide à comprendre ta peau et à trouver les soins qui te correspondent vraiment&nbsp;? »</p>
            <p>J’ai dit non. Direct. Nous ne sommes pas dermatologues, et franchement, l’idée me paraissait un peu folle.</p>
            <p>J’avais oublié un détail&nbsp;: quand mon mari a une idée en tête, il ne la lâche <strong>jamais</strong>.</p>
            <p>De retour à la maison, il a commencé à y passer toutes ses soirées. Après le travail, le week-end, encore et encore. Moi, je pensais que c’était sa nouvelle lubie.</p>
          </section>

          <section>
            <h2>Le jour où j’ai compris</h2>
            <p>Quelques mois plus tard, il m’a montré ce qu’il avait construit&nbsp;: un outil qui analyse les caractéristiques visibles de la peau, comprend ses besoins et aide à choisir ses soins autrement.</p>
            <p className="sv-story-rule">On commence par comprendre sa peau. Ensuite, on choisit les produits. <em>Pas l’inverse.</em></p>
            <p>Et je me suis demandé pourquoi ça n’avait pas existé plus tôt dans ma vie.</p>
          </section>

          <section>
            <h2>À deux, SkinView</h2>
            <p>Alors j’ai donné mon avis. Beaucoup d’avis. Vraiment beaucoup. Je voulais que ce soit simple, beau, accessible, et surtout que chacun comprenne pourquoi on lui recommande tel ou tel soin.</p>
            <p>Puis une question s’est imposée&nbsp;: si moi, j’avais autant galéré à trouver les bons produits, combien d’autres personnes étaient dans la même situation&nbsp;?</p>
            <p>C’est là que nous avons décidé de créer SkinView, ensemble.</p>
          </section>

          <section>
            <h2>Aujourd’hui</h2>
            <p>SkinView vous aide à mieux comprendre votre peau grâce à vos photos et à un questionnaire, puis vous propose une routine personnalisée, en expliquant le rôle de chaque produit.</p>
            <p>Nous sommes une jeune marque. Nous construisons encore, nous améliorons chaque détail, et nous mettons énormément de cœur dans ce projet.</p>
          </section>
        </article>

        <section className="sv-story-end">
          <p className="sv-story-closing">SkinView, au départ, c’est une histoire de couple, quelques crèmes achetées au hasard et un mari qui a refusé de lâcher son idée.</p>
          <p className="sv-story-question">Et si nous pouvions vous éviter, à vous aussi, d’acheter votre prochaine crème au hasard&nbsp;?</p>
          <button type="button" className="sv-btn" onClick={() => open("analyse")}>Commencer mon analyse<span aria-hidden="true">→</span></button>
          <Link className="sv-link" to="/">Découvrir SkinView</Link>
        </section>
      </main>

      <footer className="sv-footer">SkinView est une aide skincare cosmétique non médicale.<br />Le rapport ne remplace pas l’avis d’un professionnel de santé.</footer>
    </div>
  );
}
