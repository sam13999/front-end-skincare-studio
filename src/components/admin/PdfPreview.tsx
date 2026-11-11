import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type PDFDocumentLoadingTask } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreview({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(320);
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    let active = true;
    let loading: PDFDocumentLoadingTask | undefined;
    blob.arrayBuffer().then(buffer => {
      if (!active) return;
      loading = getDocument({ data: new Uint8Array(buffer) });
      loading.promise.then(document => { if (active) { setPdf(document); setPage(1); setError(""); } else document.destroy(); })
        .catch(() => { if (active) setError("Impossible de lire le PDF. Ouvrez le fichier complet."); });
    }).catch(() => { if (active) setError("Impossible de charger le PDF."); });
    return () => { active = false; loading?.destroy(); URL.revokeObjectURL(objectUrl); };
  }, [blob]);

  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let cancelled = false;
    let render: ReturnType<Awaited<ReturnType<typeof pdf.getPage>>["render"]> | undefined;
    pdf.getPage(page).then(pdfPage => {
      if (cancelled || !canvas.current) return;
      const original = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: Math.min(3, Math.max(.1, (width - 2) / original.width)) * zoom });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const element = canvas.current;
      element.width = Math.round(viewport.width * pixelRatio);
      element.height = Math.round(viewport.height * pixelRatio);
      element.style.width = `${viewport.width}px`;
      element.style.height = `${viewport.height}px`;
      const context = element.getContext("2d");
      if (!context) throw new Error("Canvas indisponible");
      render = pdfPage.render({ canvas: element, canvasContext: context, viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] });
      return render.promise;
    }).catch(reason => { if (!cancelled && reason?.name !== "RenderingCancelledException") setError("Cette page ne peut pas être affichée. Ouvrez le PDF complet."); });
    return () => { cancelled = true; render?.cancel(); };
  }, [pdf, page, width, zoom]);

  return <section className="min-w-0" aria-label="Aperçu PDF actualisé">
    <h3 className="mb-2 font-semibold">Aperçu PDF actualisé</h3>
    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <a className="action-button" href={url || undefined} target="_blank" rel="noopener noreferrer">Ouvrir le PDF complet</a>
      <a className="action-button" href={url || undefined} download="rapport-skinview.pdf">Télécharger le PDF</a>
    </div>
    {error && <p role="alert" className="mb-2 text-red-700">{error}</p>}
    {pdf && <>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm" aria-label="Navigation PDF">
        <button type="button" className="action-button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédente</button>
        <span aria-live="polite">Page {page} sur {pdf.numPages}</span>
        <button type="button" className="action-button" disabled={page >= pdf.numPages} onClick={() => setPage(p => p + 1)}>Suivante</button>
        <button type="button" className="action-button" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .25))}>−</button>
        <span>{Math.round(zoom * 100)} %</span>
        <button type="button" className="action-button" disabled={zoom >= 2} onClick={() => setZoom(z => Math.min(2, z + .25))}>+</button>
      </div>
      <div ref={container} className="w-full min-w-0 overflow-x-auto rounded border bg-slate-100 p-px">
        <canvas ref={canvas} aria-label={`Page ${page} du rapport PDF`} className="block" />
      </div>
    </>}
  </section>;
}
