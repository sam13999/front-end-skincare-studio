export const QUESTIONNAIRE_VERSION = "v3" as const;

export interface DiagnosticData {
  photoFace: string | null;
  photoProfile: string | null;
  answers: Record<string, string | string[]>;
  prenom?: string;
  email?: string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  key: BackendKey;
  title: string;
  subtitle?: string;
  type: "single" | "multiple";
  maxSelections?: number;
  exclusiveValues?: readonly string[];
  options: QuestionOption[];
  showWhen?: (answers: Record<string, string | string[]>) => boolean;
}

export type BackendKey =
  | "age_range"
  | "genre"
  | "grossesse_allaitement"
  | "maquillage_frequence"
  | "types_maquillage"
  | "objectif_principal"
  | "zone_preoccupation"
  | "profil_peau_declare"
  | "couleur_peau_declaree"
  | "niveau_routine_actuelle"
  | "produits_utilises_regulierement"
  | "preferences_a_eviter"
  | "attentes_routine";

export const ALLOWED_VALUES: Record<BackendKey, readonly string[]> = {
  age_range: ["Moins de 18 ans", "18–24 ans", "25–34 ans", "35–44 ans", "45–54 ans", "55 ans et +"],
  genre: ["Femme", "Homme", "Autre", "Je préfère ne pas répondre"],
  grossesse_allaitement: ["Non", "Enceinte", "Allaitement", "Je préfère ne pas répondre"],
  maquillage_frequence: ["Jamais", "Occasionnellement", "Plusieurs fois par semaine", "Tous les jours"],
  types_maquillage: [
    "Maquillage du teint (fond de teint, BB/CC crème, correcteur)",
    "Maquillage des yeux (mascara, eyeliner, fard)",
    "Maquillage longue tenue ou résistant à l’eau",
    "Maquillage léger sans teint couvrant",
  ],
  objectif_principal: [
    "Boutons / imperfections", "Points noirs", "Pores dilatés", "Taches / hyperpigmentation",
    "Rougeurs", "Sécheresse / déshydratation", "Brillance / excès de sébum", "Rides / ridules",
    "Cernes / poches", "Teint terne", "Rien de particulier",
  ],
  zone_preoccupation: ["Front", "Nez", "Joues", "Menton", "Contour des yeux", "Plusieurs zones", "Ensemble du visage"],
  profil_peau_declare: [
    "Elle tiraille souvent et manque de confort",
    "Elle est globalement confortable et réagit rarement",
    "Elle brille surtout sur la zone T",
    "Elle brille sur l’ensemble du visage",
    "Elle réagit facilement, avec rougeurs ou picotements",
    "Son comportement varie beaucoup selon les zones ou les périodes",
  ],
  couleur_peau_declaree: ["Très claire", "Claire", "Médium", "Mate", "Brune", "Brun foncé"],
  niveau_routine_actuelle: [
    "Je n’utilise pratiquement aucun soin",
    "Routine très simple, 1 à 2 produits",
    "Routine régulière, 3 à 4 produits",
    "Routine complète, 5 produits ou plus",
  ],
  produits_utilises_regulierement: [
    "Nettoyant", "Démaquillant / huile nettoyante", "Sérum", "Crème hydratante", "Protection solaire",
    "Exfoliant", "Rétinol / rétinoïde", "Traitement anti-imperfections", "Masque", "Autre", "Aucun",
  ],
  preferences_a_eviter: [
    "Trop d’étapes", "Sensation grasse ou lourde", "Fini collant", "Parfum ou odeur marquée",
    "Soins qui picotent ou irritent facilement", "Rien en particulier", "Je ne sais pas",
  ],
  attentes_routine: [
    "Une routine très simple", "Les résultats les plus efficaces possibles", "Des produits doux",
    "Une routine adaptée aux peaux sensibles", "Peu de produits", "Des textures légères",
    "Des produits sans parfum", "Autre",
  ],
};

const opts = (key: BackendKey): QuestionOption[] =>
  ALLOWED_VALUES[key].map((value) => ({ label: value, value }));

const multi = (
  key: BackendKey,
  title: string,
  subtitle: string,
  maxSelections: number,
  exclusiveValues: readonly string[] = [],
): Omit<Question, "id"> => ({
  key, title, subtitle, type: "multiple", maxSelections, exclusiveValues, options: opts(key),
});

const questionDefinitions: Omit<Question, "id">[] = [
  { key: "age_range", title: "Quel âge avez-vous ?", type: "single", options: opts("age_range") },
  { key: "genre", title: "Comment vous définissez-vous ?", type: "single", options: opts("genre") },
  {
    key: "grossesse_allaitement",
    title: "Êtes-vous enceinte ou allaitez-vous ?",
    subtitle: "Cette information nous aide à écarter certains actifs incompatibles.",
    type: "single",
    options: opts("grossesse_allaitement"),
    showWhen: (answers) => answers.genre !== "Homme",
  },
  {
    key: "objectif_principal",
    title: "Quelle est votre principale préoccupation ?",
    subtitle: "Choisissez une seule priorité.",
    type: "single",
    options: opts("objectif_principal"),
  },
  { key: "zone_preoccupation", title: "Où se situe principalement cette préoccupation ?", type: "single", options: opts("zone_preoccupation") },
  { key: "profil_peau_declare", title: "Comment décririez-vous votre peau au quotidien ?", type: "single", options: opts("profil_peau_declare") },
  {
    key: "couleur_peau_declaree",
    title: "Quelle est votre couleur de peau naturelle, sans bronzage ?",
    subtitle: "Votre réponse complète l’observation des photos, sans la remplacer.",
    type: "single",
    options: opts("couleur_peau_declaree"),
  },
  { key: "niveau_routine_actuelle", title: "À quoi ressemble actuellement votre routine ?", type: "single", options: opts("niveau_routine_actuelle") },
  {
    key: "maquillage_frequence",
    title: "Portez-vous du maquillage ?",
    type: "single",
    options: opts("maquillage_frequence"),
  },
  {
    key: "types_maquillage",
    title: "Quel type de maquillage portez-vous le plus souvent ?",
    subtitle: "Sélectionnez jusqu’à 2 réponses.",
    type: "multiple",
    maxSelections: 2,
    options: opts("types_maquillage"),
    showWhen: (answers) => answers.maquillage_frequence !== "Jamais",
  },
  multi("produits_utilises_regulierement", "Quels produits utilisez-vous régulièrement ?", "Sélectionnez jusqu’à 4 réponses.", 4, ["Aucun"]),
  multi("preferences_a_eviter", "Qu’aimeriez-vous particulièrement éviter dans votre future routine ?", "Sélectionnez jusqu’à 2 réponses.", 2, ["Rien en particulier", "Je ne sais pas"]),
  multi("attentes_routine", "Qu’attendez-vous principalement de votre future routine ?", "Sélectionnez jusqu’à 2 réponses.", 2),
];

export const questions: Question[] = questionDefinitions.map((question, index) => ({ ...question, id: index + 1 }));

export function getVisibleQuestions(answers: Record<string, string | string[]>): Question[] {
  return questions.filter((question) => !question.showWhen || question.showWhen(answers));
}

export interface QuestionnairePayload {
  questionnaire_version: typeof QUESTIONNAIRE_VERSION;
  prenom: string;
  email: string;
  [key: string]: string | string[];
}

export interface ValidationError {
  field: string;
  message: string;
  invalidValue?: unknown;
}

function isAnswerValue(value: unknown): value is string | string[] {
  return typeof value === "string" || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

export function restoreStoredDiagnosticData(raw: string | null): Pick<DiagnosticData, "answers" | "prenom" | "email"> {
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    if (parsed.questionnaire_version !== QUESTIONNAIRE_VERSION) {
      return {
        answers: {},
        prenom: typeof parsed.prenom === "string" ? parsed.prenom : "",
        email: typeof parsed.email === "string" ? parsed.email : "",
      };
    }
    const answers: Record<string, string | string[]> = {};
    if (parsed.answers && typeof parsed.answers === "object") {
      for (const [key, value] of Object.entries(parsed.answers)) {
        if (isAnswerValue(value)) answers[key] = value;
      }
    }
    return {
      answers,
      prenom: typeof parsed.prenom === "string" ? parsed.prenom : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
    };
  } catch {
    return { answers: {}, prenom: "", email: "" };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildAndValidatePayload(
  data: DiagnosticData,
): { ok: true; payload: { questionnaire_version: typeof QUESTIONNAIRE_VERSION; questionnaire: QuestionnairePayload } }
  | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const prenom = (data.prenom ?? "").trim();
  const email = (data.email ?? "").trim();
  if (!prenom) errors.push({ field: "prenom", message: "Le prénom est requis." });
  if (!email || !EMAIL_RE.test(email)) errors.push({ field: "email", message: "Email invalide." });

  const questionnaire: Record<string, unknown> = { questionnaire_version: QUESTIONNAIRE_VERSION, prenom, email };
  for (const question of getVisibleQuestions(data.answers)) {
    const value = data.answers[question.key];
    if (question.type === "single") {
      if (typeof value !== "string" || !value) {
        errors.push({ field: question.key, message: "Réponse manquante." });
      } else if (!ALLOWED_VALUES[question.key].includes(value)) {
        errors.push({ field: question.key, message: "Valeur non autorisée.", invalidValue: value });
      } else {
        questionnaire[question.key] = value;
      }
      continue;
    }

    const selected = Array.isArray(value) ? [...new Set(value)] : [];
    if (selected.length < 1) {
      errors.push({ field: question.key, message: "Sélection requise." });
      continue;
    }
    if (selected.length > (question.maxSelections ?? Number.POSITIVE_INFINITY)) {
      errors.push({ field: question.key, message: "Sélectionnez au maximum " + question.maxSelections + " réponses." });
    }
    for (const selectedValue of selected) {
      if (!ALLOWED_VALUES[question.key].includes(selectedValue)) {
        errors.push({ field: question.key, message: "Valeur non autorisée.", invalidValue: selectedValue });
      }
    }
    const exclusives = new Set(question.exclusiveValues ?? []);
    if (selected.some((item) => exclusives.has(item)) && selected.length > 1) {
      errors.push({ field: question.key, message: "Ce choix ne peut pas être combiné avec les autres." });
    }
    questionnaire[question.key] = selected;
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    payload: {
      questionnaire_version: QUESTIONNAIRE_VERSION,
      questionnaire: questionnaire as QuestionnairePayload,
    },
  };
}
