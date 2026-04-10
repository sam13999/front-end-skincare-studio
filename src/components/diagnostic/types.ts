export interface DiagnosticData {
  photoFace: string | null;
  photoProfile: string | null;
  answers: Record<number, string | string[]>;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  title: string;
  subtitle?: string;
  type: "single" | "multiple";
  options: QuestionOption[];
}

export const questions: Question[] = [
  {
    id: 1,
    title: "Quel est votre objectif principal ?",
    subtitle: "Choisissez celui qui vous parle le plus.",
    type: "single",
    options: [
      { label: "Éclat", value: "eclat" },
      { label: "Texture plus lisse", value: "texture" },
      { label: "Imperfections", value: "imperfections" },
      { label: "Rougeurs", value: "rougeurs" },
      { label: "Hydratation", value: "hydratation" },
      { label: "Taches", value: "taches" },
      { label: "Premières rides", value: "rides" },
      { label: "Routine simple", value: "routine" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
  {
    id: 2,
    title: "Quel est le problème le plus visible aujourd'hui ?",
    subtitle: "Ce que vous remarquez en premier dans le miroir.",
    type: "single",
    options: [
      { label: "Pores visibles", value: "pores" },
      { label: "Points noirs", value: "points_noirs" },
      { label: "Boutons", value: "boutons" },
      { label: "Tiraillements", value: "tiraillements" },
      { label: "Rougeurs", value: "rougeurs" },
      { label: "Teint terne", value: "teint_terne" },
      { label: "Taches", value: "taches" },
      { label: "Rien de précis", value: "rien" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
  {
    id: 3,
    title: "Quelles zones vous préoccupent le plus ?",
    subtitle: "Vous pouvez en sélectionner plusieurs.",
    type: "multiple",
    options: [
      { label: "Front", value: "front" },
      { label: "Nez", value: "nez" },
      { label: "Joues", value: "joues" },
      { label: "Menton", value: "menton" },
      { label: "Zone T", value: "zone_t" },
      { label: "Contour des yeux", value: "contour_yeux" },
      { label: "Visage entier", value: "visage_entier" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
  {
    id: 4,
    title: "Comment votre peau se comporte-t-elle le plus souvent ?",
    subtitle: "Au quotidien, en général.",
    type: "single",
    options: [
      { label: "Confortable", value: "confortable" },
      { label: "Tire parfois", value: "tire" },
      { label: "Brille vite", value: "brille" },
      { label: "Mixte selon les zones", value: "mixte" },
      { label: "Réactive", value: "reactive" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
  {
    id: 5,
    title: "Quelle est votre routine actuelle ?",
    subtitle: "Pas de jugement, soyez honnête.",
    type: "single",
    options: [
      { label: "Aucune", value: "aucune" },
      { label: "Nettoyant seul", value: "nettoyant" },
      { label: "Nettoyant + crème", value: "nettoyant_creme" },
      { label: "Déjà plusieurs produits", value: "plusieurs" },
      { label: "J'utilise des actifs forts", value: "actifs_forts" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
  {
    id: 6,
    title: "Votre peau tolère-t-elle facilement les produits ?",
    subtitle: "Réactions, tiraillements, rougeurs inhabituelles ?",
    type: "single",
    options: [
      { label: "Oui, globalement", value: "oui" },
      { label: "Elle réagit parfois", value: "parfois" },
      { label: "Elle est très sensible", value: "sensible" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
  {
    id: 7,
    title: "Qu'aimeriez-vous éviter dans votre future routine ?",
    subtitle: "Vous pouvez en sélectionner plusieurs.",
    type: "multiple",
    options: [
      { label: "Parfum", value: "parfum" },
      { label: "Texture grasse", value: "grasse" },
      { label: "Trop d'étapes", value: "etapes" },
      { label: "Petit budget", value: "budget" },
      { label: "Actifs forts", value: "actifs" },
      { label: "Aucun en particulier", value: "aucun" },
      { label: "Je ne sais pas", value: "unknown" },
    ],
  },
];
