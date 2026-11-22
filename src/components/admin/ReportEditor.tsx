import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { fetchAdminArtifact, fetchOriginalZoom, fetchReportEditing, ReportEditing, ZylaDetection,
  revertReport, saveReportCrop, saveReportText } from "@/lib/adminApi";
const PdfPreview = lazy(() => import("./PdfPreview"));

const chapterNames: Record<string, string> = {
  cover: "Page de couverture", glance: "Votre peau en un coup d’œil",
  profile: "Votre profil", priorities: "À prioriser / à éviter",
  goals: "Vos objectifs et repères de suivi", why: "La stratégie SkinView",
  routine: "Votre routine personnalisée", "products-matin": "Les produits du matin",
  "products-soir": "Les produits du soir", "products-hebdomadaire": "Soins hebdomadaires",
  closing: "Conclusion et informations complémentaires",
};
const chapterOrder = Object.keys(chapterNames);
type Field = ReportEditing["fields"][number];
const fieldKey = (field: Field) => JSON.stringify(field.path);
function chapter(field: Field): string {
  if (field.section_id) return field.section_id;
  const [root, key] = field.path;
  if (root === "report") return key === "first_name" || key === "signature" ? "cover" : "closing";
  if (root === "overview") return "glance";
  if (root === "profile") return "profile";
  if (root === "strategy") return key === "goals" ? "goals" : key === "prioritize" || key === "avoid" ? "priorities" : "why";
  if (root === "routine_overview") return key === "follow_up" || key === "conclusion" ? "goals" : "routine";
  return "products-soir";
}

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
  const [htmlPreview, setHtmlPreview] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const [chapterId, setChapterId] = useState("");
  const [selected, setSelected] = useState("");
  const [view, setView] = useState<"modifier" | "apercu">("modifier");
  const [busy, setBusy] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const key = (path: Array<string | number>) => JSON.stringify(path);

  async function load() {
    try {
      const result = await fetchReportEditing(token, sessionId);
      setData(result);
      setValues(Object.fromEntries(result.fields.map(field => [key(field.path), field.value])));
      const first = [...result.fields].sort((a, b) => chapterOrder.indexOf(chapter(a)) - chapterOrder.indexOf(chapter(b)))[0];
      setChapterId(current => current || (first ? chapter(first) : "cover"));
      setSelected(current => current || (first ? fieldKey(first) : ""));
      setError("");
      return result;
    } catch (e) { setError(e instanceof Error ? e.message : "Édition indisponible"); throw e; }
  }
  useEffect(() => { void load().catch(() => {}); }, [token, sessionId]);
  useEffect(() => {
    if (!showHtml) return;
    let alive = true;
    let url = "";
    fetchAdminArtifact(token, sessionId, "html").then(blob => {
      if (alive) { url = URL.createObjectURL(blob); setHtmlPreview(url); }
    }).catch(() => { if (alive) setHtmlPreview(""); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [token, sessionId, data?.review_revision, showHtml]);

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
  function choose(field: Field) {
    setChapterId(chapter(field)); setSelected(fieldKey(field)); setView("modifier");
    requestAnimationFrame(() => editor.current?.focus());
  }
  function onHtmlLoad(frame: HTMLIFrameElement) {
    const doc = frame.contentDocument;
    if (!doc || !data) return;
    doc.addEventListener("click", event => {
      // The preview lives in a separate window: parent-window instanceof Element fails.
      const target = event.target as Node | null;
      if (!target || target.nodeType !== 1) return;
      const element = target as Element;
      const slot = element.closest("[data-slot]")?.getAttribute("data-slot");
      const value = element.textContent?.trim();
      const match = data.fields.find(field =>
        (slot && field.path.join(".") === slot) ||
        (value && value.length > 8 && field.value.trim() === value));
      if (match) choose(match);
    });
  }
  async function restore(revision: number) {
    if (!data) return;
    setBusy(true); setError("");
    try { const saved = await revertReport(token, sessionId, revision, data.review_revision); await refresh(saved.review_revision); }
    catch (e) { setError(e instanceof Error ? e.message : "Retour impossible"); }
    finally { setBusy(false); }
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Chargement des sections…"}</p>;
  const sections = chapterOrder.filter(id => data.fields.some(field => chapter(field) === id));
  const hasTextChanges = data.fields.some(field => values[key(field.path)] !== field.value);
  const currentFields = data.fields.filter(field => chapter(field) === chapterId);
  const currentField = currentFields.find(field => fieldKey(field) === selected) || currentFields[0];
  return <div className="min-w-0 space-y-5">
    <p className="text-sm text-slate-600">Choisissez un chapitre puis un texte du rapport. Les fréquences se modifient dans « Routine ».</p>
    <div className="grid min-w-0 gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <nav aria-label="Chapitres du rapport" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col">
        {sections.map(id => <button key={id} type="button" onClick={() => { setChapterId(id); setSelected(""); }}
          className={`min-h-11 shrink-0 rounded-xl border px-3 py-2 text-left text-sm lg:whitespace-normal ${chapterId === id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}>
          {chapterNames[id]}</button>)}
      </nav>
      <div className="min-w-0 space-y-4">
        <div className="flex gap-2 lg:hidden">
          <button type="button" className="action-button min-h-11" aria-pressed={view === "apercu"} onClick={() => { setView("apercu"); setShowHtml(true); }}>Aperçu</button>
          <button type="button" className="action-button min-h-11" aria-pressed={view === "modifier"} onClick={() => setView("modifier")}>Modifier</button>
        </div>
        <section className={`min-w-0 rounded-xl border bg-white p-3 sm:p-5 ${view === "apercu" ? "hidden lg:block" : ""}`}>
          <h3 className="mb-3 text-lg font-semibold">{chapterNames[chapterId] || "Votre rapport"}</h3>
          <p className="mb-3 text-sm text-slate-500">Touchez un bloc pour ouvrir son édition.</p>
          <div className="space-y-2">{currentFields.map(field => <button type="button" key={fieldKey(field)}
            onClick={() => choose(field)} aria-pressed={currentField === field}
            className={`block min-h-11 w-full rounded-xl border p-3 text-left ${currentField === field ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
            <span className="block text-sm font-semibold">{field.context ? `${field.context} · ` : ""}{field.label}</span>
            <span className="mt-1 block whitespace-pre-wrap break-words text-sm font-normal text-slate-700">
              {values[fieldKey(field)] === "" ? "Bloc masqué" : values[fieldKey(field)]}</span>
          </button>)}</div>
        </section>
        {currentField && <section className={`rounded-xl border bg-white p-3 sm:p-5 ${view === "apercu" ? "hidden lg:block" : ""}`}>
          <label className="block text-sm font-semibold" htmlFor="report-field">{currentField.label}</label>
          {currentField.context && <p className="text-sm text-slate-600">{currentField.context}</p>}
          <textarea id="report-field" ref={editor} disabled={busy} className="mt-2 block min-h-28 w-full resize-y rounded-lg border border-slate-300 p-3 text-base"
            value={values[fieldKey(currentField)] ?? ""} onChange={e => setValues(current => ({ ...current, [fieldKey(currentField)]: e.target.value }))} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="action-button min-h-11" disabled={busy || values[fieldKey(currentField)] === currentField.value}
              onClick={() => setValues(current => ({ ...current, [fieldKey(currentField)]: currentField.value }))}>Annuler la modification</button>
            {currentField.original_value !== undefined && currentField.original_value !== currentField.value &&
              <button type="button" className="action-button min-h-11" disabled={busy} onClick={() =>
                setValues(current => ({ ...current, [fieldKey(currentField)]: currentField.original_value! }))}>Restaurer le texte initial</button>}
            {currentField.optional && <button type="button" className="action-button min-h-11" disabled={busy || values[fieldKey(currentField)] === ""}
              onClick={() => setValues(current => ({ ...current, [fieldKey(currentField)]: "" }))}>Masquer ce bloc</button>}
            {data.history.length > 0 && <button type="button" className="action-button min-h-11" disabled={busy}
              onClick={() => restore(0)}>Restaurer le rapport initial</button>}
          </div>
          {currentField.path[0] === "report" && currentField.path[1] === "disclaimer" && <p className="mt-2 text-sm text-amber-800">Mention légale obligatoire.</p>}
          {currentField.original_value !== undefined && currentField.original_value !== currentField.value &&
            <details className="mt-3 text-sm"><summary className="cursor-pointer">Comparer au texte initial</summary>
              <p className="mt-2 whitespace-pre-wrap rounded bg-slate-50 p-3">{currentField.original_value || "(champ initialement vide)"}</p>
            </details>}
        </section>}
        <div className="sticky bottom-2 z-10 rounded-xl border bg-white p-3 shadow-lg">
          <button type="button" className="primary-button min-h-11 disabled:opacity-50" disabled={busy || !hasTextChanges} onClick={save}>{busy ? "Reconstruction HTML/PDF…" : "Enregistrer et reconstruire HTML/PDF"}</button>
          <p role="status" className="mt-1 text-sm text-slate-600">{hasTextChanges ? "Modifications non enregistrées" : "Modifications enregistrées"}</p>
          {!hasTextChanges && <p className="text-sm text-slate-500">Modifiez un texte pour activer ce bouton. Les recadrages s’enregistrent séparément.</p>}
        </div>
      </div>
    </div>
    <details className="rounded-xl border p-3" open={view === "apercu" ? true : undefined} onToggle={e => { if (e.currentTarget.open) setShowHtml(true); }}>
      <summary className="min-h-11 cursor-pointer font-semibold">Aperçu HTML du rapport complet</summary>
      {htmlPreview &&
      <iframe title="Aperçu HTML du rapport" sandbox="allow-same-origin" src={htmlPreview} onLoad={e => onHtmlLoad(e.currentTarget)}
        className="mt-2 h-[70vh] min-h-[400px] w-full rounded-lg border" />}
    </details>
    {data.zooms.length > 0 && <details><summary className="min-h-11 cursor-pointer font-semibold">Recadrages photographiques</summary><div className="space-y-3">{data.zooms.map((zoom, index) =>
      <CropEditor key={`${data.review_revision}-${index}`} token={token} sessionId={sessionId} zoom={zoom} index={index} detections={data.detections || []} revision={data.review_revision} onSaved={refresh} />)}</div></details>}
    {data.history.length > 0 && <section className="rounded-xl border p-4"><h3 className="font-semibold">Historique des versions</h3><div className="mt-3 space-y-2">{data.history.map(item =>
      <div key={item.revision} className="flex items-center justify-between gap-3 text-sm"><span>Version {item.revision} · {item.reason}</span><button type="button" className="action-button" disabled={busy} onClick={() => restore(item.revision)}>Restaurer</button></div>)}</div></section>}
    {notice && <p className="rounded bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {preview && <Suspense fallback={<p>Chargement de l’aperçu PDF…</p>}><PdfPreview blob={preview} /></Suspense>}
  </div>;
}
