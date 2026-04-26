import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdentityStepProps {
  prenom: string;
  email: string;
  onPrenomChange: (v: string) => void;
  onEmailChange: (v: string) => void;
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
}: IdentityStepProps) => {
  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h2 className="font-serif text-foreground text-2xl md:text-3xl mb-2">
          Vos coordonnées
        </h2>
        <p className="font-sans text-warm text-sm font-light">
          Pour vous adresser votre analyse personnalisée.
        </p>
      </div>

      <div className="space-y-5 mb-8">
        <div className="space-y-2">
          <Label htmlFor="prenom" className="font-sans text-sm text-warm">
            Prénom
          </Label>
          <Input
            id="prenom"
            value={prenom}
            onChange={(e) => onPrenomChange(e.target.value)}
            placeholder="Votre prénom"
            autoComplete="given-name"
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-sm text-warm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="vous@email.com"
            autoComplete="email"
            maxLength={120}
          />
        </div>
      </div>

      <Button
        variant="premium"
        size="xl"
        className="w-full"
        disabled={!canNext}
        onClick={onNext}
      >
        Continuer
      </Button>
    </div>
  );
};
