import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import * as api from "@/lib/adminApi";
import RouteDiagnostics from "./RouteDiagnostics";

vi.mock("@/lib/adminApi", () => ({
  routineMoments: ["matin", "soir", "hebdomadaire"],
  fetchRouteEditor: vi.fn(), saveRouteEditor: vi.fn(), fetchAdminArtifact: vi.fn(),
  decideRoutineCandidate: vi.fn(), fetchRoutineCandidatePdf: vi.fn(),
}));
const schedule = { cadence: "weekly", initial_per_week: 1, maximum_per_week: 2,
  replaces_product_id: "", days: [], excluded_days: [], alternate_with: [], pair_with: [] };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchRouteEditor).mockResolvedValue({
    review_revision: "a".repeat(64), route_id: "route_1", status: "needs_correction",
    editable: true, draft_revision: null, history: [], issues: [],
    levers: [{ levier_id: "lever", role: "principal", moments: ["matin", "soir"], besoins_couverts: ["confort"] }],
    products: [{ id: "a", name: "Soin A", subcategory: "creme", moments: ["matin", "soir"] },
      { id: "b", name: "Soin B", subcategory: "serum", moments: ["soir"] }],
    items: [{ id_produit: "a", levier_id: "lever", moment: "matin", schedule, reason: "Confort" }],
  } as api.RouteEditorData);
});
function mount() {
  render(<RouteDiagnostics token="secret" sessionId="session" onSaved={vi.fn()} diagnostics={{
    files: ["shortlist_payload.json"], shortlist_issues: [],
    routes: [{ route_id: "route_1", status: "needs_correction", issues: [], attempts: [],
      missing_required_levers: [], levers: [{ id: "lever", role: "principal", required: true, needs: ["confort"],
        subcategories: ["creme"], moments: ["matin", "soir"], products: [{ id: "a", name: "Soin A" }],
        excluded: [{ id: "c", name: "Soin C", reason: "profile_incompatibility" }] }] }],
  }} />);
  fireEvent.click(screen.getByText("Modifier cette stratégie"));
}
it("expose les diagnostics et conserve les stratégies à corriger", async () => {
  mount();
  expect(screen.getByText("route_1 · À corriger")).toBeInTheDocument();
  expect(screen.getByText(/Soin C · Incompatibilité confirmée/)).toBeInTheDocument();
  await screen.findByLabelText("Produit");
  expect(api.fetchRouteEditor).toHaveBeenCalledWith("secret", "session", "route_1");
});
it("permet remplacement, déplacement, ajout et suppression avant validation", async () => {
  mount();
  const product = await screen.findByLabelText("Produit");
  fireEvent.change(product, { target: { value: "b" } });
  fireEvent.change(screen.getByLabelText("Moment"), { target: { value: "soir" } });
  fireEvent.click(screen.getByText("Ajouter une étape"));
  expect(screen.getAllByLabelText("Produit")).toHaveLength(2);
  fireEvent.click(screen.getAllByText("Supprimer l’étape")[1]);
  vi.mocked(api.saveRouteEditor).mockResolvedValue({
    id: "00000001", items: [], validation: { status: "fail", issues: [
      { code: "required_lever_missing", message: "Le nettoyage reste sans couverture." },
    ] },
  });
  fireEvent.click(screen.getByText("Enregistrer et vérifier"));
  await waitFor(() => expect(api.saveRouteEditor).toHaveBeenCalled());
  expect(vi.mocked(api.saveRouteEditor).mock.calls[0][3].items[0]).toMatchObject({
    id_produit: "b", moment: "soir", levier_id: "lever",
  });
  await screen.findByText("Le nettoyage reste sans couverture.");
  expect(screen.getByText("Relancer l’arbitrage")).toBeDisabled();
});
