import { Link } from "react-router-dom";

const reportLinks = [
  { to: "/rapport-skincare-personnalise", label: "Ce que contient le rapport" },
  { to: "/exemple-rapport", label: "Voir un exemple" },
  { to: "/tarif", label: "Tarif" },
  { to: "/notre-combat", label: "Notre combat" },
];

const adviceLinks = [
  { to: "/comprendre-sa-peau", label: "Comprendre sa peau" },
  { to: "/ordre-routine-skincare", label: "Ordre d’une routine" },
  { to: "/acheter-moins-de-skincare", label: "Acheter moins de skincare" },
  { to: "/peau-sensible-actifs-a-eviter", label: "Peau sensible : actifs à éviter" },
];

const FooterLinks = ({ title, links }: { title: string; links: typeof reportLinks }) => (
  <nav aria-label={title}>
    <h2 className="mb-3 font-sans text-[9px] uppercase tracking-[0.24em] text-white/50">{title}</h2>
    <ul className="space-y-1.5">
      {links.map((link) => (
        <li key={link.to}>
          <Link className="font-sans text-[10.5px] leading-tight text-white/75 transition-colors hover:text-white" to={link.to}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

const SiteFooter = () => (
  <footer className="bg-[#173f36] text-[#f8f4ed]">
    <div className="mx-auto max-w-[1120px] px-5 py-9 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-[1.2fr_1fr_1fr] md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-[1.8rem] leading-none tracking-[-0.035em]">SkinView</div>
          <p className="mt-2 max-w-[300px] font-sans text-[10.5px] leading-[1.45] text-white/60">
            Comprendre votre peau et construire une routine skincare réellement sur mesure.
          </p>
        </div>
        <FooterLinks title="Le rapport" links={reportLinks} />
        <FooterLinks title="Comprendre votre peau" links={adviceLinks} />
      </div>

      <div className="mt-7 border-t border-white/12 pt-5">
        <p className="font-sans text-[9px] leading-[1.5] text-white/45">
          Les photos servent uniquement à générer votre rapport. SkinView est un service de conseil cosmétique et ne remplace pas un avis médical. Sans affiliation à une marque.
        </p>
        <p className="mt-3 text-center font-sans text-[9px] tracking-wide text-white/35">
          © {new Date().getFullYear()} SkinView — L’analyse au service de votre routine
        </p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
