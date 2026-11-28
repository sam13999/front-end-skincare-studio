import { expect, test } from "@playwright/test";

test.describe("vitrine SkinView", () => {
  test.skip(({ isMobile }) => !isMobile, "La vitrine est pensée pour le mobile.");

  test("accueil : signature, pastilles et rapport", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByText("Créateur de routine sur mesure").first()).toBeVisible();
    await expect(page.getByText("Le conseil avant le produit.")).toHaveCount(0);

    await page.getByRole("button", { name: "Multimarque" }).click();
    const panel = page.getByRole("region", { name: "Multimarque" });
    await expect(panel).toContainText("SkinView ne vend aucun produit");
    await page.locator(".sv-hero").screenshot({ path: testInfo.outputPath("accueil-pastilles.png") });

    await page.getByRole("button", { name: "Indépendant" }).click();
    await expect(page.getByRole("region", { name: "Indépendant" })).toBeVisible();
    await page.getByRole("button", { name: "Indépendant" }).click();
    await expect(page.locator("#sv-perk-panel")).toHaveCount(0);

    const report = page.locator("#rapport");
    await report.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await report.screenshot({ path: testInfo.outputPath("accueil-rapport.png") });
    await page.getByRole("tab", { name: "Vos produits" }).click();
    await expect(page.locator(".sv-phone-caption")).toContainText("Vos produits");

    await page.getByRole("button", { name: "Voir le rapport complet" }).click();
    const dialog = page.getByRole("dialog", { name: "Rapport complet" });
    await expect(dialog.locator("img")).toHaveCount(10);
    await page.getByRole("button", { name: "Fermer" }).click();

    await page.screenshot({ path: testInfo.outputPath("accueil-complet.png"), fullPage: true });
  });

  test("notre histoire : page et accès depuis le menu", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.getByRole("link", { name: "Notre histoire" }).first().click();
    await expect(page).toHaveURL(/notre-histoire/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("une crème");
    await expect(page).toHaveTitle(/Notre histoire/);
    await page.screenshot({ path: testInfo.outputPath("notre-histoire.png"), fullPage: true });
  });
});
