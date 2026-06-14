import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-muted">
      <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
        <Spinner className="size-6" />
      </span>
    </div>
  );
}
