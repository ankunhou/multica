import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@multica/ui/lib/utils"

const noticeVariants = cva(
  "inline-flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ring-1 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground ring-border",
        success: "bg-success/10 text-success ring-success/25",
        warning: "bg-warning/10 text-warning ring-warning/25",
        info: "bg-info/10 text-info ring-info/25",
        destructive: "bg-destructive/10 text-destructive ring-destructive/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Notice({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof noticeVariants>) {
  return (
    <div
      data-slot="notice"
      role="status"
      className={cn(noticeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Notice, noticeVariants }
