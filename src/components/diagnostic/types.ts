export const QUESTIONNAIRE_VERSION = "v2" as const;

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
}

export type BackendKey =
  | "objectif_principal"
  | "signes_remarques"
  | "zones_preoccupantes"
  | "ressenti_peau"
  | "frequence_routine"
  | "produits_utilises_regulierement"
  | "reactivite_nouveaux_soins"
  | "experience_actifs_forts"
  | "produits_portes_journee"
  | "textures_preferees"
  | "preferences_a_eviter";

export const ALLOWED_VALUES: Record<BackendKey, readonly string[]> = {
  objectif_principal: [
    "Réduire les boutons et imperfections",
    "Réduire les points noirs et l’apparence des pores",
    "Atténuer les marques ou taches",
    "Lisser le grain de peau",
    "Retrouver plus d’éclat",
    "Apaiser les rougeurs ou l’inconfort",
    "Améliorer l’hydratation et le confort",
    "Prévenir les premiers signes de l’âge",
    "Je ne sais pas",
  ],
  signes_remarques: [
    "Boutons ou imperfections",
    "Points noirs / pores visibles",
    "Marques ou taches après boutons",
    "Grain de peau irrégulier",
    "Brillance fréquente",
    "Sécheresse / tiraillements",
    "Rougeurs / picotements",
    "Teint terne",
    "Ridules / perte de fermeté",
    "Aucun en particulier",
    "Je ne sais pas",
  ],
  zones_preoccupantes: [
    "Front",
    "Nez",
    "Menton",
    "Joues",
    "Contour des yeux",
    "Contour de la bouche",
    "Ensemble du visage",
    "Aucune zone en particulier",
    "Je ne sais pas",
  ],
  ressenti_peau: [
    "Elle tiraille facilement",
    "Elle devient brillante rapidement",
    "Certaines zones brillent et d’autres tiraillent",
    "Elle rougit ou picote facilement",
    "Elle est généralement confortable",
    "Elle change beaucoup selon les périodes",
    "Je ne sais pas",
  ],
  frequence_routine: [
    "Matin et soir presque tous les jours",
    "Une fois par jour presque tous les jours",
    "Quelques jours par semaine",
    "De façon irrégulière",
    "Je n’ai pas vraiment de routine",
  ],
  produits_utilises_regulierement: [
    "Aucun",
    "Démaquillant / eau micellaire",
    "Huile ou baume nettoyant",
    "Nettoyant visage",
    "Lotion / toner / essence",
    "Sérum ou soin hydratant / apaisant",
    "Sérum ou soin anti-imperfections",
    "Sérum ou soin anti-taches / marques",
    "Sérum ou soin éclat",
    "Sérum ou soin anti-âge",
    "Exfoliant / peeling",
    "Rétinol / rétinoïde",
    "Crème hydratante légère",
    "Crème hydratante riche / réparatrice",
    "Huile visage",
    "Soin contour des yeux",
    "Masque / soin ponctuel",
    "Protection solaire",
    "Protection solaire teintée",
    "Autre soin ciblé",
    "Je ne sais pas exactement",
  ],
  reactivite_nouveaux_soins: [
    "Elle tolère généralement bien les nouveaux soins",
    "Elle peut parfois picoter ou rougir légèrement",
    "Elle réagit assez facilement avec rougeurs, picotements ou inconfort",
    "Elle est actuellement irritée ou très inconfortable",
    "Je ne sais pas",
  ],
  experience_actifs_forts: [
    "Je n’ai jamais utilisé d’exfoliant ni de rétinol",
    "J’ai déjà utilisé un exfoliant et je le tolère bien",
    "J’utilise ou j’ai utilisé du rétinol / rétinoïde et je le tolère bien",
    "J’ai déjà mal toléré un exfoliant",
    "J’ai déjà mal toléré du rétinol / rétinoïde",
    "Je ne sais pas",
  ],
  produits_portes_journee: [
    "Rien de particulier",
    "Protection solaire",
    "Protection solaire teintée",
    "Fond de teint / BB crème / CC crème",
    "Maquillage léger sans produit teinté couvrant",
    "Produits longue tenue ou résistants à l’eau",
  ],
  textures_preferees: [
    "Textures très légères / fluides",
    "Gel / gel-crème",
    "Crèmes légères",
    "Crèmes riches / enveloppantes",
    "Je n’ai pas de préférence",
    "Je ne sais pas",
  ],
  preferences_a_eviter: [
    "Trop d’étapes",
    "Sensation grasse ou lourde",
    "Fini collant",
    "Parfum ou odeur marquée",
    "Soins qui picotent ou irritent facilement",
    "Rien en particulier",
    "Je ne sais pas",
  ],
};

const opts = (key: BackendKey): QuestionOption[] =>
  ALLOWED_VALUES[key].map((value) => ({ label: value, value }));

const multi = (
  key: BackendKey,
  title: string,
  subtitle: string,
  maxSelections: number,
  exclusiveValues: readonly string[],
): Question => ({
  id: 0,
  key,
  title,
  subtitle,
  type: "multiple",
  maxSelections,
  exclusiveValues,
  options: opts(key),
});

const questionDefinitions: Omit<Question, "id">[] = [
  {
    key: "objectif_principal",
    title: "Quel est votre objectif principal pour votre peau ?",
    subtitle: "Choisissez la priorité qui compte le plus pour vous.",
    type: "single",
    options: opts("objectif_principal"),
  },
  multi("signes_remarques", "Quels signes remarquez-vous régulièrement sur votre peau ?", "Sélectionnez jusqu’à 2 réponses.", 2, ["Aucun en particulier", "Je ne sais pas"]),
  multi("zones_preoccupantes", "Quelles zones vous préoccupent le plus ?", "Sélectionnez jusqu’à 2 zones.", 2, ["Ensemble du visage", "Aucune zone en particulier", "Je ne sais pas"]),
  multi("ressenti_peau", "Comment décririez-vous votre peau au quotidien ?", "Sélectionnez jusqu’à 2 réponses.", 2, ["Je ne sais pas"]),
  {
    key: "frequence_routine",
    title: "À quelle fréquence suivez-vous réellement une routine visage ?",
    subtitle: "Pensez à vos habitudes habituelles, pas à votre routine idéale.",
    type: "single",
    options: opts("frequence_routine"),
  },
  multi("produits_utilises_regulierement", "Quels produits utilisez-vous actuellement de façon régulière ?", "Sélectionnez tout ce que vous utilisez, même si ce n’est pas tous les jours.", 8, ["Aucun", "Je ne sais pas exactement"]),
  {
    key: "reactivite_nouveaux_soins",
    title: "Comment votre peau réagit-elle généralement quand vous introduisez un nouveau soin ?",
    subtitle: "Pensez aux rougeurs, picotements ou sensations d’inconfort.",
    type: "single",
    options: opts("reactivite_nouveaux_soins"),
  },
  multi("experience_actifs_forts", "Quelle expérience avez-vous avec les exfoliants ou le rétinol ?", "Sélectionnez jusqu’à 2 réponses si nécessaire.", 2, ["Je n’ai jamais utilisé d’exfoliant ni de rétinol", "Je ne sais pas"]),
  multi("produits_portes_journee", "Que portez-vous généralement sur votre visage pendant la journée ?", "Cela nous aide notamment à adapter le nettoyage du soir.", 3, ["Rien de particulier"]),
  multi("textures_preferees", "Quelles textures préférez-vous sur votre visage ?", "Sélectionnez jusqu’à 2 réponses.", 2, ["Je n’ai pas de préférence", "Je ne sais pas"]),
  multi("preferences_a_eviter", "Qu’aimeriez-vous particulièrement éviter dans votre future routine ?", "Sélectionnez jusqu’à 2 réponses.", 2, ["Rien en particulier", "Je ne sais pas"]),
];

export const questions: Question[] = questionDefinitions.map((question, index) => ({ ...question, id: index + 1 }));

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

export function restoreStoredDiagnosticData(raw: string | null): Pick<DiagnosticData, "answers" | "prenom" | "email"> {
  try {
    const parsed = JSON.parse(raw || "{}");
    const currentVersion = parsed.questionnaire_version === QUESTIONNAIRE_VERSION;
    return {
      answers: currentVersion && parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
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
): { ok: true; payload: { questionnaire_version: typeof QUESTIONNAIRE_VERSION; questionnaire: QuestionnairePayload } } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const prenom = (data.prenom ?? "").trim();
  const email = (data.email ?? "").trim();
  if (!prenom) errors.push({ field: "prenom", message: "Le prénom est requis." });
  if (!email || !EMAIL_RE.test(email)) errors.push({ field: "email", message: "Email invalide." });

  const questionnaire: Record<string, unknown> = {
    questionnaire_version: QUESTIONNAIRE_VERSION,
    prenom,
    email,
  };

  for (const question of questions) {
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
      errors.push({ field: question.key, message: `Sélectionnez au maximum ${question.maxSelections} réponses.` });
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
