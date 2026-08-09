import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { ReportCta } from "@/components/ReportCta";

const navItems = [
  { to: "/rapport-skincare-personnalise", label: "Le rapport" },
  { to: "/exemple-rapport", label: "Exemple" },
  { to: "/notre-combat", label: "Notre combat" },
  { to: "/tarif", label: "Tarif" },
];

const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#173f36]/10 bg-[#f7f2ea]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 max-[359px]:h-[60px] sm:px-6 md:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo size="sm" className="text-[2rem]" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-sans text-[12px] tracking-[0.18em] uppercase transition-colors ${
                  isActive ? "text-foreground" : "text-warm hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <ReportCta label="Obtenir ma routine" size="sm" />
        </div>

        <button
          className="min-h-11 min-w-11 md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="px-5 py-5 flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-sans text-sm tracking-wide ${
                    isActive ? "text-foreground" : "text-warm"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2">
              <ReportCta size="default" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
