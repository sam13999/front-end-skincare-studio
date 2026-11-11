import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { fetchAdminArtifact, fetchOriginalZoom, fetchReportEditing, ReportEditing, ZylaDetection,
  revertReport, saveReportCrop, saveReportText } from "@/lib/adminApi";
const PdfPreview = lazy(() => import("./PdfPreview"));

type Rect = [number, number, number, number];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function CropEditor({ token, sessionId, zoom, index, revision, detections, onSaved }: {
  token: string; sessionId: string; zoom: ReportEditing["zooms"][number]; index: number;
  revision: string; detections: ZylaDetection[]; onSaved: () => void;
}) {
  const [src, setSrc] = useState("");
  const [detectionId, setDetectionId] = useState("");
  const selected = detections.find(item => item.id === detectionId);
  const photo = selected?.source_photo || zoom.source_photo;
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  const initial = zoom.crop_box?.length === 4 && zoom.source_width && zoom.source_height
    ? [zoom.crop_box[0] / zoom.source_width, zoom.crop_box[1] / zoom.source_height,
       (zoom.crop_box[2] - zoom.crop_box[0]) / zoom.source_width,
       (zoom.crop_box[3] - zoom.crop_box[1]) / zoom.source_height] as Rect
    : [.25, .25, .5, .4] as Rect;
  const [rect, setRect] = useState<Rect>(initial);
  const gesture = useRef<{ mode: "move" | "resize"; x: number; y: number; start: Rect } | null>(null);

  useEffect(() => {
    let active = true;
    let url = "";
    setSrc("");
    setError("");
    fetchOriginalZoom(token, sessionId, index, detectionId || undefined).then(blob => {
      if (!active) return;
      url = URL.createObjectURL(blob); setSrc(url);
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : "Photo indisponible"); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [token, sessionId, index, detectionId]);

  function chooseDetection(id: string) {
    setDetectionId(id);
    setSrc("");
    setRect(detections.find(item => item.id === id)?.rect || initial);
  }

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
    setError(""); setSaving(true);
    try { await saveReportCrop(token, sessionId, index, revision, rect, detectionId || undefined); await onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : "Cadrage refusé"); }
    finally { setSaving(false); }
  }

  return <div className="rounded-xl border border-slate-200 p-4">
    <h4 className="font-semibold">{zoom.title} · signal {zoom.signal_id || "inconnu"}</h4>
    <p className="mb-3 text-xs text-slate-500">{zoom.source_photo} · {zoom.crop_method === "anatomical_approximation" ? "Zone anatomique approximative" : zoom.crop_method === "manual" ? "Cadrage manuel" : "Coordonnées fournisseur"}</p>
    {detections.length > 0 && <label className="mb-3 block text-sm">
      Détection Zyla du zoom {index + 1}
      <select className="ml-2 rounded border p-1" value={detectionId} disabled={saving}
        onChange={event => chooseDetection(event.target.value)}>
        <option value="">Conserver la preuve actuelle</option>
        {["face", "side"].map(view => <optgroup key={view} label={view === "face" ? "Face" : "Profil"}>
          {detections.filter(item => item.source_photo === view).map(item => <option key={item.id} value={item.id}>
            {item.title} · {item.zone} · {item.id.split(":").at(-1)} · {item.confidence == null ? "confiance inconnue" : `${Math.round(item.confidence * 100)} %`}
          </option>)}
        </optgroup>)}
      </select>
    </label>}
    {src && <div className="max-w-xl">
      <div className="relative inline-block max-w-full overflow-hidden touch-none" onPointerMove={move} onPointerUp={() => gesture.current = null} onPointerCancel={() => gesture.current = null}>
        <img ref={img} src={src} alt={`Photo originale : ${photo}`} className="block max-h-[520px] max-w-full select-none" draggable={false} />
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/40" style={{ height: `${rect[1] * 100}%` }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/40" style={{ height: `${(1 - rect[1] - rect[3]) * 100}%` }} />
        <div className="pointer-events-none absolute left-0 bg-black/40" style={{ top: `${rect[1] * 100}%`, height: `${rect[3] * 100}%`, width: `${rect[0] * 100}%` }} />
        <div className="pointer-events-none absolute right-0 bg-black/40" style={{ top: `${rect[1] * 100}%`, height: `${rect[3] * 100}%`, width: `${(1 - rect[0] - rect[2]) * 100}%` }} />
        <div className="absolute cursor-move border-2 border-white bg-black/10"
          style={{ left: `${rect[0] * 100}%`, top: `${rect[1] * 100}%`, width: `${rect[2] * 100}%`, height: `${rect[3] * 100}%` }}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); gesture.current = { mode: "move", x: e.clientX, y: e.clientY, start: rect }; }}>
          <span className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize bg-white"
            onPointerDown={e => { e.stopPropagation(); e.currentTarget.parentElement?.setPointerCapture(e.pointerId); gesture.current = { mode: "resize", x: e.clientX, y: e.clientY, start: rect }; }} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">Déplacez le rectangle ; tirez le coin blanc pour le redimensionner. Aperçu immédiat ci-dessous.</p>
      <div className="mt-2 w-64 overflow-hidden rounded border bg-slate-100 relative" style={{ aspectRatio: `${rect[2] * (selected?.source_width || zoom.source_width || 1)} / ${rect[3] * (selected?.source_height || zoom.source_height || 1)}` }}>
        <img src={src} alt="Aperçu du recadrage" className="absolute max-w-none" style={{ width: `${100 / rect[2]}%`, height: `${100 / rect[3]}%`, left: `${-rect[0] / rect[2] * 100}%`, top: `${-rect[1] / rect[3] * 100}%` }} />
      </div>
      <button type="button" className="action-button mt-3" disabled={saving} onClick={save}>{saving ? "Actualisation du PDF…" : "Enregistrer ce cadrage"}</button>
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}

export default function ReportEditor({ token, sessionId, onSaved }: { token: string; sessionId: string; onSaved: () => void | Promise<void> }) {
  const [data, setData] = useState<ReportEditing | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const key = (path: Array<string | number>) => JSON.stringify(path);

  async function load() {
    try {
      const result = await fetchReportEditing(token, sessionId);
      setData(result);
      setValues(Object.fromEntries(result.fields.map(field => [key(field.path), field.value])));
      setError("");
      return result;
    } catch (e) { setError(e instanceof Error ? e.message : "Édition indisponible"); throw e; }
  }
  useEffect(() => { void load().catch(() => {}); }, [token, sessionId]);

  async function refresh(expectedRevision?: string) {
    const current = await load();
    await onSaved();
    if (expectedRevision && current.review_revision !== expectedRevision) throw new Error("Le rapport a changé entre l’enregistrement et l’aperçu. Rechargez la session.");
    const blob = await fetchAdminArtifact(token, sessionId, "pdf");
    setPreview(blob);
    setNotice("Nouvelle version générée. Vérifiez-la avant approbation ; aucun email n’a été envoyé.");
  }
  async function save() {
    if (!data) return;
    const changes = data.fields.filter(field => values[key(field.path)] !== field.value)
      .map(field => ({ path: field.path, value: values[key(field.path)] }));
    if (!changes.length) { setNotice("Aucun texte modifié. Le cadrage s’enregistre séparément."); return; }
    setBusy(true); setError("");
    setNotice("");
    try { const saved = await saveReportText(token, sessionId, data.review_revision, changes); await refresh(saved.review_revision); }
    catch (e) { setError(e instanceof Error ? e.message : "Correction refusée"); }
    finally { setBusy(false); }
  }
  async function restore(revision: number) {
    if (!data) return;
    setBusy(true); setError("");
    try { const saved = await revertReport(token, sessionId, revision, data.review_revision); await refresh(saved.review_revision); }
    catch (e) { setError(e instanceof Error ? e.message : "Retour impossible"); }
    finally { setBusy(false); }
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Chargement des sections…"}</p>;
  const sections = [...new Set(data.fields.map(field => field.section))];
  const hasTextChanges = data.fields.some(field => values[key(field.path)] !== field.value);
  return <div className="space-y-5">
    <p className="text-sm text-slate-600">Corrigez les textes affichés. Les fréquences se modifient dans l’onglet Routine. Chaque enregistrement reconstruit seulement le HTML et le PDF.</p>
    {sections.map(section => <section key={section} className="rounded-xl border p-4">
      <h3 className="mb-3 font-semibold capitalize">{section.replace(/_/g, " ")}</h3>
      <div className="grid gap-3 md:grid-cols-2">{data.fields.filter(field => field.section === section).map(field => <label key={key(field.path)} className="block text-sm font-medium text-slate-700">
        {field.label} <span className="font-normal text-slate-400">{field.path.filter(x => typeof x === "number").map(x => `#${Number(x) + 1}`).join(" ")}</span>
        <textarea className="mt-1 block min-h-20 w-full rounded border border-slate-300 p-2 font-normal" value={values[key(field.path)] || ""}
          onChange={e => setValues(current => ({ ...current, [key(field.path)]: e.target.value }))} />
      </label>)}</div>
    </section>)}
    <button type="button" className="primary-button disabled:opacity-50" disabled={busy || !hasTextChanges} onClick={save}>{busy ? "Reconstruction HTML/PDF…" : "Enregistrer et reconstruire HTML/PDF"}</button>
    {!hasTextChanges && <p className="text-sm text-slate-500">Modifiez un texte pour activer ce bouton. Les recadrages s’enregistrent séparément.</p>}
    {data.zooms.length > 0 && <section><h3 className="mb-3 font-semibold">Recadrages photographiques</h3><div className="space-y-3">{data.zooms.map((zoom, index) =>
      <CropEditor key={`${data.review_revision}-${index}`} token={token} sessionId={sessionId} zoom={zoom} index={index} detections={data.detections || []} revision={data.review_revision} onSaved={refresh} />)}</div></section>}
    {data.history.length > 0 && <section className="rounded-xl border p-4"><h3 className="font-semibold">Historique des versions</h3><div className="mt-3 space-y-2">{data.history.map(item =>
      <div key={item.revision} className="flex items-center justify-between gap-3 text-sm"><span>Version {item.revision} · {item.reason}</span><button type="button" className="action-button" disabled={busy} onClick={() => restore(item.revision)}>Restaurer</button></div>)}</div></section>}
    {notice && <p className="rounded bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {preview && <Suspense fallback={<p>Chargement de l’aperçu PDF…</p>}><PdfPreview blob={preview} /></Suspense>}
  </div>;
}
