import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@multica/ui/lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      tone: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        success: "text-success",
        warning: "text-warning",
        info: "text-info",
        brand: "text-brand",
        destructive: "text-destructive",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

type StatusIndicatorProps = React.ComponentProps<"span"> &
  VariantProps<typeof statusIndicatorVariants> & {
    icon?: React.ComponentType<{ className?: string }>;
    iconClassName?: string;
    spin?: boolean;
  };

function StatusIndicator({
  className,
  tone,
  icon: Icon,
  iconClassName,
  spin = false,
  children,
  ...props
}: StatusIndicatorProps) {
  return (
    <span
      data-slot="status-indicator"
      className={cn(statusIndicatorVariants({ tone }), className)}
      {...props}
    >
      {Icon && <Icon className={cn(spin && "animate-spin", iconClassName)} />}
      {children}
    </span>
  );
}

export { StatusIndicator, statusIndicatorVariants };
