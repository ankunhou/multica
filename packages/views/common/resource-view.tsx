"use client";

import type React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";

export type ResourceViewMode = "list" | "grid";

export function ResourceSurface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/50 bg-card/70 ring-1 ring-border/25",
        className,
      )}
      {...props}
    />
  );
}

export function ResourceInteractiveRegion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const stop = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className={className}
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
      onKeyDown={stop}
    >
      {children}
    </div>
  );
}

export function ResourceViewToggle({
  value,
  onChange,
  listLabel,
  gridLabel,
  className,
}: {
  value: ResourceViewMode;
  onChange: (mode: ResourceViewMode) => void;
  listLabel: string;
  gridLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border/50 bg-card/70 p-1 text-muted-foreground ring-1 ring-border/25",
        className,
      )}
    >
      <button
        type="button"
        aria-label={listLabel}
        aria-pressed={value === "list"}
        title={listLabel}
        onClick={() => onChange("list")}
        className={cn(
          "flex size-7 items-center justify-center rounded-full transition-colors",
          value === "list"
            ? "bg-background text-foreground ring-1 ring-border/50"
            : "hover:bg-background/60 hover:text-foreground",
        )}
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label={gridLabel}
        aria-pressed={value === "grid"}
        title={gridLabel}
        onClick={() => onChange("grid")}
        className={cn(
          "flex size-7 items-center justify-center rounded-full transition-colors",
          value === "grid"
            ? "bg-background text-foreground ring-1 ring-border/50"
            : "hover:bg-background/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
