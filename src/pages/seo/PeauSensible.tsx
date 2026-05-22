import SeoPage from "./SeoPage";

const PeauSensible = () => (
  <SeoPage
    title="Peau sensible : les actifs à éviter (ou à introduire avec précaution)"
    intro="Une peau sensible ne tolère pas tout. Certains actifs très populaires peuvent aggraver la barrière cutanée s'ils sont introduits sans logique."
    sections={[
      {
        title: "Les actifs à manier avec prudence",
        body: (
          <p>
            Acides exfoliants forts, rétinoïdes puissants, parfums concentrés, alcool dénaturé en
            tête de liste : pas interdits, mais à introduire progressivement et rarement
            associés.
          </p>
        ),
      },
      {
        title: "Ce qui aide une peau sensible à se stabiliser",
        body: (
          <p>
            Apaisants doux, hydratation simple, protection solaire quotidienne et réduction du
            nombre d'actifs forts en simultané. La logique compte plus que la performance brute.
          </p>
        ),
      },
    ]}
  />
);

export default PeauSensible;
