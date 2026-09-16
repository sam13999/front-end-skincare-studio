interface IdentityStepProps {
  prenom: string;
  email: string;
  onPrenomChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNext: () => void;
  canNext: boolean;
}

export const IdentityStep = ({
  prenom,
  email,
  onPrenomChange,
  onEmailChange,
  onNext,
  canNext,
}: IdentityStepProps) => (
  <section className="svd-step" aria-labelledby="identity-title">
    <div className="svd-intro">
      <p className="svd-eyebrow">Dernière étape</p>
      <h2 id="identity-title">Où souhaitez-vous recevoir votre diagnostic&nbsp;?</h2>
      <p>Votre prénom et votre adresse e-mail sont nécessaires pour vous envoyer le résultat.</p>
    </div>
    <div className="svd-form">
      <div className="svd-field">
        <label htmlFor="prenom">Prénom</label>
        <input
          id="prenom"
          value={prenom}
          onChange={(event) => onPrenomChange(event.target.value)}
          placeholder="Votre prénom"
          autoComplete="given-name"
          maxLength={60}
        />
      </div>
      <div className="svd-field">
        <label htmlFor="email">Adresse e-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="vous@email.com"
          autoComplete="email"
          maxLength={120}
        />
      </div>
    </div>
    <button type="button" className="svd-primary svd-full" disabled={!canNext} onClick={onNext}>
      Continuer
    </button>
  </section>
);
