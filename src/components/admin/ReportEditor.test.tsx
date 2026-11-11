import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ReportEditor from "./ReportEditor";
import * as api from "@/lib/adminApi";

vi.mock("./PdfPreview", () => ({ default: () => <div aria-label="Aperçu PDF actualisé">Lecteur PDF</div> }));

vi.mock("@/lib/adminApi", () => ({
  fetchReportEditing: vi.fn(), saveReportText: vi.fn(), fetchAdminArtifact: vi.fn(),
  saveReportCrop: vi.fn(), fetchOriginalZoom: vi.fn(), revertReport: vi.fn(),
}));

describe("ReportEditor", () => {
  it("explique le bouton inactif quand aucun texte n'a changé", async () => {
    vi.mocked(api.fetchReportEditing).mockResolvedValue({ review_revision: "a".repeat(64), zooms: [], history: [], fields: [
      { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Initial" },
    ] });
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    expect(await screen.findByRole("button", { name: "Enregistrer et reconstruire HTML/PDF" })).toBeDisabled();
    expect(screen.getByText(/Modifiez un texte pour activer/)).toBeInTheDocument();
  });

  it("affiche le chargement puis une erreur API sans annoncer de succès", async () => {
    vi.mocked(api.fetchReportEditing).mockResolvedValue({ review_revision: "a".repeat(64), zooms: [], history: [], fields: [
      { path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Initial" },
    ] });
    let reject!: (error: Error) => void;
    vi.mocked(api.saveReportText).mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    fireEvent.change(await screen.findByLabelText("Résumé"), { target: { value: "Nouveau" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer et reconstruire HTML/PDF" }));
    expect(screen.getByRole("button", { name: /Reconstruction HTML\/PDF/ })).toBeDisabled();
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
    fireEvent.change(await screen.findByLabelText("Stratégie"), { target: { value: "Nouveau" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer et reconstruire HTML/PDF" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("objectif incohérent");
    expect(api.fetchAdminArtifact).not.toHaveBeenCalled();
  });
  it("borne le voile à la photo et garde historique et aperçu utilisables après recadrage", async () => {
    const editing = { review_revision: "c".repeat(64),
      zooms: [{ title: "Texture", signal_id: "texture", source_photo: "face_raw", crop_method: "manual",
        source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] }],
      history: [{ revision: 1, reason: "Original", action: "original", snapshot: "inject.json" }], fields: [] };
    vi.mocked(api.fetchReportEditing).mockResolvedValue(editing);
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
    expect(screen.getByRole("button", { name: "Restaurer" })).toBeEnabled();
  });
  it("change la photo et envoie la détection sélectionnée avec les coordonnées", async () => {
    const revision = "a".repeat(64);
    const rect: [number, number, number, number] = [.25, .3, .4, .4];
    vi.mocked(api.fetchReportEditing).mockResolvedValue({
      review_revision: revision, fields: [], history: [],
      zooms: [{ title: "Texture", signal_id: "texture", source_photo: "face", crop_method: "manual",
        source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] }],
      detections: [{ id: "side:skin_spot:0", title: "Zone pigmentée", zone: "joue droite",
        source_photo: "side", confidence: null, source_width: 800, source_height: 700, rect }],
    });
    vi.mocked(api.fetchOriginalZoom).mockResolvedValue(new Blob(["photo"]));
    vi.mocked(api.saveReportCrop).mockResolvedValue({ review_revision: "d".repeat(64) });
    vi.mocked(api.fetchAdminArtifact).mockResolvedValue(new Blob(["PDF"]));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:photo") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    render(<ReportEditor token="admin" sessionId="session" onSaved={vi.fn()} />);
    const select = await screen.findByRole("combobox", { name: "Détection Zyla du zoom 1" });
    fireEvent.change(select, { target: { value: "side:skin_spot:0" } });
    await screen.findByAltText("Photo originale : side");
    expect(api.fetchOriginalZoom).toHaveBeenLastCalledWith("admin", "session", 0, "side:skin_spot:0");
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer ce cadrage" }));
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
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer et reconstruire/ }));
    await waitFor(() => expect(api.saveReportText).toHaveBeenCalledWith("admin", "session", "a".repeat(64), [
      { path: ["overview", "summary_sentence"], value: "Texte corrigé" },
    ]));
    await screen.findByLabelText("Aperçu PDF actualisé");
    expect(saved).toHaveBeenCalledOnce();
    expect(screen.getByText(/aucun email n’a été envoyé/)).toBeInTheDocument();
  });
});
