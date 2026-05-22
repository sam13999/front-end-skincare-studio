import SeoPage from "./SeoPage";

const RoutineTiktok = () => (
  <SeoPage
    title="Routine skincare TikTok : faut-il vraiment la copier ?"
    intro="Les routines TikTok donnent l'impression d'un raccourci. En réalité, elles sont calibrées pour une peau qui n'est pas la vôtre, avec des contraintes qui ne sont pas les vôtres."
    sections={[
      {
        title: "Pourquoi une routine virale ne donne pas le même résultat",
        body: (
          <>
            <p>
              Une routine virale est souvent construite autour d'un seul profil de peau, d'un
              climat précis et d'un budget particulier. Le copier-coller fonctionne rarement.
            </p>
            <p>
              Le vrai problème n'est pas la routine elle-même, c'est l'absence de logique entre
              ce que votre peau montre et ce qu'on vous propose d'appliquer.
            </p>
          </>
        ),
      },
      {
        title: "Ce qu'il faut regarder avant de copier",
        body: (
          <p>
            Avant d'ajouter un nouvel actif, posez trois questions : qu'est-ce que ma peau montre
            réellement ? Cet actif corrige-t-il un besoin que j'ai vraiment ? Va-t-il
            s'additionner ou entrer en conflit avec ce que j'utilise déjà ?
          </p>
        ),
      },
    ]}
  />
);

export default RoutineTiktok;
