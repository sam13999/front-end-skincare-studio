import SeoPage from "./SeoPage";

const Actifs = () => (
  <SeoPage
    title="Niacinamide, vitamine C, rétinol, BHA : par où commencer ?"
    intro="Ces quatre actifs sont partout. Encore faut-il savoir lequel correspond à votre peau, à quelle dose, et avec quoi il ne doit pas être associé."
    sections={[
      {
        title: "Niacinamide",
        body: (
          <p>
            Polyvalente, plutôt bien tolérée, utile sur l'éclat et les pores. Souvent un bon
            point de départ quand la peau ne tolère pas grand-chose.
          </p>
        ),
      },
      {
        title: "Vitamine C",
        body: (
          <p>
            Antioxydante, intéressante le matin. Sa stabilité, sa concentration et sa galénique
            comptent autant que la molécule elle-même.
          </p>
        ),
      },
      {
        title: "Rétinol",
        body: (
          <p>
            Puissant, exigeant, à introduire progressivement. Pas systématique : tout le monde
            n'en a pas besoin.
          </p>
        ),
      },
      {
        title: "BHA (acide salicylique)",
        body: (
          <p>
            Utile sur les pores et certaines imperfections, à utiliser avec mesure et jamais en
            cumul d'autres actifs forts le même soir.
          </p>
        ),
      },
    ]}
  />
);

export default Actifs;
