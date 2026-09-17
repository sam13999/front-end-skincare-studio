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
import { useDiagnostic } from "@/context/DiagnosticContext";
import logo from "@/assets/landing/logo.png";
import heroImage from "@/assets/landing/hero.jpg";
import stepPhotos from "@/assets/landing/step-photos.jpg";
import stepQuestionnaire from "@/assets/landing/step-questionnaire.jpg";
import stepReport from "@/assets/landing/step-report.jpg";
import skinDetail from "@/assets/landing/skin-detail.jpg";
import valueSkin from "@/assets/landing/value-skin.jpg";
import valueBrands from "@/assets/landing/value-brands.jpg";
import valuePlace from "@/assets/landing/value-place.jpg";
import valueBuy from "@/assets/landing/value-buy.jpg";
import report1 from "@/assets/landing/report-1.jpg";
import report2 from "@/assets/landing/report-2.jpg";
import report3 from "@/assets/landing/report-3.jpg";
import report4 from "@/assets/landing/report-4.jpg";
import report5 from "@/assets/landing/report-5.jpg";
import report6 from "@/assets/landing/report-6.jpg";
import report7 from "@/assets/landing/report-7.jpg";
import report8 from "@/assets/landing/report-8.jpg";
import "./SkinViewLanding.css";

const reportPages = [report1, report2, report3, report4, report5, report6, report7, report8];
const reportNames = [
  "Couverture",
  "Votre peau",
  "Votre profil",
  "Vos objectifs",
  "Routine",
  "Routine du matin",
  "Routine du soir",
  "Routine du soir (suite)",
];
type ReportStop = {
  page: number;
  center: [number, number];
  focus: [number, number, number, number];
  scale: number;
  title: string;
  text: string;
};

const REPORT_WIDTH = 1100;
const reportStops: ReportStop[] = [
  {
    page: 1,
    center: [470, 530],
    focus: [45, 460, 850, 140],
    scale: 1.2,
    title: "Photos",
    text: "Observations localisées sur les zones utiles.",
  },
  {
    page: 2,
    center: [690, 540],
    focus: [315, 260, 735, 560],
    scale: 1.35,
    title: "Profil",
    text: "Votre type et votre profil de peau expliqués clairement.",
  },
  {
    page: 3,
    center: [405, 365],
    focus: [45, 315, 720, 110],
    scale: 1.3,
    title: "Objectif",
    text: "Votre priorité déclarée est réellement prise en compte.",
  },
  {
    page: 6,
    center: [560, 570],
    focus: [45, 270, 1010, 600],
    scale: 1.2,
    title: "Produits",
    text: "Produits sélectionnés avec rôle et conseil d’utilisation.",
  },
];

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
  const links = [["fonctionnement", "Comment ça marche"], ["rapport", "Le rapport"], ["conseil", "Le conseil"], ["tarifs", "Tarifs"], ["faq", "FAQ"]];
  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sv-header">
      <button type="button" className="sv-brand" onClick={() => go("top")} aria-label="SkinView, accueil">
        <img src={logo} alt="SkinView" />
        <small>Comprends ta peau avant d’acheter.</small>
      </button>
      <button type="button" className="sv-burger" onClick={() => setOpen((value) => !value)} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open && <nav className="sv-menu">{links.map(([id, label]) => <button type="button" key={id} onClick={() => go(id)}>{label}</button>)}<Cta onClick={onStart}>Commencer mon analyse</Cta></nav>}
    </header>
  );
}

function ReportTour() {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frameRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused) return undefined;
    const timer = window.setTimeout(() => setCurrent((value) => (value + 1) % reportStops.length), 2400);
    return () => window.clearTimeout(timer);
  }, [current, paused, visible]);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [lightbox]);

  const stop = reportStops[current];
  const [centerX, centerY] = stop.center;
  const [focusX, focusY, focusWidth, focusHeight] = stop.focus;
  const imageLeft = 50 - (stop.scale * centerX / REPORT_WIDTH) * 100;
  const imageTop = 50 - (stop.scale * centerY / REPORT_WIDTH) * 100;
  const focusLeft = imageLeft + (stop.scale * focusX / REPORT_WIDTH) * 100;
  const focusTop = imageTop + (stop.scale * focusY / REPORT_WIDTH) * 100;
  const focusRight = focusLeft + (stop.scale * focusWidth / REPORT_WIDTH) * 100;
  const focusBottom = focusTop + (stop.scale * focusHeight / REPORT_WIDTH) * 100;
  const clamp = (value: number) => Math.min(98, Math.max(2, value));
  const focusStyle = {
    left: `${clamp(focusLeft)}%`,
    top: `${clamp(focusTop)}%`,
    width: `${Math.max(10, clamp(focusRight) - clamp(focusLeft))}%`,
    height: `${Math.max(10, clamp(focusBottom) - clamp(focusTop))}%`,
  };

  return <>
    <div className={`sv-tour ${paused ? "is-paused" : ""}`}>
      <div className="sv-frame" ref={frameRef} aria-live="polite">
        <img
          src={reportPages[stop.page]}
          alt={`Extrait d’un rapport SkinView : ${stop.title}`}
          style={{ width: `${stop.scale * 100}%`, left: `${imageLeft}%`, top: `${imageTop}%` }}
        />
        <span className="sv-focus" style={focusStyle} />
        <span className="sv-page-no">Page {stop.page} / 7</span>
      </div>
      <div className="sv-tour-caption"><h3>{stop.title}</h3><p>{stop.text}</p></div>
      <div className="sv-tour-nav" role="tablist" aria-label="Preuves du rapport">
        {reportStops.map((item, index) => <button type="button" role="tab" aria-selected={index === current} key={item.title} onClick={() => { setPaused(true); setCurrent(index); }}><i><b style={{ width: index < current ? "100%" : undefined }} /></i>{item.title}</button>)}
      </div>
    </div>
    <div className="sv-leaf-head"><h3>Feuilletez le rapport</h3><span>Touchez une page pour l’agrandir</span></div>
    <div className="sv-pages">{reportPages.map((page, index) => <button type="button" key={page} onClick={() => { setPaused(true); setLightbox(index); }} aria-label={`Agrandir : ${reportNames[index]}`}><img src={page} alt="" loading="lazy" /><small>{reportNames[index]}</small></button>)}</div>
    <button type="button" className="sv-btn" onClick={() => { setPaused(true); setLightbox(0); }}>Voir le rapport complet <span aria-hidden="true">→</span></button>
    <p className="sv-note">Rapport réel, anonymisé : prénom modifié, photos de peau remplacées et noms des produits floutés.</p>
    {lightbox !== null && <div className="sv-lightbox" role="dialog" aria-modal="true" aria-label="Rapport complet"><div className="sv-lightbox-bar"><span>Exemple de rapport</span><button type="button" onClick={() => setLightbox(null)} aria-label="Fermer">✕</button></div><div className="sv-lightbox-scroll">{reportPages.map((page, index) => <img key={page} src={page} alt={reportNames[index]} className={index === lightbox ? "sv-lightbox-current" : ""} />)}</div></div>}
  </>;
}

export default function SkinViewLanding() {
  const { open } = useDiagnostic();
  const start = () => open();
  return <div className="sv-page">
    <Header onStart={start} />
    <main>
      <section className="sv-hero" id="top">
        <div className="sv-hero-image"><p>Analyse<br />de peau<br />personnalisée<br />en ligne</p><img src={heroImage} alt="Femme présentant une peau naturelle, dans une lumière douce" /></div>
        <h1>Une routine<br />(vraiment) pensée<br />pour votre peau.</h1>
        <p className="sv-lead">SkinView analyse vos photos et vos réponses pour construire une routine adaptée à votre peau, avec uniquement les produits qui ont une vraie raison d’être.</p>
        <Cta onClick={start}>Commencer mon analyse</Cta>
        <button type="button" className="sv-link" onClick={() => document.getElementById("rapport")?.scrollIntoView({ behavior: "smooth" })}>Voir un exemple de rapport</button>
        <ul className="sv-perks"><li><i><span>▦</span></i>Multimarque</li><li><i><Leaf aria-hidden="true" /></i>Personnalisé</li><li><i><Scale aria-hidden="true" /></i>Indépendant</li></ul>
        <p className="sv-script">Moins d’essais.<span>Plus de certitudes.</span></p>
      </section>

      <section className="sv-section" id="fonctionnement"><h2>Comment ça marche&nbsp;?</h2><p className="sv-lead">Quelques minutes pour nous aider à comprendre votre peau, vos habitudes et vos objectifs.</p><ol className="sv-steps"><li><div className="sv-step-photo"><img src={stepPhotos} alt="" /><b>1</b></div><div><h3>Vous partagez vos photos</h3><p>Quelques photos permettent d’observer votre peau sous différents angles.</p></div></li><li><div className="sv-step-photo"><img src={stepQuestionnaire} alt="" /><b>2</b></div><div><h3>Vous répondez à un questionnaire</h3><p>Vos habitudes, vos objectifs, votre routine actuelle et votre ressenti donnent le contexte nécessaire à l’analyse.</p></div></li><li><div className="sv-step-photo"><img src={stepReport} alt="" /><b>3</b></div><div><h3>Vous recevez votre analyse complète</h3><p>Découvrez vos priorités, votre stratégie, votre routine et les produits retenus pour votre peau.</p></div></li></ol><Cta onClick={start}>Commencer mon analyse</Cta><p className="sv-script">Simple aujourd’hui,<span>une peau plus sereine demain.</span></p></section>

      <section className="sv-section sv-report" id="rapport"><h2>Voyez exactement ce que vous recevez</h2><p className="sv-lead">De vrais exemples SkinView : votre peau, vos priorités, votre stratégie, votre routine et les produits retenus.</p><ReportTour /><div className="sv-trust sv-report-trust"><Search aria-hidden="true" /><div><h3>Pas de conclusions forcées</h3><p>Si un élément n’est pas suffisamment visible sur vos photos, il n’est pas présenté comme une certitude.</p></div></div></section>

      <section className="sv-section sv-combat" id="conseil"><h2>Le conseil avant le produit.</h2><p className="sv-sub">Un bon conseil ne commence pas par un catalogue. Il commence par votre peau.</p><p className="sv-body">SkinView ne vend aucun produit. Nos recommandations sont multimarques et chaque produit doit avoir une fonction précise dans votre routine.</p><div className="sv-values"><Value image={valueSkin} title="Votre peau avant les tendances" text="Nous partons de vos besoins, pas du produit dont tout le monde parle." /><Value image={valueBrands} title="Des recommandations multimarques" text="Les références sont retenues pour leur pertinence dans votre routine." /><Value image={valuePlace} title="Chaque produit doit mériter sa place" text="Une étape inutile n’est pas ajoutée simplement pour rendre la routine plus complète." /><Value image={valueBuy} title="Moins acheter. Mieux choisir." text="L’objectif n’est pas de multiplier les produits mais de construire une routine cohérente." /></div></section>

      <section className="sv-section" id="tarifs"><h2>Choisissez votre analyse SkinView</h2><div className="sv-plans"><article className="sv-plan"><h3>Analyse SkinView</h3><p className="sv-price">39&nbsp;€</p><p className="sv-tagline">Une analyse complète, une fois.</p><ul><li>Analyse personnalisée</li><li>Rapport complet</li><li>Priorités et stratégie</li><li>Routine matin et soir</li><li>Produits recommandés</li><li>Conseils d’utilisation et fréquences</li></ul><Cta onClick={start}>Commencer mon analyse</Cta></article><article className="sv-plan sv-plan-alt"><span className="sv-badge">ANALYSE + SUIVI</span><h3>SkinView Suivi</h3><p className="sv-price">59&nbsp;€</p><p className="sv-tagline">Votre peau évolue. Votre routine aussi.</p><p className="sv-desc">Votre analyse initiale est suivie d’un nouveau bilan dans les 6 mois pour comparer l’évolution de votre peau et adapter votre routine à sa nouvelle situation.</p><ol className="sv-journey"><li>Avant</li><li>Évolution</li><li>Après</li><li>Routine réadaptée</li></ol><ul><li>Analyse complète initiale</li><li>Nouvelle analyse à partir de nouvelles photos</li><li>Comparatif avant / après</li><li>Évolution des zones et priorités suivies</li><li>Routine réévaluée selon les progrès observés</li><li>Produits ou fréquences ajustés uniquement si nécessaire</li></ul><p className="sv-extra">20 € de plus pour refaire le point dans les 6 mois.</p><Cta onClick={start}>Choisir le suivi</Cta></article></div></section>

      <section className="sv-section sv-faq" id="faq"><h2>Questions fréquentes</h2><div className="sv-faq-list">{faq.map(([question, answers], index) => <details key={question} open={index === 0}><summary>{question}</summary><div className="sv-answer">{answers.map((answer) => <p key={answer} className={answer === "Réponse à compléter." ? "sv-todo" : undefined}>{answer}</p>)}</div></details>)}</div></section>
      <section className="sv-final"><p>Comprenez votre peau avant votre prochain achat.</p><Cta onClick={start}>Commencer mon analyse</Cta></section>
    </main>
    <footer className="sv-footer">SkinView est une aide skincare cosmétique non médicale.<br />Le rapport ne remplace pas l’avis d’un professionnel de santé.</footer>
  </div>;
}

function Value({ image, title, text }: { image: string; title: string; text: string }) {
  return <article className="sv-value"><img src={image} alt="" /><div><span aria-hidden="true">✦</span><h3>{title}</h3><p>{text}</p></div></article>;
}
