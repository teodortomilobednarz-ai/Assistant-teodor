export default function InboxLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center gap-4">
        <span className="size-12 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="flex flex-col gap-2">
          <span className="h-5 w-44 animate-pulse rounded bg-surface-muted" />
          <span className="h-3 w-64 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>

      <span className="h-11 w-full animate-pulse rounded-xl bg-surface-muted" />

      <ul className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="size-9 shrink-0 animate-pulse rounded-full bg-surface-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="h-3.5 w-1/3 animate-pulse rounded bg-surface-muted" />
              <span className="h-3 w-2/3 animate-pulse rounded bg-surface-muted" />
              <span className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
