import type { ComponentType } from "react";

interface PageHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}

export function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="animate-fade-up flex items-center gap-4">
      <span className="bg-accent-soft flex size-12 shrink-0 items-center justify-center rounded-2xl text-accent">
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
