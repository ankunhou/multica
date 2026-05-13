"use client";

import type { TaskFailureReason } from "@multica/core/types";
import { useT } from "../../../i18n";

// Human-readable copy for the back-end task failure reason enum. Surfaced
// in the agent detail Recent Work tab when a task ended in failure — the
// only place the front-end exposes failure_reason directly to the user.
//
// Lives next to the consuming tab (rather than in agents/presence) because
// failed tasks no longer have a top-level workload state; failure context
// is purely a detail-page concern now.
export function useFailureReasonLabel(): (reason: TaskFailureReason) => string {
  const { t } = useT("agents");
  return (reason) => t(($) => $.task_failure[reason]);
}
