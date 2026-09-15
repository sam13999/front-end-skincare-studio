import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { ReportCta } from "@/components/ReportCta";

const navItems = [
  { to: "/comment-ca-marche", label: "Comment ça marche", anchor: false },
  { to: "/exemple-rapport", label: "Exemple de rapport", anchor: false },
  { to: "/notre-combat", label: "Notre combat", anchor: false },
  { to: "/faq", label: "FAQ", anchor: false },
  { to: "/tarif", label: "Tarif", anchor: false },
];

const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#183e34]/10 bg-[#f8f6f1]/90 backdrop-blur-xl">
      <div className="site-container flex h-[70px] items-center justify-between sm:h-[78px]">
        <Link to="/" aria-label="Accueil SkinView" onClick={closeMenu} className="shrink-0">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {navItems.map((item) =>
            item.anchor ? (
              <Link key={item.to} to={item.to} className="font-sans text-[12px] font-medium text-[#52625e] transition hover:text-[#183e34]">
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  "font-sans text-[12px] font-medium transition " + (isActive ? "text-[#183e34]" : "text-[#52625e] hover:text-[#183e34]")
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <ReportCta label="Commencer mon analyse" size="sm" className="w-[205px]" />
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#183e34] transition hover:bg-[#183e34]/8 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-[#183e34]/10 bg-[#f8f6f1] lg:hidden" role="dialog" aria-label="Menu principal">
          <nav className="site-container flex flex-col gap-1 py-5" aria-label="Navigation mobile">
            <Link to="/" onClick={closeMenu} className="min-h-11 py-2 font-serif text-xl text-[#183e34]">Accueil</Link>
            {navItems.map((item) => {
              const className = "flex min-h-11 items-center border-b border-[#183e34]/10 font-sans text-sm text-[#52625e]";
              return item.anchor ? (
                <Link key={item.to} to={item.to} onClick={closeMenu} className={className}>{item.label}</Link>
              ) : (
                <NavLink key={item.to} to={item.to} onClick={closeMenu} className={className}>{item.label}</NavLink>
              );
            })}
            <div className="pt-4">
              <ReportCta label="Commencer mon analyse" className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
