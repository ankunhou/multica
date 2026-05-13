import * as React from "react"

import { cn } from "@multica/ui/lib/utils"

function clampValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function Meter({
  className,
  indicatorClassName,
  value,
  ...props
}: React.ComponentProps<"div"> & {
  value: number
  indicatorClassName?: string
}) {
  const clamped = clampValue(value)

  return (
    <div
      data-slot="meter"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn("relative overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        data-slot="meter-indicator"
        className={cn(
          "absolute inset-y-0 left-0 rounded-full bg-primary transition-all",
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Meter }
