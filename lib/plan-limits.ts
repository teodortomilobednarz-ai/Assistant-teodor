import type { PlanId } from "./plans";

/**
 * What each plan is allowed to do. `null` means unlimited.
 *
 *  - Découverte (free) : 5 analyses IA/jour, documents standards, pas de devis.
 *  - Essentiel         : analyses illimitées, documents standards, 10 devis/mois.
 *  - Pro               : tout illimité + lecture des fichiers avancés (Office,
 *                        audio, vidéo, archives).
 */
export interface PlanLimits {
  /** Max Copilot analyses per day (null = unlimited). */
  analysesPerDay: number | null;
  /** Max quotes/invoices generated per month (null = unlimited). */
  invoicesPerMonth: number | null;
  /** Whether heavy file types (Office, audio, video, archives) can be read. */
  advancedDocs: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { analysesPerDay: 5, invoicesPerMonth: 0, advancedDocs: false },
  essentiel: { analysesPerDay: null, invoicesPerMonth: 10, advancedDocs: false },
  pro: { analysesPerDay: null, invoicesPerMonth: null, advancedDocs: true },
};

export function limitsFor(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan];
}
