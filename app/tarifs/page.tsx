import Link from "next/link";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { PlanGrid } from "@/components/billing/plan-grid";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Tarifs — Draidly",
  description:
    "Des formules simples et accessibles : Découverte gratuit, Essentiel à 5 €/mois, Pro à 10 €/mois.",
};

export default async function TarifsPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <div className="flex flex-1 flex-col">
      <header className="glass sticky top-0 z-20 border-b border-border/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/">
            <Logo />
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Tableau de bord →
            </Link>
          ) : (
            <SignInButton label="Se connecter" className="px-4 py-2 text-sm" />
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="aurora" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Des tarifs simples, pensés pour les{" "}
              <span className="text-gradient">PME</span>
            </h1>
            <p className="mt-3 text-muted">
              Commencez gratuitement. Passez au plan supérieur quand Draidly vous
              fait gagner du temps. Sans engagement.
            </p>
          </div>

          <div className="mt-12">
            <PlanGrid
              cta={(plan) =>
                signedIn ? (
                  <Link
                    href="/dashboard/abonnement"
                    className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-transform active:scale-[0.98] ${
                      plan.highlight
                        ? "bg-gradient-accent text-white shadow-sm hover:-translate-y-0.5"
                        : "border border-border bg-surface text-foreground hover:border-accent/40"
                    }`}
                  >
                    {plan.id === "free" ? "Accéder" : "Choisir ce plan"}
                  </Link>
                ) : (
                  <SignInButton
                    label={plan.id === "free" ? "Commencer gratuitement" : "Choisir ce plan"}
                    className="w-full"
                  />
                )
              }
            />
          </div>

          <p className="mt-10 text-center text-xs text-muted">
            Paiement sécurisé par Stripe · Résiliable à tout moment.
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted sm:flex-row">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Conditions
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <a href="mailto:info@draidly.com" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
