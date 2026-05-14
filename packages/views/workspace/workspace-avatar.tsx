import { cn } from "@multica/ui/lib/utils";

const sizeMap = {
  sm: "h-5 w-5 text-xs rounded",
  md: "h-7 w-7 text-xs rounded-md",
  lg: "h-9 w-9 text-sm rounded-md",
} as const;

interface WorkspaceAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}

function WorkspaceAvatar({ name, logoUrl, size = "sm", className }: WorkspaceAvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden border bg-muted font-semibold text-muted-foreground",
        sizeMap[size],
        className,
      )}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

export { WorkspaceAvatar, type WorkspaceAvatarProps };
