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

    expect(screen.getByRole("heading", { name: "Une routine (vraiment) pensée pour votre peau." })).toBeInTheDocument();
    const prices = document.querySelectorAll(".sv-price");
    expect(prices).toHaveLength(2);
    expect(prices[0].textContent).toContain("39");
    expect(prices[1].textContent).toContain("59");
    expect(screen.getByRole("heading", { name: "Voyez exactement ce que vous recevez" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Une analyse ne suffit pas. Il faut savoir quoi en faire." })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pas de conclusions forcées" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
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
