import { DocsWorkspace } from "@/components/copilot/docs-workspace";

export const dynamic = "force-dynamic";

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-muted">
          Recherchez un document dans votre Drive et obtenez-en un résumé.
        </p>
      </div>

      <DocsWorkspace />
    </main>
  );
}
