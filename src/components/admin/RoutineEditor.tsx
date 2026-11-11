import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  decideRoutineCandidate, fetchAdminArtifact, fetchRoutine, fetchRoutineCandidatePdf,
  rerunPrompt4, routineMoments, saveFrequencies,
  type FrequencyPlan, type RoutineFrequency, type RoutineMoment, type RoutineView, type RoutineWarning,
} from "@/lib/adminApi";

const PdfPreview = lazy(() => import("./PdfPreview"));
const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const momentLabels = { matin: "Matin", soir: "Soir", hebdomadaire: "Soin hebdomadaire" };
type Plans = Record<string, Partial<Record<RoutineMoment, FrequencyPlan>>>;

function defaultPlan(): FrequencyPlan {
  return { initial_per_week: 1, maximum_per_week: 1, days: [], excluded_days: [], alternate_with: [], pair_with: [], progression: "" };
}

function schedules(view: RoutineView): Plans {
  return Object.fromEntries(view.products.map(product => [
    product.id_produit, Object.fromEntries(routineMoments.flatMap(moment => {
      const item = product.moments[moment];
      if (!item) return [];
      const plan = defaultPlan();
      // Only send editable fields. The source cadence is read-only metadata.
      for (const field of Object.keys(plan) as (keyof FrequencyPlan)[]) {
        if (field in item) Object.assign(plan, { [field]: item[field] });
      }
      return [[moment, plan]];
    })),
  ]));
}

const toggle = <T,>(items: T[], value: T, on: boolean) => on ? [...items, value] : items.filter(item => item !== value);
const control = "block min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-base";

function FrequencySummary({ rows }: { rows: RoutineFrequency[] }) {
  return <ul className="space-y-1 text-sm text-slate-700">
    {rows.map(row => <li key={row.id_produit}><strong>{row.name}</strong>{" · "}
      {row.initial_per_week ?? "?"} au départ / {row.maximum_per_week ?? "?"} max par semaine{" · "}
      {row.moments.map(moment => momentLabels[moment]).join(", ")}</li>)}
  </ul>;
}

function Warnings({ issues }: { issues: RoutineWarning[] }) {
  return issues.length ? <ul className="mt-2 space-y-2 text-sm text-amber-950">
    {issues.map((issue, index) => <li className="rounded-md bg-amber-50 p-2" key={`${issue.code}-${index}`}>{issue.message}</li>)}
  </ul> : null;
}

function TextsToReview({ fields }: { fields: string[] }) {
  return fields.length ? <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-950">
    <p>Vérifiez ces textes dans « Corriger le rapport ». Leur mise à jour automatique ne peut pas être déduite du calendrier.</p>
    <ul className="list-inside list-disc">{fields.map(field => <li key={field}>{field}</li>)}</ul>
  </div> : null;
}

export default function RoutineEditor({ token, sessionId, onSaved }: {
  token: string; sessionId: string; onSaved: () => void;
}) {
  const [view, setView] = useState<RoutineView | null>(null);
  const [plans, setPlans] = useState<Plans>({});
  const [route, setRoute] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<{ label: string; blob: Blob } | null>(null);
  const lock = useRef(false);

  function install(result: RoutineView) {
    setView(result);
    setPlans(schedules(result));
  }

  useEffect(() => {
    let active = true;
    fetchRoutine(token, sessionId)
      .then(result => { if (active) install(result); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Routine indisponible."); });
    return () => { active = false; };
  }, [token, sessionId]);

  async function run(label: string, operation: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setError("");
    setNotice("");
    setBusy(label);
    try { await operation(); }
    catch (e) { setError(e instanceof Error ? e.message : "L’opération a échoué."); }
    finally { lock.current = false; setBusy(""); }
  }

  async function reload(expectedRevision?: string) {
    const result = await fetchRoutine(token, sessionId);
    if (expectedRevision && result.review_revision !== expectedRevision) {
      throw new Error("La version du rapport a changé. Rechargez la routine avant de poursuivre.");
    }
    install(result);
  }

  function update(pid: string, moment: RoutineMoment, plan?: FrequencyPlan) {
    setPlans(current => {
      const next = { ...current[pid] };
      if (plan) next[moment] = plan;
      else delete next[moment];
      return { ...current, [pid]: next };
    });
  }

  if (!view) return <p role={error ? "alert" : "status"} className="text-sm">{error || "Chargement de la routine…"}</p>;
  const initial = schedules(view);
  const changes = view.products.flatMap(product => {
    const pid = product.id_produit;
    return JSON.stringify(plans[pid]) !== JSON.stringify(initial[pid]) ? [{ id_produit: pid, moments: plans[pid] }] : [];
  });
  const valid = changes.every(change => Object.values(change.moments).length > 0 && Object.values(change.moments).every(plan =>
    plan.initial_per_week !== null && plan.maximum_per_week !== null && plan.initial_per_week >= 0
    && plan.maximum_per_week >= plan.initial_per_week && plan.maximum_per_week <= 7));
  const candidate = view.candidate;
  const disabled = !view.editable || !!busy;
  const currentPreview = () => run("Chargement du PDF…", async () => {
    setPreview({ label: "Rapport actif", blob: await fetchAdminArtifact(token, sessionId, "pdf") });
  });

  return <div className="min-w-0 space-y-5">
    <section className="space-y-2">
      <h3 className="font-semibold">Rapport actif{view.active_version ? ` · version ${view.active_version}` : ""}</h3>
      <p className="text-sm text-slate-700">{view.source === "initial" ? "Génération initiale" : "Proposition de Prompt 4 retenue"}
        {view.adjusted_products.length > 0 && ` · ${view.adjusted_products.length} produit(s) ajusté(s) manuellement`}
        {view.route_id && ` · ${view.routes.find(item => item.route_id === view.route_id)?.nom || view.route_id}`}</p>
      <FrequencySummary rows={view.frequencies} />
      <button type="button" className="action-button" disabled={!!busy} onClick={currentPreview}>Aperçu du rapport actif</button>
      <details className="text-sm"><summary className="cursor-pointer font-medium">Routine initiale générée par l’IA</summary>
        <FrequencySummary rows={view.initial_frequencies} />
      </details>
      <TextsToReview fields={view.texts_to_review} />
    </section>

    <section className="space-y-3">
      <h3 className="font-semibold">Fréquences et avertissements</h3>
      <Warnings issues={view.warnings.filter(issue => !issue.id_produit && !issue.product_ids?.length)} />
      {view.products.map(product => {
        const pid = product.id_produit;
        return <details key={pid} className="rounded-xl border border-slate-200 p-3">
          <summary className="min-h-8 cursor-pointer font-medium">{product.name}
            {view.adjusted_products.includes(pid) && <span className="ml-2 text-sm text-slate-500">Ajusté</span>}
          </summary>
          <Warnings issues={view.warnings.filter(issue => issue.id_produit === pid || issue.product_ids?.includes(pid))} />
          <fieldset disabled={disabled} className="mt-3 space-y-3">
            <legend className="sr-only">Moments et fréquence de {product.name}</legend>
            {routineMoments.map(moment => {
              const plan = plans[pid]?.[moment];
              return <div key={moment} className="space-y-2 rounded-md border p-3">
                <label className="flex min-h-9 items-center gap-2 font-medium">
                  <input type="checkbox" checked={!!plan} onChange={e => update(pid, moment, e.target.checked ? defaultPlan() : undefined)} />
                  {momentLabels[moment]}
                </label>
                {plan && <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([["initial_per_week", "Départ / semaine"], ["maximum_per_week", "Maximum / semaine"]] as const).map(([key, label]) =>
                      <label key={key} className="text-sm">{label}
                        <input className={control} type="number" min={0} max={7} step={1} inputMode="numeric" value={plan[key] ?? ""}
                          onChange={e => update(pid, moment, { ...plan, [key]: e.target.value === "" ? null : e.target.valueAsNumber })} />
                      </label>)}
                  </div>
                  {([["days", "Jours possibles"], ["excluded_days", "Jours à exclure"]] as const).map(([key, label]) =>
                    <fieldset key={key}>
                      <legend className="text-sm">{label}</legend>
                      <div className="flex flex-wrap gap-1">
                        {days.map((day, index) => <label key={day} className="flex min-h-10 items-center gap-1 rounded border px-2 text-sm">
                          <input type="checkbox" checked={plan[key].includes(index)}
                            onChange={e => update(pid, moment, { ...plan, [key]: toggle(plan[key], index, e.target.checked).sort() })} />
                          {day}
                        </label>)}
                      </div>
                    </fieldset>)}
                  <details>
                    <summary className="min-h-9 cursor-pointer text-sm">Coordonner avec un autre produit</summary>
                    {view.products.filter(other => other.id_produit !== pid && !!Object.keys(plans[other.id_produit] || {}).length).map(other =>
                      <label key={other.id_produit} className="mb-2 block text-sm">{other.name}
                        <select className={control}
                          value={plan.alternate_with.includes(other.id_produit) ? "alternate_with" : plan.pair_with.includes(other.id_produit) ? "pair_with" : ""}
                          onChange={e => update(pid, moment, { ...plan,
                            alternate_with: toggle(plan.alternate_with.filter(id => id !== other.id_produit), other.id_produit, e.target.value === "alternate_with"),
                            pair_with: toggle(plan.pair_with.filter(id => id !== other.id_produit), other.id_produit, e.target.value === "pair_with"),
                          })}>
                          <option value="">Aucune coordination</option>
                          <option value="alternate_with">Alterner les jours</option>
                          <option value="pair_with">Utiliser les mêmes jours</option>
                        </select>
                      </label>)}
                  </details>
                  <label className="block text-sm">Condition de progression
                    <input className={control} value={plan.progression} maxLength={160}
                      placeholder="Si la peau reste confortable"
                      onChange={e => update(pid, moment, { ...plan, progression: e.target.value })} />
                  </label>
                </>}
              </div>;
            })}
          </fieldset>
        </details>;
      })}
      <button type="button" className="primary-button disabled:opacity-50" disabled={disabled || !changes.length || !valid}
        onClick={() => run("Reconstruction HTML/PDF…", async () => {
          const saved = await saveFrequencies(token, sessionId, view.review_revision, changes);
          setNotice("Fréquences enregistrées. Le rapport attend votre validation.");
          setPreview(null);
          onSaved();
          await reload(saved.review_revision);
        })}>Enregistrer les fréquences</button>
      {!!changes.length && !valid && <p className="text-sm text-amber-900">Conservez au moins un créneau valide par produit.</p>}
    </section>

    <section className="space-y-3 rounded-xl border p-3">
      <h3 className="font-semibold">Relancer Prompt 4</h3>
      {view.routes.map(item => <details key={item.route_id} className="rounded-md border p-2">
        <summary className="cursor-pointer text-sm font-medium">{item.nom || item.route_id} · {item.available ? "Disponible" : "Indisponible"}
          {item.route_id === view.route_id ? " · Route active" : ""}</summary>
        <div className="space-y-1 pt-2 text-sm text-slate-700">
          <p>{item.logique_technique}</p><p>{item.difference_majeure}</p>
          <p>{item.treatments} traitement(s) correctif(s){item.nombre_produits_cible ? ` · ${item.nombre_produits_cible} produits visés` : ""}</p>
          {!!item.precautions.length && <p>{item.precautions.join(" · ")}</p>}
          {!item.available && <p>{item.missing_required_levers?.length
            ? `Le filtre n’a pas couvert ces exigences : ${item.missing_required_levers.join(", ")}.`
            : "Le snapshot catalogue ne déclare pas cette route exécutable."}</p>}
        </div>
      </details>)}
      <label className="block text-sm">Mode de sélection
        <select className={control} disabled={disabled} value={route} onChange={e => setRoute(e.target.value)}>
          <option value="">Sélection automatique</option>
          {view.routes.map(item => <option key={item.route_id} value={item.route_id} disabled={!item.available}>{item.nom || item.route_id}</option>)}
        </select>
      </label>
      <button type="button" className="action-button" disabled={disabled || !!changes.length || !view.routes.some(item => item.available)
          || (route !== "" && !view.routes.some(item => item.route_id === route && item.available)) || (!!candidate && !candidate.stale)}
        onClick={() => run("Prompt 4 en cours…", async () => {
          const proposal = await rerunPrompt4(token, sessionId, view.review_revision, route || null);
          setView(current => current ? { ...current, candidate: proposal } : current);
          setNotice("Proposition prête à comparer. Le rapport actif est conservé.");
        })}>Générer une proposition</button>
      {candidate && <div className="space-y-3 border-t pt-3">
        <h4 className="font-semibold">Proposition · {view.routes.find(item => item.route_id === candidate.route_id)?.nom || candidate.route_id}</h4>
        <FrequencySummary rows={candidate.frequencies} />
        <Warnings issues={candidate.warnings} />
        <TextsToReview fields={candidate.texts_to_review} />
        {candidate.stale && <p className="text-sm">Le rapport actif a changé depuis cette proposition. Une nouvelle génération est nécessaire pour la retenir.</p>}
        <p className="text-sm">Retenir la proposition remplace la routine active et ses ajustements. Vous pouvez restaurer la version précédente dans « Corriger le rapport ». Le rapport repasse en attente de validation.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="action-button" disabled={!!busy} onClick={() => run("Chargement du PDF…", async () =>
            setPreview({ label: "Proposition de Prompt 4", blob: await fetchRoutineCandidatePdf(token, sessionId, candidate.id) }))}>Aperçu de la proposition</button>
          <button type="button" className="action-button" disabled={disabled || !!changes.length || candidate.stale}
            onClick={() => run("Activation de la proposition…", async () => {
              const result = await decideRoutineCandidate(token, sessionId, view.review_revision, candidate.id, true);
              setNotice("Proposition retenue. Le rapport attend votre validation.");
              setPreview(null);
              onSaved();
              await reload(result.review_revision);
            })}>Retenir la proposition</button>
          <button type="button" className="action-button" disabled={disabled}
            onClick={() => run("Suppression de la proposition…", async () => {
              await decideRoutineCandidate(token, sessionId, view.review_revision, candidate.id, false);
              setView(current => current ? { ...current, candidate: null } : current);
              setPreview(null);
            })}>Écarter</button>
        </div>
      </div>}
    </section>

    {(busy || notice) && <p role="status" className="rounded bg-blue-50 p-3 text-sm text-blue-800">{busy || notice}</p>}
    {error && <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
      <p>{error}</p>
      <button type="button" className="action-button mt-2" disabled={!!busy} onClick={() => run("Rechargement…", () => reload())}>Recharger la routine</button>
    </div>}
    {preview && <section><h3 className="font-semibold">{preview.label}</h3>
      <Suspense fallback={<p>Chargement de l’aperçu…</p>}><PdfPreview blob={preview.blob} /></Suspense>
    </section>}
  </div>;
}
