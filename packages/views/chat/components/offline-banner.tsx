"use client";

import { AlertCircle, WifiOff } from "lucide-react";
import type { AgentAvailability } from "@multica/core/agents";
import { Notice } from "@multica/ui/components/ui/notice";
import { useT } from "../../i18n";

interface Props {
  /** Display name shown in the banner copy. */
  agentName?: string;
  /**
   * Resolved presence availability. Pass `undefined` (or "loading") to
   * suppress the banner — we only surface known offline / unstable states,
   * never speculative copy.
   */
  availability: AgentAvailability | undefined;
}

// Inline notice rendered above the chat input when the active agent isn't
// reachable. Hides on `online`, `undefined`, or while presence is loading —
// users get the silent default behaviour and only see copy when there's a
// real-world implication for the message they're about to send.
export function OfflineBanner({ agentName, availability }: Props) {
  const { t } = useT("chat");
  if (availability !== "offline" && availability !== "unstable") return null;

  const name = agentName?.trim() || t(($) => $.offline_banner.fallback_name);
  if (availability === "unstable") {
    return (
      <div className="px-5 mb-1.5">
        <Notice variant="warning" className="mx-auto max-w-4xl">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="truncate">{t(($) => $.offline_banner.unstable, { name })}</span>
        </Notice>
      </div>
    );
  }
  return (
    <div className="px-5 mb-1.5">
      <Notice className="mx-auto max-w-4xl">
        <WifiOff className="size-3.5 shrink-0" />
        <span className="truncate">{t(($) => $.offline_banner.offline, { name })}</span>
      </Notice>
    </div>
  );
}
