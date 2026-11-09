import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ReportEditor from "./ReportEditor";
import * as api from "@/lib/adminApi";

vi.mock("@/lib/adminApi", () => ({
  fetchReportEditing: vi.fn(), saveReportText: vi.fn(), fetchAdminArtifact: vi.fn(),
  saveReportCrop: vi.fn(), fetchOriginalZoom: vi.fn(), revertReport: vi.fn(),
}));

describe("ReportEditor", () => {
  it("borne le voile à la photo et garde historique et aperçu utilisables après recadrage", async () => {
    const editing = { review_revision: "c".repeat(64),
      zooms: [{ title: "Texture", signal_id: "texture", source_photo: "face_raw", crop_method: "manual",
        source_width: 400, source_height: 400, crop_box: [100, 100, 300, 300] }],
      history: [{ revision: 1, reason: "Original" }], fields: [] };
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
    await screen.findByTitle("Aperçu du rapport");
    expect(screen.getByRole("button", { name: "Restaurer" })).toBeEnabled();
  });
  it("sauvegarde les champs structurés et prévisualise sans appel IA", async () => {
    const saved = vi.fn();
    const editing = { review_revision: "a".repeat(64), zooms: [], history: [],
      fields: [{ path: ["overview", "summary_sentence"], label: "Résumé", section: "overview", value: "Texte initial" }] };
    vi.mocked(api.fetchReportEditing).mockResolvedValue(editing);
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
    await screen.findByTitle("Aperçu du rapport");
    expect(saved).toHaveBeenCalledOnce();
    expect(screen.getByText(/aucun email n’a été envoyé/)).toBeInTheDocument();
  });
});
