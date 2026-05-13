import {
  AlertCircle,
  CircleDot,
  CircleSlash,
  Clock,
  Loader2,
  PlugZap,
  type LucideIcon,
} from "lucide-react";
import type { AgentAvailability, Workload } from "@multica/core/agents";

// Visual mapping for the two presence dimensions, kept in matching shape
// so consumers can pick which to render. The two are independent — the
// dot reads only from availabilityConfig, the workload chip reads only
// from workloadConfig.
//
// Color tokens map to product semantic tokens (no hardcoded Tailwind colors):
//
//   AVAILABILITY (drives the dot everywhere a dot appears):
//     online    → agent-available (green)
//     unstable  → agent-blocked   (amber) — pairs with the runtime card's amber
//     offline   → muted-foreground (gray)
//
//   WORKLOAD (drives the optional workload chip on focused surfaces):
//     working   → agent-running   (blue) has activity
//     queued    → agent-queued    (amber) anomaly: nothing running but tasks
//                                         waiting (typically stuck on offline
//                                         runtime; brief flash on online is
//                                         a harmless race)
//     idle      → muted           (gray)  nothing on the plate
//
// `failed` / `completed` / `cancelled` deliberately have no top-level visual
// — those are historical context, surfaced via Recent Work + Inbox, not
// list-level summary state.

export interface AvailabilityVisual {
  label: string;
  // Background fill for the dot indicator.
  dotClass: string;
  // Foreground colour for the label text alongside the dot.
  textClass: string;
  // Icon used in larger badge contexts (detail header, hover card).
  icon: LucideIcon;
}

export const availabilityConfig: Record<AgentAvailability, AvailabilityVisual> = {
  online: {
    label: "Online",
    dotClass: "bg-agent-available",
    textClass: "text-agent-available",
    icon: CircleDot,
  },
  unstable: {
    label: "Unstable",
    dotClass: "bg-agent-blocked",
    textClass: "text-agent-blocked",
    icon: PlugZap,
  },
  offline: {
    label: "Offline",
    dotClass: "bg-muted-foreground/40",
    textClass: "text-muted-foreground",
    icon: CircleSlash,
  },
};

// Order used by availability filter chips so colours read in a natural
// progression rather than alphabetical.
export const availabilityOrder: AgentAvailability[] = [
  "online",
  "unstable",
  "offline",
];

export interface WorkloadVisual {
  label: string;
  // Foreground colour for icon + label text.
  textClass: string;
  // Icon used inline.
  icon: LucideIcon;
}

export const workloadConfig: Record<Workload, WorkloadVisual> = {
  working: {
    label: "Working",
    textClass: "text-agent-running",
    icon: Loader2,
  },
  queued: {
    // Amber chip: nothing running but tasks waiting. On an offline runtime
    // this is the "stuck" signal we explicitly surface (replacing the old
    // misleading "Running 0/N +Mq" copy).
    label: "Queued",
    textClass: "text-agent-queued",
    icon: Clock,
  },
  idle: {
    label: "Idle",
    textClass: "text-muted-foreground",
    icon: AlertCircle,
  },
};

// Order used in any future workload chip group; actionable signals first.
export const workloadOrder: Workload[] = ["working", "queued", "idle"];
