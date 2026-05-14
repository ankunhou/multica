import type { IssuePriority } from "../../types";

export const PRIORITY_ORDER: IssuePriority[] = ["urgent", "high", "medium", "low", "none"];

export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; bars: number }> = {
  urgent: { label: "Urgent", bars: 4 },
  high: { label: "High", bars: 3 },
  medium: { label: "Medium", bars: 2 },
  low: { label: "Low", bars: 1 },
  none: { label: "No priority", bars: 0 },
};
