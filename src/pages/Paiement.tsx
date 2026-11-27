import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  PENDING_CHECKOUT_KEY,
  confirmPayment,
  getPaymentStatus,
  readPendingCheckout,
  startCheckout,
} from "@/lib/api";
import "@/components/diagnostic/DiagnosticFlow.css";

const ANSWERS_KEY = "diagnostic_answers_v3";

const Shell = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) => (
  <div className="svd-shell">
    <main className="svd-scroll">
      <div className="svd-content">
        <section className="svd-step" aria-labelledby="payment-title">
          <div className="svd-intro">
            <p className="svd-eyebrow">{eyebrow}</p>
            <h2 id="payment-title">{title}</h2>
          </div>
          {children}
        </section>
      </div>
    </main>
  </div>
);

export const PaiementConfirme = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const checkoutId = params.get("cs") || "";
  const [state, setState] = useState<"checking" | "paid" | "pending" | "error">("checking");
  const email = readPendingCheckout()?.email;

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      return;
    }
    let cancelled = false;
    const run = async () => {
      for (let attempt = 0; attempt < 6 && !cancelled; attempt += 1) {
        try {
          const status = checkoutId && attempt === 0
            ? await confirmPayment(sessionId, checkoutId)
            : await getPaymentStatus(sessionId);
          if (status.payment_status === "paid") {
            if (!cancelled) setState("paid");
            try {
              localStorage.removeItem(ANSWERS_KEY);
              localStorage.removeItem(PENDING_CHECKOUT_KEY);
            } catch { /* stockage indisponible */ }
            return;
          }
        } catch {
          /* on réessaie */
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
      }
      if (!cancelled) setState("pending");
    };
    void run();
    return () => { cancelled = true; };
  }, [sessionId, checkoutId]);

  if (state === "checking") {
    return (
      <Shell eyebrow="Paiement" title="Confirmation en cours…">
        <p className="svd-summary-message" style={{ textAlign: "center" }}>
          <Loader2 className="svd-spinner" aria-hidden="true" /> Nous vérifions votre paiement.
        </p>
      </Shell>
    );
  }
  if (state === "paid") {
    return (
      <Shell eyebrow="Paiement confirmé" title="Merci, votre analyse est lancée.">
        <div className="svd-result" role="status">
          <p className="svd-summary-message">
            Votre rapport sera vérifié par notre équipe puis envoyé
            {email ? <> à <strong>{email}</strong></> : " par e-mail"} sous 24 heures.
          </p>
          <p className="svd-summary-message">Un reçu de paiement vous a été envoyé par Stripe.</p>
          <Link to="/" className="svd-secondary svd-full">Retour à l’accueil</Link>
        </div>
      </Shell>
    );
  }
  return (
    <Shell eyebrow="Paiement" title={state === "pending" ? "Paiement en cours de confirmation" : "Lien incomplet"}>
      <div className="svd-result" role="status">
        <p className="svd-summary-message">
          {state === "pending"
            ? "Votre paiement est bien parti, sa confirmation prend juste un peu plus de temps que prévu. Vous n’avez rien à refaire : votre analyse démarrera automatiquement et votre rapport arrivera par e-mail."
            : "Nous n’avons pas pu retrouver votre demande à partir de ce lien."}
        </p>
        <Link to="/" className="svd-secondary svd-full">Retour à l’accueil</Link>
      </div>
    </Shell>
  );
};

export const PaiementAnnule = () => {
  const [params] = useSearchParams();
  const pending = readPendingCheckout();
  const sessionId = params.get("session_id") || pending?.sessionId || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resume = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const checkout = await startCheckout(sessionId, pending?.offer || "analyse", pending?.promoCode);
      if (checkout.status === "redirect" && checkout.checkout_url) {
        window.location.assign(checkout.checkout_url);
        return;
      }
      window.location.assign(`/paiement-confirme?session_id=${encodeURIComponent(sessionId)}`);
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Le paiement n’a pas pu reprendre.");
      setLoading(false);
    }
  };

  return (
    <Shell eyebrow="Paiement" title="Paiement interrompu">
      <div className="svd-result">
        <p className="svd-summary-message">
          Aucun montant n’a été débité. Vos photos et vos réponses sont conservées : vous pouvez reprendre le paiement quand vous voulez.
        </p>
        {sessionId && (
          <button type="button" className="svd-primary svd-full" onClick={resume} disabled={loading}>
            {loading ? <><Loader2 className="svd-spinner" aria-hidden="true" /> Redirection…</> : "Reprendre le paiement"}
          </button>
        )}
        {error && <p className="svd-error" role="alert">{error}</p>}
        <Link to="/" className="svd-secondary svd-full">Retour à l’accueil</Link>
      </div>
    </Shell>
  );
};
