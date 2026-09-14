import { describe, expect, it } from "vitest";
import {
  ALLOWED_VALUES,
  QUESTIONNAIRE_VERSION,
  buildAndValidatePayload,
  questions,
  restoreStoredDiagnosticData,
} from "@/components/diagnostic/types";
import { hasUsablePhotoForLaunch } from "@/components/diagnostic/photoLaunch";

const answerAll = () =>
  Object.fromEntries(questions.map((question) => [
    question.key,
    question.type === "multiple" ? [question.options[0].value] : question.options[0].value,
  ]));

describe("questionnaire SkinView v2", () => {
  it("contains exactly the 11 questions in the required order", () => {
    expect(questions.map((question) => question.key)).toEqual([
      "objectif_principal", "signes_remarques", "zones_preoccupantes", "ressenti_peau",
      "frequence_routine", "produits_utilises_regulierement", "reactivite_nouveaux_soins",
      "experience_actifs_forts", "produits_portes_journee", "textures_preferees", "preferences_a_eviter",
    ]);
    expect(questions).toHaveLength(11);
  });

  it("uses exact values and per-question maxima", () => {
    expect(ALLOWED_VALUES.produits_utilises_regulierement).toContain("Je ne sais pas exactement");
    expect(questions.filter((question) => question.type === "multiple").map((question) => [question.key, question.maxSelections])).toEqual([
      ["signes_remarques", 2], ["zones_preoccupantes", 2], ["ressenti_peau", 2],
      ["produits_utilises_regulierement", 8], ["experience_actifs_forts", 2],
      ["produits_portes_journee", 3], ["textures_preferees", 2], ["preferences_a_eviter", 2],
    ]);
  });

  it("enforces exclusivity and the v2 payload version", () => {
    const answers = answerAll();
    answers.signes_remarques = ["Aucun en particulier", "Teint terne"];
    expect(buildAndValidatePayload({ photoFace: null, photoProfile: null, prenom: "Samir", email: "s@example.com", answers })).toMatchObject({ ok: false });

    const valid = buildAndValidatePayload({ photoFace: null, photoProfile: null, prenom: "Samir", email: "s@example.com", answers: answerAll() });
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.payload.questionnaire_version).toBe(QUESTIONNAIRE_VERSION);
      expect(valid.payload.questionnaire.questionnaire_version).toBe("v2");
    }
  });

  it("rejects the ninth product", () => {
    const answers = answerAll();
    answers.produits_utilises_regulierement = ALLOWED_VALUES.produits_utilises_regulierement.slice(1, 10);
    const result = buildAndValidatePayload({ photoFace: null, photoProfile: null, prenom: "Samir", email: "s@example.com", answers });
    expect(result.ok).toBe(false);
  });

  it("invalidates legacy answers while preserving identity", () => {
    const restored = restoreStoredDiagnosticData(JSON.stringify({
      questionnaire_version: "v1",
      answers: { objectif: "ancienne valeur" },
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
