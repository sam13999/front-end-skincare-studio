import diagnosticImage from "@/assets/report/homepage/votre-diagnostic.png";
import understandImage from "@/assets/report/homepage/comprendre-votre-peau.png";
import strategyImage from "@/assets/report/homepage/strategie-skinview.png";
import routineImage from "@/assets/report/homepage/routine-conseillee.png";

export type ReportPreviewPageId = "diagnostic" | "understand" | "strategy" | "routine";

export interface ReportPreviewPage {
  id: ReportPreviewPageId;
  label: string;
  title: string;
  image: string;
  alt: string;
  description: string;
}

export const reportPreviewPages: ReportPreviewPage[] = [
  {
    id: "diagnostic",
    label: "Chapitre 01",
    title: "Votre peau en un coup d’œil",
    image: diagnosticImage,
    alt: "Extrait réel et anonymisé du rapport SkinView présentant le profil, les observations et les objectifs retenus",
    description: "Le profil, les observations visibles et les objectifs prioritaires sont regroupés dans une lecture immédiatement compréhensible.",
  },
  {
    id: "understand",
    label: "Chapitre 02",
    title: "Comprendre votre peau",
    image: understandImage,
    alt: "Extrait réel et anonymisé du rapport SkinView expliquant la lecture globale et les besoins observés",
    description: "Une explication structurée relie les observations aux besoins de la peau et aux résultats recherchés.",
  },
  {
    id: "strategy",
    label: "Chapitre 03",
    title: "La stratégie SkinView",
    image: strategyImage,
    alt: "Extrait réel et anonymisé du rapport SkinView présentant les priorités et les points de vigilance",
    description: "La logique de recommandation, les priorités et les points de vigilance sont exposés avant le choix des soins.",
  },
  {
    id: "routine",
    label: "Chapitre 04",
    title: "Votre routine conseillée",
    image: routineImage,
    alt: "Extrait réel et anonymisé du rapport SkinView présentant les étapes et leur complémentarité",
    description: "Les étapes retenues, leur ordre et leur rôle dans l’ensemble de la routine sont présentés clairement.",
  },
];

export const homepageReportPages = ["diagnostic", "understand", "routine"].map(
  (id) => reportPreviewPages.find((page) => page.id === id)!,
);
