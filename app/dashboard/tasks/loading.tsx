export default function TasksLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center gap-4">
        <span className="size-12 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="flex flex-col gap-2">
          <span className="h-5 w-32 animate-pulse rounded bg-surface-muted" />
          <span className="h-3 w-48 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <span className="size-6 shrink-0 animate-pulse rounded-full bg-surface-muted" />
              <div className="flex flex-col gap-2">
                <span className="h-3.5 w-48 animate-pulse rounded bg-surface-muted" />
                <span className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
              </div>
            </div>
            <span className="h-8 w-8 animate-pulse rounded-lg bg-surface-muted" />
          </li>
        ))}
      </ul>
    </main>
  );
}
