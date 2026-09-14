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
      analysis: {},
      prompts: { prompt_0: [], prompt_1: [], prompt_2: [], prompt_3: [], prompt_4: [] },
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
      if (url.includes(`/session/${sessionId}`)) return { ok: true, status: 200, json: async () => detail } as Response;
      return { ok: true, status: 200, json: async () => ({ ...listResponse, items: [detail.summary] }) } as Response;
    });

    render(<MemoryRouter initialEntries={[`/admin/session/${sessionId}`]}><Routes><Route path="/admin/session/:sessionId" element={<AdminPage />} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Token admin"), { target: { value: "test-token" } });
    fireEvent.submit(screen.getByRole("button", { name: "Se connecter" }).closest("form")!);

    await screen.findByText("Client140926test");
    fireEvent.click(screen.getByRole("button", { name: "QA" }));
    await waitFor(() => expect(screen.getByText("Warnings")).toBeInTheDocument());
    expect(screen.getByText("Blocage")).toBeInTheDocument();
    expect(screen.getByText("Texte long")).toBeInTheDocument();
    expect(screen.getByText("Rendu impossible")).toBeInTheDocument();
  });
});
