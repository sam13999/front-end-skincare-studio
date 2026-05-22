import SeoPage from "./SeoPage";

const RoutineNeFonctionnePas = () => (
  <SeoPage
    title="Ma routine skincare ne fonctionne pas : par où commencer ?"
    intro="Quand une routine ne donne pas de résultat, ce n'est pas toujours un problème de produit. C'est presque toujours un problème de logique."
    sections={[
      {
        title: "Vérifier la cohérence avant de changer de marque",
        body: (
          <p>
            Avant d'acheter une nouvelle gamme, regardez l'ordre d'application, la fréquence des
            actifs forts, les associations à risque (rétinol + acides, par exemple) et la
            cohérence des textures.
          </p>
        ),
      },
      {
        title: "Donner du temps à la peau",
        body: (
          <p>
            Beaucoup de routines sont jugées trop tôt. La plupart des actifs demandent 4 à 8
            semaines pour montrer un effet visible — à condition d'être utilisés dans un cadre
            logique.
          </p>
        ),
      },
    ]}
  />
);

export default RoutineNeFonctionnePas;
