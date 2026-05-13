import type { Project } from "@multica/core/types";
import { Folder } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";

export type ProjectIconSize = "sm" | "md" | "lg";

export interface ProjectIconProps {
  project?: Pick<Project, "icon"> | null;
  size?: ProjectIconSize;
  className?: string;
}

const EMOJI_SIZE_CLASS: Record<ProjectIconSize, string> = {
  sm: "size-3.5 text-xs leading-none",
  md: "size-4 text-sm leading-none",
  lg: "size-6 text-2xl leading-none",
};

const DEFAULT_ICON_SIZE_CLASS: Record<ProjectIconSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function ProjectIcon({ project, size = "sm", className }: ProjectIconProps) {
  const icon = project?.icon?.trim();
  const hasCustomIcon = !!icon && icon !== "📁";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        hasCustomIcon ? EMOJI_SIZE_CLASS[size] : DEFAULT_ICON_SIZE_CLASS[size],
        !hasCustomIcon && "text-muted-foreground",
        className,
      )}
    >
      {hasCustomIcon ? icon : <Folder className="size-full" strokeWidth={2} />}
    </span>
  );
}
