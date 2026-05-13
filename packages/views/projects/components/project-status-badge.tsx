"use client";

import type { ProjectStatus } from "@multica/core/types";
import { cn } from "@multica/ui/lib/utils";
import { useProjectStatusLabels } from "./labels";
import { PROJECT_STATUS_VISUALS } from "./visuals";

export function ProjectStatusDot({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn("size-2 rounded-full", PROJECT_STATUS_VISUALS[status].dotColor, className)}
    />
  );
}

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const labels = useProjectStatusLabels();
  const visual = PROJECT_STATUS_VISUALS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        visual.badgeBg,
        visual.badgeText,
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
