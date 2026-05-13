"use client";

import type { IssuePriority } from "@multica/core/types";
import { cn } from "@multica/ui/lib/utils";
import { PriorityIcon } from "./priority-icon";
import { ISSUE_PRIORITY_VISUALS } from "../visuals";
import { useT } from "../../i18n";

export function IssuePriorityBadge({
  priority,
  className,
}: {
  priority: IssuePriority;
  className?: string;
}) {
  const { t } = useT("issues");
  const visual = ISSUE_PRIORITY_VISUALS[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
        visual.badgeBg,
        visual.badgeText,
        className,
      )}
    >
      <PriorityIcon priority={priority} className="h-3 w-3" inheritColor />
      {t(($) => $.priority[priority])}
    </span>
  );
}
