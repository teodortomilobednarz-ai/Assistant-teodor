import { Analyzer } from "@/components/copilot/analyzer";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          Copilote IA pour PME
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Résume, répond, organise — en quelques secondes.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Collez un email ou un texte. Le copilote le résume, prépare un
          brouillon de réponse, extrait les tâches et répond à vos questions.
          Rien n&apos;est envoyé : vous gardez le contrôle.
        </p>
      </header>

      <Analyzer />

      <footer className="mt-auto border-t border-border pt-6 text-xs text-muted">
        Propulsé par Claude · Étape 1 du MVP — analyse de texte. Connexion Gmail,
        agenda et documents à venir.
      </footer>
    </main>
  );
}
