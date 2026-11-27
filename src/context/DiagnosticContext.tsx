import { createContext, useContext, useState, ReactNode } from "react";
import DiagnosticFlow from "@/components/diagnostic/DiagnosticFlow";
import type { Offer } from "@/lib/api";

interface DiagnosticContextValue {
  open: (offer?: Offer) => void;
  close: () => void;
  isOpen: boolean;
}

const DiagnosticContext = createContext<DiagnosticContextValue | undefined>(undefined);

export const DiagnosticProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [offer, setOffer] = useState<Offer>("analyse");
  const open = (chosen?: Offer) => {
    setOffer(chosen === "suivi" ? "suivi" : "analyse");
    setIsOpen(true);
  };
  return (
    <DiagnosticContext.Provider value={{ open, close: () => setIsOpen(false), isOpen }}>
      {isOpen ? <DiagnosticFlow initialOffer={offer} onClose={() => setIsOpen(false)} /> : children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const ctx = useContext(DiagnosticContext);
  if (!ctx) throw new Error("useDiagnostic must be used within DiagnosticProvider");
  return ctx;
};
