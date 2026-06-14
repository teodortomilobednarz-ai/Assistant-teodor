import { PageHeader } from "@/components/dashboard/page-header";
import { InboxBrowser } from "@/components/copilot/inbox-browser";
import { MailIcon } from "@/components/icons";
import { fetchInbox } from "@/lib/actions/inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  // Fetch the first page server-side so the list paints immediately; the
  // browser component then handles search, filtering and infinite scroll.
  const initial = await fetchInbox({ filter: "all" });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={MailIcon}
        title="Boîte de réception"
        description="Cherche, filtre et ouvre tes emails — même ceux d'il y a plusieurs mois."
      />
      <InboxBrowser initial={initial} />
    </main>
  );
}
