import { createContext, useContext, useState, ReactNode } from "react";
import DiagnosticFlow from "@/components/diagnostic/DiagnosticFlow";

interface DiagnosticContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const DiagnosticContext = createContext<DiagnosticContextValue | undefined>(undefined);

export const DiagnosticProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DiagnosticContext.Provider
      value={{ open: () => setIsOpen(true), close: () => setIsOpen(false), isOpen }}
    >
      {isOpen ? <DiagnosticFlow onClose={() => setIsOpen(false)} /> : children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const ctx = useContext(DiagnosticContext);
  if (!ctx) throw new Error("useDiagnostic must be used within DiagnosticProvider");
  return ctx;
};
