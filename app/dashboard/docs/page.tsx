import { DocsWorkspace } from "@/components/copilot/docs-workspace";
import { PageHeader } from "@/components/dashboard/page-header";
import { FileIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={FileIcon}
        title="Documents"
        description="Recherchez un document dans votre Drive et obtenez-en un résumé."
      />
      <DocsWorkspace />
    </main>
  );
}
