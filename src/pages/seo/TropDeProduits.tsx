import SeoPage from "./SeoPage";

const TropDeProduits = () => (
  <SeoPage
    title="Trop de produits skincare : quand votre routine se retourne contre vous"
    intro="Empiler les soins n'est pas une stratégie. C'est souvent le meilleur moyen d'agresser une peau qui demandait simplement de la cohérence."
    sections={[
      {
        title: "Les signaux d'une routine surchargée",
        body: (
          <p>
            Tiraillements, réactivité accrue, peau qui pique au moment de l'application, boutons
            qui apparaissent sans logique : ce sont souvent les symptômes d'une routine trop
            riche, pas d'une peau qui manque de produits.
          </p>
        ),
      },
      {
        title: "Réduire avant d'ajouter",
        body: (
          <p>
            Avant d'acheter un soin de plus, la bonne question est : que puis-je retirer pour
            voir comment ma peau se comporte vraiment ? Souvent, l'équilibre revient avec moins.
          </p>
        ),
      },
    ]}
  />
);

export default TropDeProduits;
