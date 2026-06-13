import { Analyzer } from "@/components/copilot/analyzer";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Copilote</h1>
        <p className="text-sm text-muted">
          Collez un email ou un texte. Le résumé, le brouillon et les tâches sont
          générés puis enregistrés dans votre espace.
        </p>
      </div>

      <Analyzer />
    </main>
  );
}
