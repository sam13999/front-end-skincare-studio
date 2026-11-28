import { describe, expect, it } from "vitest";
import {
  ALLOWED_VALUES,
  QUESTIONNAIRE_VERSION,
  buildAndValidatePayload,
  questions,
  getVisibleQuestions,
  restoreStoredDiagnosticData,
} from "@/components/diagnostic/types";
import { hasUsablePhotoForLaunch } from "@/components/diagnostic/photoLaunch";

const answerAll = () =>
  Object.fromEntries(
    questions.map((question) => [
      question.key,
      question.type === "multiple" ? [question.options[0].value] : question.options[0].value,
    ]),
  );

const validData = () => ({
  photoFace: null,
  photoProfile: null,
  prenom: "Samir",
  email: "s@example.com",
  answers: answerAll(),
});

describe("questionnaire SkinView v4", () => {
  const visibleKeys = (answers: Record<string, string | string[]>) =>
    getVisibleQuestions(answers).map((question) => question.key);

  it("lists the v4 questions in order, without duplicates", () => {
    expect(questions.map((question) => question.key)).toEqual([
      "age_range", "genre", "grossesse_allaitement", "objectif_principal", "zone_preoccupation", "type_cernes",
      "profil_peau_declare", "reactivite_peau_declaree", "imperfections_frequence", "couleur_peau_declaree",
      "niveau_routine_actuelle", "produits_utilises_regulierement", "maquillage_frequence", "types_maquillage",
      "preferences_a_eviter", "taille_routine",
    ]);
    expect(QUESTIONNAIRE_VERSION).toBe("v4");
    expect(ALLOWED_VALUES.preferences_a_eviter).not.toContain("Trop d’étapes");
    expect(ALLOWED_VALUES.preferences_a_eviter).not.toContain("Soins qui picotent ou irritent facilement");
    expect(ALLOWED_VALUES.profil_peau_declare).not.toContain("Elle réagit facilement, avec rougeurs ou picotements");
    expect(ALLOWED_VALUES.taille_routine).toContain("Une routine très simple (4 produits ou moins)");
  });

  it("uses the required maxima", () => {
    expect(questions.filter((question) => question.type === "multiple").map((question) => [question.key, question.maxSelections])).toEqual([
      ["produits_utilises_regulierement", 4],
      ["types_maquillage", 2],
      ["preferences_a_eviter", 2],
    ]);
  });

  it("spares men the pregnancy and makeup questions", () => {
    const data = validData();
    data.answers.genre = "Homme";
    expect(visibleKeys(data.answers)).not.toContain("grossesse_allaitement");
    expect(visibleKeys(data.answers)).not.toContain("maquillage_frequence");
    expect(visibleKeys(data.answers)).not.toContain("types_maquillage");
    const result = buildAndValidatePayload(data);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.questionnaire.grossesse_allaitement).toBeUndefined();
      expect(result.payload.questionnaire.maquillage_frequence).toBeUndefined();
    }
  });

  it("asks the dark-circle type instead of the zone when dark circles are the concern", () => {
    const answers = { ...answerAll(), objectif_principal: "Cernes / poches" };
    expect(visibleKeys(answers)).toContain("type_cernes");
    expect(visibleKeys(answers)).not.toContain("zone_preoccupation");
    expect(visibleKeys({ ...answerAll(), objectif_principal: "Rien de particulier" })).not.toContain("zone_preoccupation");
    expect(visibleKeys(answerAll())).not.toContain("type_cernes");
  });

  it("asks used products only to people who already have a routine", () => {
    expect(visibleKeys({ ...answerAll(), niveau_routine_actuelle: "Je n’utilise pratiquement aucun soin" }))
      .not.toContain("produits_utilises_regulierement");
    expect(visibleKeys({ ...answerAll(), niveau_routine_actuelle: "Routine régulière, 3 à 4 produits" }))
      .toContain("produits_utilises_regulierement");
  });

  it("requires makeup type only when makeup is worn", () => {
    const never = validData();
    never.answers.maquillage_frequence = "Jamais";
    delete never.answers.types_maquillage;
    expect(buildAndValidatePayload(never).ok).toBe(true);

    const daily = validData();
    daily.answers.maquillage_frequence = "Tous les jours";
    daily.answers.types_maquillage = ["Maquillage du teint (fond de teint, BB/CC crème, correcteur)"];
    expect(buildAndValidatePayload(daily).ok).toBe(true);
  });

  it("builds a strict v4 payload with identity at the end of the flow", () => {
    const result = buildAndValidatePayload(validData());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.questionnaire_version).toBe("v4");
      expect(result.payload.questionnaire.questionnaire_version).toBe("v4");
      expect(result.payload.questionnaire.prenom).toBe("Samir");
      expect(result.payload.questionnaire.taille_routine).toBe(ALLOWED_VALUES.taille_routine[0]);
    }
  });

  it("enforces product and preference limits and exclusivity", () => {
    const productsTooMany = validData();
    productsTooMany.answers.niveau_routine_actuelle = "Routine complète, 5 produits ou plus";
    productsTooMany.answers.produits_utilises_regulierement = ALLOWED_VALUES.produits_utilises_regulierement.slice(0, 5);
    expect(buildAndValidatePayload(productsTooMany).ok).toBe(false);

    const preferencesTooMany = validData();
    preferencesTooMany.answers.preferences_a_eviter = ALLOWED_VALUES.preferences_a_eviter.slice(0, 3);
    expect(buildAndValidatePayload(preferencesTooMany).ok).toBe(false);

    const nothingPlusOther = validData();
    nothingPlusOther.answers.preferences_a_eviter = ["Rien en particulier", "Fini collant"];
    expect(buildAndValidatePayload(nothingPlusOther).ok).toBe(false);
  });

  it("requires every answer plus prénom and email", () => {
    const missingAnswer = validData();
    delete missingAnswer.answers.age_range;
    expect(buildAndValidatePayload(missingAnswer).ok).toBe(false);

    const missingIdentity = validData();
    missingIdentity.email = "";
    expect(buildAndValidatePayload(missingIdentity).ok).toBe(false);
  });

  it("restores v4 only and does not reuse old questionnaire answers", () => {
    const restored = restoreStoredDiagnosticData(JSON.stringify({
      questionnaire_version: "v3",
      answers: { objectif_principal: "ancienne valeur", signes_remarques: ["ancienne réponse"] },
      prenom: "Samir",
      email: "s@example.com",
    }));
    expect(restored.answers).toEqual({});
    expect(restored.prenom).toBe("Samir");
    expect(restored.email).toBe("s@example.com");
  });

  it("allows launch with one usable photo but not with none", () => {
    expect(hasUsablePhotoForLaunch(null, null)).toBe(false);
    expect(hasUsablePhotoForLaunch("face.jpg", null)).toBe(true);
    expect(hasUsablePhotoForLaunch(null, "profile.jpg")).toBe(true);
  });
});
