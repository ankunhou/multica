"use client";

import type { IssuePriority, IssueStatus } from "@multica/core/types";
import { useT } from "../../i18n";

export function useIssueStatusLabels(): Record<IssueStatus, string> {
  const { t } = useT("issues");
  return {
    backlog: t(($) => $.status.backlog),
    todo: t(($) => $.status.todo),
    in_progress: t(($) => $.status.in_progress),
    in_review: t(($) => $.status.in_review),
    done: t(($) => $.status.done),
    blocked: t(($) => $.status.blocked),
    cancelled: t(($) => $.status.cancelled),
  };
}

export function useIssuePriorityLabels(): Record<IssuePriority, string> {
  const { t } = useT("issues");
  return {
    urgent: t(($) => $.priority.urgent),
    high: t(($) => $.priority.high),
    medium: t(($) => $.priority.medium),
    low: t(($) => $.priority.low),
    none: t(($) => $.priority.none),
  };
}
