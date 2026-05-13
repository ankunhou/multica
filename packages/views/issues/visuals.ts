import type { IssuePriority, IssueStatus } from "@multica/core/types";

export const ISSUE_STATUS_VISUALS: Record<
  IssueStatus,
  {
    iconColor: string;
    hoverBg: string;
    dividerColor: string;
    columnBg: string;
  }
> = {
  backlog: {
    iconColor: "text-muted-foreground",
    hoverBg: "hover:bg-accent",
    dividerColor: "bg-muted-foreground/40",
    columnBg: "bg-muted/40",
  },
  todo: {
    iconColor: "text-muted-foreground",
    hoverBg: "hover:bg-accent",
    dividerColor: "bg-muted-foreground/40",
    columnBg: "bg-muted/40",
  },
  in_progress: {
    iconColor: "text-warning",
    hoverBg: "hover:bg-warning/10",
    dividerColor: "bg-warning",
    columnBg: "bg-warning/5",
  },
  in_review: {
    iconColor: "text-success",
    hoverBg: "hover:bg-success/10",
    dividerColor: "bg-success",
    columnBg: "bg-success/5",
  },
  done: {
    iconColor: "text-info",
    hoverBg: "hover:bg-info/10",
    dividerColor: "bg-info",
    columnBg: "bg-info/5",
  },
  blocked: {
    iconColor: "text-destructive",
    hoverBg: "hover:bg-destructive/10",
    dividerColor: "bg-destructive",
    columnBg: "bg-destructive/5",
  },
  cancelled: {
    iconColor: "text-muted-foreground",
    hoverBg: "hover:bg-accent",
    dividerColor: "bg-muted-foreground/40",
    columnBg: "bg-muted/40",
  },
};

export const ISSUE_PRIORITY_VISUALS: Record<
  IssuePriority,
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
