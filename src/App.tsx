import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ExempleRapport from "./pages/ExempleRapport.tsx";
import NotreCombat from "./pages/NotreCombat.tsx";
import RapportPersonnalise from "./pages/RapportPersonnalise.tsx";
import Tarif from "./pages/Tarif.tsx";
import RoutineTiktok from "./pages/seo/RoutineTiktok.tsx";
import TropDeProduits from "./pages/seo/TropDeProduits.tsx";
import RoutineNeFonctionnePas from "./pages/seo/RoutineNeFonctionnePas.tsx";
import ComprendreSaPeau from "./pages/seo/ComprendreSaPeau.tsx";
import AcheterMoins from "./pages/seo/AcheterMoins.tsx";
import PeauSensible from "./pages/seo/PeauSensible.tsx";
import OrdreRoutine from "./pages/seo/OrdreRoutine.tsx";
import Actifs from "./pages/seo/Actifs.tsx";
import { DiagnosticProvider } from "./context/DiagnosticContext.tsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <DiagnosticProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/exemple-rapport" element={<ExempleRapport />} />
            <Route path="/notre-combat" element={<NotreCombat />} />
            <Route path="/rapport-skincare-personnalise" element={<RapportPersonnalise />} />
            <Route path="/tarif" element={<Tarif />} />
            <Route path="/routine-skincare-tiktok" element={<RoutineTiktok />} />
            <Route path="/trop-de-produits-skincare" element={<TropDeProduits />} />
            <Route path="/routine-skincare-ne-fonctionne-pas" element={<RoutineNeFonctionnePas />} />
            <Route path="/comprendre-sa-peau" element={<ComprendreSaPeau />} />
            <Route path="/acheter-moins-de-skincare" element={<AcheterMoins />} />
            <Route path="/peau-sensible-actifs-a-eviter" element={<PeauSensible />} />
            <Route path="/ordre-routine-skincare" element={<OrdreRoutine />} />
            <Route path="/niacinamide-vitamine-c-retinol-bha" element={<Actifs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DiagnosticProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
