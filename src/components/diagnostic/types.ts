export interface DiagnosticData {
  photoFace: string | null;
  photoProfile: string | null;
  answers: Record<string, string | string[]>;
  prenom?: string;
  email?: string;
}

export interface QuestionOption {
  label: string; // displayed to user
  value: string; // EXACT backend value — never modify
}

export interface Question {
  id: number;
  /** Backend key — must match payload exactly */
  key: BackendKey;
  title: string;
  subtitle?: string;
  type: "single" | "multiple";
  options: QuestionOption[];
}

export type BackendKey =
  | "objectif_principal"
  | "probleme_principal_visible"
  | "zone_plus_problematique"
  | "routine_actuelle"
  | "produits_utilises_regulierement"
  | "reactivite_peau"
  | "ce_que_vous_voulez_eviter";

/**
 * Allowed backend values, locked. Used both as <select> source and as
 * the strict whitelist for pre-submit validation.
 * DO NOT modify accents, spacing, casing, or punctuation.
 */
export const ALLOWED_VALUES: Record<BackendKey, readonly string[]> = {
  objectif_principal: [
    "Réduire les imperfections",
    "Uniformiser le teint / atténuer les marques",
    "Améliorer l’éclat",
    "Apaiser / réduire l’inconfort",
    "Hydrater / renforcer la barrière cutanée",
    "Prévenir les premiers signes de l’âge",
    "Je ne sais pas",
  ],
  probleme_principal_visible: [
    "Boutons / imperfections",
    "Marques / irrégularités",
    "Rougeurs",
    "Teint terne",
    "Sécheresse / tiraillements",
    "Brillance / pores visibles",
    "Premières rides / relâchement",
    "Je ne sais pas",
  ],
  zone_plus_problematique: [
    "Front",
    "Joues",
    "Menton",
    "Nez",
    "Contour des yeux",
    "Plusieurs zones",
    "Je ne sais pas",
  ],
  routine_actuelle: [
    "Non",
    "Oui, simple (1–2 produits)",
    "Oui, régulière (3–4 produits)",
    "Oui, complète (5+ produits)",
    "Je change souvent",
    "Je ne sais pas",
  ],
  produits_utilises_regulierement: [
    "Aucun",
    "Nettoyant doux",
    "Nettoyant purifiant / anti-imperfections",
    "Sérum hydratant / apaisant",
    "Sérum anti-imperfections",
    "Sérum anti-taches",
    "Sérum anti-âge",
    "Crème légère",
    "Crème riche",
    "Protection solaire (SPF)",
    "Exfoliant",
    "Rétinol / rétinoïde",
    "Huile visage",
  ],
  reactivite_peau: [
    "Oui (rougeurs, picotements…)",
    "Parfois",
    "Non",
    "Je ne sais pas",
  ],
  ce_que_vous_voulez_eviter: [
    "Trop d’étapes",
    "Sensation grasse / lourde",
    "Produits agressifs",
    "Résultats trop lents",
    "Parfum / odeur forte",
    "Je ne sais pas",
  ],
};

/** Helper to build options where label === value (exact backend strings). */
const opts = (key: BackendKey, labels?: Record<string, string>): QuestionOption[] =>
  ALLOWED_VALUES[key].map((v) => ({ label: labels?.[v] ?? v, value: v }));

export const questions: Question[] = [
  {
    id: 1,
    key: "objectif_principal",
    title: "Quel est votre objectif principal ?",
    subtitle: "Choisissez celui qui vous parle le plus.",
    type: "single",
    options: opts("objectif_principal"),
  },
  {
    id: 2,
    key: "probleme_principal_visible",
    title: "Quel est le problème le plus visible aujourd’hui ?",
    subtitle: "Ce que vous remarquez en premier dans le miroir.",
    type: "single",
    options: opts("probleme_principal_visible"),
  },
  {
    id: 3,
    key: "zone_plus_problematique",
    title: "Quelle zone vous préoccupe le plus ?",
    subtitle: "Une seule réponse.",
    type: "single",
    options: opts("zone_plus_problematique"),
  },
  {
    id: 4,
    key: "routine_actuelle",
    title: "Avez-vous une routine actuelle ?",
    subtitle: "Soyez honnête, sans jugement.",
    type: "single",
    options: opts("routine_actuelle"),
  },
  {
    id: 5,
    key: "produits_utilises_regulierement",
    title: "Quels produits utilisez-vous régulièrement ?",
    subtitle: "Vous pouvez en sélectionner plusieurs.",
    type: "multiple",
    options: opts("produits_utilises_regulierement"),
  },
  {
    id: 6,
    key: "reactivite_peau",
    title: "Votre peau est-elle réactive ?",
    subtitle: "Rougeurs, picotements, inconfort après un produit.",
    type: "single",
    options: opts("reactivite_peau"),
  },
  {
    id: 7,
    key: "ce_que_vous_voulez_eviter",
    title: "Que souhaitez-vous éviter ?",
    subtitle: "Une seule réponse.",
    type: "single",
    options: opts("ce_que_vous_voulez_eviter"),
  },
];

// --- Payload + validation ---

export interface QuestionnairePayload {
  prenom: string;
  email: string;
  objectif_principal: string;
  probleme_principal_visible: string;
  zone_plus_problematique: string;
  routine_actuelle: string;
  produits_utilises_regulierement: string[];
  reactivite_peau: string;
  ce_que_vous_voulez_eviter: string;
}

export interface ValidationError {
  field: string;
  message: string;
  invalidValue?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Builds the strict backend payload from the diagnostic data.
 * Validates every value against ALLOWED_VALUES — no transformation, no fallback.
 */
export function buildAndValidatePayload(
  data: DiagnosticData
): { ok: true; payload: { questionnaire: QuestionnairePayload } } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const prenom = (data.prenom ?? "").trim();
  const email = (data.email ?? "").trim();

  if (!prenom) errors.push({ field: "prenom", message: "Le prénom est requis." });
  if (!email || !EMAIL_RE.test(email))
    errors.push({ field: "email", message: "Email invalide." });

  const singleKeys: BackendKey[] = [
    "objectif_principal",
    "probleme_principal_visible",
    "zone_plus_problematique",
    "routine_actuelle",
    "reactivite_peau",
    "ce_que_vous_voulez_eviter",
  ];

  const single: Partial<Record<BackendKey, string>> = {};
  for (const key of singleKeys) {
    const v = data.answers[key];
    if (typeof v !== "string" || !v) {
      errors.push({ field: key, message: "Réponse manquante." });
      continue;
    }
    if (!ALLOWED_VALUES[key].includes(v)) {
      errors.push({ field: key, message: "Valeur non autorisée.", invalidValue: v });
      continue;
    }
    single[key] = v;
  }

  const produits = data.answers.produits_utilises_regulierement;
  let produitsArr: string[] = [];
  if (!Array.isArray(produits) || produits.length === 0) {
    errors.push({
      field: "produits_utilises_regulierement",
      message: "Sélection requise.",
    });
  } else {
    if (produits.length > 4) {
      errors.push({
        field: "produits_utilises_regulierement",
        message: "Sélectionnez au maximum 4 produits.",
      });
    }
    for (const v of produits) {
      if (!ALLOWED_VALUES.produits_utilises_regulierement.includes(v)) {
        errors.push({
          field: "produits_utilises_regulierement",
          message: "Valeur non autorisée.",
          invalidValue: v,
        });
      }
    }
    produitsArr = produits as string[];
  }

  if (errors.length > 0) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[questionnaire] validation errors", errors);
    }
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: {
      questionnaire: {
        prenom,
        email,
        objectif_principal: single.objectif_principal!,
        probleme_principal_visible: single.probleme_principal_visible!,
        zone_plus_problematique: single.zone_plus_problematique!,
        routine_actuelle: single.routine_actuelle!,
        produits_utilises_regulierement: produitsArr,
        reactivite_peau: single.reactivite_peau!,
        ce_que_vous_voulez_eviter: single.ce_que_vous_voulez_eviter!,
      },
    },
  };
}
