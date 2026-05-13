"use client";

import type React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";

export type ResourceViewMode = "list" | "grid";

export const resourceHeaderIconClassName =
  "flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground";

export const resourceActionButtonClassName =
  "rounded-full border-border/50 bg-card/75 px-3 shadow-none hover:bg-background/80";

export const resourceSearchInputClassName =
  "h-8 w-64 rounded-full border-border/50 bg-card/75 pl-8 text-sm shadow-none";

export const resourceSegmentClassName =
  "flex items-center gap-0.5 rounded-full bg-muted/60 p-0.5";

export function resourceSegmentItemClassName(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
    active
      ? "bg-background text-foreground ring-1 ring-border/40"
      : "text-muted-foreground hover:bg-background/45 hover:text-foreground",
  );
}

export function ResourcePageBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-5 pb-8 pt-2 md:px-10",
        className,
      )}
      {...props}
    />
  );
}

export function ResourceSurface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/45 bg-card/75 shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export function ResourceToolbarRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex min-h-12 shrink-0 items-center border-b border-border/35 px-4",
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
        "inline-flex rounded-full border border-border/45 bg-card/75 p-1 text-muted-foreground",
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
            ? "bg-background text-foreground ring-1 ring-border/40"
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
            ? "bg-background text-foreground ring-1 ring-border/40"
            : "hover:bg-background/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
