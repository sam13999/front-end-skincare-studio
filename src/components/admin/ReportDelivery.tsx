import { useState } from "react";
import { AdminSessionSummary, manageReportDelivery, ReportDelivery as Delivery } from "@/lib/adminApi";

const formatTime = (value: string) => new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium", timeStyle: "short",
}).format(new Date(value));

const eventLabels: Record<string, string> = {
  html_started: "Tentative d’envoi du lien",
  html_accepted: "Lien accepté par le fournisseur",
  html_rejected: "Envoi du lien refusé",
  html_unknown: "Envoi du lien à vérifier",
  html_rejected_verified: "Refus du lien vérifié",
  resend_started: "Tentative de renvoi du lien",
  resend_accepted: "Renvoi accepté par le fournisseur",
  resend_rejected: "Renvoi refusé",
  resend_unknown: "Renvoi à vérifier",
  resend_rejected_verified: "Refus du renvoi vérifié",
  link_expired: "Lien expiré",
  link_revoked: "Lien révoqué",
  pdf_started: "Tentative d’envoi du PDF",
  pdf_accepted: "PDF accepté par le fournisseur",
  pdf_rejected: "Envoi du PDF refusé",
  pdf_unknown: "Envoi du PDF à vérifier",
  pdf_rejected_verified: "Refus du PDF vérifié",
  pdf_preparation_failed: "Préparation du PDF impossible",
  pdf_escalated: "Intervention requise après J+37",
  pdf_alert: "Alerte administrateur déclenchée",
  pdf_alert_unconfirmed: "Alerte administrateur à vérifier",
  pdf_escalation_alert: "Alerte d’escalade déclenchée",
  pdf_escalation_alert_unconfirmed: "Alerte d’escalade à vérifier",
  cleanup_held: "Conservation des fichiers prolongée",
  cleanup_failed: "Nettoyage à reprendre",
  files_deleted: "Fichiers supprimés",
  test_clock_advanced: "Échéance de test simulée",
};

type Command = Parameters<typeof manageReportDelivery>[2];
type Stage = "html" | "resend" | "pdf";
const stages: Array<{ key: Stage; label: string; status: "html_status" | "resend_status" | "pdf_status" }> = [
  { key: "html", label: "Envoi du lien", status: "html_status" },
  { key: "resend", label: "Renvoi du lien", status: "resend_status" },
  { key: "pdf", label: "Envoi du PDF", status: "pdf_status" },
];

export default function ReportDelivery({ token, summary, delivery, onRefresh, disabled }: {
  token: string; summary: AdminSessionSummary; delivery?: Delivery | null;
  onRefresh: () => Promise<void>; disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [resolution, setResolution] = useState<Stage | null>(null);
  const [acceptedAt, setAcceptedAt] = useState("");
  const [providerId, setProviderId] = useState("");
  const blocked = busy || disabled;

  async function run(command: Command) {
    setBusy(true);
    setError("");
    setMessage("");
    setLink("");
    try {
      if (command.action === "link") {
        const text = manageReportDelivery(token, summary.session_id, command).then(result => {
          if (!result.client_link) throw new Error("Lien indisponible.");
          return result.client_link;
        });
        try {
          await navigator.clipboard.write([new ClipboardItem({
            "text/plain": text.then(value => new Blob([value], { type: "text/plain" })),
          })]);
          setMessage("Lien copié.");
        } catch {
          setLink(await text);
        }
      } else {
        await manageReportDelivery(token, summary.session_id, command);
        await onRefresh();
        setResolution(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action de livraison indisponible.");
    } finally {
      setBusy(false);
    }
  }

  function reconcile(stage: Stage, accepted: boolean) {
    if (!accepted && !window.confirm("Confirmez-vous que le fournisseur a refusé cet envoi ?")) return;
    void run({ action: "reconcile", stage, resolution: accepted ? "accepted" : "rejected",
      accepted_at: accepted ? new Date(acceptedAt).toISOString() : undefined, message_id: accepted ? providerId : undefined });
  }

  const canSend = summary.review_status === "approved" && (!delivery || delivery.html_status === "rejected");
  return <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
    <h3 className="font-semibold text-slate-900">Livraison au client</h3>
    {!delivery && <p className="text-sm text-slate-600">{
      summary.review_status === "approved" ? "Validé, non envoyé" :
        summary.review_status === "legacy_delivered" || summary.review_status === "sent" ? "Rapport historique livré" : "En attente de validation"
    }</p>}
    {delivery?.html_status === "accepted" && <p className="text-sm">Lien HTML envoyé{delivery.test ? " · test" : ""}</p>}
    {delivery?.expires_at && <p className="text-sm">
      {delivery.expired ? "Lien expiré" : delivery.revoked_at ? "Lien révoqué" : "Expiration du lien"} · {formatTime(delivery.expires_at)}
    </p>}
    {delivery?.pdf_status === "accepted" && <p className="text-sm">PDF accepté par le fournisseur{delivery.pdf_accepted_at && ` · ${formatTime(delivery.pdf_accepted_at)}`}</p>}
    {delivery?.deleted_at && <p className="text-sm">Fichiers supprimés · {formatTime(delivery.deleted_at)}</p>}
    {delivery?.cleanup_status === "held" && <p className="text-sm">Fichiers conservés selon la politique de rétention.</p>}
    {delivery?.cleanup_status === "failed" && <p role="alert" className="text-sm text-red-800">Nettoyage incomplet. Le traitement sera repris automatiquement.</p>}
    {delivery?.escalated_at && delivery.pdf_status !== "accepted" && <p role="alert" className="text-sm font-semibold text-red-800">Intervention requise. Le PDF est conservé en privé.</p>}
    {stages.map(stage => {
      const status = delivery?.[stage.status];
      if (status !== "rejected" && status !== "unknown") return null;
      const latest = delivery?.history.slice().reverse().find(event => event.event === `${stage.key}_started`);
      return <div key={stage.key} className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
        <p role="alert">{stage.label} {status === "rejected" ? "refusé" : "à vérifier chez le fournisseur"}{latest?.reference && ` · ${latest.reference}`}</p>
        {stage.key === "pdf" && delivery?.next_retry_at && !delivery.escalated_at && <p>Prochaine tentative après le {formatTime(delivery.next_retry_at)}.</p>}
        {status === "unknown" && <button type="button" className="action-button min-h-11" disabled={blocked}
          onClick={() => setResolution(resolution === stage.key ? null : stage.key)}>Renseigner le résultat fournisseur</button>}
        {resolution === stage.key && <div className="space-y-2">
          <p>Vérifiez cette référence dans les journaux Brevo ou SMTP. En cas de doute, laissez l’envoi en attente.</p>
          <label className="block">Référence du message accepté<input className="block w-full rounded border p-2 text-base" value={providerId} onChange={event => setProviderId(event.target.value)} /></label>
          <label className="block">Date et heure d’acceptation (heure locale)<input className="block max-w-full rounded border p-2 text-base" type="datetime-local" step="1" value={acceptedAt} onChange={event => setAcceptedAt(event.target.value)} /></label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="action-button min-h-11" disabled={blocked || !providerId.trim() || !Number.isFinite(Date.parse(acceptedAt))} onClick={() => reconcile(stage.key, true)}>Acceptation vérifiée</button>
            <button type="button" className="action-button min-h-11" disabled={blocked} onClick={() => reconcile(stage.key, false)}>Refus vérifié</button>
          </div>
        </div>}
      </div>;
    })}
    <div className="flex flex-wrap gap-2">
      {canSend && <button type="button" className="primary-button min-h-11" disabled={blocked}
        onClick={() => { if (window.confirm(`Envoyer le lien à ${summary.email || "l’adresse de la session"} ?`)) void run({ action: "send", expected_revision: summary.review_revision }); }}>Envoyer le lien HTML</button>}
      {delivery?.link_active && <>
        <button type="button" className="action-button min-h-11" disabled={blocked} onClick={() => run({ action: "link" })}>Copier le lien client</button>
        <button type="button" className="action-button min-h-11" disabled={blocked || delivery.resend_status === "unknown"}
          onClick={() => { if (window.confirm("Renvoyer le même lien au client ?")) void run({ action: "resend", expected_revision: summary.review_revision, request_id: crypto.randomUUID() }); }}>Renvoyer le lien</button>
        <button type="button" className="action-button min-h-11 text-red-700" disabled={blocked}
          onClick={() => { if (window.confirm("Révoquer le lien dès maintenant ?")) void run({ action: "revoke" }); }}>Révoquer le lien</button>
      </>}
      {delivery?.expired && (delivery.pdf_status === "rejected" || !delivery.pdf_status) && <button type="button" className="action-button min-h-11"
        disabled={blocked} onClick={() => run({ action: "retry_pdf" })}>Relancer l’envoi du PDF</button>}
      {delivery?.test && delivery.link_active && <button type="button" className="action-button min-h-11" disabled={blocked}
        onClick={() => { if (window.confirm("Simuler J+30 et terminer la livraison de cette session de test ?")) void run({ action: "simulate" }); }}>Simuler J+30</button>}
    </div>
    {link && delivery?.link_active && <label className="block text-sm">Lien client<input className="block w-full rounded border p-2 text-base" readOnly value={link}
      onFocus={event => event.currentTarget.select()} /></label>}
    {busy && <p role="status" className="text-sm">Opération en cours…</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    {!!delivery?.history.length && <details className="text-sm"><summary className="cursor-pointer font-semibold">Historique des envois</summary>
      <ul className="mt-2 space-y-2">{delivery.history.map((item, index) => <li key={index} className="break-words">
        <span>{eventLabels[item.event] || item.event} · {formatTime(item.at)}</span>
        {(item.reference || item.message_id) && <span className="block text-xs text-slate-600">{[item.reference, item.message_id].filter(Boolean).join(" · ")}</span>}
      </li>)}</ul>
    </details>}
  </div>;
}
