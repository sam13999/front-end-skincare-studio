import { useEffect, useRef, useState } from "react";
import { fetchAdminArtifact, fetchOriginalZoom, fetchReportEditing, ReportEditing,
  revertReport, saveReportCrop, saveReportText } from "@/lib/adminApi";

type Rect = [number, number, number, number];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function CropEditor({ token, sessionId, zoom, index, revision, onSaved }: {
  token: string; sessionId: string; zoom: ReportEditing["zooms"][number]; index: number;
  revision: string; onSaved: () => void;
}) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");
  const img = useRef<HTMLImageElement>(null);
  const initial = zoom.crop_box?.length === 4 && zoom.source_width && zoom.source_height
    ? [zoom.crop_box[0] / zoom.source_width, zoom.crop_box[1] / zoom.source_height,
       (zoom.crop_box[2] - zoom.crop_box[0]) / zoom.source_width,
       (zoom.crop_box[3] - zoom.crop_box[1]) / zoom.source_height] as Rect
    : [.25, .25, .5, .4] as Rect;
  const [rect, setRect] = useState<Rect>(initial);
  const gesture = useRef<{ mode: "move" | "resize"; x: number; y: number; start: Rect } | null>(null);

  useEffect(() => {
    let url = "";
    fetchOriginalZoom(token, sessionId, index).then(blob => {
      url = URL.createObjectURL(blob); setSrc(url);
    }).catch(e => setError(e instanceof Error ? e.message : "Photo indisponible"));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [token, sessionId, index]);

  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (!gesture.current || !img.current) return;
    const box = img.current.getBoundingClientRect();
    const dx = (event.clientX - gesture.current.x) / box.width;
    const dy = (event.clientY - gesture.current.y) / box.height;
    const [x, y, w, h] = gesture.current.start;
    setRect(gesture.current.mode === "move"
      ? [clamp(x + dx, 0, 1 - w), clamp(y + dy, 0, 1 - h), w, h]
      : [x, y, clamp(w + dx, .08, 1 - x), clamp(h + dy, .08, 1 - y)]);
  }

  async function save() {
    setError("");
    try { await saveReportCrop(token, sessionId, index, revision, rect); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : "Cadrage refusé"); }
  }

  return <div className="rounded-xl border border-slate-200 p-4">
    <h4 className="font-semibold">{zoom.title} · signal {zoom.signal_id || "inconnu"}</h4>
    <p className="mb-3 text-xs text-slate-500">{zoom.source_photo} · {zoom.crop_method === "anatomical_approximation" ? "Zone anatomique approximative" : zoom.crop_method === "manual" ? "Cadrage manuel" : "Coordonnées fournisseur"}</p>
    {src && <div className="max-w-xl">
      <div className="relative inline-block max-w-full touch-none" onPointerMove={move} onPointerUp={() => gesture.current = null} onPointerCancel={() => gesture.current = null}>
        <img ref={img} src={src} alt={`Photo originale : ${zoom.source_photo}`} className="block max-h-[520px] max-w-full select-none" draggable={false} />
        <div className="absolute cursor-move border-2 border-white bg-black/10 shadow-[0_0_0_999px_rgba(0,0,0,.4)]"
          style={{ left: `${rect[0] * 100}%`, top: `${rect[1] * 100}%`, width: `${rect[2] * 100}%`, height: `${rect[3] * 100}%` }}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); gesture.current = { mode: "move", x: e.clientX, y: e.clientY, start: rect }; }}>
          <span className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize bg-white"
            onPointerDown={e => { e.stopPropagation(); e.currentTarget.parentElement?.setPointerCapture(e.pointerId); gesture.current = { mode: "resize", x: e.clientX, y: e.clientY, start: rect }; }} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">Déplacez le rectangle ; tirez le coin blanc pour le redimensionner. Aperçu immédiat ci-dessous.</p>
      <div className="mt-2 w-64 overflow-hidden rounded border bg-slate-100 relative" style={{ aspectRatio: `${rect[2] * (zoom.source_width || 1)} / ${rect[3] * (zoom.source_height || 1)}` }}>
        <img src={src} alt="Aperçu du recadrage" className="absolute max-w-none" style={{ width: `${100 / rect[2]}%`, height: `${100 / rect[3]}%`, left: `${-rect[0] / rect[2] * 100}%`, top: `${-rect[1] / rect[3] * 100}%` }} />
      </div>
      <button type="button" className="action-button mt-3" onClick={save}>Enregistrer ce cadrage</button>
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}

export default function ReportEditor({ token, sessionId, onSaved }: { token: string; sessionId: string; onSaved: () => void }) {
  const [data, setData] = useState<ReportEditing | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const key = (path: Array<string | number>) => JSON.stringify(path);

  async function load() {
    try {
      const result = await fetchReportEditing(token, sessionId);
      setData(result);
      setValues(Object.fromEntries(result.fields.map(field => [key(field.path), field.value])));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Édition indisponible"); }
  }
  useEffect(() => { load(); }, [token, sessionId]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function refresh() {
    await load(); onSaved();
    const blob = await fetchAdminArtifact(token, sessionId, "pdf");
    setPreview(URL.createObjectURL(blob));
    setNotice("Nouvelle version générée. Vérifiez-la avant approbation ; aucun email n’a été envoyé.");
  }
  async function save() {
    if (!data) return;
    const changes = data.fields.filter(field => values[key(field.path)] !== field.value)
      .map(field => ({ path: field.path, value: values[key(field.path)] }));
    if (!changes.length) return;
    setBusy(true); setError("");
    try { await saveReportText(token, sessionId, data.review_revision, changes); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Correction refusée"); }
    finally { setBusy(false); }
  }
  async function restore(revision: number) {
    if (!data) return;
    setBusy(true); setError("");
    try { await revertReport(token, sessionId, revision, data.review_revision); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Retour impossible"); }
    finally { setBusy(false); }
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Chargement des sections…"}</p>;
  const sections = [...new Set(data.fields.map(field => field.section))];
  return <div className="space-y-5">
    <p className="text-sm text-slate-600">Corrigez les textes affichés. Les produits, fréquences et sources des observations restent verrouillés. Chaque enregistrement reconstruit seulement le HTML et le PDF.</p>
    {sections.map(section => <section key={section} className="rounded-xl border p-4">
      <h3 className="mb-3 font-semibold capitalize">{section.replaceAll("_", " ")}</h3>
      <div className="grid gap-3 md:grid-cols-2">{data.fields.filter(field => field.section === section).map(field => <label key={key(field.path)} className="block text-sm font-medium text-slate-700">
        {field.label} <span className="font-normal text-slate-400">{field.path.filter(x => typeof x === "number").map(x => `#${Number(x) + 1}`).join(" ")}</span>
        <textarea className="mt-1 block min-h-20 w-full rounded border border-slate-300 p-2 font-normal" value={values[key(field.path)] || ""}
          onChange={e => setValues(current => ({ ...current, [key(field.path)]: e.target.value }))} />
      </label>)}</div>
    </section>)}
    <button type="button" className="primary-button" disabled={busy} onClick={save}>{busy ? "Génération…" : "Enregistrer et reconstruire HTML/PDF"}</button>
    {data.zooms.length > 0 && <section><h3 className="mb-3 font-semibold">Recadrages photographiques</h3><div className="space-y-3">{data.zooms.map((zoom, index) =>
      <CropEditor key={`${data.review_revision}-${index}`} token={token} sessionId={sessionId} zoom={zoom} index={index} revision={data.review_revision} onSaved={refresh} />)}</div></section>}
    {data.history.length > 0 && <section className="rounded-xl border p-4"><h3 className="font-semibold">Historique des versions</h3><div className="mt-3 space-y-2">{data.history.map(item =>
      <div key={item.revision} className="flex items-center justify-between gap-3 text-sm"><span>Version {item.revision} · {item.reason}</span><button type="button" className="action-button" disabled={busy} onClick={() => restore(item.revision)}>Restaurer</button></div>)}</div></section>}
    {notice && <p className="rounded bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {preview && <div><h3 className="mb-2 font-semibold">Aperçu PDF actualisé</h3><iframe title="Aperçu du rapport" src={preview} className="h-[750px] w-full rounded border" /></div>}
  </div>;
}
