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
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo size="sm" />
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
          <ReportCta label="Mon rapport — 29 €" size="sm" />
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              <ReportCta label="Recevoir mon rapport — 29 €" size="default" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
