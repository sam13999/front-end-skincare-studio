import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePressFeedback } from "./use-press-feedback";

function Demo() {
  usePressFeedback(180);
  return <><button type="button">Valider</button><button type="button" disabled>Bloqué</button></>;
}

describe("usePressFeedback", () => {
  afterEach(() => vi.useRealTimers());

  it("marque le bouton pressé au moins 180 ms puis relâche", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Demo />);
    expect(document.body.classList.contains("admin-ui")).toBe(true);
    const button = screen.getByText("Valider");
    act(() => {
      button.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      window.dispatchEvent(new Event("pointerup"));
    });
    expect(button.classList.contains("is-pressed")).toBe(true);
    act(() => { vi.advanceTimersByTime(200); });
    expect(button.classList.contains("is-pressed")).toBe(false);
    unmount();
    expect(document.body.classList.contains("admin-ui")).toBe(false);
  });

  it("ignore les boutons désactivés", () => {
    render(<Demo />);
    const disabled = screen.getByText("Bloqué");
    act(() => { disabled.dispatchEvent(new Event("pointerdown", { bubbles: true })); });
    expect(disabled.classList.contains("is-pressed")).toBe(false);
  });
});
