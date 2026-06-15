"use client";

import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import {
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  MailIcon,
  ReceiptIcon,
  ReplyIcon,
} from "@/components/icons";
import { completeOnboarding } from "@/lib/actions/onboarding";

const FEATURES = [
  { icon: MailIcon, title: "Boîte", desc: "Résume et répond à vos emails" },
  { icon: ReplyIcon, title: "Relances", desc: "Relance les emails sans réponse" },
  { icon: CalendarIcon, title: "Agenda", desc: "Résume votre journée" },
  { icon: FileIcon, title: "Documents", desc: "Résume vos docs (dès Essentiel)" },
  { icon: ReceiptIcon, title: "Devis", desc: "Devis & factures (dès Essentiel)" },
  { icon: ChecksIcon, title: "Tâches", desc: "Extrait et suit vos actions" },
];

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

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10">
      <div className="aurora" />
      <div className="relative w-full max-w-lg">
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
                retrouver — pendant que vous gérez l&apos;essentiel.
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
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-muted hover:text-foreground"
                >
                  Plus tard
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
                  Ce que Draidly fait pour vous
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Tout est relié à l&apos;IA. Rien n&apos;est envoyé sans votre
                  validation.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-3"
                  >
                    <span className="bg-gradient-accent flex size-8 shrink-0 items-center justify-center rounded-lg text-white">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                Votre espace est configuré. Accédez à votre centre de contrôle.
              </p>
              <input type="hidden" name="companyName" value={companyName} />
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="siret" value={siret} />
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
