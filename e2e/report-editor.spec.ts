import { expect, test } from "@playwright/test";

test("édite un rapport et ses sept soirs sur mobile et ordinateur", async ({ page }, testInfo) => {
  const sessionId = "demo-report";
  let revision = "a".repeat(64);
  let advice = "Introduisez un nouveau soin à la fois.";
  const summary = () => ({
    session_id: sessionId, display_name: "Rapport de démonstration", first_name: "Anaïs",
    email: "demo@example.test", created_at: "2026-11-22T12:00:00Z", updated_at: "2026-11-22T12:00:00Z",
    status: "completed", review_status: "pending_review", review_revision: revision,
    payment: { payment_status: "paid" }, html_available: true, pdf_available: true,
  });
  await page.addInitScript(() => sessionStorage.setItem("skinview_admin_token", "demo-token"));
  await page.route("**/v1/admin/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" } });
      return;
    }
    if (path.endsWith("/artifact/html")) {
      await route.fulfill({ body: "<html><body><p data-slot='strategy.advice'>Introduisez un nouveau soin à la fois.</p></body></html>",
        contentType: "text/html", headers: { "Access-Control-Allow-Origin": "*" } });
      return;
    }
    if (path.endsWith("/artifact/pdf")) {
      await route.fulfill({ body: "%PDF-1.4\n%%EOF", contentType: "application/pdf",
        headers: { "Access-Control-Allow-Origin": "*" } });
      return;
    }
    let result: unknown;
    if (path.endsWith("/auth/check")) result = { authenticated: true };
    else if (path.endsWith("/editing/text")) {
      const request = route.request().postDataJSON();
      expect(request.changes).toEqual([{ path: ["strategy", "advice"], value: "" }]);
      advice = ""; revision = "b".repeat(64);
      result = { review_revision: revision };
    } else if (path.endsWith("/editing")) result = {
      review_revision: revision, history: [], zooms: [], fields: [
        { path: ["report", "first_name"], label: "Prénom", section: "report", section_id: "cover", value: "Anaïs" },
        { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", section_id: "glance", value: "Peau mixte." },
        { path: ["strategy", "advice"], label: "Conseil de démarrage", section: "strategy", section_id: "why",
          optional: true, value: advice, original_value: "Introduisez un nouveau soin à la fois." },
      ],
    };
    else if (path.endsWith("/editing/routine")) result = {
      review_revision: revision, active_version: null, source: "initial", adjusted_products: [],
      route_id: "", initial_route_id: "", initial_frequencies: [], frequencies: [],
      products: [{ id_produit: "ST028", name: "Geek & Gorgeous – A-Game 5", moments: {
        soir: { initial_per_week: 1, maximum_per_week: 2, days: [], excluded_days: [],
          alternate_with: [], pair_with: [], progression: "" },
      } }],
      warnings: [], texts_to_review: [], routes: [], candidate: null, editable: true,
    };
    else if (path.endsWith("/editing/routine/frequencies")) {
      const request = route.request().postDataJSON();
      expect(request.weekly_plan.initial).toHaveLength(7);
      expect(request.weekly_plan.progressed).toHaveLength(7);
      revision = "c".repeat(64);
      result = { review_revision: revision };
    } else if (path.endsWith(`/session/${sessionId}`)) result = {
      summary: summary(), user: { questionnaire: {}, photos: [] }, analysis: {}, prompts: {},
      qa: { stages: {}, issues: [], totals: { ok: 0, warnings: 0, blocking: 0 } },
      artifacts: [], history: [], rerun_history: [], raw_session: {},
    };
    else if (path.endsWith("/sessions")) result = { items: [summary()], total: 1, stats: {
      sessions_today: 1, sessions_complete: 1, sessions_failed: 0, sessions_paid: 1, revenue_total: 0, currency: "EUR",
    } };
    else throw new Error(`Route inattendue: ${path}`);
    await route.fulfill({ json: result, headers: { "Access-Control-Allow-Origin": "*" } });
  });
  await page.goto(`/admin/session/${sessionId}`);
  await page.getByRole("button", { name: "Corriger le rapport" }).click();
  await expect(page.getByRole("navigation", { name: "Chapitres du rapport" })).toBeVisible();
  await page.getByRole("button", { name: "La stratégie SkinView" }).click();
  await expect(page.getByLabel("Conseil de démarrage")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("edition-rapport.png"), fullPage: true });
  await page.getByRole("button", { name: "Masquer ce bloc" }).click();
  await page.getByRole("button", { name: "Votre peau en un coup d’œil" }).click();
  await page.getByRole("button", { name: "La stratégie SkinView" }).click();
  await expect(page.getByLabel("Conseil de démarrage")).toHaveValue("");
  await page.getByRole("button", { name: "Enregistrer et reconstruire HTML/PDF" }).click();
  await expect(page.getByText(/Nouvelle version générée/)).toBeVisible();
  await page.getByRole("button", { name: "Routine", exact: true }).click();
  await expect(page.getByRole("combobox", { name: /· départ/ })).toHaveCount(7);
  await page.getByRole("combobox", { name: "Sam · départ" }).selectOption("rest");
  await page.getByRole("combobox", { name: "Dim · départ" }).selectOption("recovery");
  await expect(page.getByText("Calendrier modifié, non enregistré.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("calendrier-sept-soirs.png"), fullPage: true });
  await page.getByRole("button", { name: "Appliquer et reconstruire" }).click();
  await expect(page.getByText("Fréquences enregistrées. Le rapport attend votre validation.")).toBeVisible();
});
