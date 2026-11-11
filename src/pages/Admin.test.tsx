import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "./Admin";

const summary = (id: string, status: "completed" | "in_progress" | "failed" | "partial", name: string) => ({
  session_id: id,
  display_name: name,
  first_name: name,
  email: `${name.toLowerCase()}@example.com`,
  created_at: "2026-09-14T10:00:00Z",
  updated_at: "2026-09-14T10:10:00Z",
  status,
  payment: { payment_status: "unknown" as const, payment_currency: "EUR" },
  html_available: status === "completed",
  pdf_available: status === "completed",
});

const listResponse = {
  items: [
    summary("a".repeat(32), "completed", "Alpha140926alph"),
    summary("b".repeat(32), "failed", "Beta140926beta"),
  ],
  total: 2,
  stats: { sessions_today: 2, sessions_complete: 1, sessions_failed: 1, sessions_paid: 0, revenue_total: 0, currency: "EUR" },
};

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("AdminPage", () => {
  it("connecte l’admin puis affiche et filtre la liste", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/auth/check")) return { ok: true, status: 200, json: async () => ({ authenticated: true }) } as Response;
      return { ok: true, status: 200, json: async () => listResponse } as Response;
    });

    render(<MemoryRouter initialEntries={["/admin"]}><AdminPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Token admin"), { target: { value: "test-token" } });
    fireEvent.submit(screen.getByRole("button", { name: "Se connecter" }).closest("form")!);

    await screen.findByText("Alpha140926alph");
    expect(screen.getByText("Beta140926beta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Échouées" }));
    expect(screen.getByText("Beta140926beta")).toBeInTheDocument();
    expect(screen.queryByText("Alpha140926alph")).not.toBeInTheDocument();
  });

  it("distingue les warnings QA des blocages", async () => {
    const sessionId = "c".repeat(32);
    const detail = {
      summary: summary(sessionId, "partial", "Client140926test"),
      user: { questionnaire: { email: "client@example.com" }, photos: [] },
      analysis: {
        zyla_raw: { results: [] }, zyla_normalized: { signals: { skin_type: {} } },
        zyla_maps: [{ photo: "side", name: "red_area" }],
      },
      prompts: { prompt_0: [], prompt_1: [], prompt_2: [{ debug_info: { submitted_input: { skin_analysis_normalized: {} } } }], prompt_3: [], prompt_4: [] },
      qa: {
        stages: {
          "Prompt 0": { status: "Warnings" as const, issues: [{ code: "long_text", severity: "warning", message: "Texte long" }] },
          HTML: { status: "Blocage" as const, issues: [{ code: "render", severity: "fail", message: "Rendu impossible" }] },
        },
        issues: [],
        totals: { ok: 0, warnings: 1, blocking: 1 },
      },
      artifacts: [],
      history: [],
      rerun_history: [],
      raw_session: {},
    };

    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/auth/check")) return { ok: true, status: 200, json: async () => ({ authenticated: true }) } as Response;
      if (url.endsWith("/zyla-map/side/red_area")) return new Response(new Blob(["image"], { type: "image/jpeg" }));
      if (url.includes(`/session/${sessionId}`)) return { ok: true, status: 200, json: async () => detail } as Response;
      return { ok: true, status: 200, json: async () => ({ ...listResponse, items: [detail.summary] }) } as Response;
    });

    render(<MemoryRouter initialEntries={[`/admin/session/${sessionId}`]}><Routes><Route path="/admin/session/:sessionId" element={<AdminPage />} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Token admin"), { target: { value: "test-token" } });
    fireEvent.submit(screen.getByRole("button", { name: "Se connecter" }).closest("form")!);

    await screen.findByText("Client140926test");
    fireEvent.click(screen.getByRole("button", { name: "QA" }));
    await waitFor(() => expect(screen.getAllByText("Warnings").length).toBeGreaterThan(0));
    expect(screen.getByText("Blocage")).toBeInTheDocument();
    expect(screen.getByText("Texte long")).toBeInTheDocument();
    expect(screen.getByText("Rendu impossible")).toBeInTheDocument();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:zyla") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    fireEvent.click(screen.getByRole("button", { name: "Analyse" }));
    expect(screen.getByText("Réponse brute Zyla sans images")).toBeInTheDocument();
    expect(screen.getByText("Caractéristiques normalisées par photographie")).toBeInTheDocument();
    expect(screen.getByText("Payload envoyé à Prompt 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voir red_area · Profil" }));
    expect(await screen.findByAltText("red_area · Profil")).toHaveAttribute("src", "blob:zyla");
  });
});

it.each([false, true])("affiche l’échec de Prompt 1 et ses diagnostics (ancienne session=%s)", async (oldSession) => {
  const sessionId = "d".repeat(32);
  const detail = {
    summary: { ...summary(sessionId, "failed", "Session échouée"), failed_stage: "prompt_1" },
    user: { questionnaire: {}, photos: [] }, analysis: {},
    prompts: { prompt_1: [{ status: "failed", parsed_output: oldSession ? null : { profile: { insights: [] } },
      input_payload: oldSession ? undefined : { context: "exact" },
      debug_info: { error: "QA bloquant après repair", output_unavailable: oldSession, initial_raw_output: oldSession ? undefined : "original" },
      qa_report: { status: "fail", issues: oldSession ? [] : [
        { severity: "fail", code: "unproven_profile", message: "Référence rejetée : invented", path: "profile.insights[0]", metadata: { invalid_refs: ["invented"] } },
        { severity: "warning", code: "length", message: "Texte trop long" },
      ] },
    }] },
    qa: { stages: {}, issues: [], totals: { ok: 0, warnings: 0, blocking: 1 } },
    artifacts: [], history: [], rerun_history: [], raw_session: {},
  };
  vi.spyOn(global, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    return { ok: true, status: 200, json: async () => url.includes("/auth/check") ? { authenticated: true }
      : url.includes(`/session/${sessionId}`) ? detail : { ...listResponse, items: [detail.summary] } } as Response;
  });
  render(<MemoryRouter initialEntries={[`/admin/session/${sessionId}`]}><Routes><Route path="/admin/session/:sessionId" element={<AdminPage />} /></Routes></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Token admin"), { target: { value: "test-token" } });
  fireEvent.submit(screen.getByRole("button", { name: "Se connecter" }).closest("form")!);
  expect(await screen.findByText(/Échec à l’étape prompt_1/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Prompts" }));
  expect(screen.getByText("Prompt 1 a échoué")).toBeInTheDocument();
  expect(screen.getByText("QA bloquant après repair")).toBeInTheDocument();
  if (oldSession) {
    expect(screen.getByText(/La sortie rejetée n’a pas été conservée/)).toBeInTheDocument();
    expect(screen.queryByText("Résultat rejeté")).not.toBeInTheDocument();
  } else {
    expect(screen.getByText("Référence rejetée : invented")).toBeInTheDocument();
    expect(screen.getByText("Blocage · unproven_profile")).toBeInTheDocument();
    expect(screen.getByText("Avertissement · length")).toBeInTheDocument();
    expect(screen.getByText("Références contrôlées")).toBeInTheDocument();
    expect(screen.getByText("Données transmises au prompt")).toBeInTheDocument();
    expect(screen.getByText("Sortie avant réparation")).toBeInTheDocument();
  }

  let complete: (value: Response) => void = () => {};
  vi.mocked(global.fetch).mockImplementationOnce(() => new Promise<Response>(resolve => { complete = resolve; }));
  fireEvent.click(screen.getByRole("button", { name: "Reprendre la session" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmer la reprise" }));
  expect(screen.getByRole("status")).toHaveTextContent("Reprise en cours");
  expect(screen.getByRole("button", { name: "Reprise…" })).toBeDisabled();
  complete({ ok: true, status: 200, json: async () => ({ status: "failed", error: "Erreur précise du pipeline" }) } as Response);
  expect(await screen.findAllByText("Erreur précise du pipeline")).toHaveLength(2);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
