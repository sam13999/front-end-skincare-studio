import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  decideRoutineCandidate, fetchAdminArtifact, fetchRoutine, fetchRoutineCandidatePdf,
  rerunPrompt4, routineMoments, saveFrequencies, saveFrequencyDraft, discardFrequencyDraft, saveApplicationOrder,
  type FrequencyPlan, type FrequencyPlanV2, type RoutineFrequency, type RoutineMoment, type RoutineView, type RoutineWarning,
  type WeeklyPlan, type WeeklyNight,
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

function targeted(view: RoutineView) {
  return view.products.filter(product => product.calendar_role === "corrective"
    && (product.moments.soir?.initial_per_week ?? 7) > 0
    && (product.moments.soir?.initial_per_week ?? 7) < 7);
}
function supporting(view: RoutineView) {
  return view.products.filter(product => product.calendar_role !== "corrective"
    && product.moments.soir && (product.moments.soir.initial_per_week ?? 7) < 7);
}
function suggestedWeek(view: RoutineView): WeeklyPlan {
  const products = targeted(view);
  const supports = supporting(view);
  const nights = (progressed: boolean): WeeklyNight[] => {
    const result: WeeklyNight[] = days.map(() => ({ status: "recovery", product_ids: [], support_product_ids: [] }));
    for (const product of products) {
      const schedule = product.moments.soir;
      const count = (progressed ? schedule?.maximum_per_week : schedule?.initial_per_week) || 0;
      const allowed = schedule?.days?.length ? schedule.days : [0, 3, 5, 1, 4, 2, 6];
      let placed = 0;
      for (const day of allowed) {
        if (placed >= count) break;
        if (schedule?.excluded_days?.includes(day)) continue;
        if (result[day].product_ids.some(id => schedule?.alternate_with?.includes(id)
          || view.products.find(other => other.id_produit === id)?.moments.soir?.alternate_with?.includes(product.id_produit))) continue;
        result[day] = { ...result[day], status: "active",
          product_ids: [...result[day].product_ids, product.id_produit] };
        placed++;
      }
    }
    const rest = [...result].map((night, index) => ({ night, index })).reverse().find(item => item.night.status === "recovery");
    if (rest) result[rest.index] = { ...result[rest.index], status: "rest" };
    for (const product of supports) {
      const schedule = product.moments.soir;
      const count = (progressed ? schedule?.maximum_per_week : schedule?.initial_per_week) || 0;
      const allowed = schedule?.days?.length ? schedule.days : [1, 2, 4, 5, 6, 0, 3];
      let placed = 0;
      for (const day of allowed) {
        if (placed >= count) break;
        if (schedule?.excluded_days?.includes(day)) continue;
        const ids = [...result[day].product_ids, ...(result[day].support_product_ids || [])];
        if (ids.some(id => schedule?.alternate_with?.includes(id))) continue;
        result[day] = { ...result[day], support_product_ids: [...(result[day].support_product_ids || []), product.id_produit] };
        placed++;
      }
    }
    return result;
  };
  return { initial: nights(false), progressed: nights(true) };
}
function alignWeekDays(view: RoutineView, plans: Plans, week: WeeklyPlan): Plans {
  const next: Plans = { ...plans };
  for (const product of [...targeted(view), ...supporting(view)]) {
    const pid = product.id_produit;
    const plan = plans[pid]?.soir;
    if (!plan) continue;
    const selected = days.map((_, index) => index).filter(day =>
      [week.initial[day], week.progressed[day]].some(night =>
        night.product_ids.includes(pid) || night.support_product_ids?.includes(pid)));
    const rest = days.map((_, index) => index).filter(day =>
      week.initial[day].status === "rest" || week.progressed[day].status === "rest");
    const excluded = product.calendar_role === "corrective" ?
      [...new Set([...plan.excluded_days, ...rest])] : plan.excluded_days;
    const allowed = [...selected];
    for (let day = 0; allowed.length < (plan.maximum_per_week || 0) && day < 7; day++) {
      if (!allowed.includes(day) && !excluded.includes(day)) allowed.push(day);
    }
    next[pid] = { ...plans[pid], soir: { ...plan, days: allowed.sort(), excluded_days: [...excluded].sort() } };
  }
  return next;
}

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
  const [week, setWeek] = useState<WeeklyPlan | null>(null);
  const [order, setOrder] = useState<Record<RoutineMoment, string[]>>({ matin: [], soir: [], hebdomadaire: [] });
  const [route, setRoute] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<{ label: string; blob: Blob } | null>(null);
  const lock = useRef(false);

  function install(result: RoutineView) {
    setView(result);
    setOrder(result.application_order || Object.fromEntries(routineMoments.map(moment => [moment,
      result.products.filter(product => product.moments[moment]).map(product => product.id_produit)])) as Record<RoutineMoment, string[]>);
    const next = schedules(result);
    if (result.frequency_draft && !result.frequency_draft.applied) {
      for (const change of result.frequency_draft.changes) {
        next[change.id_produit] = change.moments as Partial<Record<RoutineMoment, FrequencyPlan>>;
      }
    }
    setPlans(next);
    const suggested = suggestedWeek(result);
    setWeek(result.weekly_plan ? {
      initial: result.weekly_plan.initial.map((night, day) => ({
        ...night, support_product_ids: night.support_product_ids ?? suggested.initial[day].support_product_ids,
      })),
      progressed: result.weekly_plan.progressed.map((night, day) => ({
        ...night, support_product_ids: night.support_product_ids ?? suggested.progressed[day].support_product_ids,
      })),
    } : suggested);
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
  function updateNight(phase: keyof WeeklyPlan, day: number, night: WeeklyNight) {
    setWeek(current => current && ({ ...current, [phase]: current[phase].map((item, index) => index === day ? night : item) }));
  }

  if (!view) return <p role={error ? "alert" : "status"} className="text-sm">{error || "Chargement de la routine…"}</p>;
  if (view.calendar_contract === "v2") return <RoutineEditorV2 token={token} sessionId={sessionId} onSaved={onSaved} initialView={view} />;
  const initial = schedules(view);
  const orderChanged = !!view.application_order && JSON.stringify(order) !== JSON.stringify(view.application_order);
  const weekChanged = !!week && JSON.stringify(week) !== JSON.stringify(view.weekly_plan || suggestedWeek(view));
  const finalPlans = weekChanged && week ? alignWeekDays(view, plans, week) : plans;
  const changes = view.products.flatMap(product => {
    const pid = product.id_produit;
    return JSON.stringify(finalPlans[pid]) !== JSON.stringify(initial[pid]) ? [{ id_produit: pid, moments: finalPlans[pid] }] : [];
  });
  const valid = changes.every(change => Object.values(change.moments).length > 0 && Object.values(change.moments).every(plan =>
    plan.initial_per_week !== null && plan.maximum_per_week !== null && Number.isInteger(plan.initial_per_week) && Number.isInteger(plan.maximum_per_week) && plan.initial_per_week >= 0
    && plan.maximum_per_week >= plan.initial_per_week && plan.maximum_per_week <= 7));
  const candidate = view.candidate;
  const disabled = !view.editable || !!busy;
  const targetedProducts = targeted(view);
  const supportiveProducts = supporting(view);
  const weekValid = !week || (["initial", "progressed"] as const).every(phase => {
    const nights = week[phase];
    const all = [...targetedProducts, ...supportiveProducts];
    return nights.length === 7 && nights.every(night => {
      const ids = [...night.product_ids, ...(night.support_product_ids || [])];
      return (night.status === "active") === (night.product_ids.length > 0)
        && new Set(ids).size === ids.length
        && night.product_ids.every(id => targetedProducts.some(product => product.id_produit === id))
        && (night.support_product_ids || []).every(id => supportiveProducts.some(product => product.id_produit === id))
        && ids.every(id => !ids.some(other => other !== id &&
          all.find(product => product.id_produit === id)?.moments.soir?.alternate_with?.includes(other)));
    }) && all.every(product => {
        const count = nights.filter(night => [...night.product_ids, ...(night.support_product_ids || [])]
          .includes(product.id_produit)).length;
        const start = plans[product.id_produit]?.soir?.initial_per_week || 0;
        const maximum = plans[product.id_produit]?.soir?.maximum_per_week || 0;
        return phase === "initial" ? count === start : count >= start && count <= maximum;
      });
  });
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

    <section className="space-y-3 rounded-xl border border-slate-200 p-3" aria-label="Ordre d’application des produits">
      <h3 className="font-semibold">Ordre d’application des produits</h3>
      <p className="text-sm text-slate-700">Déplacez chaque soin avec les boutons. Le produit et sa fréquence restent inchangés.</p>
      {routineMoments.map(moment => <div key={moment} className="space-y-2">
        <h4 className="font-medium">{moment === "hebdomadaire" ? "Soins hebdomadaires" : `Routine du ${moment}`}</h4>
        {!order[moment].length && <p className="text-sm text-slate-500">Aucun produit.</p>}
        <ol className="space-y-2">{order[moment].map((id, index) => <li key={id} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border bg-white p-2 text-sm">
          <span className="min-w-0 break-words">{index + 1}. {view.products.find(product => product.id_produit === id)?.name || id}</span>
          <span className="flex shrink-0 gap-1">
            {([-1, 1] as const).map(direction => <button key={direction} type="button" className="action-button min-h-11 px-2"
              aria-label={`${direction === -1 ? "Monter" : "Descendre"} ${view.products.find(product => product.id_produit === id)?.name || id}`}
              disabled={disabled || index + direction < 0 || index + direction >= order[moment].length}
              onClick={() => setOrder(current => {
                const next = [...current[moment]];
                [next[index], next[index + direction]] = [next[index + direction], next[index]];
                return { ...current, [moment]: next };
              })}>{direction === -1 ? "↑" : "↓"}</button>)}
          </span>
        </li>)}</ol>
      </div>)}
      {orderChanged && <p role="status" className="text-sm text-amber-800">Ordre modifié, non enregistré.</p>}
      <button type="button" className="primary-button disabled:opacity-50" disabled={disabled || !orderChanged || !!changes.length || weekChanged}
        onClick={() => run("Reconstruction HTML/PDF…", async () => {
          const saved = await saveApplicationOrder(token, sessionId, view.review_revision, order);
          setNotice("Ordre enregistré dans le rapport. La validation humaine reste requise.");
          setPreview(null);
          onSaved();
          await reload(saved.review_revision);
        })}>Enregistrer l’ordre et reconstruire</button>
      {(!!changes.length || weekChanged) && orderChanged && <p className="text-sm text-amber-800">Enregistrez d’abord vos changements de fréquence et de calendrier.</p>}
    </section>

    <section className="space-y-3">
      <h3 className="font-semibold">Calendrier et fréquences</h3>
      {week && targetedProducts.length > 0 && <div className="space-y-4 rounded-xl border border-slate-200 p-3">
        <h4 className="font-semibold">Les sept soirs de la semaine</h4>
        <p className="text-sm text-slate-700">Récupération : soins de confort habituels. Repos minimal : conservez démaquillage et hydratation si nécessaire ; aucun soin ciblé. Les produits quotidiens restent appliqués selon leur fiche.</p>
        {(["initial", "progressed"] as const).map(phase => <fieldset key={phase} disabled={disabled} className="space-y-2">
          <legend className="font-medium">{phase === "initial" ? "Au départ" : "Après progression"}</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-7">
            {week[phase].map((night, index) => <div key={index} className="min-w-0 rounded-lg border bg-white p-2">
              <label className="block text-sm font-semibold">{days[index]}
                <select className={control} aria-label={`${days[index]} · ${phase === "initial" ? "départ" : "progression"}`}
                  value={night.status} onChange={event => {
                    const status = event.target.value as WeeklyNight["status"];
                    updateNight(phase, index, { ...night, status, product_ids: status === "active" ?
                      (night.product_ids.length ? night.product_ids : [targetedProducts[0].id_produit]) : [] });
                  }}>
                  <option value="active">Soin ciblé</option><option value="recovery">Récupération</option>
                  <option value="rest">Repos minimal</option>
                </select>
              </label>
              {night.status === "active" && targetedProducts.map(product => <label key={product.id_produit} className="mt-2 flex min-h-10 items-center gap-2 text-sm">
                <input type="checkbox" checked={night.product_ids.includes(product.id_produit)}
                  onChange={event => {
                    const ids = toggle(night.product_ids, product.id_produit, event.target.checked);
                    updateNight(phase, index, { ...night, status: ids.length ? "active" : "recovery", product_ids: ids });
                  }} />{product.name}</label>)}
              {supportiveProducts.length > 0 && <details className="mt-2 text-sm">
                <summary className="min-h-10 cursor-pointer">Soins de confort</summary>
                {supportiveProducts.map(product => <label key={product.id_produit} className="flex min-h-10 items-center gap-2">
                  <input type="checkbox" checked={(night.support_product_ids || []).includes(product.id_produit)}
                    onChange={event => updateNight(phase, index, { ...night,
                      support_product_ids: toggle(night.support_product_ids || [], product.id_produit, event.target.checked),
                    })} />{product.name}
                </label>)}
              </details>}
            </div>)}
          </div>
        </fieldset>)}
        {!weekValid && <p role="alert" className="text-sm text-amber-900">Vérifiez les sept soirs, la fréquence de chaque soin et les alternances indiquées.</p>}
        {weekChanged && <p className="text-sm text-slate-700">Calendrier modifié, non enregistré.</p>}
      </div>}
      <Warnings issues={view.warnings.filter(issue => !issue.id_produit && !issue.product_ids?.length)} />
      {view.products.map(product => {
        const pid = product.id_produit;
        return <details key={pid} className="min-w-0 rounded-xl border border-slate-200 p-3">
          <summary className="min-h-8 cursor-pointer font-medium">{product.name}
            {view.adjusted_products.includes(pid) && <span className="ml-2 text-sm text-slate-500">Ajusté</span>}
          </summary>
          <Warnings issues={view.warnings.filter(issue => issue.id_produit === pid || issue.product_ids?.includes(pid))} />
          <fieldset disabled={disabled} className="mt-3 min-w-0 space-y-3">
            <legend className="sr-only">Moments et fréquence de {product.name}</legend>
            {routineMoments.map(moment => {
              const plan = plans[pid]?.[moment];
              if (!plan && product.allowed_moments && !product.allowed_moments.includes(moment)) return null;
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
                  <details><summary className="min-h-11 cursor-pointer text-sm">Jours autorisés pour ce produit</summary>
                  {([["days", "Jours possibles"], ["excluded_days", "Jours à exclure"]] as const).map(([key, label]) =>
                    <fieldset key={key} className="min-w-0">
                      <legend className="text-sm">{label}</legend>
                      <div className="flex flex-wrap gap-1">
                        {days.map((day, index) => <label key={day} className="flex min-h-10 items-center gap-1 rounded border px-2 text-sm">
                          <input type="checkbox" checked={plan[key].includes(index)}
                            onChange={e => update(pid, moment, { ...plan, [key]: toggle(plan[key], index, e.target.checked).sort() })} />
                          {day}
                        </label>)}
                      </div>
                    </fieldset>)}</details>
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
      <button type="button" className="action-button min-h-11" disabled={disabled || !changes.length || !changes.every(change =>
        Object.values(change.moments).every(plan => Number.isInteger(plan.initial_per_week) && Number.isInteger(plan.maximum_per_week)
          && plan.initial_per_week >= 0 && plan.initial_per_week <= 7 && plan.maximum_per_week >= 0 && plan.maximum_per_week <= 7))}
        onClick={() => run("Enregistrement du brouillon…", async () => {
          const draft = await saveFrequencyDraft(token, sessionId, view.review_revision,
            view.frequency_draft?.id || null, changes);
          setView({ ...view, frequency_draft: draft });
          setNotice("Brouillon enregistré. Le rapport actif reste inchangé ; corrigez les anomalies avant de l’appliquer.");
          onSaved();
        })}>Enregistrer le brouillon</button>
      {view.frequency_draft && !view.frequency_draft.applied && <>
        <p className="text-sm">Brouillon conservé · {view.frequency_draft.validation.status === "ok" ? "Prêt à appliquer" : "À corriger"}. L’approbation reste suspendue tant qu’il n’est pas appliqué.</p>
        <Warnings issues={view.frequency_draft.validation.issues} />
        <button type="button" className="action-button min-h-11" disabled={disabled}
          onClick={() => run("Abandon du brouillon…", async () => {
            await discardFrequencyDraft(token, sessionId, view.review_revision, view.frequency_draft!.id);
            await reload(view.review_revision);
            onSaved();
            setNotice("Brouillon abandonné. Le rapport actif est conservé.");
          })}>Abandonner le brouillon</button>
      </>}
      <button type="button" className="primary-button disabled:opacity-50" disabled={disabled || (!changes.length && !weekChanged) || !valid || !weekValid}
        onClick={() => run("Reconstruction HTML/PDF…", async () => {
          const saved = await saveFrequencies(token, sessionId, view.review_revision, changes,
            targetedProducts.length ? week || undefined : undefined);
          setNotice("Fréquences enregistrées. Le rapport attend votre validation.");
          setPreview(null);
          onSaved();
          await reload(saved.review_revision);
        })}>Appliquer et reconstruire</button>
      {!!changes.length && !valid && <p className="text-sm text-amber-900">Vous pouvez enregistrer ce brouillon. Corrigez les fréquences avant de l’appliquer.</p>}
    </section>

    <section className="space-y-3 rounded-xl border p-3">
      <h3 className="font-semibold">Relancer Prompt 4</h3>
      {!view.routes.length && <p className="text-sm">Les routes filtrées sont absentes du snapshot de cette session.</p>}
      {view.routes.map(item => <details key={item.route_id} className="rounded-md border p-2">
        <summary className="cursor-pointer text-sm font-medium">{item.nom || item.route_id} · {item.available ? "Disponible" : "Indisponible"}
          {item.route_id === view.route_id ? " · Route active" : ""}</summary>
        <div className="space-y-1 pt-2 text-sm text-slate-700">
          <p>{item.logique_technique}</p><p>{item.difference_majeure}</p>
          <p>{item.treatments} traitement(s) correctif(s){item.nombre_produits_cible ? ` · ${item.nombre_produits_cible} produits visés` : ""}</p>
          {!!item.intensities?.length && <p>Intensité des candidats correctifs · {item.intensities.join(", ")}</p>}
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

    {(busy || notice) && <p role="status" className="sticky bottom-2 rounded bg-blue-50 p-3 text-sm text-blue-800">{busy || notice}</p>}
    {error && <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
      <p>{error}</p>
      <button type="button" className="action-button mt-2" disabled={!!busy} onClick={() => run("Rechargement…", () => reload())}>Recharger et effacer la saisie</button>
    </div>}
    {preview && <section><h3 className="font-semibold">{preview.label}</h3>
      <Suspense fallback={<p>Chargement de l’aperçu…</p>}><PdfPreview blob={preview.blob} /></Suspense>
    </section>}
  </div>;
}

type V2Plans = Record<string, Partial<Record<RoutineMoment, FrequencyPlanV2>>>;
function v2Plans(view: RoutineView): V2Plans {
  return Object.fromEntries(view.products.map(product => [product.id_produit,
    Object.fromEntries(routineMoments.flatMap(moment => {
      const row = product.moments[moment];
      return row && row.initial_per_week !== null && row.maximum_per_week !== null
        ? [[moment, { initial_per_week: row.initial_per_week, maximum_per_week: row.maximum_per_week,
            jours_initialement: [...(row.jours_initialement || [])], jours_cibles: [...(row.jours_cibles || [])] }]] : [];
    }))]));
}

function RoutineEditorV2({ token, sessionId, onSaved, initialView }: {
  token: string; sessionId: string; onSaved: () => void; initialView: RoutineView;
}) {
  const [view, setView] = useState(initialView);
  const [plans, setPlans] = useState<V2Plans>(() => v2Plans(initialView));
  const [order, setOrder] = useState(initialView.application_order || { matin: [], soir: [], hebdomadaire: [] });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [candidatePreview, setCandidatePreview] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<Blob | null>(null);
  const [route, setRoute] = useState("");
  const disabled = !view.editable || busy;
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const original = v2Plans(view);
  const changes = view.products.flatMap(product => {
    const pid = product.id_produit;
    const moments = Object.fromEntries(routineMoments.flatMap(moment => {
      const current = plans[pid]?.[moment];
      const prior = original[pid]?.[moment];
      return current && JSON.stringify(current) !== JSON.stringify(prior) ? [[moment, current]] : [];
    }));
    return Object.keys(moments).length ? [{ id_produit: pid, moments }] : [];
  });
  const orderChanged = JSON.stringify(order) !== JSON.stringify(view.application_order);
  function install(next: RoutineView) {
    setView(next);
    const result = v2Plans(next);
    if (next.frequency_draft && !next.frequency_draft.applied) {
      for (const change of next.frequency_draft.changes) {
        const restored = { ...result[change.id_produit] };
        for (const plan of Object.values(change.moments)) {
          if (plan && "move_from" in plan && plan.move_from) delete restored[plan.move_from];
        }
        result[change.id_produit] = { ...restored,
          ...change.moments as Partial<Record<RoutineMoment, FrequencyPlanV2>> };
      }
    }
    setPlans(result);
    setOrder(next.application_order || { matin: [], soir: [], hebdomadaire: [] });
  }
  async function refresh() { install(await fetchRoutine(token, sessionId)); onSaved(); }
  async function run(task: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await task(); } catch (error) { setMessage(error instanceof Error ? error.message : "Modification impossible."); }
    finally { setBusy(false); }
  }
  function change(pid: string, moment: RoutineMoment, patch: Partial<FrequencyPlanV2>) {
    setPlans(current => ({ ...current, [pid]: { ...current[pid],
      [moment]: { ...current[pid]?.[moment], ...patch } as FrequencyPlanV2 } }));
  }
  function moveMoment(pid: string, source: RoutineMoment, target: RoutineMoment) {
    setPlans(current => {
      const sourcePlan = current[pid]?.[source];
      if (!sourcePlan || current[pid]?.[target]) return current;
      const next = { ...current[pid] };
      delete next[source];
      next[target] = { ...sourcePlan,
        move_from: original[pid]?.[target] ? undefined : sourcePlan.move_from || source as "matin" | "soir" };
      return { ...current, [pid]: next };
    });
  }
  function dayChange(pid: string, moment: RoutineMoment, phase: "jours_initialement" | "jours_cibles", day: number, checked: boolean) {
    const row = plans[pid]?.[moment];
    if (!row) return;
    const prior = original[pid]?.[moment];
    const start = [...(row.jours_initialement ?? prior?.jours_initialement ?? [])];
    const target = [...(row.jours_cibles ?? prior?.jours_cibles ?? [])];
    const toggleDay = (values: number[]) => checked ? [...new Set([...values, day])].sort() : values.filter(value => value !== day);
    if (phase === "jours_initialement") {
      const next = toggleDay(start);
      change(pid, moment, { jours_initialement: next, jours_cibles: checked ? toggleDay(target) : target,
        initial_per_week: next.length, maximum_per_week: checked ? toggleDay(target).length : target.length });
    } else {
      const next = toggleDay(target);
      const initial = checked ? start : start.filter(value => value !== day);
      change(pid, moment, { jours_initialement: initial, jours_cibles: next,
        initial_per_week: initial.length, maximum_per_week: next.length });
    }
  }
  const valid = changes.every(change => Object.values(change.moments).every(plan =>
    Number.isInteger(plan.initial_per_week) && Number.isInteger(plan.maximum_per_week)
    && plan.initial_per_week >= 0 && plan.maximum_per_week <= 7
    && plan.initial_per_week <= plan.maximum_per_week));
  return <div className="min-w-0 space-y-5">
    <section className="space-y-2 rounded-xl border p-3">
      <h3 className="font-semibold">Routine active · fréquences et calendrier</h3>
      <FrequencySummary rows={view.frequencies} />
      <Warnings issues={view.warnings} />
      <button className="action-button min-h-11" type="button" onClick={() => run(async () =>
        setPreview(await fetchAdminArtifact(token, sessionId, "pdf")))}>Aperçu PDF</button>
      {preview && <div><button type="button" className="action-button" onClick={() => setPreview(null)}>Fermer l’aperçu</button><PdfPreview blob={preview} /></div>}
    </section>
    <section className="space-y-3 rounded-xl border p-3">
      <h3 className="font-semibold">Applications par produit</h3>
      <p className="text-sm text-slate-700">Modifiez un nombre d’applications, ou choisissez directement les jours. Les autres produits restent à leur place.</p>
      {view.products.map(product => <details key={product.id_produit} className="min-w-0 rounded-lg border p-3">
        <summary className="cursor-pointer font-medium">{product.name}</summary>
        {routineMoments.flatMap(moment => {
          const plan = plans[product.id_produit]?.[moment];
          if (!plan) return [];
          const condition = product.moments[moment]?.condition_utilisation;
          return [<fieldset key={moment} disabled={disabled || !!condition} className="mt-3 space-y-2">
            <legend className="font-medium">{momentLabels[moment]}{condition ? ` · ${condition}` : ""}</legend>
            {!condition && (moment === "matin" || moment === "soir") &&
              (product.allowed_moments || []).some(other => other !== moment && other !== "hebdomadaire" && !plans[product.id_produit]?.[other]) &&
              <label className="block text-sm">Moment d’application
                <select className={control} value={moment} onChange={event => moveMoment(product.id_produit, moment, event.target.value as RoutineMoment)}>
                  <option value={moment}>{momentLabels[moment]}</option>
                  {(product.allowed_moments || []).filter(other => other !== moment && other !== "hebdomadaire" && !plans[product.id_produit]?.[other])
                    .map(other => <option key={other} value={other}>{momentLabels[other]}</option>)}
                </select>
              </label>}
            {!condition && <>
              <div className="grid gap-2 sm:grid-cols-2">{(["initial_per_week", "maximum_per_week"] as const).map(field =>
                <label key={field} className="text-sm">{field === "initial_per_week" ? "Départ / semaine" : "Cible / semaine"}
                  <input className={control} type="number" min={0} max={7} inputMode="numeric" value={plan[field]}
                    onChange={event => change(product.id_produit, moment, { [field]: Number(event.target.value),
                      jours_initialement: undefined, jours_cibles: undefined })} />
                </label>)}</div>
              {(["jours_initialement", "jours_cibles"] as const).map(phase => <fieldset key={phase} className="space-y-1">
                <legend className="text-sm">{phase === "jours_initialement" ? "Jours de départ" : "Jours cibles"}</legend>
                <div className="flex flex-wrap gap-1">{days.map((day, index) => <label key={day} className="flex min-h-11 items-center gap-1 rounded border px-2 text-sm">
                  <input type="checkbox" checked={(plan[phase] || original[product.id_produit]?.[moment]?.[phase] || []).includes(index)}
                    onChange={event => dayChange(product.id_produit, moment, phase, index, event.target.checked)} />{day}
                </label>)}</div>
              </fieldset>)}
              {!!product.moments[moment]?.condition_progression && <p className="text-sm">Progression : {product.moments[moment]?.condition_progression}</p>}
            </>}
          </fieldset>];
        })}
      </details>)}
      <div className="rounded-lg border p-2 text-sm"><strong>Soirs programmés</strong>
        {(["jours_initialement", "jours_cibles"] as const).map(phase => <div key={phase} className="mt-2">
          <span>{phase === "jours_initialement" ? "Au départ" : "À terme"}</span>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-7">{days.map((day, index) => <div key={day} className="rounded border p-2">
            <strong>{day}</strong><div>{view.products.flatMap(product => {
              const plan = plans[product.id_produit]?.soir;
              return (plan?.[phase] || original[product.id_produit]?.soir?.[phase] || []).includes(index) ? [product.name] : [];
            }).join(", ") || "Aucun soin ciblé prévu"}</div>
          </div>)}</div>
        </div>)}</div>
      <div className="flex flex-wrap gap-2">
        <button className="action-button min-h-11" type="button" disabled={disabled || !changes.length || !valid}
          onClick={() => run(async () => { const draft = await saveFrequencyDraft(token, sessionId, view.review_revision,
            view.frequency_draft?.id || null, changes); setView({ ...view, frequency_draft: draft });
            setMessage(draft.validation.status === "ok" ? "Brouillon enregistré." : draft.validation.issues.map(i => i.message).join(" ")); onSaved(); })}>Enregistrer le brouillon</button>
        <button className="primary-button min-h-11 disabled:opacity-50" type="button" disabled={disabled || !changes.length || !valid}
          onClick={() => run(async () => { await saveFrequencies(token, sessionId, view.review_revision, changes);
            await refresh(); setMessage("Calendrier enregistré et rapport reconstruit."); })}>Appliquer et reconstruire HTML/PDF</button>
        {view.frequency_draft && !view.frequency_draft.applied && <button type="button" className="action-button min-h-11" disabled={disabled}
          onClick={() => run(async () => { await discardFrequencyDraft(token, sessionId, view.review_revision,
            view.frequency_draft!.id); await refresh(); })}>Abandonner le brouillon</button>}
      </div>
      {view.frequency_draft && !view.frequency_draft.applied && <Warnings issues={view.frequency_draft.validation.issues} />}
    </section>
    <section className="space-y-2 rounded-xl border p-3">
      <h3 className="font-semibold">Ordre d’application</h3>
      {routineMoments.map(moment => <div key={moment}><strong>{momentLabels[moment]}</strong>
        {(order[moment] || []).map((pid, index) => <div key={pid} className="flex min-h-11 items-center justify-between gap-2 text-sm">
          <span>{view.products.find(product => product.id_produit === pid)?.name || pid}</span>
          <div>{([-1, 1] as const).map(direction => <button key={direction} type="button" className="action-button px-2"
            disabled={disabled || index + direction < 0 || index + direction >= order[moment].length}
            onClick={() => setOrder(current => { const next = [...current[moment]];
              [next[index], next[index + direction]] = [next[index + direction], next[index]];
              return { ...current, [moment]: next }; })}>{direction === -1 ? "↑" : "↓"}</button>)}</div>
        </div>)}
      </div>)}
      <button type="button" className="primary-button disabled:opacity-50" disabled={disabled || !orderChanged || !!changes.length}
        onClick={() => run(async () => { await saveApplicationOrder(token, sessionId, view.review_revision, order);
          await refresh(); setMessage("Ordre enregistré et rapport reconstruit."); })}>Enregistrer l’ordre</button>
    </section>
    <section className="space-y-2 rounded-xl border p-3">
      <h3 className="font-semibold">Nouvelle proposition</h3>
      {view.routes.map(item => <details key={item.route_id} className="rounded border p-2 text-sm">
        <summary>{item.nom || item.route_id} · {item.available ? "Disponible" : "Indisponible"}</summary>
        <p>{item.logique_technique}</p><p>{item.difference_majeure}</p>
        {!!item.precautions.length && <p>{item.precautions.join(" · ")}</p>}
        {!!item.missing_required_levers?.length && <p>{item.missing_required_levers.join(", ")}</p>}
      </details>)}
      <label className="block text-sm">Mode de sélection
        <select className={control} disabled={disabled} value={route} onChange={event => setRoute(event.target.value)}>
          <option value="">Sélection automatique</option>
          {view.routes.map(item => <option key={item.route_id} value={item.route_id} disabled={!item.available}>{item.nom || item.route_id}</option>)}
        </select>
      </label>
      <button type="button" className="action-button min-h-11" disabled={disabled || !!view.candidate || !!changes.length || !view.routes.some(item => item.available)}
        onClick={() => run(async () => { await rerunPrompt4(token, sessionId, view.review_revision, route || null); await refresh(); })}>Relancer Prompt 4 et réarbitrer</button>
      {view.candidate && <div className="flex flex-wrap gap-2">
        <span>Proposition {view.candidate.route_id}</span>
        <button type="button" className="action-button" onClick={() => run(async () => setCandidatePreview(
          await fetchRoutineCandidatePdf(token, sessionId, view.candidate!.id)))}>Aperçu de la proposition</button>
        {[true, false].map(accept => <button type="button" key={String(accept)} className="action-button" disabled={disabled || (accept && view.candidate!.stale)}
          onClick={() => run(async () => { await decideRoutineCandidate(token, sessionId, view.review_revision,
            view.candidate!.id, accept); await refresh(); })}>{accept ? "Accepter" : "Refuser"}</button>)}
      </div>}
      {candidatePreview && <div><button type="button" className="action-button" onClick={() => setCandidatePreview(null)}>Fermer l’aperçu</button><PdfPreview blob={candidatePreview} /></div>}
    </section>
    <TextsToReview fields={view.texts_to_review} />
    <p role={message ? "alert" : "status"} className="text-sm">{busy ? "En cours…" : message}</p>
  </div>;
}
