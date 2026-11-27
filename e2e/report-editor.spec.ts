import { expect, test } from "@playwright/test";

test("édite un rapport et ses sept soirs sur mobile et ordinateur", async ({ page }, testInfo) => {
  const sessionId = "demo-report";
  let revision = "a".repeat(64);
  let advice = "Introduisez un nouveau soin à la fois.";
  let morningOrder = ["SPF", "ST005"];
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
      await route.fulfill({ body: `<html><body>
        <section data-sv-panel><p data-edit-path='["overview","summary_sentence"]'>Introduisez un nouveau soin à la fois.</p><footer><span class="sv-foot__n">02 / 16</span></footer></section>
        <section data-sv-panel><p data-edit-path='["strategy","advice"]'>Introduisez un nouveau soin à la fois.</p><footer><span class="sv-foot__n">09 / 16</span></footer></section>
        </body></html>`,
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
        { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", section_id: "glance", value: "Introduisez un nouveau soin à la fois." },
        { path: ["strategy", "advice"], label: "Conseil de démarrage", section: "strategy", section_id: "why",
          optional: true, value: advice, original_value: "Introduisez un nouveau soin à la fois." },
      ],
    };
    else if (path.endsWith("/editing/routine")) result = {
      review_revision: revision, active_version: null, source: "initial", adjusted_products: [],
      route_id: "", initial_route_id: "", initial_frequencies: [], frequencies: [],
      application_order: { matin: morningOrder, soir: ["ST028", "ST005"], hebdomadaire: [] },
      products: [{ id_produit: "SPF", name: "Protection solaire", calendar_role: "spf", moments: {
        matin: { initial_per_week: 7, maximum_per_week: 7 } } },
        { id_produit: "ST028", name: "Geek & Gorgeous – A-Game 5", calendar_role: "corrective", moments: {
        soir: { initial_per_week: 1, maximum_per_week: 2, days: [], excluded_days: [],
          alternate_with: [], pair_with: [], progression: "" },
      } }, { id_produit: "ST005", name: "Geek & Gorgeous – Stress Less", calendar_role: "soothing",
        moments: { matin: { initial_per_week: 7, maximum_per_week: 7 },
          soir: { initial_per_week: 3, maximum_per_week: 3, days: [], excluded_days: [],
          alternate_with: [], pair_with: [], progression: "" } } }],
      warnings: [], texts_to_review: [], routes: [], candidate: null, editable: true,
    };
    else if (path.endsWith("/editing/routine/frequencies")) {
      const request = route.request().postDataJSON();
      expect(request.weekly_plan.initial).toHaveLength(7);
      expect(request.weekly_plan.progressed).toHaveLength(7);
      expect(request.weekly_plan.initial.filter((night: { support_product_ids?: string[] }) =>
        night.support_product_ids?.includes("ST005"))).toHaveLength(3);
      revision = "c".repeat(64);
      result = { review_revision: revision };
    } else if (path.endsWith("/editing/routine/order")) {
      const request = route.request().postDataJSON();
      expect(request.order.matin).toEqual(["ST005", "SPF"]);
      expect(request.order.soir).toEqual(["ST028", "ST005"]);
      morningOrder = request.order.matin;
      revision = "d".repeat(64);
      result = { review_revision: revision };
    } else if (path.endsWith(`/session/${sessionId}`)) result = {
      summary: summary(), user: { questionnaire: {}, photos: [] }, analysis: {}, prompts: {},
      qa: { stages: {}, issues: [], totals: { ok: 0, warnings: 0, blocking: 0 } },
      artifacts: [], history: [], rerun_history: [], raw_session: {},
    };
    else if (path.endsWith("/sessions")) result = { items: [summary()], total: 1, stats: {
      sessions_today: 1, sessions_complete: 1, sessions_failed: 0, sessions_paid: 1, revenue_total: 0, currency: "EUR",
    } };
    else if (path.endsWith("/promo-codes")) result = { items: [] };
    else throw new Error(`Route inattendue: ${path}`);
    await route.fulfill({ json: result, headers: { "Access-Control-Allow-Origin": "*" } });
  });
  await page.goto(`/admin/session/${sessionId}`);
  await page.getByRole("button", { name: "Corriger le rapport" }).click();
  const mobile = (page.viewportSize()?.width || 1280) < 1024;
  const chapter = async (name: string) => {
    if (mobile) await page.getByLabel("Chapitre du rapport").selectOption({ label: name });
    else await page.getByRole("navigation", { name: "Chapitres du rapport" }).getByRole("button", { name }).click();
  };
  await chapter("La stratégie SkinView");
  await expect(page.getByLabel("Conseil de démarrage")).toBeVisible();
  await chapter("Page de couverture");
  if (mobile) await page.getByRole("button", { name: "Aperçu", exact: true }).click();
  else await page.getByText("Aperçu HTML du rapport complet").click();
  await page.frameLocator('iframe[title="Aperçu HTML du rapport"]')
    .locator('[data-edit-path=\'["strategy","advice"]\']').click();
  await expect(page.getByLabel("Conseil de démarrage")).toBeVisible();
  await expect(page.getByText("Page 09 / 16").first()).toBeVisible();
  if (!mobile) await page.getByText("Aperçu HTML du rapport complet").click();
  await page.screenshot({ path: testInfo.outputPath("edition-rapport.png"), fullPage: true });
  await page.getByRole("button", { name: "Masquer ce bloc" }).click();
  await chapter("Votre peau en un coup d’œil");
  await chapter("La stratégie SkinView");
  await expect(page.getByLabel("Conseil de démarrage")).toHaveValue("");
  await page.getByRole("button", { name: "Enregistrer et reconstruire HTML/PDF" }).click();
  await expect(page.getByText(/Nouvelle version générée/)).toBeVisible();
  await page.getByRole("button", { name: "Routine", exact: true }).click();
  await page.getByRole("button", { name: "Monter Geek & Gorgeous – Stress Less" }).first().click();
  await expect(page.getByText("Ordre modifié, non enregistré.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("ordre-produits-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Enregistrer l’ordre et reconstruire" }).click();
  await expect(page.getByText("Ordre enregistré dans le rapport. La validation humaine reste requise.")).toBeVisible();
  await expect(page.getByRole("combobox", { name: /· départ/ })).toHaveCount(7);
  await page.getByRole("combobox", { name: "Sam · départ" }).selectOption("rest");
  await page.getByRole("combobox", { name: "Dim · départ" }).selectOption("recovery");
  await expect(page.getByText("Calendrier modifié, non enregistré.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("calendrier-sept-soirs.png"), fullPage: true });
  await page.getByRole("button", { name: "Appliquer et reconstruire" }).click();
  await expect(page.getByText("Fréquences enregistrées. Le rapport attend votre validation.")).toBeVisible();
});
