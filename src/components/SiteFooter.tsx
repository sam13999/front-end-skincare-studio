import { Link } from "react-router-dom";

const reportLinks = [
  { to: "/rapport-skincare-personnalise", label: "Le contenu du rapport" },
  { to: "/exemple-rapport", label: "Voir un exemple" },
  { to: "/tarif", label: "Tarif" },
];

const guideLinks = [
  { to: "/notre-combat", label: "Notre combat" },
  { to: "/faq", label: "Questions fréquentes" },
  { to: "/comprendre-sa-peau", label: "Comprendre sa peau" },
  { to: "/ordre-routine-skincare", label: "Ordre d’une routine" },
];

const SiteFooter = () => (
  <footer className="bg-[#183e34] text-[#f8f6f1]">
    <div className="site-container py-12 sm:py-16">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-16">
        <div>
          <Link to="/" className="inline-flex font-serif text-3xl tracking-[-0.04em] text-[#f8f6f1]">SkinView</Link>
          <p className="mt-4 max-w-[310px] font-sans text-sm leading-[1.65] text-white/65">
            Comprends ta peau avant d’acheter. Une analyse indépendante pour construire une routine cohérente.
          </p>
          <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.2em] text-[#e0b8a9]">Une peau comprise, une vie plus belle.</p>
        </div>
        <nav aria-label="Le rapport">
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Le rapport</h2>
          <ul className="mt-4 space-y-3">
            {reportLinks.map((link) => <li key={link.to}><Link to={link.to} className="font-sans text-sm text-white/75 transition hover:text-white">{link.label}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Ressources">
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Ressources</h2>
          <ul className="mt-4 space-y-3">
            {guideLinks.map((link) => <li key={link.to}><Link to={link.to} className="font-sans text-sm text-white/75 transition hover:text-white">{link.label}</Link></li>)}
          </ul>
        </nav>
      </div>

      <div className="mt-12 border-t border-white/15 pt-5">
        <p className="max-w-4xl font-sans text-[11px] leading-[1.6] text-white/50">
          Les photos servent uniquement à générer votre rapport. SkinView est un service de conseil cosmétique et ne constitue pas un diagnostic médical. Sans affiliation à une marque.
        </p>
        <p className="mt-4 font-sans text-[11px] text-white/35">© {new Date().getFullYear()} SkinView — Comprendre aujourd’hui. Choisir avec plus de sens demain.</p>
      </div>
    </div>
  </footer>
);
export default SiteFooter;
