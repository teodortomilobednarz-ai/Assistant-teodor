import { PageHeader } from "@/components/dashboard/page-header";
import { FollowUpsView } from "@/components/followups/follow-ups-view";
import { ReplyIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default function RelancesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={ReplyIcon}
        title="Relances"
        description="Vos emails restés sans réponse — générez une relance polie en un clic."
      />
      <FollowUpsView />
    </main>
  );
}
