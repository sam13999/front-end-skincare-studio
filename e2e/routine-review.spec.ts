import { expect, test } from "@playwright/test";

test("réviser une stratégie conservée et contrôler ses étapes", async ({ page }, testInfo) => {
  const revision = "a".repeat(64);
  const schedule = { cadence: "weekly", initial_per_week: 1, maximum_per_week: 2,
    replaces_product_id: "", days: [], excluded_days: [], alternate_with: [], pair_with: [] };
  const items = [{ id_produit: "support", levier_id: "confort", moment: "soir",
    schedule, reason: "Confort documenté" }];
  const levers = [{ levier_id: "confort", role: "complementaire", moments: ["matin", "soir"],
    besoins_couverts: ["Confort"] }];
  const diagnostic = {
    files: ["shortlist_payload.json", "shortlist_qa.json", "validation_catalogue_par_route.json"],
    shortlist_issues: [],
    routes: [
      { route_id: "route_1", status: "needs_correction", missing_required_levers: [], issues: [
        { code: "application_moment", message: "Créneau initial à corriger. La stratégie reste disponible." }],
        attempts: [{ method: "prompt_4", validation: { status: "fail" } }],
        levers: [{ id: "confort", role: "complementaire", required: false, needs: ["Confort"],
          subcategories: ["soin_confort"], moments: ["soir"],
          products: [{ id: "support", name: "Soin de confort" }],
          excluded: [{ id: "excluded", name: "Autre soin", reason: "profile_incompatibility" }],
          outside_requested_subcategories: 160 }] },
      { route_id: "route_2", status: "valid", issues: [], attempts: [], levers: [], missing_required_levers: [] },
      { route_id: "route_3", status: "unavailable", issues: [], attempts: [], levers: [],
        missing_required_levers: ["Protection requise sans candidat"] },
    ],
  };
  const detail = {
    summary: { session_id: "demo", display_name: "Démonstration SkinView", first_name: "Démonstration",
      email: "", created_at: "2026-11-17T12:00:00Z", updated_at: "2026-11-17T12:00:00Z",
      status: "completed", review_status: "pending_review", review_revision: revision,
      payment: { payment_status: "unknown" }, html_available: true, pdf_available: true },
    user: { questionnaire: {}, photos: [] },
    analysis: { routine_diagnostics: diagnostic }, prompts: {},
    qa: { stages: {}, issues: [], totals: { ok: 0, warnings: 0, blocking: 0 } },
    artifacts: [], history: [], rerun_history: [], raw_session: {},
  };
  let draft: string | null = null;
  let saved: unknown;
  await page.addInitScript(() => sessionStorage.setItem("skinview_admin_token", "synthetic-demo-token"));
  await page.route("**/v1/admin/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" } });
      return;
    }
    let payload: unknown;
    if (path.endsWith("/auth/check")) payload = { authenticated: true };
    else if (path.endsWith("/sessions")) payload = { items: [], stats: {
      sessions_today: 0, sessions_complete: 0, sessions_failed: 0, sessions_paid: 0, revenue_total: 0, currency: "EUR" } };
    else if (path.endsWith("/routes/route_1")) {
      if (route.request().method() === "POST") {
        saved = route.request().postDataJSON();
        expect((saved as { items: unknown[] }).items).toHaveLength(2);
        draft = "00000001";
        payload = { id: draft, items: (saved as { items: unknown[] }).items,
          validation: { status: "ok", issues: [] } };
      } else payload = {
        review_revision: revision, route_id: "route_1", status: "needs_correction", editable: true,
        levers, products: [
          { id: "support", name: "Soin de confort", subcategory: "soin_confort", moments: ["matin", "soir"] },
          { id: "alternative", name: "Autre formulation", subcategory: "soin_confort", moments: ["soir"] },
        ], items, draft_revision: draft, history: [], issues: [],
      };
    } else if (path.endsWith("/session/demo")) payload = detail;
    else throw new Error(`Requête inattendue dans la démonstration ${path}`);
    await route.fulfill({ json: payload, headers: { "Access-Control-Allow-Origin": "*" } });
  });

  await page.goto("/admin/session/demo");
  await page.getByRole("button", { name: "Analyse", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Filtrage et validation des routines" })).toBeVisible();
  await page.getByText("route_1 · À corriger", { exact: true }).click();
  await expect(page.getByText("Créneau initial à corriger. La stratégie reste disponible.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Modifier cette stratégie" }).click();
  await page.getByRole("combobox", { name: "Produit", exact: true }).selectOption("alternative");
  await page.getByRole("combobox", { name: "Moment", exact: true }).selectOption("soir");
  await page.getByLabel("Applications initiales par semaine").fill("2");
  await page.getByRole("button", { name: "Ajouter une étape" }).click();
  await page.getByRole("combobox", { name: "Produit", exact: true }).nth(1).selectOption("support");
  await page.getByRole("combobox", { name: "Moment", exact: true }).nth(1).selectOption("matin");
  await page.getByLabel("Justification de la sélection").nth(1).fill("Fonction complémentaire documentée");
  await page.getByRole("button", { name: "Enregistrer et vérifier" }).click();
  await expect(page.getByText("Brouillon enregistré et contrôlé.")).toBeVisible();
  expect(saved).toMatchObject({ items: [
    { id_produit: "alternative", moment: "soir" },
    { id_produit: "support", moment: "matin" },
  ] });
  await expect(page.getByRole("button", { name: "Relancer l’arbitrage" })).toBeEnabled();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("dashboard-revision.png"), fullPage: true });
  await page.getByRole("button", { name: "Supprimer l’étape" }).nth(1).click();
  await expect(page.getByRole("combobox", { name: "Produit", exact: true })).toHaveCount(1);
});
