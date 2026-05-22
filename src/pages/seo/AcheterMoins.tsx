import SeoPage from "./SeoPage";

const AcheterMoins = () => (
  <SeoPage
    title="Acheter moins de skincare, mieux choisir"
    intro="Acheter moins ne veut pas dire se priver. Cela veut dire arrêter de dépenser dans des soins qui ne correspondent pas à ce que votre peau attend."
    sections={[
      {
        title: "Le coût caché d'une routine incohérente",
        body: (
          <p>
            Un sérum mal choisi, une crème trop riche, un actif agressif utilisé à mauvaise
            fréquence : chaque erreur coûte de l'argent, du temps et parfois de la patience.
          </p>
        ),
      },
      {
        title: "Construire un noyau, pas une collection",
        body: (
          <p>
            Une bonne routine repose sur 4 à 6 produits utilisés correctement, pas sur 12 soins
            empilés sans logique.
          </p>
        ),
      },
    ]}
  />
);

export default AcheterMoins;
