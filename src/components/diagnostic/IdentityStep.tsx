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

export const IdentityStep = ({ prenom, email, onPrenomChange, onEmailChange, onNext, canNext }: IdentityStepProps) => (
  <div className="flex flex-col">
    <div className="mb-8">
      <p className="eyebrow">Étape 03</p>
      <h2 className="mt-4 font-serif text-3xl leading-none tracking-[-0.03em] text-[#183e34] sm:text-4xl">Vos coordonnées.</h2>
      <p className="mt-3 text-[15px] leading-[1.65] text-[#69766f]">Pour vous adresser votre analyse personnalisée.</p>
    </div>

    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="prenom" className="font-sans text-sm font-semibold text-[#33483f]">Prénom</Label>
        <Input id="prenom" value={prenom} onChange={(event) => onPrenomChange(event.target.value)} placeholder="Votre prénom" autoComplete="given-name" maxLength={60} className="h-12 rounded-xl border-[#183e34]/18 bg-white text-base" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="font-sans text-sm font-semibold text-[#33483f]">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="vous@email.com" autoComplete="email" maxLength={120} className="h-12 rounded-xl border-[#183e34]/18 bg-white text-base" />
      </div>
    </div>

    <Button variant="premium" size="xl" className="mt-8 w-full" disabled={!canNext} onClick={onNext}>Continuer</Button>
    <p className="mt-4 text-center text-xs leading-relaxed text-[#69766f]">Votre email sert à vous transmettre le rapport.</p>
  </div>
);
