import SeoPage from "./SeoPage";

const ComprendreSaPeau = () => (
  <SeoPage
    title="Comprendre sa peau avant d'acheter encore"
    intro="Comprendre sa peau, ce n'est pas la classer en deux mots. C'est lire ce qu'elle montre, ce qu'elle évite et ce qu'elle tolère vraiment."
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
