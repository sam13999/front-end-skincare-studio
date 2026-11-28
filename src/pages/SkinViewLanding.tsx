import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  FileText,
  Leaf,
  Menu,
  Search,
  Scale,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDiagnostic } from "@/context/DiagnosticContext";
import logo from "@/assets/landing/logo.png";
import heroImage from "@/assets/landing/hero.jpg";
import stepPhotos from "@/assets/landing/step-photos.jpg";
import stepQuestionnaire from "@/assets/landing/step-questionnaire.jpg";
import stepReport from "@/assets/landing/step-report.jpg";
import skinDetail from "@/assets/landing/skin-detail.jpg";
import report01 from "@/assets/landing/rapport/01-cover.jpg";
import report02 from "@/assets/landing/rapport/02-glance.jpg";
import report03 from "@/assets/landing/rapport/03-profile.jpg";
import report04 from "@/assets/landing/rapport/04-priorities.jpg";
import report05 from "@/assets/landing/rapport/05-goals.jpg";
import report06 from "@/assets/landing/rapport/06-why.jpg";
import report07 from "@/assets/landing/rapport/07-routine.jpg";
import report08 from "@/assets/landing/rapport/08-products-matin-1.jpg";
import report09 from "@/assets/landing/rapport/09-actives.jpg";
import report10 from "@/assets/landing/rapport/10-closing.jpg";
import "./SkinViewLanding.css";

const reportScreens = [
  { image: report01, title: "Votre rapport", text: "Un rapport à votre nom, pensé pour se lire sur téléphone." },
  { image: report02, title: "Votre peau", text: "Votre type de peau et ce que montrent vos photos, zone par zone." },
  { image: report03, title: "Votre profil", text: "Ce qu’il faut retenir de votre peau, expliqué simplement." },
  { image: report04, title: "À prioriser", text: "Les bons réflexes, et ce qu’il vaut mieux éviter pour votre peau." },
  { image: report05, title: "Vos objectifs", text: "Vos objectifs, avec des repères pour suivre vos progrès." },
  { image: report06, title: "La stratégie", text: "La logique de votre routine, et ce qui a été volontairement écarté." },
  { image: report07, title: "Votre routine", text: "Matin et soir, avec la fréquence de chaque soin." },
  { image: report08, title: "Vos produits", text: "Pour chaque produit : pourquoi ce choix et comment l’appliquer." },
  { image: report09, title: "Les actifs", text: "Les ingrédients retenus et leur rôle dans votre routine." },
  { image: report10, title: "Merci", text: "Votre rapport complet, à garder et à relire quand vous voulez." },
];
const SCREEN_DURATION = 6500;

const perks = [
  {
    id: "multimarque",
    label: "Multimarque",
    title: "Des soins de toutes les marques",
    text: "SkinView ne vend aucun produit. Les soins sont choisis parmi de nombreuses marques, uniquement pour leur intérêt dans votre routine.",
  },
  {
    id: "personnalise",
    label: "Personnalisé",
    title: "Votre peau avant les tendances",
    text: "Votre routine part de vos photos, de vos réponses et de vos objectifs. Chaque produit doit mériter sa place : aucune étape n’est ajoutée pour faire nombre.",
  },
  {
    id: "independant",
    label: "Indépendant",
    title: "Le conseil avant le produit",
    text: "Pas de gamme maison ni de marque partenaire à pousser. Vous payez pour l’analyse et le conseil, pas pour être dirigé vers un catalogue.",
  },
] as const;

const faq = [
  ["Pourquoi payer alors que certains diagnostics de peau sont gratuits ?", ["Quand celui qui vous conseille vous vend aussi les produits, il vend autant qu’il conseille.", "SkinView ne vend aucun produit. Vous payez pour l’analyse, la stratégie et la sélection, pas pour être dirigé vers une gamme maison."]],
  ["SkinView vend-il les produits recommandés ?", ["Non. Et c’est volontaire.", "Un bon conseil ne commence pas par un catalogue. Il commence par votre peau.", "Nos recommandations sont multimarques et chaque produit doit avoir une fonction précise dans votre routine."]],
  ["Pourquoi l’analyse coûte-t-elle 39 € ?", ["Parce que vous ne recevez pas simplement un résultat ou une liste de produits.", "SkinView vous donne vos priorités, une stratégie expliquée, une routine complète, les fréquences d’utilisation et les produits retenus.", "Le but n’est pas de vous faire acheter plus. C’est de vous éviter d’acheter au hasard."]],
  ["Quelle différence entre l’analyse à 39 € et le suivi à 59 € ?", ["L’analyse à 39 € construit votre stratégie et votre routine actuelles.", "Le suivi à 59 € ajoute une nouvelle analyse dans les 6 mois, avec comparaison avant / après, observation des évolutions et adaptation de votre routine à la peau que vous avez à ce moment-là."]],
  ["Allez-vous me recommander beaucoup de produits ?", ["Non.", "Une routine n’est pas meilleure parce qu’elle est plus longue.", "Chaque produit doit mériter sa place."]],
  ["Pourquoi demander des photos et un questionnaire ?", ["Parce que vos photos montrent certaines choses et que vos habitudes, vos objectifs et votre ressenti en racontent d’autres.", "SkinView utilise les deux pour construire une recommandation réellement personnalisée."]],
  ["Et si quelque chose n’est pas clair sur mes photos ?", ["Nous ne forçons pas les conclusions.", "Ce qui n’est pas suffisamment visible n’est pas présenté comme une certitude."]],
  ["SkinView remplace-t-il un dermatologue ?", ["Non.", "SkinView fournit des recommandations cosmétiques personnalisées. Il ne pose pas de diagnostic médical et ne remplace pas un professionnel de santé."]],
  ["Mes données sont-elles confidentielles ?", ["Réponse à compléter."]],
  ["Combien de temps faut-il pour recevoir mon rapport ?", ["Réponse à compléter."]],
  ["Que vais-je recevoir à la fin ?", ["Un rapport complet : vos priorités, une stratégie expliquée, une routine complète, les fréquences d’utilisation et les produits retenus."]],
  ["Puis-je refaire une analyse plus tard ?", ["Oui. L’offre SkinView Suivi inclut une nouvelle analyse dans les 6 mois, à partir de nouvelles photos, avec un comparatif avant / après et une routine réadaptée."]],
] as const;

function Cta({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className="sv-btn" onClick={onClick}>{children}<span aria-hidden="true">→</span></button>;
}

function Header({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [["fonctionnement", "Comment ça marche"], ["rapport", "Le rapport"], ["tarifs", "Tarifs"], ["faq", "FAQ"]];
  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sv-header">
      <button type="button" className="sv-brand" onClick={() => go("top")} aria-label="SkinView, accueil">
        <img src={logo} alt="SkinView" />
        <small>Créateur de routine sur mesure</small>
      </button>
      <button type="button" className="sv-burger" onClick={() => setOpen((value) => !value)} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open && <nav className="sv-menu">{links.map(([id, label]) => <button type="button" key={id} onClick={() => go(id)}>{label}</button>)}<Link to="/notre-histoire" onClick={() => setOpen(false)}>Notre histoire</Link><Cta onClick={onStart}>Commencer mon analyse</Cta></nav>}
    </header>
  );
}

function ReportPhone() {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const phoneRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    reportScreens.forEach(({ image }) => { const preload = new Image(); preload.src = image; });
  }, []);

  useEffect(() => {
    const element = phoneRef.current;
    if (!element || !("IntersectionObserver" in window)) { setVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused || reduced) return undefined;
    const timer = window.setTimeout(() => setCurrent((value) => (value + 1) % reportScreens.length), SCREEN_DURATION);
    return () => window.clearTimeout(timer);
  }, [current, paused, reduced, visible]);

  useEffect(() => {
    const chip = navRef.current?.children[current] as HTMLElement | undefined;
    const nav = navRef.current;
    if (chip && nav) nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [current]);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => document.getElementById(`sv-screen-${lightbox}`)?.scrollIntoView({ block: "start" }), 0);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [lightbox]);

  const screen = reportScreens[current];
  const choose = (index: number) => { setPaused(true); setCurrent(index); };

  return <>
    <div className={`sv-phone-stage${visible && !reduced ? " is-playing" : ""}`}>
      <button type="button" className="sv-phone" ref={phoneRef} onClick={() => { setPaused(true); setLightbox(current); }} aria-label={`Agrandir l’écran « ${screen.title} »`}>
        <span className="sv-phone-notch" aria-hidden="true" />
        <span className="sv-phone-screen">
          <img key={current} src={screen.image} alt={`Rapport SkinView, écran « ${screen.title} »`} style={{ animationDuration: `${SCREEN_DURATION}ms` }} />
        </span>
      </button>
      <span className="sv-phone-shadow" aria-hidden="true" />
    </div>
    <div className="sv-phone-caption" aria-live="polite"><span>{String(current + 1).padStart(2, "0")} / {reportScreens.length}</span><h3>{screen.title}</h3><p>{screen.text}</p></div>
    <div className={`sv-chips${paused ? " is-paused" : ""}`} ref={navRef} role="tablist" aria-label="Écrans du rapport">
      {reportScreens.map((item, index) => <button type="button" role="tab" key={item.title} aria-selected={index === current} onClick={() => choose(index)}>{item.title}{index === current && !paused && !reduced && <i style={{ animationDuration: `${SCREEN_DURATION}ms` }} />}</button>)}
    </div>
    <button type="button" className="sv-btn" onClick={() => { setPaused(true); setLightbox(0); }}>Voir le rapport complet <span aria-hidden="true">→</span></button>
    <p className="sv-note">Rapport réel, anonymisé : prénom modifié, photos de peau remplacées et noms des produits floutés.</p>
    {lightbox !== null && <div className="sv-lightbox" role="dialog" aria-modal="true" aria-label="Rapport complet"><div className="sv-lightbox-bar"><span>Exemple de rapport</span><button type="button" onClick={() => setLightbox(null)} aria-label="Fermer">✕</button></div><div className="sv-lightbox-scroll">{reportScreens.map((item, index) => <img key={item.title} id={`sv-screen-${index}`} src={item.image} alt={`Rapport SkinView, écran « ${item.title} »`} loading="lazy" />)}</div></div>}
  </>;
}

function Perks() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = perks.find((perk) => perk.id === openId);
  const icons: Record<string, React.ReactNode> = {
    multimarque: <span aria-hidden="true">▦</span>,
    personnalise: <Leaf aria-hidden="true" />,
    independant: <Scale aria-hidden="true" />,
  };
  return <div className="sv-perks-wrap">
    <ul className="sv-perks">
      {perks.map((perk) => <li key={perk.id}><button type="button" aria-expanded={openId === perk.id} aria-controls="sv-perk-panel" onClick={() => setOpenId((value) => (value === perk.id ? null : perk.id))}><i>{icons[perk.id]}</i>{perk.label}</button></li>)}
    </ul>
    {active ? <div className="sv-perk-panel" id="sv-perk-panel" role="region" aria-label={active.label} key={active.id}><h3>{active.title}</h3><p>{active.text}</p></div> : <p className="sv-perk-hint">Touchez une pastille pour en savoir plus.</p>}
  </div>;
}

export default function SkinViewLanding() {
  const { open } = useDiagnostic();
  const start = () => open("analyse");
  const startSuivi = () => open("suivi");
  return <div className="sv-page">
    <Header onStart={start} />
    <main>
      <section className="sv-hero" id="top">
        <div className="sv-hero-image"><p>Analyse<br />de peau<br />personnalisée<br />en ligne</p><img src={heroImage} alt="Femme présentant une peau naturelle, dans une lumière douce" /></div>
        <h1>Une routine<br />(vraiment) pensée<br />pour votre peau.</h1>
        <p className="sv-lead">SkinView analyse vos photos et vos réponses pour construire une routine adaptée à votre peau, avec uniquement les produits qui ont une vraie raison d’être.</p>
        <Cta onClick={start}>Commencer mon analyse</Cta>
        <button type="button" className="sv-link" onClick={() => document.getElementById("rapport")?.scrollIntoView({ behavior: "smooth" })}>Voir un exemple de rapport</button>
        <Perks />
        <p className="sv-script">Moins d’essais.<span>Plus de certitudes.</span></p>
      </section>

      <section className="sv-section" id="fonctionnement"><h2>Comment ça marche&nbsp;?</h2><p className="sv-lead">Quelques minutes pour nous aider à comprendre votre peau, vos habitudes et vos objectifs.</p><ol className="sv-steps"><li><div className="sv-step-photo"><img src={stepPhotos} alt="" /><b>1</b></div><div><h3>Vous partagez vos photos</h3><p>Quelques photos permettent d’observer votre peau sous différents angles.</p></div></li><li><div className="sv-step-photo"><img src={stepQuestionnaire} alt="" /><b>2</b></div><div><h3>Vous répondez à un questionnaire</h3><p>Vos habitudes, vos objectifs, votre routine actuelle et votre ressenti donnent le contexte nécessaire à l’analyse.</p></div></li><li><div className="sv-step-photo"><img src={stepReport} alt="" /><b>3</b></div><div><h3>Vous recevez votre analyse complète</h3><p>Découvrez vos priorités, votre stratégie, votre routine et les produits retenus pour votre peau.</p></div></li></ol><Cta onClick={start}>Commencer mon analyse</Cta><p className="sv-script">Simple aujourd’hui,<span>une peau plus sereine demain.</span></p></section>

      <section className="sv-section sv-report" id="rapport"><h2>Voyez exactement ce que vous recevez</h2><p className="sv-lead">Un vrai rapport SkinView, écran par écran : votre peau, vos priorités, votre stratégie, votre routine et les produits retenus.</p><ReportPhone /><div className="sv-trust sv-report-trust"><Search aria-hidden="true" /><div><h3>Pas de conclusions forcées</h3><p>Si un élément n’est pas suffisamment visible sur vos photos, il n’est pas présenté comme une certitude.</p></div></div></section>

      <section className="sv-section" id="tarifs"><h2>Choisissez votre analyse SkinView</h2><div className="sv-plans"><article className="sv-plan"><h3>Analyse SkinView</h3><p className="sv-price">39&nbsp;€</p><p className="sv-tagline">Une analyse complète, une fois.</p><ul><li>Analyse personnalisée</li><li>Rapport complet</li><li>Priorités et stratégie</li><li>Routine matin et soir</li><li>Produits recommandés</li><li>Conseils d’utilisation et fréquences</li></ul><Cta onClick={start}>Commencer mon analyse</Cta></article><article className="sv-plan sv-plan-alt"><span className="sv-badge">ANALYSE + SUIVI</span><h3>SkinView Suivi</h3><p className="sv-price">59&nbsp;€</p><p className="sv-tagline">Votre peau évolue. Votre routine aussi.</p><p className="sv-desc">Votre analyse initiale est suivie d’un nouveau bilan dans les 6 mois pour comparer l’évolution de votre peau et adapter votre routine à sa nouvelle situation.</p><ol className="sv-journey"><li>Avant</li><li>Évolution</li><li>Après</li><li>Routine réadaptée</li></ol><ul><li>Analyse complète initiale</li><li>Nouvelle analyse à partir de nouvelles photos</li><li>Comparatif avant / après</li><li>Évolution des zones et priorités suivies</li><li>Routine réévaluée selon les progrès observés</li><li>Produits ou fréquences ajustés uniquement si nécessaire</li></ul><p className="sv-extra">20 € de plus pour refaire le point dans les 6 mois.</p><Cta onClick={startSuivi}>Choisir le suivi</Cta></article></div></section>

      <section className="sv-section sv-faq" id="faq"><h2>Questions fréquentes</h2><div className="sv-faq-list">{faq.map(([question, answers], index) => <details key={question} open={index === 0}><summary>{question}</summary><div className="sv-answer">{answers.map((answer) => <p key={answer} className={answer === "Réponse à compléter." ? "sv-todo" : undefined}>{answer}</p>)}</div></details>)}</div></section>
      <section className="sv-final"><p>Comprenez votre peau avant votre prochain achat.</p><Cta onClick={start}>Commencer mon analyse</Cta></section>
    </main>
    <footer className="sv-footer"><Link to="/notre-histoire">Notre histoire</Link><br />SkinView est une aide skincare cosmétique non médicale.<br />Le rapport ne remplace pas l’avis d’un professionnel de santé.</footer>
  </div>;
}
