import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { deleteReportZoom, fetchAdminArtifact, fetchOriginalZoom, fetchReportEditing, ReportEditing, ZylaDetection,
  revertReport, saveReportCrop, saveReportText } from "@/lib/adminApi";
const PdfPreview = lazy(() => import("./PdfPreview"));

type Rect = [number, number, number, number];
type EditResult = { review_revision: string };
type RunEdit = (write: () => Promise<EditResult>, preserveDraft?: boolean) => Promise<void>;
const zoomTextFields = [
  ["title", "Titre de l’observation"],
  ["caption", "Légende"],
  ["image_alt", "Description accessible"],
] as const;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function CropEditor({ token, sessionId, zoom, index, revision, detections, busy, runEdit }: {
  token: string; sessionId: string; zoom: ReportEditing["zooms"][number]; index: number;
  revision: string; detections: ZylaDetection[]; busy: boolean; runEdit: RunEdit;
}) {
  const [src, setSrc] = useState("");
  const [detectionId, setDetectionId] = useState("");
  const selected = detections.find(item => item.id === detectionId);
  const photo = selected?.source_photo || zoom.source_photo;
  const [error, setError] = useState("");
  const [texts, setTexts] = useState(() => ({
    title: zoom.title, caption: zoom.caption ?? "", image_alt: zoom.image_alt ?? "",
  }));
  const textChanges = zoomTextFields
    .filter(([field]) => texts[field] !== (zoom[field] ?? ""))
    .map(([field]) => ({ path: ["overview", "zooms", index, field], value: texts[field] }));
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
    fetchOriginalZoom(token, sessionId, index, detectionId || undefined, revision).then(blob => {
      if (!active) return;
      url = URL.createObjectURL(blob); setSrc(url);
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : "Photo indisponible"); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [token, sessionId, index, detectionId, revision]);

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

  function remove() {
    if (window.confirm(`Supprimer le zoom « ${zoom.title} » du rapport ?`)) {
      void runEdit(() => deleteReportZoom(token, sessionId, index, revision));
    }
  }

  return <div className="rounded-xl border border-slate-200 p-4">
    <h4 className="font-semibold">{zoom.title} · signal {zoom.signal_id || "inconnu"}</h4>
    <p className="mb-3 text-xs text-slate-500">{zoom.source_photo} · {zoom.crop_method === "anatomical_approximation" ? "Zone anatomique approximative" : zoom.crop_method === "manual" ? "Cadrage manuel" : "Coordonnées fournisseur"}</p>
    <fieldset className="mb-4 grid gap-2 sm:grid-cols-2" disabled={busy || !!selected}>
      <legend className="mb-2 text-sm font-medium">Renommer ou préciser l’observation</legend>
      {zoomTextFields.map(([field, label]) => <label className="block text-sm" key={field}>
        {label}
        <input className="mt-1 block w-full rounded border p-2" value={texts[field]} maxLength={2500}
          onChange={event => setTexts({ ...texts, [field]: event.target.value })} />
      </label>)}
      <p className="text-xs text-slate-500 sm:col-span-2">Décrivez la caractéristique indiquée ci-dessus. Pour en choisir une autre, remplacez la preuve.</p>
      <div className="sm:col-span-2"><button type="button" className="action-button" disabled={!textChanges.length}
        onClick={() => runEdit(() => saveReportText(token, sessionId, revision, textChanges))}>Enregistrer les textes du zoom</button></div>
    </fieldset>
    {detections.length > 0 && <label className="mb-3 block text-sm">
      Preuve photographique du zoom {index + 1}
      <select className="ml-2 rounded border p-1" value={detectionId} disabled={busy}
        onChange={event => chooseDetection(event.target.value)}>
        <option value="">Conserver la preuve actuelle</option>
        {["face", "side"].map(view => <optgroup key={view} label={view === "face" ? "Face" : "Profil"}>
          {detections.filter(item => item.source_photo === view).map(item => <option key={item.id} value={item.id}>
            {item.title} · {item.zone} · {item.id.split(":").at(-1)} · {item.confidence == null ? "confiance inconnue" : `${Math.round(item.confidence * 100)} %`}
          </option>)}
        </optgroup>)}
      </select>
    </label>}
    {selected && selected.source_photo === zoom.source_photo && <button type="button" className="action-button mb-2"
      disabled={busy} onClick={() => setRect(initial)}>Reprendre le cadrage actuel</button>}
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
      <button type="button" className="action-button mt-3" disabled={busy}
        onClick={() => runEdit(() => saveReportCrop(token, sessionId, index, revision, rect, detectionId || undefined))}>
        {selected ? "Enregistrer le remplacement" : "Enregistrer ce cadrage"}
      </button>
    </div>}
    <button type="button" className="action-button mt-3 text-red-700" disabled={busy} onClick={remove}>Supprimer ce zoom</button>
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
  const saving = useRef(false);
  const key = (path: Array<string | number>) => JSON.stringify(path);

  function applyEditing(result: ReportEditing, preserveDraft: boolean) {
    const fields = result.fields.filter(field => field.path[0] !== "overview" || field.path[1] !== "zooms");
    setValues(current => Object.fromEntries(fields.map(field => {
      const id = key(field.path);
      const previous = data?.fields.find(item => key(item.path) === id);
      const dirty = previous && current[id] !== previous.value;
      return [id, preserveDraft && dirty ? current[id] : field.value];
    })));
    setData({ ...result, fields });
  }

  useEffect(() => {
    let active = true;
    fetchReportEditing(token, sessionId)
      .then(result => { if (active) applyEditing(result, false); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Édition indisponible"); });
    return () => { active = false; };
  }, [token, sessionId]);

  const runEdit: RunEdit = async (write, preserveDraft = true) => {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    let committed = false;
    try {
      const saved = await write();
      committed = true;
      setPreview(null);
      const current = await fetchReportEditing(token, sessionId);
      applyEditing(current, preserveDraft);
      await onSaved();
      if (current.review_revision !== saved.review_revision) {
        throw new Error("Le rapport a changé depuis l’enregistrement. La version actuelle est affichée.");
      }
      setPreview(await fetchAdminArtifact(token, sessionId, "pdf", saved.review_revision));
      setNotice("Nouvelle version générée. Vérifiez-la avant approbation.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Correction refusée";
      setError(committed ? `Version enregistrée. Actualisation de l’aperçu incomplète. ${message}` : message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  function save() {
    if (!data) return;
    const changes = data.fields.filter(field => values[key(field.path)] !== field.value)
      .map(field => ({ path: field.path, value: values[key(field.path)] }));
    if (changes.length) void runEdit(() => saveReportText(token, sessionId, data.review_revision, changes), false);
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
        <textarea className="mt-1 block min-h-20 w-full rounded border border-slate-300 p-2 font-normal" value={values[key(field.path)] || ""} disabled={busy}
          onChange={e => setValues(current => ({ ...current, [key(field.path)]: e.target.value }))} />
      </label>)}</div>
    </section>)}
    <button type="button" className="primary-button disabled:opacity-50" disabled={busy || !hasTextChanges} onClick={save}>{busy ? "Reconstruction HTML/PDF…" : "Enregistrer et reconstruire HTML/PDF"}</button>
    {!hasTextChanges && <p className="text-sm text-slate-500">Modifiez un texte pour activer ce bouton. Les recadrages s’enregistrent séparément.</p>}
    <section><h3 className="mb-3 font-semibold">Recadrages photographiques</h3>
      {data.zooms.length === 0 && <p role="status" className="text-sm text-amber-800">Aucune preuve photographique affichée dans ce rapport.</p>}
      <div className="space-y-3">{data.zooms.map((zoom, index) =>
        <CropEditor key={`${data.review_revision}-${index}`} token={token} sessionId={sessionId} zoom={zoom} index={index}
          detections={data.detections || []} revision={data.review_revision} busy={busy} runEdit={runEdit} />)}</div>
    </section>
    {data.history.length > 0 && <section className="rounded-xl border p-4"><h3 className="font-semibold">Historique des versions</h3><div className="mt-3 space-y-2">{data.history.map(item =>
      <div key={item.revision} className="flex items-center justify-between gap-3 text-sm"><span>Version {item.revision} · {item.reason}</span><button type="button" className="action-button" disabled={busy} onClick={() => runEdit(() => revertReport(token, sessionId, item.revision, data.review_revision), false)}>Restaurer</button></div>)}</div></section>}
    {busy && <p role="status" className="text-sm">Reconstruction ou chargement du rapport…</p>}
    {notice && <p role="status" className="rounded bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {preview && <Suspense fallback={<p>Chargement de l’aperçu PDF…</p>}><PdfPreview blob={preview} /></Suspense>}
  </div>;
}
