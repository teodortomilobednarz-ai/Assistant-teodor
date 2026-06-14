import { PageHeader } from "@/components/dashboard/page-header";
import { MailIcon } from "@/components/icons";
import { InboxView } from "@/components/inbox/inbox-view";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={MailIcon}
        title="Boîte de réception"
        description="Recherchez, filtrez et retrouvez n'importe quel email — même vieux de plusieurs mois."
      />
      <InboxView />
    </main>
  );
}
