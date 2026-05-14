import type { ProjectStatus, ProjectPriority } from "../types";

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "planned",
  "in_progress",
  "paused",
  "completed",
  "cancelled",
];

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string }> = {
  planned: { label: "Planned" },
  in_progress: { label: "In Progress" },
  paused: { label: "Paused" },
  completed: { label: "Completed" },
  cancelled: { label: "Cancelled" },
};

export const PROJECT_PRIORITY_ORDER: ProjectPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
];

export const PROJECT_PRIORITY_CONFIG: Record<ProjectPriority, { label: string; bars: number }> = {
  urgent: { label: "Urgent", bars: 4 },
  high: { label: "High", bars: 3 },
  medium: { label: "Medium", bars: 2 },
  low: { label: "Low", bars: 1 },
  none: { label: "No priority", bars: 0 },
};
