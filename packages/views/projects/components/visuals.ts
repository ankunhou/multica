import type { ProjectPriority, ProjectStatus } from "@multica/core/types";

export const PROJECT_STATUS_VISUALS: Record<
  ProjectStatus,
  {
    color: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  planned: {
    color: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
  },
  in_progress: {
    color: "text-warning",
    dotColor: "bg-warning",
    badgeBg: "bg-warning",
    badgeText: "text-warning-foreground",
  },
  paused: {
    color: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
  },
  completed: {
    color: "text-info",
    dotColor: "bg-info",
    badgeBg: "bg-info",
    badgeText: "text-info-foreground",
  },
  cancelled: {
    color: "text-destructive",
    dotColor: "bg-destructive",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
  },
};

export const PROJECT_PRIORITY_VISUALS: Record<
  ProjectPriority,
  {
    color: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  urgent: {
    color: "text-destructive",
    badgeBg: "bg-destructive/10",
    badgeText: "text-destructive",
  },
  high: {
    color: "text-warning",
    badgeBg: "bg-warning/10",
    badgeText: "text-warning",
  },
  medium: {
    color: "text-warning",
    badgeBg: "bg-warning/10",
    badgeText: "text-warning",
  },
  low: {
    color: "text-info",
    badgeBg: "bg-info/10",
    badgeText: "text-info",
  },
  none: {
    color: "text-muted-foreground",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
  },
};
