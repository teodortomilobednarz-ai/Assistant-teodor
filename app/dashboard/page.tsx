import { Analyzer } from "@/components/copilot/analyzer";
import { PageHeader } from "@/components/dashboard/page-header";
import { SparklesIcon } from "@/components/icons";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <PageHeader
        icon={SparklesIcon}
        title="Copilote"
        description="Collez un email ou un texte — résumé, brouillon et tâches sont générés puis enregistrés."
      />
      <Analyzer />
    </main>
  );
}
