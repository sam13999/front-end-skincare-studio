import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import heroBg from "@/assets/hero-bg.jpg";
import heroBgMobile from "@/assets/hero-bg-mobile.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background image - desktop */}
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          width={1920}
          height={1080}
        />
        {/* Background image - mobile */}
        <img
          src={heroBgMobile}
          alt=""
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          width={768}
          height={1024}
        />
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-ivory/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Logo size="lg" />
          </div>

          {/* Gold separator */}
          <div
            className="gold-separator w-16 mb-10 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          />

          {/* Headline */}
          <h1
            className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-6 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            Votre peau mérite
            <br />
            <span className="italic font-light">un meilleur équilibre</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-warm font-sans font-light text-base md:text-lg leading-relaxed max-w-md mb-10 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            Ne la surchargez pas.
            <br />
            Écoutez-la. Nous en faisons notre expertise.
          </p>

          {/* CTA */}
          <div
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.8s" }}
          >
            <Button variant="premium" size="xl">
              Diagnostic personnalisé
            </Button>
          </div>

          {/* Gold accent below CTA */}
          <div
            className="mt-12 flex items-center gap-3 text-gold animate-fade-in-up opacity-0"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-8 h-px bg-gold/40" />
            <span className="font-sans text-[10px] tracking-[0.4em] uppercase font-light">
              Soin sur mesure
            </span>
            <div className="w-8 h-px bg-gold/40" />
          </div>
        </div>
      </section>

      {/* Value propositions - minimal section */}
      <section className="bg-ivory-light py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          {/* Section separator */}
          <div className="flex items-center justify-center mb-16">
            <div className="gold-separator w-24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
            {[
              {
                title: "Analyse approfondie",
                desc: "Un diagnostic précis de votre peau et de ses besoins réels.",
              },
              {
                title: "Routine personnalisée",
                desc: "Des soins adaptés, rien de superflu. L'essentiel, avec justesse.",
              },
              {
                title: "Résultats visibles",
                desc: "Une peau équilibrée, lumineuse, qui retrouve son éclat naturel.",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-8 bg-gold/30 mb-6" />
                <h3 className="font-serif text-foreground text-xl mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-warm font-sans font-light text-sm leading-relaxed max-w-[220px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom separator */}
          <div className="flex items-center justify-center mt-16">
            <div className="gold-separator w-24" />
          </div>
        </div>
      </section>

      {/* Quote section */}
      <section className="bg-background py-20 md:py-28">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="text-gold text-4xl font-serif mb-6">"</div>
          <blockquote className="font-serif text-foreground text-2xl md:text-3xl italic leading-relaxed mb-6">
            Votre peau n'a pas besoin de plus de produits.
            <br />
            <span className="not-italic font-medium text-foreground/80">
              Elle a besoin d'un meilleur équilibre.
            </span>
          </blockquote>
          <div className="gold-separator w-12 mx-auto mt-8 mb-8" />
          <Logo size="sm" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="font-serif text-primary-foreground tracking-[0.3em] text-sm mb-2">
            SKINCARE STUDIO
          </div>
          <p className="font-sans text-primary-foreground/50 text-xs tracking-wider font-light">
            L'expertise au service de votre peau
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
