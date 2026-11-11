import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/adminApi";
import type { RoutineCandidate, RoutineView } from "@/lib/adminApi";
import RoutineEditor from "./RoutineEditor";

vi.mock("@/lib/adminApi", () => ({
  routineMoments: ["matin", "soir", "hebdomadaire"],
  fetchRoutine: vi.fn(), saveFrequencies: vi.fn(), rerunPrompt4: vi.fn(),
  decideRoutineCandidate: vi.fn(), fetchAdminArtifact: vi.fn(), fetchRoutineCandidatePdf: vi.fn(),
}));
vi.mock("./PdfPreview", () => ({ default: () => <p>Aperçu PDF chargé</p> }));

const initial = "a".repeat(64);
const revised = "b".repeat(64);
const serum = { id_produit: "serum", name: "Sérum correctif", initial_per_week: 12, maximum_per_week: 12,
  moments: ["matin", "soir"] as const, coordinates_with: [] };
const makeView = (): RoutineView => ({
  review_revision: initial, active_version: null, source: "initial", adjusted_products: [],
  route_id: "a", initial_route_id: "a", initial_frequencies: [{ ...serum, moments: [...serum.moments] }],
  frequencies: [{ ...serum, moments: [...serum.moments] }],
  products: [
    { id_produit: "serum", name: "Sérum correctif", moments: {
      matin: { initial_per_week: 7, maximum_per_week: 7 }, soir: { initial_per_week: 5, maximum_per_week: 5 },
    } },
    { id_produit: "exfol", name: "Exfoliant", moments: { hebdomadaire: { initial_per_week: 1, maximum_per_week: 2 } } },
  ],
  warnings: [{ code: "cumul", message: "Vérifier les 12 applications.", product_ids: ["serum"] }], texts_to_review: [],
  routes: ["a", "b", "c"].map((route_id, i) => ({
    route_id, nom: `Route ${i + 1}`, logique_technique: "Approche progressive", difference_majeure: "",
    available: i !== 2, missing_required_levers: i === 2 ? ["hydratation"] : [],
    nombre_produits_cible: 3, treatments: 1, precautions: [],
  })),
  candidate: null, editable: true,
});
const candidate: RoutineCandidate = { id: "proposal", route_id: "b", frequencies: [],
  warnings: [], texts_to_review: [], stale: false };

const renderEditor = () => render(<RoutineEditor token="test" sessionId="session" onSaved={vi.fn()} />);
const button = (name: string) => screen.getByRole("button", { name });

describe("Révision de la routine", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.fetchRoutine).mockResolvedValue(makeView());
  });

  it("enregistre les fréquences, les exclusions et l’alternance entre créneaux", async () => {
    vi.mocked(api.saveFrequencies).mockResolvedValue({ review_revision: revised });
    const view = makeView();
    view.review_revision = revised;
    view.adjusted_products = ["serum"];
    vi.mocked(api.fetchRoutine).mockResolvedValueOnce(makeView()).mockResolvedValueOnce(view);
    const { container } = renderEditor();
    await screen.findByText("Vérifier les 12 applications.");
    const product = within(Array.from(container.querySelectorAll("details")).find(
      details => details.querySelector("summary")?.textContent === "Sérum correctif",
    )!);
    fireEvent.click(product.getByLabelText("Matin"));
    fireEvent.change(product.getByLabelText("Départ / semaine"), { target: { value: "3" } });
    fireEvent.change(product.getByLabelText("Maximum / semaine"), { target: { value: "4" } });
    const excluded = product.getByText("Jours à exclure").closest("fieldset")!;
    fireEvent.click(within(excluded).getByLabelText("Lun"));
    fireEvent.change(product.getByLabelText("Exfoliant"), { target: { value: "alternate_with" } });
    fireEvent.click(button("Enregistrer les fréquences"));
    await screen.findByText("Fréquences enregistrées. Le rapport attend votre validation.");
    expect(api.saveFrequencies).toHaveBeenCalledWith("test", "session", initial, [{
      id_produit: "serum", moments: { soir: {
        initial_per_week: 3, maximum_per_week: 4, days: [], excluded_days: [0],
        alternate_with: ["exfol"], pair_with: [], progression: "",
      } },
    }]);
    expect(api.rerunPrompt4).not.toHaveBeenCalled();
    expect(await screen.findByText("Ajusté")).toBeInTheDocument();
  });

  it("affiche le rejet API et garde la saisie", async () => {
    vi.mocked(api.saveFrequencies).mockRejectedValue(new Error("La version a changé."));
    const { container } = renderEditor();
    await screen.findByText("Vérifier les 12 applications.");
    const morning = container.querySelector<HTMLInputElement>("input[type=number]")!;
    fireEvent.change(morning, { target: { value: "6" } });
    fireEvent.click(button("Enregistrer les fréquences"));
    expect(await screen.findByRole("alert")).toHaveTextContent("La version a changé.");
    expect(morning.value).toBe("6");
    expect(screen.queryByText(/Fréquences enregistrées/)).not.toBeInTheDocument();
  });

  it("verrouille le double clic et sépare l’aperçu de la décision", async () => {
    let resolve!: (proposal: RoutineCandidate) => void;
    vi.mocked(api.rerunPrompt4).mockImplementation(() => new Promise(r => { resolve = r; }));
    vi.mocked(api.fetchRoutineCandidatePdf).mockResolvedValue(new Blob(["pdf"]));
    vi.mocked(api.decideRoutineCandidate).mockResolvedValue({ review_revision: revised });
    const active = { ...makeView(), source: "prompt_4" as const, review_revision: revised, active_version: 1, route_id: "b" };
    vi.mocked(api.fetchRoutine).mockResolvedValueOnce(makeView()).mockResolvedValueOnce(active);
    renderEditor();
    const selection = await screen.findByLabelText("Mode de sélection");
    expect(within(selection).getByRole("option", { name: "Route 3" })).toBeDisabled();
    fireEvent.change(selection, { target: { value: "b" } });
    const launch = button("Générer une proposition");
    fireEvent.click(launch);
    fireEvent.click(launch);
    expect(api.rerunPrompt4).toHaveBeenCalledExactlyOnceWith("test", "session", initial, "b");
    expect(launch).toBeDisabled();
    expect(await screen.findByText("Prompt 4 en cours…")).toBeInTheDocument();
    resolve(candidate);
    expect(await screen.findByText("Proposition · Route 2")).toBeInTheDocument();
    expect(api.decideRoutineCandidate).not.toHaveBeenCalled();
    fireEvent.click(button("Aperçu de la proposition"));
    expect(await screen.findByText("Aperçu PDF chargé")).toBeInTheDocument();
    fireEvent.click(button("Retenir la proposition"));
    await waitFor(() => expect(api.decideRoutineCandidate).toHaveBeenCalledWith("test", "session", initial, "proposal", true));
    expect(await screen.findByText(/Proposition de Prompt 4 retenue/)).toBeInTheDocument();
  });
});
