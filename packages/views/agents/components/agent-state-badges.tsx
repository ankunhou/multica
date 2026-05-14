"use client";

import { Skeleton } from "@multica/ui/components/ui/skeleton";
import { cn } from "@multica/ui/lib/utils";
import type { AgentPresenceDetail } from "@multica/core/agents";
import { availabilityConfig, workloadConfig } from "../presence";
import { useT } from "../../i18n";

interface AgentStateBadgeProps {
  detail: AgentPresenceDetail | null | undefined;
  className?: string;
}

export function AgentAvailabilityBadge({
  detail,
  className,
  compact,
}: AgentStateBadgeProps & {
  compact?: boolean;
}) {
  const { t } = useT("agents");

  if (!detail) {
    return compact ? (
      <Skeleton className={cn("h-1.5 w-1.5 rounded-full", className)} />
    ) : (
      <Skeleton className={cn("h-3 w-16 rounded", className)} />
    );
  }

  const availability = availabilityConfig[detail.availability];
  const availabilityLabel = t(($) => $.availability[detail.availability]);
  const workloadLabel = t(($) => $.workload[detail.workload]);
  const title =
    detail.workload === "idle" ? availabilityLabel : `${availabilityLabel} · ${workloadLabel}`;

  if (compact) {
    return (
      <span className={cn("inline-flex items-center", className)} title={title}>
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", availability.dotClass)} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", availability.dotClass)} />
      <span className={cn("text-xs", availability.textClass)}>{availabilityLabel}</span>
    </span>
  );
}

export function AgentWorkloadBadge({
  detail,
  className,
  countStyle = "badge",
}: AgentStateBadgeProps & {
  countStyle?: "badge" | "inline";
}) {
  const { t } = useT("agents");

  if (!detail) {
    return <Skeleton className={cn("h-3 w-20 rounded", className)} />;
  }

  const workload = workloadConfig[detail.workload];
  const isWorking = detail.workload === "working";
  const isQueued = detail.workload === "queued";
  const queuedTone =
    detail.availability === "online" ? "text-muted-foreground" : workload.textClass;
  const labelTone = isQueued ? queuedTone : workload.textClass;
  const inlineCount = isWorking
    ? detail.queuedCount > 0
      ? `${detail.runningCount}/${detail.capacity} +${detail.queuedCount}q`
      : `${detail.runningCount}/${detail.capacity}`
    : isQueued
      ? `${detail.queuedCount}`
      : null;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      {detail.workload !== "idle" && (
        <workload.icon className={cn("h-3 w-3 shrink-0", labelTone, isWorking && "animate-spin")} />
      )}
      <span className={cn("shrink-0", labelTone)}>{t(($) => $.workload[detail.workload])}</span>
      {countStyle === "inline" && inlineCount && (
        <span className="truncate text-muted-foreground">{inlineCount}</span>
      )}
      {countStyle === "badge" && isWorking && (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {detail.runningCount} / {detail.capacity}
        </span>
      )}
      {countStyle === "badge" && isWorking && detail.queuedCount > 0 && (
        <span className="rounded-md bg-muted px-1 py-0 text-xs font-medium text-muted-foreground">
          {t(($) => $.presence.queue_badge, { count: detail.queuedCount })}
        </span>
      )}
      {countStyle === "badge" && isQueued && (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {detail.queuedCount}
        </span>
      )}
    </span>
  );
}

export function AgentPresenceSummary({
  detail,
  compact,
  className,
}: AgentStateBadgeProps & {
  compact?: boolean;
}) {
  if (compact) {
    return <AgentAvailabilityBadge detail={detail} compact className={className} />;
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5", className)}>
      <AgentAvailabilityBadge detail={detail} />
      {detail && (
        <>
          <span className="text-xs text-muted-foreground">·</span>
          <AgentWorkloadBadge detail={detail} />
        </>
      )}
    </span>
  );
}
