import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
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
const sectionLabels = {
  overview: "Observations photographiques",
  profile: "Votre profil",
  strategy: "Objectifs et stratégie",
  routine: "Routine matin et soir",
  followup: "Conseils et suivi",
};
type Section = keyof typeof sectionLabels;
const sectionOf = (path: Array<string | number>): Section => {
  if (path[0] === "routine_pages") return "routine";
  if (path[0] === "routine_overview") {
    return path[1] === "follow_up" || path[1] === "conclusion" ? "followup" : "routine";
  }
  return path[0] as Section;
};
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function CropEditor({ token, sessionId, zoom, index, revision, detections, busy, runEdit, onDirty }: {
  token: string; sessionId: string; zoom: ReportEditing["zooms"][number]; index: number;
  revision: string; detections: ZylaDetection[]; busy: boolean; runEdit: RunEdit; onDirty: (index: number, dirty: boolean) => void;
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
  const cropDirty = !!selected || rect.some((value, i) => value !== initial[i]);
  const textDirty = textChanges.length > 0;
  useEffect(() => {
    onDirty(index, cropDirty || textDirty);
    return () => onDirty(index, false);
  }, [index, cropDirty, textDirty, onDirty]);

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
        <input className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border p-2 text-base" value={texts[field]} maxLength={2500}
          onChange={event => setTexts({ ...texts, [field]: event.target.value })} />
      </label>)}
      <p className="text-xs text-slate-500 sm:col-span-2">Décrivez la caractéristique indiquée ci-dessus. Pour en choisir une autre, remplacez la preuve.</p>
      <div className="sm:col-span-2"><button type="button" className="action-button" disabled={!textChanges.length}
        onClick={() => { if (!cropDirty || window.confirm("Le cadrage en cours sera perdu. Enregistrer les textes ?")) void runEdit(() => saveReportText(token, sessionId, revision, textChanges)); }}>Enregistrer les textes du zoom</button></div>
    </fieldset>
    {detections.length > 0 && <label className="mb-3 block text-sm">
      Preuve photographique du zoom {index + 1}
      <select className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border p-2 text-base" value={detectionId} disabled={busy}
        onChange={event => { if (!cropDirty || window.confirm("Remplacer le cadrage en cours ?")) chooseDetection(event.target.value); }}>
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
      <div className="mt-2 w-64 max-w-full overflow-hidden rounded border bg-slate-100 relative" style={{ aspectRatio: `${rect[2] * (selected?.source_width || zoom.source_width || 1)} / ${rect[3] * (selected?.source_height || zoom.source_height || 1)}` }}>
        <img src={src} alt="Aperçu du recadrage" className="absolute max-w-none" style={{ width: `${100 / rect[2]}%`, height: `${100 / rect[3]}%`, left: `${-rect[0] / rect[2] * 100}%`, top: `${-rect[1] / rect[3] * 100}%` }} />
      </div>
      <button type="button" className="action-button mt-3" disabled={busy}
        onClick={() => { if (!textDirty || window.confirm("Les textes du zoom en cours seront perdus. Enregistrer le cadrage ?")) void runEdit(() => saveReportCrop(token, sessionId, index, revision, rect, detectionId || undefined)); }}>
        {selected ? "Enregistrer le remplacement" : "Enregistrer ce cadrage"}
      </button>
    </div>}
    <button type="button" className="action-button mt-3 text-red-700" disabled={busy} onClick={remove}>Supprimer ce zoom</button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}

export default function ReportEditor({ token, sessionId, onSaved, onDraftChange }: { token: string; sessionId: string; onSaved: () => void | Promise<void>; onDraftChange?: (dirty: boolean) => void }) {
  const [data, setData] = useState<ReportEditing | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [openSection, setOpenSection] = useState<Section | null>("overview");
  const [savingSection, setSavingSection] = useState<Section | null>(null);
  const [savedSection, setSavedSection] = useState<Section | null>(null);
  const [zoomDrafts, setZoomDrafts] = useState<number[]>([]);
  const onZoomDirty = useCallback((index: number, dirty: boolean) => {
    setZoomDrafts(current => dirty ? [...new Set([...current, index])] : current.filter(item => item !== index));
  }, []);
  const dirtyFields = data?.fields.filter(field => values[JSON.stringify(field.path)] !== field.value) || [];
  const dirty = dirtyFields.length > 0 || zoomDrafts.length > 0;
  useEffect(() => {
    onDraftChange?.(dirty || busy);
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy, onDraftChange]);

  const key = (path: Array<string | number>) => JSON.stringify(path);

  function applyEditing(result: ReportEditing, preserveDraft: boolean, savedPaths = new Set<string>()) {
    const fields = result.fields.filter(field => field.path[0] !== "overview" || field.path[1] !== "zooms");
    setValues(current => Object.fromEntries(fields.map(field => {
      const id = key(field.path);
      const previous = data?.fields.find(item => key(item.path) === id);
      const dirty = previous && current[id] !== previous.value;
      return [id, preserveDraft && dirty && !savedPaths.has(id) ? current[id] : field.value];
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

  const runEdit = async (write: () => Promise<EditResult>, preserveDraft = true,
    options: { section?: Section; paths?: Set<string>; zoomIndex?: number } = {}) => {
    if (saving.current) return;
    const losesDraft = zoomDrafts.some(index => index !== options.zoomIndex) || (!preserveDraft && dirtyFields.length > 0);
    if (losesDraft && !window.confirm("Cette opération remplacera des modifications non enregistrées. Continuer ?")) return;
    saving.current = true;
    setBusy(true);
    setSavingSection(options.section ?? null);
    setSavedSection(null);
    setError("");
    setNotice("");
    let committed = false;
    try {
      const saved = await write();
      committed = true;
      setPreview(null);
      const current = await fetchReportEditing(token, sessionId);
      applyEditing(current, preserveDraft, options.paths);
      await onSaved();
      if (current.review_revision !== saved.review_revision) {
        throw new Error("Le rapport a changé depuis l’enregistrement. La version actuelle est affichée.");
      }
      const [, pdf] = await Promise.all([
        fetchAdminArtifact(token, sessionId, "html", saved.review_revision),
        fetchAdminArtifact(token, sessionId, "pdf", saved.review_revision),
      ]);
      setPreview(pdf);
      setSavedSection(options.section ?? null);
      setNotice("Nouvelle version générée. Vérifiez-la avant approbation.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Correction refusée";
      setError(committed ? `L’écriture a abouti. La vérification des aperçus a échoué. ${message}` : message);
    } finally {
      saving.current = false;
      setBusy(false);
      setSavingSection(null);
    }
  };
  async function reload() {
    if (dirty && !window.confirm("Recharger le rapport et abandonner les modifications non enregistrées ?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const current = await fetchReportEditing(token, sessionId);
      applyEditing(current, false);
      setPreview(null);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le rapport n’a pas pu être rechargé.");
    } finally {
      setBusy(false);
    }
  }

  function save(section: Section) {
    if (!data) return;
    const changes = dirtyFields.filter(field => sectionOf(field.path) === section)
      .map(field => ({ path: field.path, value: values[key(field.path)] }));
    if (changes.length) {
      void runEdit(() => saveReportText(token, sessionId, data.review_revision, changes), true,
        { section, paths: new Set(changes.map(change => key(change.path))) });
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Chargement des sections…"}</p>;
  const sections = (Object.keys(sectionLabels) as Section[])
    .filter(section => section === "overview" || data.fields.some(field => sectionOf(field.path) === section));
  function jump(section: Section) {
    setOpenSection(section);
    document.getElementById(`report-edit-${section}`)?.scrollIntoView?.({ block: "start" });
  }
  return <div className="min-w-0 space-y-4 pb-[env(safe-area-inset-bottom)]">
    <nav aria-label="Sections du rapport" className="flex flex-wrap gap-2">
      {sections.map(section => <button key={section} type="button" className="action-button min-h-11"
        aria-controls={`report-edit-${section}`} onClick={() => jump(section)}>{sectionLabels[section]}</button>)}
    </nav>
    {sections.map(section => {
      const fields = data.fields.filter(field => sectionOf(field.path) === section);
      const changed = fields.some(field => values[key(field.path)] !== field.value);
      const sectionState = savingSection === section ? "Enregistrement…" : changed || (section === "overview" && zoomDrafts.length)
        ? "Modifications en cours" : savedSection === section ? "Enregistré" : "";
      return <section key={section} id={`report-edit-${section}`} className="scroll-mt-3 rounded-2xl border border-slate-200 bg-white">
        <h3><button type="button" aria-expanded={openSection === section} aria-controls={`report-fields-${section}`}
          onClick={() => setOpenSection(openSection === section ? null : section)}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-slate-900">
          <span>{sectionLabels[section]}{sectionState && <span className="block text-xs font-normal text-slate-600">{sectionState}</span>}</span>
          <span aria-hidden="true">{openSection === section ? "−" : "+"}</span>
        </button></h3>
        <div id={`report-fields-${section}`} hidden={openSection !== section} className="space-y-4 border-t border-slate-100 p-3 sm:p-4">
          <div className="grid gap-4 md:grid-cols-2">{fields.map(field => <label key={key(field.path)} className="block min-w-0 text-sm font-medium text-slate-700">
            {field.label} <span className="font-normal text-slate-500">{field.path.filter(x => typeof x === "number").map(x => `n°${Number(x) + 1}`).join(" · ")}</span>
            <textarea className="mt-1 block min-h-24 w-full rounded-lg border border-slate-300 p-3 text-base font-normal"
              value={values[key(field.path)] ?? ""} disabled={busy} maxLength={2500}
              onChange={event => setValues(current => ({ ...current, [key(field.path)]: event.target.value }))} />
          </label>)}</div>
          {fields.length > 0 && <button type="button" className="primary-button min-h-11 w-full disabled:opacity-50 sm:w-auto"
            disabled={busy || !changed} onClick={() => save(section)}>Enregistrer les modifications</button>}
          {section === "overview" && <>
            <h4 className="font-semibold">Recadrages photographiques</h4>
            {data.zooms.length === 0 && <p role="status" className="text-sm text-amber-800">Aucune preuve photographique affichée dans ce rapport.</p>}
            <div className="space-y-3">{data.zooms.map((zoom, index) => (
              <CropEditor key={`${data.review_revision}-${index}`} token={token} sessionId={sessionId} zoom={zoom} index={index}
                detections={data.detections || []} revision={data.review_revision} busy={busy} onDirty={onZoomDirty}
                runEdit={write => runEdit(write, true, { section, zoomIndex: index })} />
            ))}</div>
          </>}
          {error && openSection === section && <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <p role="alert">{error}</p>
            <button type="button" className="action-button min-h-11" disabled={busy} onClick={() => void reload()}>Recharger les champs</button>
          </div>}
          {notice && openSection === section && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
        </div>
      </section>;
    })}
    {data.history.length > 0 && <details className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-semibold">Historique des versions</summary><div className="mt-3 space-y-2">{data.history.map(item =>
      <div key={item.revision} className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>Version {item.revision} · {item.reason}</span><button type="button" className="action-button min-h-11" disabled={busy} onClick={() => runEdit(() => revertReport(token, sessionId, item.revision, data.review_revision), false)}>Restaurer</button></div>)}</div></details>}
    {openSection === null && error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {preview && <details className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-semibold">Aperçu PDF</summary>
      <Suspense fallback={<p>Chargement de l’aperçu PDF…</p>}><PdfPreview blob={preview} /></Suspense>
    </details>}
  </div>;
}
