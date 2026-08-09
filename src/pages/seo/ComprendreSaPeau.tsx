import SeoPage from "./SeoPage";

const ComprendreSaPeau = () => (
  <SeoPage
    title="Reconnaître les besoins visibles de sa peau"
    metaTitle="Reconnaître les besoins de sa peau | Guide SkinView"
    metaDescription="Brillance, tiraillements, sensibilité, imperfections : apprenez à lire les signes visibles de votre peau avant de choisir vos soins."
    intro="Reconnaître les besoins de sa peau, ce n'est pas la classer en deux mots. C'est observer ce qu'elle montre, ce qu'elle tolère et la façon dont elle évolue."
    sections={[
      {
        title: "Au-delà de « peau grasse » ou « peau sèche »",
        body: (
          <p>
            Une peau est rarement uniforme. Elle peut être déshydratée et grasse, sensible et
            sujette à imperfections, mature et réactive. Ces nuances changent radicalement les
            actifs adaptés.
          </p>
        ),
      },
      {
        title: "Ce que votre peau essaie de vous montrer",
        body: (
          <p>
            Les rougeurs localisées, la brillance ciblée, les pores plus visibles à certains
            endroits, les tiraillements en fin de journée : chaque signal a un sens, à condition
            d'être lu.
          </p>
        ),
      },
    ]}
  />
);

export default ComprendreSaPeau;
