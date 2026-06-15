/**
 * Plan catalogue — display metadata shared by the public pricing page and the
 * in-app subscription panel. Prices here are for display; the source of truth
 * for charging is the Stripe Price (see STRIPE_PRICE_* env vars). Keep the
 * amounts in sync with the Stripe dashboard.
 *
 * Positioning:
 *  - Découverte (0€) : tester l'outil, usage limité.
 *  - Essentiel (5€)  : indépendant — productivité quotidienne (emails, tâches, devis).
 *  - Pro (10€)       : PME — automatisation complète, tous documents, facturation illimitée, support.
 *
 * Margins: le moteur IA (Gemini) est en palier gratuit / très bas coût, donc les
 * deux paliers sont largement rentables tout en restant accessibles.
 */

export type PlanId = "free" | "essentiel" | "pro";

export interface Plan {
  id: PlanId;
  /** Maps to the Stripe price tier ("essentiel" | "pro"); null for the free plan. */
  tier: "essentiel" | "pro" | null;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  highlight?: boolean;
  features: string[];
}

export const FREE_PLAN: Plan = {
  id: "free",
  tier: null,
  name: "Découverte",
  tagline: "Pour tester Draidly",
  priceMonthly: 0,
  priceYearly: 0,
  features: [
    "Connexion Gmail, Agenda et Drive",
    "5 analyses IA par jour",
    "Résumés et brouillons d'emails",
    "Tâches et recherche IA",
  ],
};

export const ESSENTIEL_PLAN: Plan = {
  id: "essentiel",
  tier: "essentiel",
  name: "Essentiel",
  tagline: "Pour les indépendants",
  priceMonthly: 4.99,
  priceYearly: 49.9, // ~2 mois offerts
  features: [
    "Analyses IA illimitées",
    "Lecture de documents (Docs, PDF, Sheets, images)",
    "Brouillons et envoi d'emails",
    "Tâches et relances",
    "Jusqu'à 10 devis / factures par mois",
  ],
};

export const PRO_PLAN: Plan = {
  id: "pro",
  tier: "pro",
  name: "Pro",
  tagline: "Pour les PME qui veulent tout automatiser",
  priceMonthly: 9.99,
  priceYearly: 99.9, // ~2 mois offerts
  highlight: true,
  features: [
    "Tout le plan Essentiel",
    "Lecture de TOUS les fichiers (Office, audio, vidéo, archives)",
    "Devis & factures illimités",
    "Recherche IA avancée",
    "Résumé quotidien de l'agenda",
    "Support prioritaire",
  ],
};

export const PLANS: Plan[] = [FREE_PLAN, ESSENTIEL_PLAN, PRO_PLAN];

export function planById(id: PlanId): Plan {
  return PLANS.find((plan) => plan.id === id) ?? FREE_PLAN;
}

export function formatPrice(euros: number): string {
  if (euros === 0) return "Gratuit";
  const value = Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(2).replace(".", ",");
  return `${value} €`;
}
