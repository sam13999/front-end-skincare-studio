import { useEffect, useState } from "react";
import {
  decideRoutineCandidate, fetchAdminArtifact, fetchRouteEditor, fetchRoutineCandidatePdf, routineMoments, saveRouteEditor,
  type RouteEditorData, type RouteLine, type RouteSchedule, type RoutineDiagnostics,
} from "@/lib/adminApi";

const statusLabels = { valid: "Valide", needs_correction: "À corriger", unavailable: "Indisponible" };
const reasonLabels: Record<string, string> = {
  pregnancy_retinoid: "Restriction grossesse",
  profile_incompatibility: "Incompatibilité confirmée avec le profil",
  application_moment: "Moment d’application incompatible",
  insufficient_for_lever: "Capacité insuffisante pour ce levier",
  physical_duplicate: "Autre référence du même produit retenue",
};
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const control = "min-h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-base";

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const defaultSchedule = (): RouteSchedule => ({
  cadence: "weekly", initial_per_week: 1, maximum_per_week: 1, replaces_product_id: "",
  days: [], excluded_days: [], alternate_with: [], pair_with: [],
});

function RouteDraft({ token, sessionId, routeId, onSaved }: {
  token: string; sessionId: string; routeId: string; onSaved: () => void;
}) {
  const [view, setView] = useState<RouteEditorData | null>(null);
  const [items, setItems] = useState<RouteLine[]>([]);
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [restore, setRestore] = useState("");
  const [validated, setValidated] = useState(false);

  function install(result: RouteEditorData) {
    setView(result);
    setValidated(result.status === "valid");
    setItems(result.items.map(item => ({ ...item, schedule: { ...defaultSchedule(), ...item.schedule } })));
  }

  useEffect(() => {
    let current = true;
    fetchRouteEditor(token, sessionId, routeId).then(result => {
      if (current) install(result);
    }).catch((error: Error) => {
      if (current) setFeedback(error.message);
    });
    return () => { current = false; };
  }, [token, sessionId, routeId]);

  if (!view) return <p role={feedback ? "alert" : "status"}>{feedback || "Chargement du brouillon…"}</p>;
  const catalogue = view.products.filter(product =>
    `${product.name} ${product.brand || ""} ${product.subcategory}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const productLabel = (id: string) => view.products.find(product => product.id === id)?.name || id;
  const blocked = busy || !view.editable;

  function change(next: RouteLine[]) {
    setValidated(false);
    setItems(next);
  }
  function replace(index: number, patch: Partial<RouteLine>) {
    change(items.map((item, position) => position === index ? { ...item, ...patch } : item));
  }
  function reorder(index: number, offset: number) {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    change(next);
  }
  function scheduleChange(index: number, key: keyof RouteSchedule, value: RouteSchedule[keyof RouteSchedule]) {
    replace(index, { schedule: { ...items[index].schedule, [key]: value } });
  }
  async function operation(action: () => Promise<void>) {
    setBusy(true);
    setFeedback("");
    try { await action(); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "Opération impossible."); }
    finally { setBusy(false); }
  }
  async function persist(arbitrate: boolean, prior?: string) {
    if (!view) return;
    const result = await saveRouteEditor(token, sessionId, routeId, {
      expected_revision: view.review_revision, draft_revision: view.draft_revision,
      items, arbitrate, restore_revision: prior,
    });
    install({ ...view, items: result.items, draft_revision: result.id,
      history: [result.id, ...view.history], issues: result.validation.issues,
      status: result.validation.status === "ok" ? "valid" : "needs_correction",
      candidate: result.candidate ?? view.candidate,
    });
    setFeedback(result.arbitration_error || (result.candidate ? "Proposition prête pour vérification."
      : "Brouillon enregistré et contrôlé."));
  }

  return <section className="mt-3 min-w-0 space-y-3" aria-label={`Édition ${routeId}`}>
    <p className="text-sm">État du brouillon · <strong>{statusLabels[view.status]}</strong></p>
    <label className="block text-sm">Rechercher dans le catalogue
      <input className={control} value={query} onChange={event => setQuery(event.target.value)} />
    </label>
    {items.map((item, index) => {
      const lever = view.levers.find(value => value.levier_id === item.levier_id);
      const product = view.products.find(value => value.id === item.id_produit);
      const moments = (lever?.moments || [...routineMoments]).filter(moment => !product?.moments.length || product.moments.includes(moment));
      const partners = [...new Set(items.map(value => value.id_produit).filter(id => id && id !== item.id_produit))];
      return <fieldset key={index} disabled={blocked} className="min-w-0 space-y-2 rounded-xl border border-slate-200 p-3">
        <legend className="px-1 text-sm font-semibold">Étape {index + 1}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label>Produit<select className={control} value={item.id_produit} onChange={e => replace(index, { id_produit: e.target.value })}>
            <option value="">Choisir une référence</option>
            {product && !catalogue.includes(product) && <option value={product.id}>{product.name}</option>}
            {catalogue.map(value => <option value={value.id} key={value.id}>{value.brand} {value.name}</option>)}
          </select></label>
          <label>Levier<select className={control} value={item.levier_id} onChange={e => replace(index, { levier_id: e.target.value })}>
            {view.levers.map(value => <option key={value.levier_id} value={value.levier_id}>{value.besoins_couverts.join(", ") || value.levier_id} · {value.role}</option>)}
          </select></label>
          <label>Moment<select className={control} value={item.moment} onChange={e => replace(index, { moment: e.target.value as RouteLine["moment"] })}>
            {!moments.includes(item.moment) && <option value={item.moment}>{item.moment} · à vérifier</option>}
            {moments.map(moment => <option value={moment} key={moment}>{moment}</option>)}
          </select></label>
          <label>Cadence<select className={control} value={item.schedule.cadence} onChange={e => {
            const cadence = e.target.value as RouteSchedule["cadence"];
            replace(index, { schedule: cadence === "daily"
              ? { ...item.schedule, cadence, initial_per_week: 7, maximum_per_week: 7 }
              : { ...item.schedule, cadence } });
          }}><option value="daily">Quotidienne</option><option value="weekly">Plusieurs fois par semaine</option><option value="as_needed">Selon besoin ou introduction différée</option></select></label>
          {(["initial_per_week", "maximum_per_week"] as const).map(key => <label key={key}>{key === "initial_per_week" ? "Applications initiales par semaine" : "Maximum par semaine"}
            <input type="number" inputMode="numeric" min={0} max={7} className={control} value={item.schedule[key]}
              onChange={e => scheduleChange(index, key, Number(e.target.value))} />
          </label>)}
        </div>
        {(["days", "excluded_days"] as const).map(key => <fieldset key={key}>
          <legend className="text-sm">{key === "days" ? "Jours possibles (vide = tous)" : "Jours exclus"}</legend>
          <div className="flex flex-wrap gap-1">{dayNames.map((day, value) => <label key={day} className="inline-flex min-h-11 items-center gap-1 px-1 text-sm">
            <input type="checkbox" checked={item.schedule[key].includes(value)} onChange={e =>
              scheduleChange(index, key, e.target.checked ? [...item.schedule[key], value] : item.schedule[key].filter(x => x !== value))} />{day}</label>)}</div>
        </fieldset>)}
        {(["alternate_with", "pair_with"] as const).map(key => partners.length > 0 && <fieldset key={key}>
          <legend className="text-sm">{key === "alternate_with" ? "Alterner avec" : "Appliquer les mêmes jours que"}</legend>
          {partners.map(pid => <label key={pid} className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={item.schedule[key].includes(pid)} onChange={e =>
              scheduleChange(index, key, e.target.checked ? [...item.schedule[key], pid] : item.schedule[key].filter(id => id !== pid))} />{productLabel(pid)}</label>)}
        </fieldset>)}
        <label className="block">Justification de la sélection<input className={control} maxLength={400} value={item.reason}
          onChange={e => replace(index, { reason: e.target.value })} /></label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="action-button min-h-11" disabled={!index} onClick={() => reorder(index, -1)}>Monter</button>
          <button type="button" className="action-button min-h-11" disabled={index === items.length - 1} onClick={() => reorder(index, 1)}>Descendre</button>
          <button type="button" className="action-button min-h-11" onClick={() => change(items.filter((_, i) => i !== index))}>Supprimer l’étape</button>
        </div>
      </fieldset>;
    })}
    {!!view.issues.length && <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm">
      {view.issues.map((issue, index) => <li key={index}>{issue.message}</li>)}
    </ul>}
    <div className="flex flex-wrap gap-2">
      <button type="button" className="action-button min-h-11" disabled={blocked || !view.levers.length}
        onClick={() => change([...items, { id_produit: "", levier_id: view.levers[0].levier_id,
          moment: view.levers[0].moments?.[0] || "soir", schedule: defaultSchedule(), reason: "" }])}>Ajouter une étape</button>
      <button type="button" className="action-button min-h-11" disabled={blocked || items.some(item => !item.id_produit)}
        onClick={() => operation(() => persist(false))}>Enregistrer et vérifier</button>
      <button type="button" className="action-button min-h-11" disabled={blocked || !validated || !!view.candidate || !items.length}
        onClick={() => operation(() => persist(true))}>Relancer l’arbitrage</button>
    </div>
    {view.history.length > 1 && <div className="flex flex-wrap items-end gap-2">
      <label className="min-w-40">Historique du brouillon<select className={control} value={restore} onChange={e => setRestore(e.target.value)}>
        <option value="">Choisir une version</option>{view.history.map(id => <option value={id} key={id}>Version {Number(id)}</option>)}
      </select></label>
      <button type="button" className="action-button min-h-11" disabled={blocked || !restore}
        onClick={() => operation(() => persist(false, restore))}>Restaurer</button>
    </div>}
    {view.candidate && <div className="flex flex-wrap gap-2 rounded-lg border p-3">
      <p className="w-full">Proposition après arbitrage · {view.candidate.route_id}</p>
      <button type="button" className="action-button min-h-11" disabled={busy}
        onClick={() => operation(async () => download("proposition-routine.pdf", await fetchRoutineCandidatePdf(token, sessionId, view.candidate!.id)))}>Télécharger le PDF</button>
      {[true, false].map(accept => <button type="button" className="action-button min-h-11" key={String(accept)}
        disabled={blocked || (accept && view.candidate!.stale)} onClick={() => operation(async () => {
          await decideRoutineCandidate(token, sessionId, view.review_revision, view.candidate!.id, accept);
          install(await fetchRouteEditor(token, sessionId, routeId));
          onSaved();
        })}>{accept ? "Retenir pour validation" : "Écarter la proposition"}</button>)}
    </div>}
    <p role="status" className="text-sm">{busy ? "Contrôle en cours…" : feedback}</p>
  </section>;
}

export default function RouteDiagnostics({ token, sessionId, diagnostics, onSaved }: {
  token: string; sessionId: string; diagnostics?: RoutineDiagnostics; onSaved: () => void;
}) {
  const [editor, setEditor] = useState("");
  const [downloadError, setDownloadError] = useState("");
  return <section className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
    <h3 className="font-semibold">Filtrage et validation des routines</h3>
    {!diagnostics?.routes.length && <p className="text-sm">Aucun diagnostic de routine disponible pour cette session.</p>}
    {!!diagnostics?.shortlist_issues.length && <ul className="list-inside list-disc text-sm">{diagnostics.shortlist_issues.map((issue, i) => <li key={i}>{issue.message}</li>)}</ul>}
    <div className="flex flex-wrap gap-2">
      {diagnostics?.files.map(name => <button type="button" className="action-button min-h-11 break-all" key={name} onClick={async () => {
        setDownloadError("");
        try { download(name, await fetchAdminArtifact(token, sessionId, name)); }
        catch (error) { setDownloadError(error instanceof Error ? error.message : "Téléchargement impossible."); }
      }}>Télécharger {name}</button>)}
    </div>
    {downloadError && <p role="alert">{downloadError}</p>}
    {diagnostics?.routes.map(route => <details key={route.route_id} className="rounded-xl border border-slate-200 p-3">
      <summary className="cursor-pointer py-2 font-semibold">{route.route_id} · {statusLabels[route.status]}</summary>
      {route.reason && <p className="text-sm">{route.reason}</p>}
      {route.missing_required_levers.length > 0 && <p className="text-sm">Leviers sans couverture · {route.missing_required_levers.join(", ")}</p>}
      {route.issues.map((issue, i) => <p key={i} className="text-sm">{issue.message}</p>)}
      {route.attempts.map((attempt, index) => <p key={index} className="text-sm">
        Réparation {attempt.method} · {attempt.error || (attempt.validation?.status === "ok" ? "réussie" : "à corriger")}
        {attempt.validation?.issues?.map((issue, i) => <span className="block" key={i}>{issue.message}</span>)}
      </p>)}
      {route.levers.map(lever => <details key={lever.id} className="my-2 rounded-lg bg-slate-50 p-2 text-sm">
        <summary className="cursor-pointer py-2">{lever.needs.join(", ") || lever.id} · {lever.required ? "Obligatoire" : lever.role}</summary>
        <p>Sous-catégories · {lever.subcategories.join(", ")}</p>
        <p>Admissibles · {lever.products.map(product => product.name).join(", ") || "Aucune référence"}</p>
        {lever.excluded?.map(product => <p className="break-words" key={product.id}>
          {product.name || product.id} · {reasonLabels[product.reason] || product.reason}</p>)}
        {!!lever.outside_requested_subcategories && <p>{lever.outside_requested_subcategories} références hors des sous-catégories demandées.</p>}
      </details>)}
      <button type="button" className="action-button min-h-11" onClick={() => setEditor(editor === route.route_id ? "" : route.route_id)}>
        {editor === route.route_id ? "Fermer l’éditeur" : "Modifier cette stratégie"}
      </button>
      {editor === route.route_id && <RouteDraft key={route.route_id} token={token} sessionId={sessionId} routeId={route.route_id} onSaved={onSaved} />}
    </details>)}
  </section>;
}
