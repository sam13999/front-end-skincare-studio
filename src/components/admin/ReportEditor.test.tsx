import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ReportEditor from "./ReportEditor";
import * as api from "@/lib/adminApi";

vi.mock("./PdfPreview", () => ({ default: () => <div aria-label="Aperçu PDF actualisé">Lecteur PDF</div> }));

vi.mock("@/lib/adminApi", () => ({
  fetchReportEditing: vi.fn(), saveReportText: vi.fn(), fetchAdminArtifact: vi.fn(),
  saveReportCrop: vi.fn(), deleteReportZoom: vi.fn(), fetchOriginalZoom: vi.fn(), revertReport: vi.fn(),
}));

describe("ReportEditor", () => {
  it("explique le bouton inactif quand aucun texte n'a changé", async () => {
    vi.mocked(api.fetchReportEditing).mockResolvedValue({ review_revision: "a".repeat(64), zooms: [], history: [], fields: [
      { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Initial" },
    ] });
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    expect(await screen.findByRole("button", { name: "Enregistrer les modifications" })).toBeDisabled();
  });

  it("affiche le chargement puis une erreur API sans annoncer de succès", async () => {
    vi.mocked(api.fetchReportEditing).mockResolvedValue({ review_revision: "a".repeat(64), zooms: [], history: [], fields: [
      { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Initial" },
    ] });
    let reject!: (error: Error) => void;
    vi.mocked(api.saveReportText).mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    fireEvent.change(await screen.findByLabelText("Résumé"), { target: { value: "Nouveau" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer les modifications" }));
    expect(screen.getByRole("button", { name: "Enregistrer les modifications" })).toBeDisabled();
    expect(screen.getByText("Enregistrement…")).toBeInTheDocument();
    reject(new Error("La version consultée a changé. Ouvrez le nouveau rapport."));
    expect(await screen.findByRole("alert")).toHaveTextContent("La version consultée a changé");
    expect(screen.queryByText(/Nouvelle version générée/)).not.toBeInTheDocument();
  });

  it("signale un refus du backend et ne reconstruit pas de faux aperçu", async () => {
    vi.mocked(api.fetchReportEditing).mockResolvedValue({ review_revision: "a".repeat(64), zooms: [], history: [], fields: [
      { path: ["strategy", "rationale"], label: "Stratégie", section: "strategy", value: "Initial" },
    ] });
    vi.mocked(api.saveReportText).mockRejectedValue(new Error("Correction refusée : objectif incohérent."));
    vi.mocked(api.fetchAdminArtifact).mockClear();
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    fireEvent.click(await screen.findByRole("navigation", { name: "Sections du rapport" }).then(nav => nav.querySelector("button:last-child")!));
    fireEvent.change(await screen.findByLabelText("Stratégie"), { target: { value: "Nouveau" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer les modifications" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("objectif incohérent");
    expect(api.fetchAdminArtifact).not.toHaveBeenCalled();
  });
  it("borne le voile à la photo et garde historique et aperçu utilisables après recadrage", async () => {
    const editing = { review_revision: "c".repeat(64),
      zooms: [{ title: "Texture", signal_id: "texture", source_photo: "face_raw", crop_method: "manual",
        source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] }],
      history: [{ revision: 1, reason: "Original", action: "original", snapshot: "inject.json" }], fields: [] };
    vi.mocked(api.fetchReportEditing).mockResolvedValueOnce(editing).mockResolvedValue({ ...editing, review_revision: "d".repeat(64) });
    vi.mocked(api.fetchOriginalZoom).mockResolvedValue(new Blob(["photo"]));
    vi.mocked(api.saveReportCrop).mockResolvedValue({ review_revision: "d".repeat(64) });
    vi.mocked(api.fetchAdminArtifact).mockResolvedValue(new Blob(["PDF"]));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:photo") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    const original = await screen.findByAltText("Photo originale : face_raw");
    expect(original.parentElement).toHaveClass("overflow-hidden");
    expect(original.parentElement?.querySelector("[class*='shadow-[']")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer ce cadrage" }));
    await waitFor(() => expect(api.saveReportCrop).toHaveBeenCalledOnce());
    await screen.findByLabelText("Aperçu PDF actualisé");
    fireEvent.click(screen.getByText("Historique des versions"));
    expect(screen.getByRole("button", { name: "Restaurer" })).toBeEnabled();
  });
  it("change la photo et envoie la détection sélectionnée avec les coordonnées", async () => {
    const revision = "a".repeat(64);
    const rect: [number, number, number, number] = [.25, .3, .4, .4];
    const editing: api.ReportEditing = {
      review_revision: revision, fields: [], history: [],
      zooms: [{ title: "Texture", signal_id: "texture", source_photo: "face", crop_method: "manual",
        source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] }],
      detections: [{ id: "side:skin_spot:0", title: "Zone pigmentée", zone: "joue droite",
        source_photo: "side", confidence: null, source_width: 800, source_height: 700, rect }],
    };
    vi.mocked(api.fetchReportEditing).mockResolvedValueOnce(editing).mockResolvedValue({ ...editing, review_revision: "d".repeat(64) });
    vi.mocked(api.fetchOriginalZoom).mockResolvedValue(new Blob(["photo"]));
    vi.mocked(api.saveReportCrop).mockResolvedValue({ review_revision: "d".repeat(64) });
    vi.mocked(api.fetchAdminArtifact).mockResolvedValue(new Blob(["PDF"]));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:photo") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    const select = await screen.findByRole("combobox", { name: "Preuve photographique du zoom 1" });
    fireEvent.change(select, { target: { value: "side:skin_spot:0" } });
    await screen.findByAltText("Photo originale : side");
    expect(api.fetchOriginalZoom).toHaveBeenLastCalledWith("admin", "session", 0, "side:skin_spot:0", revision);
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer le remplacement" }));
    await waitFor(() => expect(api.saveReportCrop).toHaveBeenLastCalledWith("admin", "session", 0, revision, rect, "side:skin_spot:0"));
    await screen.findByLabelText("Aperçu PDF actualisé");
  });
  it("sauvegarde les champs structurés et prévisualise sans appel IA", async () => {
    const saved = vi.fn();
    const editing = { review_revision: "a".repeat(64), zooms: [], history: [],
      fields: [{ path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Texte initial" }] };
    vi.mocked(api.fetchReportEditing).mockResolvedValueOnce(editing).mockResolvedValue({ ...editing, review_revision: "b".repeat(64), fields: [{ ...editing.fields[0], value: "Texte corrigé" }] });
    vi.mocked(api.saveReportText).mockResolvedValue({ review_revision: "b".repeat(64) });
    vi.mocked(api.fetchAdminArtifact).mockResolvedValue(new Blob(["PDF"]));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:preview") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });

    render(<ReportEditor token="admin" sessionId="session" onSaved={saved} />);
    fireEvent.change(await screen.findByLabelText("Résumé"), { target: { value: "Texte corrigé" } });
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer les modifications/ }));
    await waitFor(() => expect(api.saveReportText).toHaveBeenCalledWith("admin", "session", "a".repeat(64), [
      { path: ["overview", "summary_sentence"], value: "Texte corrigé" },
    ]));
    await screen.findByLabelText("Aperçu PDF actualisé");
    expect(saved).toHaveBeenCalledOnce();
    expect(screen.getByText(/Vérifiez-la avant approbation/)).toBeInTheDocument();
  });
});

it("enregistre le titre, la légende et la description sans inclure le brouillon du rapport", async () => {
  const revision = "a".repeat(64);
  const nextRevision = "b".repeat(64);
  const zoom = { title: "Pores visibles", caption: "Légende initiale", image_alt: "Photo des pores",
    signal_id: "pores_left_cheek", source_photo: "face", crop_method: "manual",
    source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] };
  const editing = { review_revision: revision, zooms: [zoom], history: [], fields: [
    { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Texte initial" },
    { path: ["overview", "zooms", 0, "title"], label: "Observation", section: "overview", value: zoom.title },
  ] };
  vi.mocked(api.fetchReportEditing).mockResolvedValueOnce(editing)
    .mockResolvedValue({ ...editing, review_revision: nextRevision, zooms: [{ ...zoom, title: "Pores de la joue" }] });
  vi.mocked(api.fetchOriginalZoom).mockResolvedValue(new Blob(["photo"]));
  vi.mocked(api.fetchAdminArtifact).mockResolvedValue(new Blob(["PDF"]));
  vi.mocked(api.saveReportText).mockResolvedValue({ review_revision: nextRevision });

  render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
  fireEvent.change(await screen.findByLabelText("Résumé"), { target: { value: "Brouillon" } });
  fireEvent.change(screen.getByLabelText("Titre de l’observation"), { target: { value: "Pores de la joue" } });
  fireEvent.change(screen.getByLabelText("Légende"), { target: { value: "Détail de la joue." } });
  fireEvent.change(screen.getByLabelText("Description accessible"), { target: { value: "Vue rapprochée des pores" } });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer les textes du zoom" }));
  await screen.findByLabelText("Aperçu PDF actualisé");
  expect(api.saveReportText).toHaveBeenLastCalledWith("admin", "session", revision, [
    { path: ["overview", "zooms", 0, "title"], value: "Pores de la joue" },
    { path: ["overview", "zooms", 0, "caption"], value: "Détail de la joue." },
    { path: ["overview", "zooms", 0, "image_alt"], value: "Vue rapprochée des pores" },
  ]);
  expect(screen.getByLabelText("Résumé")).toHaveValue("Brouillon");
  expect(screen.queryByText("Observation")).not.toBeInTheDocument();
});

it("demande confirmation avant suppression et indique quand il ne reste aucun zoom", async () => {
  const revision = "a".repeat(64);
  const nextRevision = "b".repeat(64);
  const editing = { review_revision: revision, fields: [], history: [], zooms: [
    { title: "Pores visibles", signal_id: "pores_left_cheek", source_photo: "face", crop_method: "manual",
      source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] },
  ] };
  vi.mocked(api.fetchReportEditing).mockResolvedValueOnce(editing)
    .mockResolvedValue({ ...editing, review_revision: nextRevision, zooms: [] });
  vi.mocked(api.fetchOriginalZoom).mockResolvedValue(new Blob(["photo"]));
  vi.mocked(api.deleteReportZoom).mockResolvedValue({ review_revision: nextRevision });
  vi.mocked(api.fetchAdminArtifact).mockResolvedValue(new Blob(["PDF"]));
  const confirmation = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
  try {
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    const button = await screen.findByRole("button", { name: "Supprimer ce zoom" });
    fireEvent.click(button);
    expect(api.deleteReportZoom).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(await screen.findByText(/Aucune preuve photographique affichée/)).toBeInTheDocument();
    expect(api.deleteReportZoom).toHaveBeenCalledWith("admin", "session", 0, revision);
    await screen.findByLabelText("Aperçu PDF actualisé");
    expect(api.fetchAdminArtifact).toHaveBeenLastCalledWith("admin", "session", "pdf", nextRevision);
  } finally {
    confirmation.mockRestore();
  }
});
