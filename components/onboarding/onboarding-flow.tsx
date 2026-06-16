"use client";

import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { completeOnboarding } from "@/lib/actions/onboarding";

const QUESTIONS = [
  {
    key: "role",
    label: "Tu es…",
    options: [
      "Indépendant / Freelance",
      "Auto-entrepreneur",
      "TPE / PME (avec salariés)",
      "Autre",
    ],
  },
  {
    key: "painPoint",
    label: "Ton plus gros casse-tête au quotidien ?",
    options: [
      "Gérer mes emails",
      "Faire mes devis & factures",
      "Organiser mon agenda",
      "Retrouver mes infos",
      "Un peu tout 😅",
    ],
  },
  {
    key: "motivation",
    label: "Pourquoi essayer Draidly ?",
    options: [
      "Gagner du temps",
      "Automatiser l'administratif",
      "Être plus organisé",
      "Tester l'IA",
      "Autre",
    ],
  },
  {
    key: "source",
    label: "Où as-tu entendu parler de nous ?",
    options: [
      "TikTok",
      "Instagram",
      "LinkedIn",
      "Recherche Google",
      "Bouche-à-oreille",
      "Autre",
    ],
  },
  {
    key: "emailVolume",
    label: "Combien d'emails reçois-tu par jour ?",
    options: ["Moins de 10", "10–30", "30–50", "Plus de 50"],
  },
] as const;

const inputClass =
  "w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

interface OnboardingFlowProps {
  firstName: string;
  profile: { companyName: string; address: string | null; siret: string | null } | null;
}

const TOTAL = 4;

export function OnboardingFlow({ firstName, profile }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [siret, setSiret] = useState(profile?.siret ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const setAnswer = (key: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-y-auto px-6 py-10">
      <div className="aurora" />
      <div className="relative my-auto w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-4">
          <Logo />
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index <= step ? "w-8 bg-accent" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <div
          key={step}
          className="animate-fade-up rounded-3xl border border-border bg-surface p-7 shadow-sm"
        >
          {step === 0 && (
            <div className="flex flex-col gap-5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Bienvenue{firstName ? ` ${firstName}` : ""} 👋
              </h1>
              <p className="text-muted">
                Draidly est votre copilote IA : il connecte vos emails, votre
                agenda et vos documents pour résumer, répondre, organiser et
                retrouver. Deux minutes pour personnaliser votre espace.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gradient-accent glow-hover mx-auto rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm"
              >
                Commencer
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Faisons connaissance
                </h2>
                <p className="mt-1 text-sm text-muted">
                  5 questions rapides pour adapter Draidly à votre activité.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {QUESTIONS.map((q) => (
                  <div key={q.key}>
                    <p className="mb-2 text-sm font-medium">{q.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const active = answers[q.key] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswer(q.key, opt)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                              active
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-surface text-muted hover:text-foreground"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-sm font-medium text-muted hover:text-foreground"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gradient-accent rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Votre entreprise
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Pour pré-remplir vos devis et factures. (Optionnel — modifiable
                  plus tard.)
                </p>
              </div>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nom de l'entreprise"
                className={inputClass}
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresse (optionnel)"
                className={inputClass}
              />
              <input
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                placeholder="SIRET (optionnel)"
                className={inputClass}
              />
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-muted hover:text-foreground"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-gradient-accent rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form action={completeOnboarding} className="flex flex-col gap-5 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Tout est prêt 🎉
              </h2>
              <p className="text-muted">
                Merci ! Votre espace est configuré. Accédez à votre centre de
                contrôle.
              </p>
              <input type="hidden" name="companyName" value={companyName} />
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="siret" value={siret} />
              {QUESTIONS.map((q) => (
                <input
                  key={q.key}
                  type="hidden"
                  name={q.key}
                  value={answers[q.key] ?? ""}
                />
              ))}
              <button
                type="submit"
                className="bg-gradient-accent glow-hover mx-auto rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm"
              >
                Accéder à mon espace
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
