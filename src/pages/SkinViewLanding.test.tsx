import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DiagnosticProvider } from "@/context/DiagnosticContext";
import SkinViewLanding from "./SkinViewLanding";

function renderLanding() {
  return render(
    <MemoryRouter>
      <DiagnosticProvider>
        <SkinViewLanding />
      </DiagnosticProvider>
    </MemoryRouter>,
  );
}

describe("SkinView landing", () => {
  it("conserve le nouveau positionnement, les offres et le rapport", () => {
    renderLanding();

    expect(screen.getByRole("heading", { level: 1, name: /26 points analysés/ })).toBeInTheDocument();
    expect(screen.getByText("Exemple d’analyse")).toBeInTheDocument();
    const prices = document.querySelectorAll(".sv-price");
    expect(prices).toHaveLength(2);
    expect(prices[0].textContent).toContain("39");
    expect(prices[1].textContent).toContain("59");
    expect(screen.getByRole("heading", { name: "Voyez exactement ce que vous recevez" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Une analyse ne suffit pas. Il faut savoir quoi en faire." })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pas de conclusions forcées" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(10);
    expect(screen.getByText("Créateur de routine sur mesure")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Le conseil avant le produit." })).not.toBeInTheDocument();
  });

  it("explique chaque pastille au toucher", () => {
    renderLanding();

    fireEvent.click(screen.getByRole("button", { name: "Indépendant" }));
    expect(screen.getByRole("region", { name: "Indépendant" })).toHaveTextContent("Pas de gamme maison");
    fireEvent.click(screen.getByRole("button", { name: "Indépendant" }));
    expect(screen.queryByRole("region", { name: "Indépendant" })).not.toBeInTheDocument();
  });

  it("ouvre le menu et le diagnostic depuis le nouveau CTA", () => {
    renderLanding();

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    const menu = screen.getByRole("navigation");
    expect(within(menu).getByRole("button", { name: "Commencer mon analyse" })).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole("button", { name: "Commencer mon analyse" }));
    expect(screen.getByText("Photo de face")).toBeInTheDocument();
  });
});
