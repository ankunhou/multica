"use client";

import { cn } from "@multica/ui/lib/utils";

export type ChatSessionSignal = "running" | "unread";

interface ChatSessionSignalPipProps {
  signal: ChatSessionSignal;
  label: string;
  className?: string;
}

export function ChatSessionSignalPip({
  signal,
  label,
  className,
}: ChatSessionSignalPipProps) {
  return (
    <span
      aria-label={label}
      title={label}
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        signal === "running" && "bg-warning animate-pulse",
        signal === "unread" && "bg-brand",
        className,
      )}
    />
  );
}
