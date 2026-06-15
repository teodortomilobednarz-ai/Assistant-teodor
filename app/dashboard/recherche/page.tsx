import { AssistantSearch } from "@/components/copilot/assistant-search";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default function RecherchePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={SearchIcon}
        title="Recherche IA"
        description="Posez une question — l'assistant répond à partir de vos emails, agenda et documents."
      />
      <AssistantSearch />
    </main>
  );
}
