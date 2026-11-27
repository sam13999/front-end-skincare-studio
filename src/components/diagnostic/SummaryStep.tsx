import { useState } from "react";
import { DiagnosticData, getVisibleQuestions } from "./types";
import { Loader2, Pencil } from "lucide-react";
import { OFFERS, checkPromo, formatEuros, type Offer, type PromoCheckResponse } from "@/lib/api";

interface SummaryStepProps {
  data: DiagnosticData;
  onGoToStep: (step: number) => void;
  onLaunch: () => void;
  launching?: boolean;
  launchStage?: "session" | "photos" | "payment" | null;
  launched?: boolean;
  offer: Offer;
  onOfferChange: (offer: Offer) => void;
  promoCode: string | null;
  onPromoChange: (code: string | null) => void;
  firstQuestionStep: number;
  identityStep: number;
}

export const SummaryStep = ({
  data,
  onGoToStep,
  onLaunch,
  firstQuestionStep,
  identityStep,
  launching = false,
  launchStage = null,
  launched = false,
  offer,
  onOfferChange,
  promoCode,
  onPromoChange,
}: SummaryStepProps) => {
  const [promoInput, setPromoInput] = useState(promoCode ?? "");
  const [promo, setPromo] = useState<PromoCheckResponse | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const basePrice = OFFERS[offer].price;
  const percent = promo?.percent ?? 0;
  const finalPrice = Math.round(basePrice * (100 - percent)) / 100;

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setCheckingPromo(true);
    setPromoError(null);
    try {
      const result = await checkPromo(code, offer);
      setPromo(result);
      onPromoChange(result.code);
    } catch (error) {
      setPromo(null);
      onPromoChange(null);
      setPromoError(error instanceof Error ? error.message : "Ce code promo n’est pas valide.");
    } finally {
      setCheckingPromo(false);
    }
  };

  const removePromo = () => {
    setPromo(null);
    setPromoInput("");
    setPromoError(null);
    onPromoChange(null);
  };

  const renderAnswer = (key: string) => {
    const value = data.answers[key];
    if (!value) return "—";
    return Array.isArray(value) ? value.join(", ") : value;
  };

  return (
    <section className="svd-step svd-summary" aria-labelledby="summary-title">
      <div className="svd-step-intro">
        <p className="svd-eyebrow">Vérification</p>
        <h2 id="summary-title">Récapitulatif</h2>
        <p>Vérifiez vos informations avant de lancer l’analyse.</p>
      </div>

      <div className="svd-summary-photos">
        {[
          { label: "Face", photo: data.photoFace, step: 1 },
          { label: "Vue 3/4", photo: data.photoProfile, step: 2 },
        ].map((item) => (
          <div key={item.label} className="svd-summary-photo-wrap">
            <div className="svd-summary-photo">
              {item.photo && <img src={item.photo} alt={item.label} />}
              <button
                type="button"
                onClick={() => onGoToStep(item.step)}
                className="svd-icon-button"
                aria-label={`Modifier la photo ${item.label}`}
              >
                <Pencil aria-hidden="true" />
              </button>
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="svd-summary-card">
        <div>
          <p className="svd-summary-label">Coordonnées</p>
          <p className="svd-summary-value">{data.prenom || "—"} · {data.email || "—"}</p>
        </div>
        <button
          type="button"
          onClick={() => onGoToStep(identityStep)}
          className="svd-text-button"
          aria-label="Modifier les coordonnées"
        >
          <Pencil aria-hidden="true" />
        </button>
      </div>

      <div className="svd-summary-answers">
        {getVisibleQuestions(data.answers).map((question, index) => (
          <div key={question.id} className="svd-summary-card">
            <div>
              <p className="svd-summary-label">{question.title}</p>
              <p className="svd-summary-value">{renderAnswer(question.key)}</p>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(index + firstQuestionStep)}
              className="svd-text-button"
              aria-label={`Modifier : ${question.title}`}
            >
              <Pencil aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {launched ? (
        <div className="svd-result" role="status">
          <p>Votre demande est reçue. Votre rapport sera vérifié par notre équipe puis envoyé à {data.email} sous 24 heures après votre demande.</p>
        </div>
      ) : (
        <div className="svd-checkout">
          <p className="svd-summary-label">Votre formule</p>
          <div className="svd-offer-options" role="radiogroup" aria-label="Votre formule">
            {(Object.keys(OFFERS) as Offer[]).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={offer === key}
                aria-pressed={offer === key}
                className="svd-choice svd-offer"
                onClick={() => onOfferChange(key)}
                disabled={launching}
              >
                <span>{OFFERS[key].label}</span>
                <strong>{formatEuros(OFFERS[key].price)}</strong>
              </button>
            ))}
          </div>

          {promo ? (
            <div className="svd-promo-applied">
              <span>Code <strong>{promo.code}</strong> : −{promo.percent}&nbsp;%</span>
              <button type="button" className="svd-text-button" onClick={removePromo} disabled={launching}>Retirer</button>
            </div>
          ) : (
            <div className="svd-field svd-promo">
              <label htmlFor="promo">Code promo</label>
              <div className="svd-promo-row">
                <input
                  id="promo"
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") void applyPromo(); }}
                  placeholder="Facultatif"
                  autoCapitalize="characters"
                  autoComplete="off"
                  maxLength={32}
                  disabled={launching}
                />
                <button
                  type="button"
                  className="svd-secondary"
                  onClick={applyPromo}
                  disabled={!promoInput.trim() || checkingPromo || launching}
                >
                  {checkingPromo ? <Loader2 className="svd-spinner" aria-hidden="true" /> : "Appliquer"}
                </button>
              </div>
              {promoError && <p className="svd-error" role="alert">{promoError}</p>}
            </div>
          )}

          <div className="svd-total">
            <span>Total</span>
            <span>
              {percent > 0 && <s>{formatEuros(basePrice)}</s>} <strong>{formatEuros(finalPrice)}</strong>
            </span>
          </div>

          <button type="button" className="svd-primary svd-full" onClick={onLaunch} disabled={launching}>
            {launching ? (
              <><Loader2 className="svd-spinner" aria-hidden="true" /> {launchStage === "session" ? "Préparation…" : launchStage === "photos" ? "Envoi des photos…" : "Redirection vers le paiement…"}</>
            ) : finalPrice === 0 ? (
              "Lancer mon analyse"
            ) : (
              `Payer ${formatEuros(finalPrice)} et lancer mon analyse`
            )}
          </button>
          {finalPrice > 0 && <p className="svd-secure-note">Paiement sécurisé par Stripe. Votre analyse démarre dès la confirmation du paiement.</p>}
        </div>
      )}
    </section>
  );
};

