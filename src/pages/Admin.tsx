import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  Mail,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  adminAuthCheck,
  AdminDetailResponse,
  AdminSessionSummary,
  fetchAdminArtifact,
  fetchAdminSession,
  fetchAdminSessions,
  PromptRun,
  resendAdminEmail,
  rerunAdminSession,
} from "@/lib/adminApi";

const TOKEN_KEY = "skinview_admin_token";

const statusLabels: Record<string, string> = {
  completed: "Complète",
  in_progress: "En cours",
  failed: "Échouée",
  partial: "Partielle",
};

const paymentLabels: Record<string, string> = {
  paid: "Payé",
  unpaid: "Non payé",
  refunded: "Remboursé",
  unknown: "Inconnu",
};

function formatDate(value?: string | number | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatAmount(amount: unknown, currency = "EUR") {
  if (typeof amount !== "number" && typeof amount !== "string") return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(numeric);
}

function pretty(value: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
    partial: "bg-amber-50 text-amber-700 ring-amber-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    unpaid: "bg-slate-100 text-slate-600 ring-slate-200",
    refunded: "bg-violet-50 text-violet-700 ring-violet-200",
    unknown: "bg-slate-100 text-slate-500 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[value] || styles.unknown}`}>
      {value in statusLabels ? statusLabels[value] : paymentLabels[value] || value}
    </span>
  );
}

function JsonPanel({ value, label = "JSON brut" }: { value: unknown; label?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        <span>{label}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-slate-300 transition hover:text-white"
          onClick={() => navigator.clipboard?.writeText(pretty(value))}
        >
          <Copy className="h-3.5 w-3.5" /> Copier
        </button>
      </div>
      <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-5 text-slate-200">{pretty(value)}</pre>
    </div>
  );
}

function StatCard({ label, value, tone = "slate" }: { label: string; value: string | number; tone?: string }) {
  const tones: Record<string, string> = {
    slate: "bg-white border-slate-200",
    emerald: "bg-emerald-50/70 border-emerald-100",
    blue: "bg-blue-50/70 border-blue-100",
    red: "bg-red-50/70 border-red-100",
    amber: "bg-amber-50/70 border-amber-100",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function Login({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminAuthCheck(value.trim());
      sessionStorage.setItem(TOKEN_KEY, value.trim());
      onAuthenticated(value.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f9] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] sm:p-9">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">SkinView</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Espace administrateur</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Accès réservé au suivi des sessions et à leurs artefacts privés.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="admin-token">Token admin</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="admin-token"
              type="password"
              autoComplete="current-password"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              placeholder="Saisissez votre token"
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? "Vérification…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">Le token reste uniquement en session dans ce navigateur.</p>
      </section>
    </main>
  );
}

function ProtectedImage({ token, sessionId, kind, label }: { token: string; sessionId: string; kind: string; label: string }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    fetchAdminArtifact(token, sessionId, kind)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, sessionId, kind]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        {src && <a href={src} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900"><ExternalLink className="h-4 w-4" /></a>}
      </div>
      <div className="flex min-h-48 items-center justify-center p-3">
        {src ? <img src={src} alt={label} className="max-h-80 w-full rounded-xl object-contain" /> : error ? <span className="text-xs text-slate-400">Image indisponible</span> : <RefreshCw className="h-5 w-5 animate-spin text-slate-300" />}
      </div>
    </div>
  );
}

function PromptCard({ name, runs }: { name: string; runs: PromptRun[] }) {
  const latest = runs[runs.length - 1];
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white" open={Boolean(latest)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="font-semibold text-slate-900">{name.replace("prompt_", "Prompt ")}</span>
        <span className="flex items-center gap-2 text-xs text-slate-500">{runs.length ? `${runs.length} sortie(s)` : "Aucune trace"}<ChevronRight className="h-4 w-4 transition group-open:rotate-90" /></span>
      </summary>
      {latest && (
        <div className="space-y-3 border-t border-slate-100 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <StatusBadge value={latest.status || "ok"} />
            <span>{formatDate(latest.timestamp)}</span>
            {latest.artifact_name && <span className="font-mono text-[10px]">{latest.artifact_name}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="action-button" onClick={() => navigator.clipboard?.writeText(pretty(latest.parsed_output || latest.raw_output))}><Copy className="h-3.5 w-3.5" /> Copier</button>
            <button type="button" className="action-button" onClick={() => downloadText(`${name}.json`, JSON.stringify(latest, null, 2), "application/json")}><Download className="h-3.5 w-3.5" /> Télécharger JSON</button>
          </div>
          <JsonPanel value={latest.parsed_output || latest.raw_output} label="Résultat formaté" />
          {latest.raw_output && <JsonPanel value={latest.raw_output} label="Sortie brute" />}
        </div>
      )}
    </details>
  );
}

function downloadText(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function DetailView({ token, detail, onBack, onRefresh }: { token: string; detail: AdminDetailResponse; onBack: () => void; onRefresh: () => void }) {
  const [tab, setTab] = useState("summary");
  const [rerunOpen, setRerunOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  const { summary } = detail;
  const raw = detail.raw_session || {};
  const products = raw.products_retained || raw.produits_retenus || raw.selected_products;
  const routine = raw.routine_finale || raw.final_routine || raw.routine;

  async function artifact(kind: string, action: "open" | "download", filename: string) {
    setBusy(kind);
    setNotice("");
    try {
      const blob = await fetchAdminArtifact(token, summary.session_id, kind);
      if (action === "download") downloadBlob(filename, blob);
      else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Artefact indisponible.");
    } finally {
      setBusy("");
    }
  }

  async function resend() {
    setBusy("email");
    setNotice("");
    try {
      await resendAdminEmail(token, summary.session_id);
      setNotice("Email renvoyé avec succès.");
      onRefresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy("");
    }
  }

  async function rerun() {
    setBusy("rerun");
    setNotice("");
    try {
      const response = await rerunAdminSession(token, summary.session_id, reason);
      setNotice(`Reprise ${String(response.run || "")} terminée : ${String(response.status || "ok")}.`);
      setRerunOpen(false);
      setReason("");
      onRefresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Reprise impossible.");
    } finally {
      setBusy("");
    }
  }

  const tabs = [
    ["summary", "Résumé"],
    ["user", "Utilisateur"],
    ["analysis", "Analyse"],
    ["prompts", "Prompts"],
    ["qa", "QA"],
    ["report", "Rapport"],
    ["history", "Historique / logs"],
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Toutes les sessions</button>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="action-button" onClick={onRefresh}><RefreshCw className="h-3.5 w-3.5" /> Actualiser</button>
          <button type="button" className="primary-button" onClick={() => setRerunOpen(true)}><Play className="h-3.5 w-3.5" /> Reprendre la session</button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Session</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{summary.display_name}</h1>
            <p className="mt-1 font-mono text-xs text-slate-400">{summary.session_id}</p>
          </div>
          <div className="flex flex-wrap gap-2"><StatusBadge value={summary.status} /><StatusBadge value={summary.payment.payment_status} /></div>
        </div>
        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Email" value={summary.email || "—"} />
          <Info label="Créée le" value={formatDate(summary.created_at)} />
          <Info label="Dernière mise à jour" value={formatDate(summary.updated_at)} />
          <Info label="Étape actuelle" value={summary.current_stage || "—"} />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1">
        {tabs.map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 ${tab === key ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>{label}</button>)}
      </div>

      {notice && <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</div>}

      {tab === "summary" && <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="État du traitement">
          <Info label="Statut global" value={statusLabels[summary.status]} /><Info label="Dernière étape réussie" value={summary.last_successful_stage || "—"} /><Info label="Étape ayant échoué" value={summary.failed_stage || "—"} /><Info label="Email envoyé" value={pretty((summary.email_status || {}).sent)} />
        </InfoCard>
        <InfoCard title="Paiement & livrables">
          <Info label="Paiement" value={paymentLabels[summary.payment.payment_status]} /><Info label="Montant" value={formatAmount(summary.payment.payment_amount, summary.payment.payment_currency || "EUR")} /><Info label="HTML disponible" value={summary.html_available ? "Oui" : "Non"} /><Info label="PDF disponible" value={summary.pdf_available ? "Oui" : "Non"} />
        </InfoCard>
      </div>}

      {tab === "user" && <div className="space-y-4">
        <InfoCard title="Questionnaire complet"><JsonPanel value={detail.user.questionnaire} /></InfoCard>
        <div className="grid gap-4 md:grid-cols-2">{detail.user.photos.map((photo) => <ProtectedImage key={photo.kind} token={token} sessionId={summary.session_id} kind={photo.kind} label={photo.kind.replaceAll("_", " ")} />)}</div>
        {!detail.user.photos.length && <Empty text="Aucune photo disponible." />}
      </div>}

      {tab === "analysis" && <div className="space-y-4">
        <InfoCard title="Analyse disponible"><JsonPanel value={detail.analysis} label="Vue formatée / données normalisées" /></InfoCard>
        <div className="flex flex-wrap gap-2"><button type="button" className="action-button" onClick={() => navigator.clipboard?.writeText(JSON.stringify(detail.analysis, null, 2))}><Copy className="h-3.5 w-3.5" /> Copier l’analyse</button><button type="button" className="action-button" onClick={() => downloadText("analysis.json", JSON.stringify(detail.analysis, null, 2), "application/json")}><Download className="h-3.5 w-3.5" /> Vue JSON brute</button></div>
      </div>}

      {tab === "prompts" && <div className="space-y-3">{Object.entries(detail.prompts).map(([name, runs]) => <PromptCard key={name} name={name} runs={runs} />)}</div>}

      {tab === "qa" && <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="OK" value={detail.qa.totals.ok} tone="emerald" /><StatCard label="Warnings" value={detail.qa.totals.warnings} tone="amber" /><StatCard label="Blocages" value={detail.qa.totals.blocking} tone="red" /></div>
        <div className="grid gap-3 md:grid-cols-2">{Object.entries(detail.qa.stages).map(([stage, data]) => <div key={stage} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-slate-900">{stage}</h3><QaStatus value={data.status} /></div>{data.issues.length > 0 && <div className="mt-3 space-y-2">{data.issues.map((issue, index) => <div key={`${issue.code}-${index}`} className="rounded-xl bg-slate-50 p-3 text-xs"><p className={issue.severity === "fail" ? "font-semibold text-red-700" : "font-semibold text-amber-700"}>{issue.code || "issue"} · {issue.severity || "warning"}</p><p className="mt-1 leading-5 text-slate-600">{issue.message || "—"}</p></div>)}</div>}</div>)}</div>
        {detail.qa.issues.length === 0 && <Empty text="Aucun warning ni blocage QA." />}
      </div>}

      {tab === "report" && <div className="space-y-4">
        <InfoCard title="Livraison">
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!summary.html_available || busy === "html"} className="primary-button disabled:opacity-40" onClick={() => artifact("html", "open", "rapport.html")}><ExternalLink className="h-3.5 w-3.5" /> Voir HTML</button>
            <button type="button" disabled={!summary.pdf_available || busy === "pdf"} className="action-button disabled:opacity-40" onClick={() => artifact("pdf", "download", "rapport.pdf")}><Download className="h-3.5 w-3.5" /> Télécharger PDF</button>
            <button type="button" className="action-button" onClick={() => artifact("pipeline_snapshot.json", "download", "session-final.json")}><FileJson className="h-3.5 w-3.5" /> JSON final</button>
            <button type="button" disabled={!summary.pdf_available || busy === "email"} className="action-button disabled:opacity-40" onClick={resend}><Mail className="h-3.5 w-3.5" /> Renvoyer l’email</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Info label="Statut email" value={pretty((summary.email_status || {}).sent)} /><Info label="Destinataire" value={summary.email || "—"} /><Info label="Montant" value={formatAmount(summary.payment.payment_amount, summary.payment.payment_currency || "EUR")} /></div>
        </InfoCard>
        <InfoCard title="Produits retenus"><JsonPanel value={products} /></InfoCard>
        <InfoCard title="Routine finale"><JsonPanel value={routine} /></InfoCard>
        <InfoCard title="Artefacts disponibles"><div className="space-y-2">{detail.artifacts.map((item) => <div key={item.path} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="font-mono text-slate-600">{item.path}</span><span className="text-slate-400">{Math.round(item.size / 1024)} Ko</span></div>)}</div></InfoCard>
      </div>}

      {tab === "history" && <div className="space-y-4">
        <InfoCard title="Historique des étapes"><div className="space-y-2">{detail.history.length ? detail.history.map((item, index) => <div key={`${String(item.ts)}-${index}`} className="grid gap-1 rounded-xl border border-slate-100 p-3 text-xs sm:grid-cols-[150px_1fr_auto] sm:items-center"><span className="text-slate-400">{formatDate(item.ts as string)}</span><span className="font-semibold text-slate-700">{String(item.stage || "—")}</span><span className={item.ok ? "text-emerald-700" : "text-red-700"}>{item.ok ? "OK" : "Échec"}</span></div>) : <Empty text="Aucun log disponible." />}</div></InfoCard>
        <InfoCard title="Versions de reprise"><JsonPanel value={detail.rerun_history} /></InfoCard>
      </div>}

      {rerunOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Confirmation requise</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">Reprendre cette session ?</h2></div><button type="button" onClick={() => setRerunOpen(false)}><X className="h-5 w-5 text-slate-400" /></button></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">L’architecture actuelle permet une reprise sûre du pipeline complet uniquement. Les anciennes sorties seront conservées dans une nouvelle version.</p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Étapes recalculées</p><p className="mt-2 text-sm leading-6 text-slate-700">Zyla → Prompt 2 → filtre → Prompt 4 → Prompt 1 → Prompt 3 → Prompt 0 → HTML → PDF</p></div>
          <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="rerun-reason">Raison (facultatif)</label><textarea id="rerun-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-slate-950" placeholder="Ex. correction technique…" />
          <div className="mt-5 flex justify-end gap-2"><button type="button" className="action-button" onClick={() => setRerunOpen(false)}>Annuler</button><button type="button" className="primary-button" disabled={busy === "rerun"} onClick={rerun}>{busy === "rerun" ? "Reprise…" : "Confirmer la reprise"}</button></div>
        </div>
      </div>}
    </section>
  );
}

function QaStatus({ value }: { value: string }) {
  const config = value === "Blocage" ? { icon: Ban, className: "text-red-700 bg-red-50" } : value === "Warnings" ? { icon: AlertTriangle, className: "text-amber-700 bg-amber-50" } : { icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50" };
  const Icon = config.icon;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${config.className}`}><Icon className="h-3.5 w-3.5" />{value}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-1 break-words text-sm text-slate-800">{value}</p></div>;
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h2 className="mb-4 font-semibold text-slate-950">{title}</h2>{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">{text}</div>;
}

function AdminPage() {
  const tokenFromStorage = sessionStorage.getItem(TOKEN_KEY) || "";
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(Boolean(tokenFromStorage));
  const [sessions, setSessions] = useState<AdminSessionSummary[]>([]);
  const [stats, setStats] = useState({ sessions_today: 0, sessions_complete: 0, sessions_failed: 0, sessions_paid: 0, revenue_total: 0, currency: "EUR" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AdminDetailResponse | null>(null);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenFromStorage) return;
    adminAuthCheck(tokenFromStorage).then(() => setToken(tokenFromStorage)).catch(() => { sessionStorage.removeItem(TOKEN_KEY); setChecking(false); }).finally(() => setChecking(false));
  }, [tokenFromStorage]);

  async function loadSessions(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminSessions(activeToken);
      setSessions(response.items);
      setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
      if (err instanceof Error && err.message.includes("invalide")) logout();
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(sessionId: string) {
    if (!token) return;
    setLoading(true);
    setError("");
    try { setDetail(await fetchAdminSession(token, sessionId)); } catch (err) { setError(err instanceof Error ? err.message : "Détail indisponible."); } finally { setLoading(false); }
  }

  useEffect(() => { if (token) loadSessions(token); }, [token]);
  useEffect(() => { if (token && params.sessionId) loadDetail(params.sessionId); else if (!params.sessionId) setDetail(null); }, [token, params.sessionId]);

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setDetail(null);
    navigate("/admin");
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions.filter((item) => {
      const matchesQuery = !query || [item.display_name, item.first_name, item.email, item.session_id].join(" ").toLowerCase().includes(query);
      const matchesFilter = !filter || item.status === filter || item.payment.payment_status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [sessions, search, filter]);

  if (checking) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f9]"><RefreshCw className="h-6 w-6 animate-spin text-slate-400" /></main>;
  if (!token) return <Login onAuthenticated={setToken} />;
  if (detail) return <main className="min-h-screen bg-[#f5f7f9]"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8"><span className="font-semibold tracking-tight text-slate-950">SkinView <span className="text-slate-400">Admin</span></span><button type="button" className="action-button" onClick={logout}><LogOut className="h-3.5 w-3.5" /> Déconnexion</button></div></header><div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8"><DetailView token={token} detail={detail} onBack={() => { setDetail(null); navigate("/admin"); }} onRefresh={() => loadDetail(detail.summary.session_id)} /></div></main>;

  const filters = [["", "Toutes"], ["completed", "Complètes"], ["in_progress", "En cours"], ["failed", "Échouées"], ["paid", "Payées"], ["unpaid", "Non payées"]];
  return (
    <main className="min-h-screen bg-[#f5f7f9]">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white"><ShieldCheck className="h-4 w-4" /></div><div><p className="font-semibold tracking-tight text-slate-950">SkinView <span className="text-slate-400">Admin</span></p><p className="text-[11px] text-slate-400">Suivi des sessions privées</p></div></div><button type="button" className="action-button" onClick={logout}><LogOut className="h-3.5 w-3.5" /> Déconnexion</button></div></header>
      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Sessions</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Vue d’ensemble</h1><p className="mt-2 text-sm text-slate-500">{stats.sessions_today} session(s) aujourd’hui · {sessions.length} chargée(s)</p></div><button type="button" className="action-button" onClick={() => loadSessions()}><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser</button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><StatCard label="Aujourd’hui" value={stats.sessions_today} tone="blue" /><StatCard label="Complètes" value={stats.sessions_complete} tone="emerald" /><StatCard label="Échouées" value={stats.sessions_failed} tone="red" /><StatCard label="Payées" value={stats.sessions_paid} tone="amber" /><StatCard label="Chiffre d’affaires" value={formatAmount(stats.revenue_total, stats.currency)} /></div>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-slate-950" placeholder="Rechercher un prénom, email, session ou identifiant…" /></div><div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{filters.map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${filter === key ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>{label}</button>)}</div></div>
          {error && <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.1em] text-slate-400"><th className="px-3 py-3 font-semibold">Session</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Email</th><th className="px-3 py-3 font-semibold">Statut</th><th className="px-3 py-3 font-semibold">Paiement</th><th className="px-3 py-3 font-semibold">Montant</th><th className="px-3 py-3" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.session_id} className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50" onClick={() => { setDetail(null); navigate(`/admin/session/${item.session_id}`); }}><td className="px-3 py-4"><p className="font-semibold text-slate-900">{item.display_name}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{item.session_id}</p></td><td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">{formatDate(item.created_at)}</td><td className="px-3 py-4 text-sm text-slate-600">{item.email || "—"}</td><td className="px-3 py-4"><StatusBadge value={item.status} /></td><td className="px-3 py-4"><StatusBadge value={item.payment.payment_status} /></td><td className="px-3 py-4 text-sm font-semibold text-slate-800">{formatAmount(item.payment.payment_amount, item.payment.payment_currency || "EUR")}</td><td className="px-3 py-4 text-right"><ChevronRight className="ml-auto h-4 w-4 text-slate-300" /></td></tr>)}</tbody></table>{!loading && filtered.length === 0 && <Empty text="Aucune session ne correspond aux critères." />}</div>
        </section>
      </div>
    </main>
  );
}

export default AdminPage;

declare global {
  interface String {
    replaceAll(searchValue: string, replaceValue: string): string;
  }
}

