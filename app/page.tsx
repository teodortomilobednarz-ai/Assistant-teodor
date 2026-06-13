import Link from "next/link";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";

const FEATURES = [
  {
    title: "Résume",
    description: "Vos emails et documents synthétisés en quelques secondes.",
  },
  {
    title: "Prépare vos réponses",
    description: "Un brouillon professionnel prêt à éditer, jamais envoyé sans vous.",
  },
  {
    title: "Crée vos tâches",
    description: "Les actions à faire extraites et priorisées automatiquement.",
  },
  {
    title: "Retrouve l'info",
    description: "Posez une question, obtenez la réponse tirée de vos contenus.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <section className="flex flex-col items-start gap-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          Copilote IA pour PME
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          L&apos;assistant IA qui vous fait gagner des heures chaque semaine.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Connectez vos emails, votre agenda et vos documents. Le copilote
          résume, prépare vos réponses, crée vos tâches et retrouve vos
          informations. Vous gardez le contrôle : rien n&apos;est envoyé sans
          votre validation.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
            >
              Ouvrir le tableau de bord
            </Link>
          ) : (
            <SignInButton label="Commencer avec Google" />
          )}
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">{feature.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-auto pt-16 text-xs text-muted">
        Propulsé par Google Gemini · Vos données ne sont utilisées que pour vous
        rendre service.
      </footer>
    </main>
  );
}
