import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import PdfPreview from "./PdfPreview";

const getPage = vi.fn(async () => ({
  getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 840 * scale }),
  render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
}));
vi.mock("pdfjs-dist", () => ({ GlobalWorkerOptions: {}, getDocument: () => ({
  promise: Promise.resolve({ numPages: 7, getPage, destroy: vi.fn() }), destroy: vi.fn(),
}) }));
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({ default: "/worker.mjs" }));

it("affiche les sept pages, navigation, zoom, ouverture native et téléchargement", async () => {
  class Observer { observe() {} disconnect() {} }
  vi.stubGlobal("ResizeObserver", Observer);
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  URL.createObjectURL = vi.fn(() => "blob:rapport");
  URL.revokeObjectURL = vi.fn();
  const blob = new Blob(["pdf"], { type: "application/pdf" });
  blob.arrayBuffer = vi.fn(async () => new ArrayBuffer(3));
  render(<PdfPreview blob={blob} />);
  expect(await screen.findByText("Page 1 sur 7")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Suivante" }));
  expect(await screen.findByText("Page 2 sur 7")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByText("125 %")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ouvrir le PDF complet" })).toHaveAttribute("href", "blob:rapport");
  expect(screen.getByRole("link", { name: "Télécharger le PDF" })).toHaveAttribute("download", "rapport-skinview.pdf");
  await waitFor(() => expect(getPage).toHaveBeenCalledWith(2));
});
