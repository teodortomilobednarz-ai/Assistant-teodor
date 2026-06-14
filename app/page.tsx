import Link from "next/link";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Logo } from "@/components/brand/logo";
import {
  ArrowRightIcon,
  BoltIcon,
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  MailIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/icons";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Résume tout",
    description:
      "Emails, réunions, documents : l'essentiel en quelques secondes, jamais noyé dans les détails.",
  },
  {
    icon: MailIcon,
    title: "Prépare vos réponses",
    description:
      "Un brouillon professionnel prêt à éditer — relié à votre vraie boîte Gmail, rien n'est envoyé sans vous.",
  },
  {
    icon: ChecksIcon,
    title: "Crée vos tâches",
    description:
      "Les actions à faire sont extraites, priorisées et enregistrées automatiquement.",
  },
  {
    icon: SearchIcon,
    title: "Retrouve l'info",
    description:
      "Posez une question, obtenez la réponse tirée de vos emails, agenda et documents.",
  },
];

const STEPS = [
  {
    title: "Connectez vos outils",
    description: "Gmail, Agenda et Drive en un clic, en toute sécurité.",
  },
  {
    title: "Laissez l'IA travailler",
    description: "Elle résume, rédige, organise et retrouve à votre place.",
  },
  {
    title: "Gardez le contrôle",
    description: "Vous validez chaque envoi et chaque action. Toujours.",
  },
];

const INTEGRATIONS = [
  { icon: MailIcon, label: "Gmail" },
  { icon: CalendarIcon, label: "Agenda" },
  { icon: FileIcon, label: "Drive" },
];

export default async function LandingPage() {
  const session = await auth();

  const cta = session?.user ? (
    <Link
      href="/dashboard"
      className="bg-gradient-accent glow-hover inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5"
    >
      Ouvrir le tableau de bord
      <ArrowRightIcon className="size-4" />
    </Link>
  ) : (
    <SignInButton label="Commencer gratuitement" />
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="glass sticky top-0 z-20 border-b border-border/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          {session?.user ? (
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="aurora" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-16 pt-20 text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
            <BoltIcon className="size-3.5 text-accent" />
            Votre assistant IA, branché à vos outils
          </span>

          <h1 className="animate-fade-up delay-1 mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Gagnez{" "}
            <span className="text-gradient glow-text shimmer">des heures</span>{" "}
            chaque semaine.
          </h1>

          <p className="animate-fade-up delay-2 mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Draidly connecte vos emails, votre agenda et vos documents, puis
            résume, prépare vos réponses, crée vos tâches et retrouve vos
            informations — pendant que vous gérez l&apos;essentiel.
          </p>

          <div className="animate-fade-up delay-3 mt-8 flex flex-col items-center gap-3 sm:flex-row">
            {cta}
            <Link
              href="#fonctionnalites"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
            >
              Voir les fonctionnalités
            </Link>
          </div>

          <p className="animate-fade-up delay-3 mt-4 flex items-center gap-1.5 text-xs text-muted">
            <ShieldIcon className="size-3.5" />
            Aucun envoi sans votre validation · Propulsé par l&apos;IA
          </p>

          {/* Product preview mockup */}
          <div className="animate-fade-up delay-4 mt-14 w-full max-w-3xl">
            <PreviewCard />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-6 text-sm text-muted">
          <span className="font-medium">Se connecte à</span>
          {INTEGRATIONS.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="size-5 text-accent" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="fonctionnalites"
        className="mx-auto w-full max-w-6xl px-6 py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Un copilote pour chaque tâche
          </h2>
          <p className="mt-3 text-muted">
            Quatre superpouvoirs, reliés à vos vrais outils de travail.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group card-glow glow-hover rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-1"
            >
              <span className="bg-accent-soft inline-flex size-11 items-center justify-center rounded-xl text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-grid border-t border-border bg-surface/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Simple comme bonjour
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
              >
                <span className="bg-gradient-accent inline-flex size-9 items-center justify-center rounded-lg text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-14 text-center shadow-sm">
          <div className="aurora" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight">
              Prêt à déléguer le travail répétitif ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Connectez-vous avec Google et laissez Draidly s&apos;occuper du
              reste.
            </p>
            <div className="mt-7 flex justify-center">{cta}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted sm:flex-row">
          <Logo />
          <span>Propulsé par Google Gemini · Vos données restent les vôtres.</span>
        </div>
      </footer>
    </div>
  );
}

/** A faux in-app preview to give the product a tangible feel. */
function PreviewCard() {
  return (
    <div className="float card-glow overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-muted">Draidly · Copilote</span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Résumé
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Camille confirme l&apos;intérêt pour votre offre et demande un devis
            avant vendredi. Réunion de lancement souhaitée la semaine du 23.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Tâches
            </p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              <li className="flex items-center justify-between gap-2">
                Envoyer le devis détaillé
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                  Haute
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                Caler la réunion (sem. 23)
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Moyenne
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-accent flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white">
            <SparklesIcon className="size-4" />
            Brouillon de réponse prêt à envoyer
          </div>
        </div>
      </div>
    </div>
  );
}
