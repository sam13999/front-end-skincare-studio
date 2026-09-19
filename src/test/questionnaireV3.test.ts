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

describe("questionnaire SkinView v3", () => {
  it("contains exactly the 11 questions in the required order", () => {
    expect(questions.map((question) => question.key)).toEqual([
      "age_range",
      "genre",
      "grossesse_allaitement",
      "objectif_principal",
      "zone_preoccupation",
      "profil_peau_declare",
      "couleur_peau_declaree",
      "niveau_routine_actuelle",
      "maquillage_frequence",
      "types_maquillage",
      "produits_utilises_regulierement",
      "preferences_a_eviter",
      "attentes_routine",
    ]);
    expect(questions).toHaveLength(13);
    expect(QUESTIONNAIRE_VERSION).toBe("v3");
  });

  it("uses the required maxima and exact answer values", () => {
    expect(ALLOWED_VALUES.produits_utilises_regulierement).toContain("Rétinol / rétinoïde");
    expect(questions.filter((question) => question.type === "multiple").map((question) => [question.key, question.maxSelections])).toEqual([
      ["types_maquillage", 2],
      ["produits_utilises_regulierement", 4],
      ["preferences_a_eviter", 2],
      ["attentes_routine", 2],
    ]);
  });

  it("hides pregnancy for men and omits it from the payload", () => {
    const data = validData();
    data.answers.genre = "Homme";
    delete data.answers.grossesse_allaitement;
    delete data.answers.types_maquillage;
    expect(getVisibleQuestions(data.answers).some((question) => question.key === "grossesse_allaitement")).toBe(false);
    const result = buildAndValidatePayload(data);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.questionnaire.grossesse_allaitement).toBeUndefined();
      expect(result.payload.questionnaire.types_maquillage).toBeUndefined();
    }
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

  it("builds a strict v3 payload with identity at the end of the flow", () => {
    const result = buildAndValidatePayload(validData());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.questionnaire_version).toBe("v3");
      expect(result.payload.questionnaire.questionnaire_version).toBe("v3");
      expect(result.payload.questionnaire.prenom).toBe("Samir");
      expect(result.payload.questionnaire.email).toBe("s@example.com");
    }
  });

  it("enforces product, preference, expectation limits and exclusivity", () => {
    const productsTooMany = validData();
    productsTooMany.answers.produits_utilises_regulierement = ALLOWED_VALUES.produits_utilises_regulierement.slice(0, 5);
    expect(buildAndValidatePayload(productsTooMany).ok).toBe(false);

    const productsNonePlusOther = validData();
    productsNonePlusOther.answers.produits_utilises_regulierement = ["Aucun", "Nettoyant"];
    expect(buildAndValidatePayload(productsNonePlusOther).ok).toBe(false);

    const preferencesTooMany = validData();
    preferencesTooMany.answers.preferences_a_eviter = ALLOWED_VALUES.preferences_a_eviter.slice(0, 3);
    expect(buildAndValidatePayload(preferencesTooMany).ok).toBe(false);

    const expectationsTooMany = validData();
    expectationsTooMany.answers.attentes_routine = ALLOWED_VALUES.attentes_routine.slice(0, 3);
    expect(buildAndValidatePayload(expectationsTooMany).ok).toBe(false);
  });

  it("requires every answer plus prénom and email", () => {
    const missingAnswer = validData();
    delete missingAnswer.answers.age_range;
    expect(buildAndValidatePayload(missingAnswer).ok).toBe(false);

    const missingIdentity = validData();
    missingIdentity.email = "";
    expect(buildAndValidatePayload(missingIdentity).ok).toBe(false);
  });

  it("restores v3 only and does not reuse old questionnaire answers", () => {
    const restored = restoreStoredDiagnosticData(JSON.stringify({
      questionnaire_version: "v2",
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
