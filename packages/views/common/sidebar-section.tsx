"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";

export function SidebarSection({
  title,
  open,
  onOpenChange,
  children,
  className,
  contentClassName,
  trailing,
}: {
  title: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className={className}>
      <button
        type="button"
        className={cn(
          "mb-2 flex w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-accent/70",
          open ? "" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onOpenChange(!open)}
      >
        <span className="min-w-0 truncate">{title}</span>
        <ChevronRight
          className={cn(
            "!size-3 shrink-0 stroke-[2.5] text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
        />
        {trailing}
      </button>
      {open && <div className={contentClassName}>{children}</div>}
    </div>
  );
}
