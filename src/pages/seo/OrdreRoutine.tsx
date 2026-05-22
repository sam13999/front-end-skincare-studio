import SeoPage from "./SeoPage";

const OrdreRoutine = () => (
  <SeoPage
    title="Dans quel ordre appliquer ses soins skincare ?"
    intro="L'ordre d'application change autant le résultat que les produits eux-mêmes. Une routine bien ordonnée peut transformer une peau qui semblait ne pas répondre."
    sections={[
      {
        title: "Le principe simple : du plus fluide au plus riche",
        body: (
          <p>
            Nettoyage, eau ou essence, sérum ciblé, soin hydratant, crème, et enfin protection
            solaire le matin. Cette logique permet à chaque texture de pénétrer correctement.
          </p>
        ),
      },
      {
        title: "Les associations à éviter au même moment",
        body: (
          <p>
            Certains actifs ne s'aiment pas appliqués ensemble. Mieux vaut alterner matin/soir ou
            jour pair/impair plutôt que de tout empiler.
          </p>
        ),
      },
    ]}
  />
);

export default OrdreRoutine;
