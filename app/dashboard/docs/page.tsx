import { DocsWorkspace } from "@/components/copilot/docs-workspace";
import { PageHeader } from "@/components/dashboard/page-header";
import { FileIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={FileIcon}
        title="Documents"
        description="Vos documents récents — recherchez-en un et obtenez son résumé en un clic."
      />
      <DocsWorkspace />
    </main>
  );
}
