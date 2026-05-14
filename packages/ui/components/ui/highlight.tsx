import * as React from "react";

import { cn } from "@multica/ui/lib/utils";

function Highlight({ className, ...props }: React.ComponentProps<"mark">) {
  return (
    <mark
      data-slot="highlight"
      className={cn("rounded-sm bg-warning/25 text-inherit", className)}
      {...props}
    />
  );
}

export { Highlight };
